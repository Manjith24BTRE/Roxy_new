from datetime import datetime
from typing import Dict, Optional, Tuple
from uuid import UUID, uuid4
from app.core.logging import logger
from app.core.plans import (
    PLAN_CONFIGS,
    PLAN_LEVELS,
    RESOLUTION_LEVELS,
    PlanConfig,
    get_plan_config,
)
from app.core.supabase import init_supabase_client
from app.models.enums import PlanType, SubscriptionStatus
from app.models.profile import utc_now
from app.models.subscription import SubscriptionModel
from app.schemas.subscription import EntitlementSummary
from app.services.project_service import parse_uuid

# Thread-safe in-memory subscription store for tests/offline
_subscriptions_store: Dict[str, SubscriptionModel] = {}


class EntitlementService:
    """Central Entitlement Service resolving Effective Plans and Feature Permissions."""

    @staticmethod
    def get_user_subscription(user_id: UUID | str) -> SubscriptionModel:
        """Fetch subscription record for user, defaulting to FREE active subscription if unassigned."""
        u_id = str(parse_uuid(user_id))

        subscription = _subscriptions_store.get(u_id)

        if not subscription and init_supabase_client():
            client = init_supabase_client()
            try:
                res = client.table("subscriptions").select("*").eq("user_id", u_id).execute()
                if res.data and len(res.data) > 0:
                    row = res.data[0]
                    subscription = SubscriptionModel(
                        id=UUID(row["id"]),
                        user_id=UUID(row["user_id"]),
                        plan=PlanType(row.get("plan", "FREE")),
                        status=SubscriptionStatus(row.get("status", "active")),
                        created_at=datetime.fromisoformat(row["created_at"]) if row.get("created_at") else utc_now(),
                        updated_at=datetime.fromisoformat(row["updated_at"]) if row.get("updated_at") else utc_now(),
                    )
                    _subscriptions_store[u_id] = subscription
            except Exception as exc:
                logger.warning(f"Supabase DB subscription fetch notice: {exc}")

        if not subscription:
            subscription = SubscriptionModel(
                id=uuid4(),
                user_id=parse_uuid(user_id),
                plan=PlanType.FREE,
                status=SubscriptionStatus.ACTIVE,
                created_at=utc_now(),
                updated_at=utc_now(),
            )
            _subscriptions_store[u_id] = subscription

        return subscription

    @staticmethod
    def set_user_subscription(user_id: UUID | str, plan: PlanType, status: SubscriptionStatus) -> SubscriptionModel:
        """Update or assign user subscription for testing/management."""
        u_id = str(parse_uuid(user_id))
        subscription = SubscriptionModel(
            id=uuid4(),
            user_id=parse_uuid(user_id),
            plan=plan,
            status=status,
            created_at=utc_now(),
            updated_at=utc_now(),
        )
        _subscriptions_store[u_id] = subscription

        client = init_supabase_client()
        if client:
            try:
                payload = {
                    "user_id": u_id,
                    "plan": plan.value,
                    "status": status.value,
                    "updated_at": subscription.updated_at.isoformat(),
                }
                client.table("subscriptions").upsert(payload, on_conflict="user_id").execute()
            except Exception as exc:
                logger.warning(f"Supabase DB subscription upsert notice: {exc}")

        return subscription

    @staticmethod
    def get_effective_plan(user_id: UUID | str) -> PlanType:
        """
        Effective Plan Resolver:
        Resolves the user's active entitlement plan. If subscription is expired,
        cancelled, or past due, falls back automatically to FREE.
        """
        sub = EntitlementService.get_user_subscription(user_id)

        if sub.status in (SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING):
            return sub.plan

        # Expired, Cancelled, Past Due -> Fallback to FREE
        return PlanType.FREE

    @staticmethod
    def get_effective_plan_config(user_id: UUID | str) -> PlanConfig:
        """Get central PlanConfig for user's effective plan."""
        effective_plan = EntitlementService.get_effective_plan(user_id)
        return get_plan_config(effective_plan)

    @staticmethod
    def can_access_asset(user_id: UUID | str, required_plan: PlanType) -> bool:
        """Check if user's effective plan level satisfies asset's required plan tier."""
        effective_plan = EntitlementService.get_effective_plan(user_id)
        user_level = PLAN_LEVELS.get(effective_plan, 0)
        required_level = PLAN_LEVELS.get(required_plan, 0)
        return user_level >= required_level

    @staticmethod
    def can_export_resolution(user_id: UUID | str, target_resolution: str) -> bool:
        """Check if user's effective plan supports rendering target resolution."""
        config = EntitlementService.get_effective_plan_config(user_id)
        max_allowed_res = config.max_export
        user_max_level = RESOLUTION_LEVELS.get(max_allowed_res.lower(), 0)
        target_level = RESOLUTION_LEVELS.get(target_resolution.lower(), 0)
        return target_level <= user_max_level

    @staticmethod
    def can_create_project(user_id: UUID | str, current_project_count: int) -> Tuple[bool, int]:
        """Check if user can create a new project based on effective project limit."""
        config = EntitlementService.get_effective_plan_config(user_id)
        max_projects = config.max_projects
        can_create = current_project_count < max_projects
        return can_create, max_projects

    @staticmethod
    def can_remove_watermark(user_id: UUID | str) -> bool:
        """Check if user's effective plan allows exporting without watermark."""
        config = EntitlementService.get_effective_plan_config(user_id)
        return config.watermark_removal

    @staticmethod
    def can_use_custom_watermark(user_id: UUID | str) -> bool:
        """Check if user's effective plan allows applying a custom brand watermark."""
        config = EntitlementService.get_effective_plan_config(user_id)
        return config.custom_watermark

    @staticmethod
    def can_use_feature(user_id: UUID | str, feature_key: str) -> bool:
        """Check feature entitlement by feature key."""
        config = EntitlementService.get_effective_plan_config(user_id)
        if feature_key == "watermark_removal":
            return config.watermark_removal
        elif feature_key == "custom_watermark":
            return config.custom_watermark
        elif feature_key == "high_priority":
            return config.command_priority in ("high", "highest")
        return True

    @staticmethod
    def get_user_entitlements(user_id: UUID | str) -> EntitlementSummary:
        """Get comprehensive entitlement summary for user."""
        sub = EntitlementService.get_user_subscription(user_id)
        effective_plan = EntitlementService.get_effective_plan(user_id)
        config = get_plan_config(effective_plan)

        return EntitlementSummary(
            effective_plan=effective_plan,
            raw_plan=sub.plan,
            status=sub.status,
            level=config.level,
            max_projects=config.max_projects,
            max_export=config.max_export,
            watermark_removal=config.watermark_removal,
            custom_watermark=config.custom_watermark,
            command_priority=config.command_priority,
        )


entitlement_service = EntitlementService()
