from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from app.core.auth import get_current_user
from app.models.enums import AssetType, PlanType
from app.schemas.asset import (
    AssetCreate,
    AssetListResponse,
    AssetResponse,
    AssetUpdate,
    CatalogListResponse,
)
from app.schemas.user import UserProfile
from app.services.asset_service import AssetService

router = APIRouter()


def get_asset_service() -> AssetService:
    """Dependency provider for AssetService."""
    return AssetService()


@router.post("/upload", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def upload_asset(
    file: UploadFile = File(...),
    asset_type: AssetType = Form(...),
    name: Optional[str] = Form(None),
    project_id: Optional[UUID] = Form(None),
    category: Optional[str] = Form(None),
    required_plan: PlanType = Form(PlanType.FREE),
    duration: Optional[float] = Form(None),
    resolution: Optional[str] = Form(None),
    current_user: UserProfile = Depends(get_current_user),
    service: AssetService = Depends(get_asset_service),
) -> AssetResponse:
    """Uploads file to Supabase Storage bucket and creates database asset record."""
    return await service.upload_asset(
        file=file,
        asset_type=asset_type,
        user_id=current_user.id,
        name=name,
        project_id=project_id,
        category=category,
        required_plan=required_plan,
        duration=duration,
        resolution=resolution,
    )


@router.post("/metadata", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset_metadata(
    data: AssetCreate,
    current_user: UserProfile = Depends(get_current_user),
    service: AssetService = Depends(get_asset_service),
) -> AssetResponse:
    """Creates metadata-only asset entry."""
    return service.create_asset_metadata(data, current_user.id)


@router.get("", response_model=AssetListResponse, status_code=status.HTTP_200_OK)
async def list_assets(
    asset_type: Optional[AssetType] = Query(None),
    project_id: Optional[UUID] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    required_plan: Optional[PlanType] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: UserProfile = Depends(get_current_user),
    service: AssetService = Depends(get_asset_service),
) -> AssetListResponse:
    """Lists user assets with search, category filtering, plan checks, and pagination."""
    return service.list_assets(
        user_id=current_user.id,
        asset_type=asset_type,
        project_id=project_id,
        category=category,
        search=search,
        required_plan=required_plan,
        page=page,
        limit=limit,
    )


@router.get("/effects", response_model=CatalogListResponse, status_code=status.HTTP_200_OK)
async def list_effects(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    required_plan: Optional[PlanType] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: UserProfile = Depends(get_current_user),
    service: AssetService = Depends(get_asset_service),
) -> CatalogListResponse:
    """Lists 450 effects catalog with filtering, search, and user entitlement status."""
    return service.list_effects(
        user_id=current_user.id,
        category=category,
        search=search,
        required_plan=required_plan,
        page=page,
        limit=limit,
    )


@router.get("/filters", response_model=CatalogListResponse, status_code=status.HTTP_200_OK)
async def list_filters(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    required_plan: Optional[PlanType] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: UserProfile = Depends(get_current_user),
    service: AssetService = Depends(get_asset_service),
) -> CatalogListResponse:
    """Lists 200 filters catalog with filtering, search, and user entitlement status."""
    return service.list_filters(
        user_id=current_user.id,
        category=category,
        search=search,
        required_plan=required_plan,
        page=page,
        limit=limit,
    )


@router.get("/transitions", response_model=CatalogListResponse, status_code=status.HTTP_200_OK)
async def list_transitions(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    required_plan: Optional[PlanType] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: UserProfile = Depends(get_current_user),
    service: AssetService = Depends(get_asset_service),
) -> CatalogListResponse:
    """Lists 200 transitions catalog with filtering, search, and user entitlement status."""
    return service.list_transitions(
        user_id=current_user.id,
        category=category,
        search=search,
        required_plan=required_plan,
        page=page,
        limit=limit,
    )


@router.get("/{asset_id}", response_model=AssetResponse, status_code=status.HTTP_200_OK)
async def get_asset(
    asset_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
    service: AssetService = Depends(get_asset_service),
) -> AssetResponse:
    """Retrieves metadata and access status for a single asset."""
    return service.get_asset_by_id(asset_id, current_user.id)


@router.patch("/{asset_id}", response_model=AssetResponse, status_code=status.HTTP_200_OK)
async def update_asset(
    asset_id: UUID,
    data: AssetUpdate,
    current_user: UserProfile = Depends(get_current_user),
    service: AssetService = Depends(get_asset_service),
) -> AssetResponse:
    """Updates asset metadata."""
    return service.update_asset_metadata(asset_id, current_user.id, data)


@router.delete("/{asset_id}", status_code=status.HTTP_200_OK)
async def delete_asset(
    asset_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
    service: AssetService = Depends(get_asset_service),
) -> dict:
    """Deletes asset metadata and storage file."""
    service.delete_asset(asset_id, current_user.id)
    return {"success": True, "message": "Asset deleted successfully."}
