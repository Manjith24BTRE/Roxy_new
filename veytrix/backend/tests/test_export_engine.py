"""Comprehensive integration, stress, and unit test suite for production-ready Export Engine."""

from uuid import uuid4
import pytest
from fastapi.testclient import TestClient

from app.builders.ffmpeg_builder import FFmpegBuilder
from app.models.enums import ExportStatus
from app.models.render_graph import RenderGraphDefinition
from app.models.timeline import TimelineModel
from app.schemas.export import ExportCreate, ExportSettings
from app.services.export_service import ExportService
from app.services.render_engine import QueueManager, RenderTask, RenderWorker, cleanup_orphaned_temp_files
from app.services.resource_monitor import resource_monitor
from main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
def queue_manager():
    return QueueManager()


@pytest.fixture
def render_worker():
    return RenderWorker()


from unittest.mock import AsyncMock

@pytest.fixture
def export_service():
    svc = ExportService()
    svc.render_worker._execute_ffmpeg_command = AsyncMock(return_value=True)
    return svc


@pytest.mark.anyio
async def test_resource_monitor():
    metrics = resource_monitor.get_system_metrics()
    assert "cpu_percent" in metrics
    assert "memory_percent" in metrics
    assert "disk_free_gb" in metrics
    is_safe, msg = resource_monitor.is_safe_for_new_render()
    assert isinstance(is_safe, bool)


@pytest.mark.anyio
async def test_cancellation_flow(export_service):
    user_id = "00000000-0000-0000-0000-000000000001"
    project_id = uuid4()

    payload = ExportCreate(
        project_id=project_id,
        title="Cancellation Test Render",
        timeline_json={"duration": 5.0, "tracks": []},
        settings=ExportSettings(resolution="720p", fps=30, format="mp4"),
    )

    export_res = await export_service.create_export(data=payload, user_id=user_id)
    assert export_res.id is not None

    # Cancel export
    success = await export_service.cancel_export_async(export_res.id, user_id)
    assert success is True

    status_res = export_service.get_export_status(export_res.id, user_id)
    assert status_res.status == ExportStatus.CANCELLED


@pytest.mark.anyio
async def test_retry_flow(export_service):
    user_id = "00000000-0000-0000-0000-000000000001"
    project_id = uuid4()

    payload = ExportCreate(
        project_id=project_id,
        title="Retry Test Render",
        timeline_json={"duration": 2.0, "tracks": []},
        settings=ExportSettings(resolution="720p", fps=30, format="mp4"),
    )

    export_res = await export_service.create_export(data=payload, user_id=user_id)
    await export_service.cancel_export_async(export_res.id, user_id)

    # Retry cancelled export
    retry_res = await export_service.retry_export(export_res.id, user_id)
    assert retry_res.id is not None
    assert retry_res.status in (ExportStatus.QUEUED, ExportStatus.RENDERING, ExportStatus.COMPLETED)


@pytest.mark.anyio
async def test_multiple_concurrent_exports(export_service):
    user1 = "00000000-0000-0000-0000-000000000001"
    user2 = "00000000-0000-0000-0000-000000000002"

    p1 = ExportCreate(
        project_id=uuid4(),
        title="User 1 Render",
        timeline_json={"duration": 1.0, "tracks": []},
        settings=ExportSettings(resolution="720p"),
    )
    p2 = ExportCreate(
        project_id=uuid4(),
        title="User 2 Render",
        timeline_json={"duration": 1.0, "tracks": []},
        settings=ExportSettings(resolution="720p"),
    )

    e1 = await export_service.create_export(p1, user1)
    e2 = await export_service.create_export(p2, user2)

    assert e1.user_id != e2.user_id
    assert e1.id != e2.id


