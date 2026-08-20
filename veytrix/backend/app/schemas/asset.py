from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.models.enums import AssetStatus, AssetType, PlanType


class AssetBase(BaseModel):
    """Base asset fields."""

    name: str
    type: AssetType = AssetType.IMAGE
    category: Optional[str] = None
    required_plan: PlanType = PlanType.FREE
    engine_key: Optional[str] = None
    thumbnail: Optional[str] = None
    duration: Optional[float] = None
    resolution: Optional[str] = None
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


class AssetCreate(AssetBase):
    """Schema for manual asset creation."""

    project_id: Optional[UUID] = None


class AssetUpdate(BaseModel):
    """Schema for updating asset metadata."""

    name: Optional[str] = None
    category: Optional[str] = None
    required_plan: Optional[PlanType] = None
    thumbnail: Optional[str] = None
    enabled: Optional[bool] = None
    metadata_json: Optional[Dict[str, Any]] = None


class AssetResponse(BaseModel):
    """Schema for returning single asset details."""

    id: UUID
    user_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    type: AssetType
    name: str
    file_url: Optional[str] = None
    storage_path: Optional[str] = None
    thumbnail: Optional[str] = None
    duration: Optional[float] = None
    resolution: Optional[str] = None
    status: AssetStatus
    required_plan: PlanType
    engine_key: Optional[str] = None
    category: Optional[str] = None
    enabled: bool
    version: int
    user_has_access: bool = True
    metadata_json: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime


class AssetListResponse(BaseModel):
    """Schema for returning paginated asset lists."""

    success: bool = True
    total: int
    page: int
    limit: int
    assets: List[AssetResponse]


class CatalogItemResponse(BaseModel):
    """Schema representing an effect, filter, or transition catalog item."""

    id: str
    name: str
    type: AssetType
    category: str
    thumbnail: Optional[str] = None
    required_plan: PlanType = PlanType.FREE
    engine_key: str
    enabled: bool = True
    version: int = 1
    user_has_access: bool = True
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CatalogListResponse(BaseModel):
    """Schema for returning catalog lists (effects, filters, transitions)."""

    success: bool = True
    total: int
    page: int
    limit: int
    items: List[CatalogItemResponse]
