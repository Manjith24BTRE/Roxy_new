"""Unit and integration tests for QueueManager, RenderWorker, and full end-to-end rendering pipeline execution."""

from uuid import uuid4
import pytest
from app.builders.ffmpeg_builder import FFmpegBuilder
from app.models.enums import ExportStatus
from app.models.render_graph import RenderGraphDefinition
from app.models.timeline import TimelineModel
from app.schemas.export import ExportCreate, ExportSettings
from app.services.export_service import ExportService
from app.services.render_engine import QueueManager, RenderTask, RenderWorker
from app.services.timeline_parser import TimelineParser


@pytest.fixture
def queue_manager():
    return QueueManager()


@pytest.fixture
def render_worker():
    return RenderWorker()


@pytest.fixture
def parser():
    return TimelineParser()


@pytest.fixture
def ffmpeg_builder():
    return FFmpegBuilder()


@pytest.mark.anyio
async def test_queue_manager_enqueue_dequeue(queue_manager, parser, ffmpeg_builder):
    timeline = parser.parse({"duration": 5.0, "tracks": []})
    render_graph = ffmpeg_builder.build_render_definition(timeline)
    export_id = uuid4()

    task = RenderTask(
        export_id=export_id,
        user_id="00000000-0000-0000-0000-000000000001",
        project_id=uuid4(),
        timeline_model=timeline,
        render_graph=render_graph,
        settings=ExportSettings(),
        effective_watermark=True,
    )

    await queue_manager.enqueue(task)
    assert queue_manager.get_queue_size() == 1

    dequeued = await queue_manager.dequeue()
    assert dequeued is not None
    assert dequeued.export_id == export_id
    assert queue_manager.get_queue_size() == 0


@pytest.mark.anyio
async def test_render_worker_process_task(render_worker, parser, ffmpeg_builder):
    timeline = parser.parse({"duration": 2.0, "tracks": []})
    render_graph = ffmpeg_builder.build_render_definition(timeline)
    export_id = uuid4()

    task = RenderTask(
        export_id=export_id,
        user_id="00000000-0000-0000-0000-000000000001",
        project_id=uuid4(),
        timeline_model=timeline,
        render_graph=render_graph,
        settings=ExportSettings(format="mp4"),
        effective_watermark=True,
    )

    progress_events = []

    def on_progress(eid, p, msg):
        progress_events.append((p, msg))

    success, file_url, storage_path, err = await render_worker.process_task(
        task=task,
        progress_callback=on_progress,
    )

    assert success is True
    assert file_url is not None
    assert storage_path is not None
    assert len(progress_events) > 0
    assert progress_events[-1][0] == 100


@pytest.mark.anyio
async def test_export_service_end_to_end_pipeline():
    export_service = ExportService()
    user_id = "00000000-0000-0000-0000-000000000001"
    project_id = uuid4()

    payload = ExportCreate(
        project_id=project_id,
        title="Production Integration Test Render",
        timeline_json={"duration": 3.0, "tracks": []},
        settings=ExportSettings(resolution="720p", fps=30, format="mp4"),
    )

    export_res = await export_service.create_export(data=payload, user_id=user_id)
    assert export_res.id is not None
    assert export_res.status in (ExportStatus.QUEUED, ExportStatus.RENDERING, ExportStatus.COMPLETED)

    # Allow worker loop execution
    import asyncio
    await asyncio.sleep(0.5)

    status_res = export_service.get_export_status(export_res.id, user_id)
    assert status_res.status in (ExportStatus.COMPLETED, ExportStatus.RENDERING, ExportStatus.UPLOADING)
