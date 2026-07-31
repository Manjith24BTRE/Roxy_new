from typing import Any, Dict, Optional
from pydantic import BaseModel, Field, field_validator
from app.models.enums import PlanType, SubscriptionStatus


class EntitlementSummary(BaseModel):
    """Full entitlement permissions and limits summary for a user."""

    effective_plan: PlanType
    raw_plan: PlanType
    status: SubscriptionStatus
    level: int
    max_projects: int
    max_export: str
    watermark_removal: bool
    custom_watermark: bool
    command_priority: str


class SubscriptionResponse(BaseModel):
    """Schema for subscription details and entitlements response."""

    success: bool = True
    plan: PlanType
    effective_plan: PlanType
    status: SubscriptionStatus
    entitlements: EntitlementSummary


class CreditResponse(BaseModel):
    """Schema for credit balance responses."""

    success: bool = True
    balance: int
    credit_mode: str
    last_reset: str


class ConsumeCreditsRequest(BaseModel):
    """Schema for consuming AI credits."""

    amount: int = Field(gt=0, description="Amount of credits to consume (must be greater than 0)")

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Credit consume amount must be positive.")
        return v
