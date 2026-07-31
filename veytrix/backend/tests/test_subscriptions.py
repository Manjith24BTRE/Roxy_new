import time
from uuid import uuid4
import jwt
from fastapi.testclient import TestClient
from app.core.plans import PLAN_CONFIGS, get_plan_config
from app.models.enums import PlanType, SubscriptionStatus
from app.services.credit_service import credit_service
from app.services.entitlement_service import entitlement_service
from main import app

client = TestClient(app)
SECRET_KEY = "test-secret-key-12345"


def create_token(user_id: str) -> str:
    """Helper to generate JWT bearer tokens for subscription tests."""
    payload = {
        "sub": user_id,
        "email": f"{user_id}@example.com",
        "role": "authenticated",
        "exp": int(time.time()) + 3600,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def test_plan_configs_and_hierarchy():
    """Verify central plan matrix level hierarchy and default parameters."""
    free_cfg = get_plan_config(PlanType.FREE)
    pro_cfg = get_plan_config(PlanType.PRO)
    prem_cfg = get_plan_config(PlanType.PREMIUM)

    assert free_cfg.level == 0
    assert pro_cfg.level == 1
    assert prem_cfg.level == 2

    assert free_cfg.max_projects == 3
    assert pro_cfg.max_projects == 20
    assert prem_cfg.max_projects == 45

    assert free_cfg.max_export == "720p"
    assert pro_cfg.max_export == "1080p"
    assert prem_cfg.max_export == "4K"


def test_effective_plan_resolver_active_and_fallback():
    """Verify Effective Plan Resolver fallback logic for active vs expired subscriptions."""
    user_id = str(uuid4())

    # Default -> FREE
    assert entitlement_service.get_effective_plan(user_id) == PlanType.FREE

    # Active PRO -> PRO
    entitlement_service.set_user_subscription(user_id, PlanType.PRO, SubscriptionStatus.ACTIVE)
    assert entitlement_service.get_effective_plan(user_id) == PlanType.PRO

    # Expired PRO -> Fallback to FREE
    entitlement_service.set_user_subscription(user_id, PlanType.PRO, SubscriptionStatus.EXPIRED)
    assert entitlement_service.get_effective_plan(user_id) == PlanType.FREE

    # Cancelled PREMIUM -> Fallback to FREE
    entitlement_service.set_user_subscription(user_id, PlanType.PREMIUM, SubscriptionStatus.CANCELLED)
    assert entitlement_service.get_effective_plan(user_id) == PlanType.FREE


def test_export_resolution_permissions():
    """Verify resolution export permissions per effective plan."""
    user_id = str(uuid4())

    # FREE plan
    entitlement_service.set_user_subscription(user_id, PlanType.FREE, SubscriptionStatus.ACTIVE)
    assert entitlement_service.can_export_resolution(user_id, "720p") is True
    assert entitlement_service.can_export_resolution(user_id, "1080p") is False
    assert entitlement_service.can_export_resolution(user_id, "4K") is False

    # PRO plan
    entitlement_service.set_user_subscription(user_id, PlanType.PRO, SubscriptionStatus.ACTIVE)
    assert entitlement_service.can_export_resolution(user_id, "720p") is True
    assert entitlement_service.can_export_resolution(user_id, "1080p") is True
    assert entitlement_service.can_export_resolution(user_id, "4K") is False

    # PREMIUM plan
    entitlement_service.set_user_subscription(user_id, PlanType.PREMIUM, SubscriptionStatus.ACTIVE)
    assert entitlement_service.can_export_resolution(user_id, "4K") is True


def test_watermark_and_asset_permissions():
    """Verify watermark and asset entitlement permissions across plan tiers."""
    user_id = str(uuid4())

    # FREE
    entitlement_service.set_user_subscription(user_id, PlanType.FREE, SubscriptionStatus.ACTIVE)
    assert entitlement_service.can_remove_watermark(user_id) is False
    assert entitlement_service.can_use_custom_watermark(user_id) is False
    assert entitlement_service.can_access_asset(user_id, PlanType.PRO) is False

    # PRO
    entitlement_service.set_user_subscription(user_id, PlanType.PRO, SubscriptionStatus.ACTIVE)
    assert entitlement_service.can_remove_watermark(user_id) is True
    assert entitlement_service.can_use_custom_watermark(user_id) is False
    assert entitlement_service.can_access_asset(user_id, PlanType.PRO) is True
    assert entitlement_service.can_access_asset(user_id, PlanType.PREMIUM) is False

    # PREMIUM
    entitlement_service.set_user_subscription(user_id, PlanType.PREMIUM, SubscriptionStatus.ACTIVE)
    assert entitlement_service.can_remove_watermark(user_id) is True
    assert entitlement_service.can_use_custom_watermark(user_id) is True
    assert entitlement_service.can_access_asset(user_id, PlanType.PREMIUM) is True


def test_credit_service_operations():
    """Verify AI credit allocation, consumption, and reset routines."""
    user_id = str(uuid4())

    # Default allocation for FREE
    entitlement_service.set_user_subscription(user_id, PlanType.FREE, SubscriptionStatus.ACTIVE)
    credits_obj = credit_service.get_credit_balance(user_id)
    assert credits_obj.balance == 250

    # Consume credits
    consumed = credit_service.consume_credits(user_id, 50)
    assert consumed.balance == 200

    # Reset credits
    reset_obj = credit_service.reset_credits(user_id, 500)
    assert reset_obj.balance == 500


def test_subscription_and_credit_api_endpoints(monkeypatch):
    """Verify REST endpoints GET /subscriptions/me, GET /subscriptions/credits, and POST /subscriptions/credits/consume."""
    u_id = str(uuid4())
    token = create_token(u_id)
    headers = {"Authorization": f"Bearer {token}"}
    monkeypatch.setattr("app.core.config.settings.JWT_SECRET", SECRET_KEY)

    # Set PRO active subscription
    entitlement_service.set_user_subscription(u_id, PlanType.PRO, SubscriptionStatus.ACTIVE)

    # GET /subscriptions/me
    sub_res = client.get("/subscriptions/me", headers=headers)
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert sub_data["effective_plan"] == "PRO"
    assert sub_data["entitlements"]["max_export"] == "1080p"
    assert sub_data["entitlements"]["watermark_removal"] is True

    # GET /subscriptions/credits
    cred_res = client.get("/subscriptions/credits", headers=headers)
    assert cred_res.status_code == 200
    assert cred_res.json()["balance"] >= 0

    # POST /subscriptions/credits/consume
    cons_res = client.post("/subscriptions/credits/consume", headers=headers, json={"amount": 25})
    assert cons_res.status_code == 200
    assert cons_res.json()["balance"] == cred_res.json()["balance"] - 25
