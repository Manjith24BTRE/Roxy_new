from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator
from app.models.enums import ProjectStatus
from app.models.project import ProjectModel


class ProjectCreate(BaseModel):
    """Schema for creating a new project."""

    title: str = Field(default="Untitled Project")
    thumbnail_url: Optional[str] = None
    timeline_json: Optional[Dict[str, Any]] = Field(default_factory=dict)
    duration: Optional[float] = 0.0
    aspect_ratio: Optional[str] = "16:9"
    fps: Optional[int] = 30
    resolution: Optional[str] = "1080p"

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Project title cannot be empty.")
        return v.strip()


class ProjectUpdate(BaseModel):
    """Schema for updating an existing project."""

    title: Optional[str] = None
    thumbnail_url: Optional[str] = None
    timeline_json: Optional[Dict[str, Any]] = None
    status: Optional[ProjectStatus] = None
    duration: Optional[float] = None
    aspect_ratio: Optional[str] = None
    fps: Optional[int] = None
    resolution: Optional[str] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Project title cannot be empty.")
        return v.strip() if v is not None else None


class ProjectRename(BaseModel):
    """Schema for renaming a project."""

    title: str

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Project title cannot be empty.")
        return v.strip()


class ProjectAutosave(BaseModel):
    """Schema for project autosave operations."""

    timeline_json: Dict[str, Any]
    duration: Optional[float] = None
    aspect_ratio: Optional[str] = None


class ProjectResponse(BaseModel):
    """Schema for single project responses."""

    success: bool = True
    project: ProjectModel


class ProjectListResponse(BaseModel):
    """Schema for paginated project list responses."""

    success: bool = True
    projects: List[ProjectModel]
    total: int
    page: int
    limit: int
