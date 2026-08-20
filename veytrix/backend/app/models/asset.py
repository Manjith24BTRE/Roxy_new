from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from app.models.enums import AssetStatus, AssetType, PlanType
from app.models.profile import utc_now


class AssetModel(BaseModel):
    """Database model for asset entity."""

    id: UUID = Field(default_factory=uuid4)
    user_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    type: AssetType = AssetType.IMAGE
    name: str
    file_url: Optional[str] = None
    storage_path: Optional[str] = None
    thumbnail: Optional[str] = None
    duration: Optional[float] = None
    resolution: Optional[str] = None
    status: AssetStatus = AssetStatus.READY
    required_plan: PlanType = PlanType.FREE
    engine_key: Optional[str] = None
    category: Optional[str] = None
    enabled: bool = True
    version: int = 1
    metadata_json: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
