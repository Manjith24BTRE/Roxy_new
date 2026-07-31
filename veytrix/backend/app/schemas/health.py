from typing import Any, Dict, Optional
from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Schema for health endpoint response."""

    status: str
    service: str
    version: str
    supabase: Optional[Dict[str, Any]] = None