def test_metrics_health_api_endpoint():
    client = TestClient(app)
    response = client.get("/api/v1/exports/metrics/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "system_resources" in data


def test_temp_file_cleanup():
    cleanup_orphaned_temp_files()


@pytest.mark.anyio
async def test_ffmpeg_failure_handling(render_worker):
    """Verify that FFmpeg non-zero exit code stops export, raises error with stderr/exit code, and creates no fallback file."""
    from unittest.mock import AsyncMock, patch

    export_id = uuid4()
    project_id = uuid4()
    cmd_args = ["ffmpeg", "-i", "nonexistent.mp4", "output.mp4"]

    mock_proc = AsyncMock()
    mock_proc.returncode = 1
    mock_proc.communicate.return_value = (b"", b"Error opening input file: No such file or directory\n")

    with patch.object(render_worker.ffmpeg_service, "get_ffmpeg_binary", return_value="ffmpeg"), \
         patch("asyncio.create_subprocess_exec", return_value=mock_proc):
        with pytest.raises(RuntimeError) as exc_info:
            await render_worker._execute_ffmpeg_command(
                export_id=export_id,
                project_id=project_id,
                cmd_args=cmd_args,
                output_path="output.mp4",
                duration=5.0,
            )

        err_str = str(exc_info.value)
        assert "exit code 1" in err_str
        assert "Error opening input file" in err_str
        assert str(export_id) in err_str
        assert str(project_id) in err_str


def test_generate_fallback_disabled(export_service):
    """Verify that _generate_fallback_file is disabled and raises RuntimeError if invoked."""
    with pytest.raises(RuntimeError) as exc_info:
        export_service.ffmpeg_service._generate_fallback_file("some_path.mp4", 5.0)
    assert "disabled" in str(exc_info.value).lower()


@pytest.mark.anyio
async def test_requeued_tasks_are_processed_until_terminal_state(export_service):
    """Verify that worker loop continuously processes requeued tasks through all retries until terminal FAILED state with no orphaned tasks."""
    from unittest.mock import AsyncMock, patch

    user_id = "00000000-0000-0000-0000-000000000001"
    project_id = uuid4()

    payload = ExportCreate(
        project_id=project_id,
        title="Retry Worker Loop Test",
        timeline_json={"duration": 1.0, "tracks": []},
        settings=ExportSettings(resolution="720p", fps=30, format="mp4"),
    )

    # Patch process_task to always return failure
    with patch.object(
        export_service.render_worker,
        "process_task",
        new_callable=AsyncMock,
        return_value=(False, None, None, "Mocked render failure"),
    ) as mock_process:
        export_res = await export_service.create_export(data=payload, user_id=user_id)

        # Allow worker loop to run through retries
        import asyncio
        await asyncio.sleep(0.1)

        # Check final status
        status_res = export_service.get_export_status(export_res.id, user_id)
        assert status_res.status == ExportStatus.FAILED
        assert status_res.progress == 0
        assert "Mocked render failure" in (status_res.error_message or "")

        # Verify no orphaned entries remain in queue
        assert export_service.queue_manager.get_queue_size() == 0
        assert export_service.queue_manager.get_active_count() == 0

        # Verify process_task was called 4 times (1 initial + 3 retries)
        assert mock_process.call_count == 4


def test_ffmpeg_resolver_success():
    """Verify that FFmpeg executable resolver discovers a valid executable and verify_version succeeds."""
    import sys
    from app.services.ffmpeg_service import FFmpegService
    svc = FFmpegService(ffmpeg_bin=sys.executable)
    binary_path = svc.get_ffmpeg_binary()
    assert binary_path is not None
    assert len(binary_path) > 0
    from pathlib import Path
    assert Path(binary_path).is_file()

    version_str = svc.verify_version()
    assert len(version_str) > 0


def test_ffmpeg_resolver_missing():
    """Verify that FFmpeg service raises a clear configuration RuntimeError if no executable is found."""
    from unittest.mock import patch, MagicMock
    from app.services.ffmpeg_service import FFmpegService

    svc = FFmpegService(ffmpeg_bin=None)
    mock_local_path = MagicMock()
    mock_local_path.is_file.return_value = False
    with patch("shutil.which", return_value=None), \
         patch.object(svc, "_get_local_project_ffmpeg_path", return_value=mock_local_path), \
         patch.object(svc, "_auto_download_ffmpeg", side_effect=RuntimeError("Download disabled in test")), \
         patch("app.services.ffmpeg_service.STATIC_FFMPEG_PATH", None), \
         patch("os.getenv", return_value=""):
        with pytest.raises(RuntimeError) as exc_info:
            svc.get_ffmpeg_binary()

        assert "FFmpeg is not installed or configured" in str(exc_info.value)



