from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    """Schema representing an authenticated user's profile and metadata."""

    id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
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
    social_links: Dict[str, Any] = Field(default_factory=dict)
    role: str = "authenticated"
    app_metadata: Dict[str, Any] = Field(default_factory=dict)
    user_metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[str] = None


class UserProfileUpdate(BaseModel):
    """Schema for partial user profile updates."""

    display_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    bio: Optional[str] = None
    occupation: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    portfolio: Optional[str] = None
    social_links: Optional[Dict[str, Any]] = None
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    """Schema for /auth/me endpoint response."""

    success: bool = True
    profile: Optional[UserProfile] = None
    user: UserProfile

