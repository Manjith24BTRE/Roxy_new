"""Automated test suite verifying DEVELOPER_MODE entitlement bypass and production mode strict enforcement."""

import pytest
from uuid import uuid4
from app.core.config import settings
from app.models.enums import PlanType, SubscriptionStatus
from app.models.timeline import EffectData, FilterData, TransitionData
from app.schemas.export import ExportCreate, ExportSettings
from app.services.asset_resolver import AssetResolver
from app.services.entitlement_service import EntitlementService
from app.services.export_service import ExportService


@pytest.fixture(autouse=True)
def restore_dev_mode():
    original = settings.DEVELOPER_MODE
    yield
    settings.DEVELOPER_MODE = original


def test_production_mode_enforces_restrictions():
    """Verify that DEVELOPER_MODE=False enforces strict subscription plan restrictions."""
    settings.DEVELOPER_MODE = False
    user_id = str(uuid4())

    # FREE user subscription
    EntitlementService.set_user_subscription(user_id, PlanType.FREE, SubscriptionStatus.ACTIVE)

    # Asset access check for PREMIUM asset
    can_access = EntitlementService.can_access_asset(user_id, PlanType.PREMIUM)
    assert can_access is False

    # Resolution check for 4K
    can_4k = EntitlementService.can_export_resolution(user_id, "4K")
    assert can_4k is False


def test_developer_mode_bypasses_all_entitlements():
    """Verify that DEVELOPER_MODE=True unlocks all FREE, PRO, and PREMIUM assets for all users."""
    settings.DEVELOPER_MODE = True
    user_id = str(uuid4())

    # FREE user subscription
    EntitlementService.set_user_subscription(user_id, PlanType.FREE, SubscriptionStatus.ACTIVE)

    # Effective plan returns PREMIUM in dev mode
    effective_plan = EntitlementService.get_effective_plan(user_id)
    assert effective_plan == PlanType.PREMIUM

    # Asset access check for PREMIUM asset
    can_access = EntitlementService.can_access_asset(user_id, PlanType.PREMIUM)
    assert can_access is True

    # Resolution check for 4K
    can_4k = EntitlementService.can_export_resolution(user_id, "4K")
    assert can_4k is True

    # AssetResolver resolution checks
    resolver = AssetResolver()
    premium_eff = EffectData(effect_id="blur-gaussian", required_plan=PlanType.PREMIUM)
    render_def = resolver.resolve_effect(premium_eff, user_id=user_id)
    assert render_def.user_has_access is True


def test_developer_mode_export_validation_bypass():
    """Verify that export creation for FREE user with PREMIUM resolution and assets succeeds under DEVELOPER_MODE=True."""
    settings.DEVELOPER_MODE = True
    user_id = str(uuid4())

    EntitlementService.set_user_subscription(user_id, PlanType.FREE, SubscriptionStatus.ACTIVE)

    service = ExportService()
    settings_payload = ExportSettings(resolution="4k", watermark=False)
    user_plan = service._validate_export_entitlements(user_id, settings_payload)

    assert user_plan == PlanType.PREMIUM
