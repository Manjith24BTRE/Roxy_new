from datetime import datetime
from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from app.models.profile import utc_now


class CreditModel(BaseModel):
    """Database model for user credit balance entity."""

    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    balance: int = 100
    last_reset: datetime = Field(default_factory=utc_now)
    credit_mode: str = "standard"
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
