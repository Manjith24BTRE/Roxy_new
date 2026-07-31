from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, status
from app.core.auth import get_current_user
from app.models.enums import ExportStatus
from app.models.render_graph import RenderGraphDefinition
from app.schemas.export import (
    ExportCreate,
    ExportDownloadResponse,
    ExportListResponse,
    ExportResponse,
    ExportStatusResponse,
)
from app.schemas.user import UserProfile
from app.services.export_service import ExportService
from app.services.resource_monitor import resource_monitor
from app.services.ws_manager import ws_manager

router = APIRouter()


def get_export_service() -> ExportService:
    """FastAPI dependency provider for ExportService."""
    return ExportService()


@router.get("/metrics/health", status_code=status.HTTP_200_OK)
def get_render_metrics(
    service: ExportService = Depends(get_export_service),
) -> dict:
    """System resource, queue metrics, and worker health endpoint."""
    system_metrics = resource_monitor.get_system_metrics()
    queue_size = service.queue_manager.get_queue_size()
    active_count = service.queue_manager.get_active_count()
    return {
        "status": "healthy",
        "queue_size": queue_size,
        "active_renders": active_count,
        "system_resources": system_metrics,
    }


@router.post("/render-graph", response_model=RenderGraphDefinition, status_code=status.HTTP_200_OK)
def preview_render_graph(
    data: ExportCreate,
    current_user: UserProfile = Depends(get_current_user),
    service: ExportService = Depends(get_export_service),
) -> RenderGraphDefinition:
    """Generates optimized FFmpeg filter graph render definition WITHOUT executing FFmpeg or rendering video."""
    return service.generate_render_graph(data=data, user_id=current_user.id)


@router.post("", response_model=ExportResponse, status_code=status.HTTP_201_CREATED)
async def create_export(
    data: ExportCreate,
    current_user: UserProfile = Depends(get_current_user),
    service: ExportService = Depends(get_export_service),
) -> ExportResponse:
    """Triggers project video export pipeline."""
    return await service.create_export(data=data, user_id=current_user.id)


@router.get("", response_model=ExportListResponse, status_code=status.HTTP_200_OK)
def list_exports(
    project_id: Optional[UUID] = Query(None, description="Filter by project ID"),
    status_filter: Optional[ExportStatus] = Query(None, alias="status", description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: UserProfile = Depends(get_current_user),
    service: ExportService = Depends(get_export_service),
) -> ExportListResponse:
    """Lists export jobs for authenticated user."""
    return service.list_exports(
        user_id=current_user.id,
        project_id=project_id,
        status_filter=status_filter,
        page=page,
        limit=limit,
    )


@router.get("/{export_id}", response_model=ExportResponse, status_code=status.HTTP_200_OK)
def get_export_by_id(
    export_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
    service: ExportService = Depends(get_export_service),
) -> ExportResponse:
    """Retrieves specific export job details."""
    return service.get_export_by_id(export_id=export_id, user_id=current_user.id)


@router.get("/{export_id}/status", response_model=ExportStatusResponse, status_code=status.HTTP_200_OK)
def get_export_status(
    export_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
    service: ExportService = Depends(get_export_service),
) -> ExportStatusResponse:
    """Lightweight polling endpoint for real-time rendering progress."""
    return service.get_export_status(export_id=export_id, user_id=current_user.id)


@router.get("/{export_id}/download", response_model=ExportDownloadResponse, status_code=status.HTTP_200_OK)
def get_export_download(
    export_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
    service: ExportService = Depends(get_export_service),
) -> ExportDownloadResponse:
    """Generates signed download URL for completed export and tracks download history."""
    return service.get_export_download_url(export_id=export_id, user_id=current_user.id)


@router.get("/{export_id}/progress", response_model=ExportStatusResponse, status_code=status.HTTP_200_OK)
def get_export_progress(
    export_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
    service: ExportService = Depends(get_export_service),
) -> ExportStatusResponse:
    """Detailed progress tracking endpoint for active rendering jobs."""
    return service.get_export_status(export_id=export_id, user_id=current_user.id)


@router.post("/{export_id}/retry", response_model=ExportResponse, status_code=status.HTTP_200_OK)
async def retry_export(
    export_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
    service: ExportService = Depends(get_export_service),
) -> ExportResponse:
    """Retries a failed or cancelled video export job."""
    return await service.retry_export(export_id=export_id, user_id=current_user.id)


@router.post("/{export_id}/cancel", status_code=status.HTTP_200_OK)
async def cancel_export_post(
    export_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
    service: ExportService = Depends(get_export_service),
) -> dict:
    """Cancels an active rendering export job via POST."""
    success = await service.cancel_export_async(export_id=export_id, user_id=current_user.id)
    return {"success": success, "message": f"Export '{export_id}' cancelled successfully."}


@router.delete("/{export_id}", status_code=status.HTTP_200_OK)
def cancel_export_delete(
    export_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
    service: ExportService = Depends(get_export_service),
) -> dict:
    """Cancels or deletes an export job via DELETE."""
    success = service.cancel_export(export_id=export_id, user_id=current_user.id)
    return {"success": success, "message": f"Export '{export_id}' cancelled successfully."}


@router.websocket("/ws/{user_id}")
async def export_websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for subscription to real-time export progress events."""
    await ws_manager.connect(websocket, user_id)
    try:
        while True:
            # Keep-alive receive loop
            await websocket.receive_text()
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket, user_id)
