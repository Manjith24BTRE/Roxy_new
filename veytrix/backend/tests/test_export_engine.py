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
def queue_manager():
    return QueueManager()


@pytest.fixture
def render_worker():
    return RenderWorker()


@pytest.fixture
def export_service():
    return ExportService()


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
