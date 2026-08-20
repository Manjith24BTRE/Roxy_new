from fastapi import APIRouter, Depends, status
from app.core.auth import get_current_user
from app.schemas.subscription import (
    ConsumeCreditsRequest,
    CreditResponse,
    SubscriptionResponse,
)
from app.schemas.user import UserProfile
from app.services.credit_service import CreditService
from app.services.entitlement_service import EntitlementService

router = APIRouter()


@router.get("/me", response_model=SubscriptionResponse, status_code=status.HTTP_200_OK)
async def get_my_subscription(
    current_user: UserProfile = Depends(get_current_user),
) -> SubscriptionResponse:
    """Retrieve current subscription status, effective plan, and feature entitlements."""
    sub = EntitlementService.get_user_subscription(current_user.id)
    effective_plan = EntitlementService.get_effective_plan(current_user.id)
    entitlements = EntitlementService.get_user_entitlements(current_user.id)

    return SubscriptionResponse(
        success=True,
        plan=sub.plan,
        effective_plan=effective_plan,
        status=sub.status,
        entitlements=entitlements,
    )


@router.get("/credits", response_model=CreditResponse, status_code=status.HTTP_200_OK)
async def get_my_credits(
    current_user: UserProfile = Depends(get_current_user),
) -> CreditResponse:
    """Retrieve authenticated user's current AI credit balance."""
    credit_obj = CreditService.get_credit_balance(current_user.id)
    return CreditResponse(
        success=True,
        balance=credit_obj.balance,
        credit_mode=credit_obj.credit_mode,
        last_reset=credit_obj.last_reset.isoformat(),
    )


@router.post("/credits/consume", response_model=CreditResponse, status_code=status.HTTP_200_OK)
async def consume_credits(
    data: ConsumeCreditsRequest,
    current_user: UserProfile = Depends(get_current_user),
) -> CreditResponse:
    """Deduct AI credits from user's balance."""
    credit_obj = CreditService.consume_credits(user_id=current_user.id, amount=data.amount)
    return CreditResponse(
        success=True,
        balance=credit_obj.balance,
        credit_mode=credit_obj.credit_mode,
        last_reset=credit_obj.last_reset.isoformat(),
    )
