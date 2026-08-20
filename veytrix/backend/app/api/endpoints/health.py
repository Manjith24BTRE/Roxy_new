from fastapi import APIRouter
from app.core.config import settings
from app.schemas.health import HealthResponse
from app.services.supabase_service import get_supabase_health_status

router = APIRouter()


@router.get("/health", response_model=HealthResponse, status_code=200)
async def get_health() -> HealthResponse:
    """Health check endpoint.

    Returns HTTP 200 with service status, name, version, and Supabase connection statuses.
    """
    supabase_status = get_supabase_health_status()
    return HealthResponse(
        status="healthy",
        service=settings.APP_NAME,
        version=settings.APP_VERSION,
        supabase=supabase_status,
    )

