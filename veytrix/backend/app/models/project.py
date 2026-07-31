from datetime import datetime, timezone
from typing import Any, Dict, Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from app.models.enums import ProjectStatus
from app.models.profile import utc_now


class ProjectModel(BaseModel):
    """Database model for project entity."""

    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    title: str = "Untitled Project"
    thumbnail_url: Optional[str] = None
    timeline_json: Dict[str, Any] = Field(default_factory=dict)
    status: ProjectStatus = ProjectStatus.DRAFT
    duration: float = 0.0
    aspect_ratio: str = "16:9"
    fps: int = 30
    resolution: str = "1080p"
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    last_opened_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
