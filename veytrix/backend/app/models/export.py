from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from app.models.enums import ExportStatus
from app.models.profile import utc_now


class ExportModel(BaseModel):
    """Database model for project export job entity with comprehensive performance & download history fields."""

    id: UUID = Field(default_factory=uuid4)
    project_id: UUID
    user_id: UUID
    title: str = "Export Job"
    resolution: str = "1080p"
    fps: int = 30
    format: str = "mp4"
    codec: str = "h264"
    bitrate: str = "standard"
    watermark: bool = True
    status: ExportStatus = ExportStatus.PENDING
    progress: int = 0
    file_url: Optional[str] = None
    storage_path: Optional[str] = None
    error_message: Optional[str] = None

    # Production History & Performance Metrics
    file_size_bytes: Optional[int] = Field(None, description="Output video file size in bytes")
    render_duration_seconds: Optional[float] = Field(None, description="Total render execution duration in seconds")
    download_count: int = Field(default=0, description="Total number of completed file downloads")
    completed_at: Optional[datetime] = Field(None, description="Completion timestamp")

    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
