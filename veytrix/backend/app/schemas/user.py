from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    """Schema representing an authenticated user's profile and metadata."""

    id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str = "authenticated"
    app_metadata: Dict[str, Any] = Field(default_factory=dict)
    user_metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[str] = None


class UserResponse(BaseModel):
    """Schema for /auth/me endpoint response."""

    success: bool = True
    user: UserProfile
