from datetime import datetime
from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from app.models.enums import PlanType, SubscriptionStatus
from app.models.profile import utc_now


class SubscriptionModel(BaseModel):
    """Database model for user subscription entity."""

    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    plan: PlanType = PlanType.FREE
    status: SubscriptionStatus = SubscriptionStatus.ACTIVE
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
