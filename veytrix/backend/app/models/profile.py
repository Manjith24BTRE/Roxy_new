from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, Field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ProfileModel(BaseModel):
    """Database model for user profile entity."""

    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = "English (US)"
    timezone: Optional[str] = "UTC+5:30 (IST)"
    bio: Optional[str] = None
    occupation: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    portfolio: Optional[str] = None
    social_links: dict = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

