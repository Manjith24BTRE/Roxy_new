from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID, uuid4
from fastapi import HTTPException, UploadFile, status
from app.core.catalog_data import get_effects_catalog, get_filters_catalog, get_transitions_catalog
from app.core.logging import logger
from app.core.plans import is_plan_sufficient
from app.core.supabase import get_supabase_admin_client
from app.models.asset import AssetModel
from app.models.enums import AssetStatus, AssetType, PlanType
from app.schemas.asset import (
    AssetCreate,
    AssetListResponse,
    AssetResponse,
    AssetUpdate,
    CatalogItemResponse,
    CatalogListResponse,
)
from app.services.entitlement_service import EntitlementService
from app.services.storage_service import StorageService

_LOCAL_ASSETS: Dict[UUID, AssetModel] = {}


class AssetService:
    """Central production service managing all asset uploads, metadata, storage, and design catalogs."""

    def __init__(
        self,
        storage_service: Optional[StorageService] = None,
        entitlement_service: Optional[EntitlementService] = None,
    ):
        self.storage_service = storage_service or StorageService()
        self.entitlement_service = entitlement_service or EntitlementService()
        self.supabase = get_supabase_admin_client()

    def _convert_model_to_response(
        self, asset: AssetModel, user_plan: PlanType = PlanType.FREE
    ) -> AssetResponse:
        """Converts AssetModel to AssetResponse with user entitlement check."""
        user_has_access = is_plan_sufficient(user_plan, asset.required_plan)
        return AssetResponse(
            id=asset.id,
            user_id=asset.user_id,
            project_id=asset.project_id,
            type=asset.type,
            name=asset.name,
            file_url=asset.file_url,
            storage_path=asset.storage_path,
            thumbnail=asset.thumbnail,
            duration=asset.duration,
            resolution=asset.resolution,
            status=asset.status,
            required_plan=asset.required_plan,
            engine_key=asset.engine_key,
            category=asset.category,
            enabled=asset.enabled,
            version=asset.version,
            user_has_access=user_has_access,
            metadata_json=asset.metadata_json,
            created_at=asset.created_at,
            updated_at=asset.updated_at,
        )

    def _get_user_effective_plan(self, user_id: str) -> PlanType:
        """Fetches effective plan for user from EntitlementService."""
        try:
            return self.entitlement_service.get_effective_plan(user_id)
        except Exception:
            return PlanType.FREE

    async def upload_asset(
        self,
        file: UploadFile,
        asset_type: AssetType,
        user_id: str,
        name: Optional[str] = None,
        project_id: Optional[UUID] = None,
        category: Optional[str] = None,
        required_plan: PlanType = PlanType.FREE,
        duration: Optional[float] = None,
        resolution: Optional[str] = None,
        metadata_json: Optional[Dict[str, Any]] = None,
    ) -> AssetResponse:
        """Uploads file to Supabase Storage and creates corresponding Asset record."""
        owner_id = UUID(user_id)
        asset_name = name or file.filename or f"Uploaded {asset_type.value}"

        file_url, storage_path = await self.storage_service.upload_file(
            file=file,
            asset_type=asset_type,
            user_id=user_id,
            custom_filename=asset_name,
        )

        now = datetime.now(timezone.utc)

        asset_model = AssetModel(
            id=uuid4(),
            user_id=owner_id,
            project_id=project_id,
            type=asset_type,
            name=asset_name,
            file_url=file_url,
            storage_path=storage_path,
            thumbnail=file_url if asset_type in (AssetType.IMAGE, AssetType.THUMBNAIL) else None,
            duration=duration,
            resolution=resolution,
            status=AssetStatus.READY,
            required_plan=required_plan,
            category=category,
            enabled=True,
            version=1,
            metadata_json=metadata_json or {},
            created_at=now,
            updated_at=now,
        )

        if self.supabase:
            try:
                self.supabase.table("assets").insert({
                    "id": str(asset_model.id),
                    "type": asset_model.type.value,
                    "name": asset_model.name,
                    "required_plan": asset_model.required_plan.value,
                    "category": asset_model.category,
                    "thumbnail": asset_model.thumbnail,
                    "enabled": asset_model.enabled,
                    "version": asset_model.version,
                }).execute()
            except Exception as exc:
                logger.warning(f"Supabase DB insert warning ({exc}). Using memory fallback.")

        _LOCAL_ASSETS[asset_model.id] = asset_model

        user_plan = self._get_user_effective_plan(user_id)
        return self._convert_model_to_response(asset_model, user_plan)

    def create_asset_metadata(self, data: AssetCreate, user_id: str) -> AssetResponse:
        """Creates asset metadata record directly."""
        owner_id = UUID(user_id)
        now = datetime.now(timezone.utc)
        asset_model = AssetModel(
            id=uuid4(),
            user_id=owner_id,
            project_id=data.project_id,
            type=data.type,
            name=data.name,
            category=data.category,
            required_plan=data.required_plan,
            engine_key=data.engine_key,
            thumbnail=data.thumbnail,
            duration=data.duration,
            resolution=data.resolution,
            status=AssetStatus.READY,
            enabled=True,
            version=1,
            metadata_json=data.metadata_json,
            created_at=now,
            updated_at=now,
        )

        _LOCAL_ASSETS[asset_model.id] = asset_model
        user_plan = self._get_user_effective_plan(user_id)
        return self._convert_model_to_response(asset_model, user_plan)

    def get_asset_by_id(self, asset_id: UUID, user_id: str) -> AssetResponse:
        """Retrieves single asset by ID."""
        asset = _LOCAL_ASSETS.get(asset_id)
        if not asset or asset.status == AssetStatus.DELETED:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset with ID '{asset_id}' not found.",
            )

        owner_str = str(asset.user_id) if asset.user_id else None
        if owner_str and owner_str != user_id and not asset.enabled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: you do not own this asset.",
            )

        user_plan = self._get_user_effective_plan(user_id)
        return self._convert_model_to_response(asset, user_plan)

    def list_assets(
        self,
        user_id: str,
        asset_type: Optional[AssetType] = None,
        project_id: Optional[UUID] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        required_plan: Optional[PlanType] = None,
        page: int = 1,
        limit: int = 20,
    ) -> AssetListResponse:
        """Lists user assets with filtering, search, and pagination."""
        all_assets = [
            a for a in _LOCAL_ASSETS.values()
            if a.status != AssetStatus.DELETED and (str(a.user_id) == user_id or a.user_id is None)
        ]

        if asset_type:
            all_assets = [a for a in all_assets if a.type == asset_type]

        if project_id:
            all_assets = [a for a in all_assets if a.project_id == project_id]

        if category:
            all_assets = [a for a in all_assets if a.category and a.category.lower() == category.lower()]

        if required_plan:
            all_assets = [a for a in all_assets if a.required_plan == required_plan]

        if search:
            query = search.lower()
            all_assets = [
                a for a in all_assets
                if query in a.name.lower() or (a.category and query in a.category.lower())
            ]

        all_assets.sort(key=lambda a: a.created_at, reverse=True)

        total = len(all_assets)
        start = (page - 1) * limit
        end = start + limit
        paged_assets = all_assets[start:end]

        user_plan = self._get_user_effective_plan(user_id)
        responses = [self._convert_model_to_response(a, user_plan) for a in paged_assets]

        return AssetListResponse(
            success=True,
            total=total,
            page=page,
            limit=limit,
            assets=responses,
        )

    def update_asset_metadata(self, asset_id: UUID, user_id: str, data: AssetUpdate) -> AssetResponse:
        """Updates asset metadata."""
        asset = _LOCAL_ASSETS.get(asset_id)
        if not asset or asset.status == AssetStatus.DELETED:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset with ID '{asset_id}' not found.",
            )

        if str(asset.user_id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: you do not own this asset.",
            )

        if data.name is not None:
            asset.name = data.name
        if data.category is not None:
            asset.category = data.category
        if data.required_plan is not None:
            asset.required_plan = data.required_plan
        if data.thumbnail is not None:
            asset.thumbnail = data.thumbnail
        if data.enabled is not None:
            asset.enabled = data.enabled
        if data.metadata_json is not None:
            asset.metadata_json.update(data.metadata_json)

        asset.updated_at = datetime.now(timezone.utc)
        _LOCAL_ASSETS[asset_id] = asset

        user_plan = self._get_user_effective_plan(user_id)
        return self._convert_model_to_response(asset, user_plan)

    def delete_asset(self, asset_id: UUID, user_id: str) -> bool:
        """Deletes asset metadata and storage file."""
        asset = _LOCAL_ASSETS.get(asset_id)
        if not asset or asset.status == AssetStatus.DELETED:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset with ID '{asset_id}' not found.",
            )

        if str(asset.user_id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: you do not own this asset.",
            )

        if asset.storage_path:
            self.storage_service.delete_file(asset.storage_path, asset.type)

        asset.status = AssetStatus.DELETED
        asset.updated_at = datetime.now(timezone.utc)
        _LOCAL_ASSETS[asset_id] = asset
        return True

    def list_effects(
        self,
        user_id: str,
        category: Optional[str] = None,
        search: Optional[str] = None,
        required_plan: Optional[PlanType] = None,
        page: int = 1,
        limit: int = 20,
    ) -> CatalogListResponse:
        """Lists 450 effects catalog with filtering, search, plan evaluation, and pagination."""
        user_plan = self._get_user_effective_plan(user_id)
        effects = get_effects_catalog()

        if category:
            effects = [e for e in effects if e.category.lower() == category.lower()]

        if required_plan:
            effects = [e for e in effects if e.required_plan == required_plan]

        if search:
            query = search.lower()
            effects = [e for e in effects if query in e.name.lower() or query in e.category.lower()]

        total = len(effects)
        start = (page - 1) * limit
        end = start + limit
        paged_items = effects[start:end]

        items_response = [
            CatalogItemResponse(
                id=item.id,
                name=item.name,
                type=item.type,
                category=item.category,
                thumbnail=item.thumbnail,
                required_plan=item.required_plan,
                engine_key=item.engine_key,
                enabled=item.enabled,
                version=item.version,
                user_has_access=is_plan_sufficient(user_plan, item.required_plan),
                metadata=item.metadata,
            )
            for item in paged_items
        ]

        return CatalogListResponse(
            success=True,
            total=total,
            page=page,
            limit=limit,
            items=items_response,
        )

    def list_filters(
        self,
        user_id: str,
        category: Optional[str] = None,
        search: Optional[str] = None,
        required_plan: Optional[PlanType] = None,
        page: int = 1,
        limit: int = 20,
    ) -> CatalogListResponse:
        """Lists 200 filters catalog with filtering, search, plan evaluation, and pagination."""
        user_plan = self._get_user_effective_plan(user_id)
        filters = get_filters_catalog()

        if category:
            filters = [f for f in filters if f.category.lower() == category.lower()]

        if required_plan:
            filters = [f for f in filters if f.required_plan == required_plan]

        if search:
            query = search.lower()
            filters = [f for f in filters if query in f.name.lower() or query in f.category.lower()]

        total = len(filters)
        start = (page - 1) * limit
        end = start + limit
        paged_items = filters[start:end]

        items_response = [
            CatalogItemResponse(
                id=item.id,
                name=item.name,
                type=item.type,
                category=item.category,
                thumbnail=item.thumbnail,
                required_plan=item.required_plan,
                engine_key=item.engine_key,
                enabled=item.enabled,
                version=item.version,
                user_has_access=is_plan_sufficient(user_plan, item.required_plan),
                metadata=item.metadata,
            )
            for item in paged_items
        ]

        return CatalogListResponse(
            success=True,
            total=total,
            page=page,
            limit=limit,
            items=items_response,
        )

    def list_transitions(
        self,
        user_id: str,
        category: Optional[str] = None,
        search: Optional[str] = None,
        required_plan: Optional[PlanType] = None,
        page: int = 1,
        limit: int = 20,
    ) -> CatalogListResponse:
        """Lists 200 transitions catalog with filtering, search, plan evaluation, and pagination."""
        user_plan = self._get_user_effective_plan(user_id)
        transitions = get_transitions_catalog()

        if category:
            transitions = [t for t in transitions if t.category.lower() == category.lower()]

        if required_plan:
            transitions = [t for t in transitions if t.required_plan == required_plan]

        if search:
            query = search.lower()
            transitions = [t for t in transitions if query in t.name.lower() or query in t.category.lower()]

        total = len(transitions)
        start = (page - 1) * limit
        end = start + limit
        paged_items = transitions[start:end]

        items_response = [
            CatalogItemResponse(
                id=item.id,
                name=item.name,
                type=item.type,
                category=item.category,
                thumbnail=item.thumbnail,
                required_plan=item.required_plan,
                engine_key=item.engine_key,
                enabled=item.enabled,
                version=item.version,
                user_has_access=is_plan_sufficient(user_plan, item.required_plan),
                metadata=item.metadata,
            )
            for item in paged_items
        ]

        return CatalogListResponse(
            success=True,
            total=total,
            page=page,
            limit=limit,
            items=items_response,
        )
