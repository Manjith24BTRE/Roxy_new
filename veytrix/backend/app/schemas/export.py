from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.models.enums import ExportStatus, PlanType


class ExportSettings(BaseModel):
    """Configuration options for exporting a project timeline."""

    resolution: str = Field(default="1080p", description="Target resolution: 720p, 1080p, 2K, 4K")
    fps: int = Field(default=30, ge=15, le=60, description="Frames per second: 24, 30, 60")
    aspect_ratio: str = Field(default="16:9", description="Target aspect ratio: 16:9, 9:16, 1:1, 4:5")
    codec: str = Field(default="h264", description="Video codec: h264, hevc, vp9")
    bitrate: str = Field(default="standard", description="Target bitrate level: standard, high, extreme")
    format: str = Field(default="mp4", description="Output format extension: mp4, webm, mov")
    watermark: bool = Field(default=True, description="Whether to draw watermark on exported video")


class ExportCreate(BaseModel):
    """Request payload for triggering a project export."""

    project_id: UUID = Field(..., description="ID of the project to export")
    title: Optional[str] = Field(None, description="Custom export title")
    timeline_json: Optional[Dict[str, Any]] = Field(None, description="Current timeline JSON state")
    settings: ExportSettings = Field(default_factory=ExportSettings, description="Export video settings")


class ExportResponse(BaseModel):
    """Full details of an export job."""

    id: UUID
    project_id: UUID
    user_id: UUID
    title: str
    resolution: str
    fps: int
    format: str
    codec: str
    bitrate: str
    watermark: bool
    status: ExportStatus
    progress: int = Field(default=0, ge=0, le=100, description="Rendering progress percentage")
    file_url: Optional[str] = None
    storage_path: Optional[str] = None
    error_message: Optional[str] = None
    file_size_bytes: Optional[int] = None
    render_duration_seconds: Optional[float] = None
    download_count: int = 0
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class ExportStatusResponse(BaseModel):
    """Lightweight status response for polling export progress."""

    id: UUID
    status: ExportStatus
    progress: int
    stage: str = Field(default="rendering", description="Detailed render pipeline stage")
    file_url: Optional[str] = None
    error_message: Optional[str] = None
    updated_at: datetime


class ExportDownloadResponse(BaseModel):
    """Response containing secure signed download URL."""

    export_id: UUID
    download_url: str
    expires_in_seconds: int = 3600
    file_name: str


class ExportListResponse(BaseModel):
    """Paginated list of export jobs."""

    success: bool = True
    total: int
    page: int
    limit: int
    exports: List[ExportResponse]
