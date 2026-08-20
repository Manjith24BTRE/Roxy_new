from typing import Any, Dict
from app.core.config import settings
from app.core.logging import logger
from app.core.supabase import init_supabase_client


def check_supabase_client() -> Dict[str, Any]:
    """Check Supabase client initialization status."""
    is_url_configured = bool(settings.SUPABASE_URL)
    is_key_configured = bool(settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY)

    client = init_supabase_client()
    is_initialized = client is not None

    return {
        "configured": is_url_configured and is_key_configured,
        "initialized": is_initialized,
        "supabase_url": settings.SUPABASE_URL if is_url_configured else "not_configured",
    }


def check_database_connection() -> Dict[str, Any]:
    """Verify connectivity to Supabase PostgreSQL / PostgREST API without modifying data."""
    client = init_supabase_client()
    if not client:
        return {
            "connected": False,
            "status": "not_configured" if not settings.SUPABASE_URL else "client_init_failed",
            "message": "Supabase client not initialized",
        }

    try:
        # Perform a lightweight API ping check to verify database REST interface
        # Note: Do not create tables or mutate data
        response = client.postgrest.session.get(f"{settings.SUPABASE_URL}/rest/v1/")
        if response.status_code in (200, 401, 403):
            return {
                "connected": True,
                "status": "connected",
                "message": "Database API endpoint is reachable",
            }
        else:
            return {
                "connected": False,
                "status": "unreachable",
                "message": f"Database API returned status code {response.status_code}",
            }
    except Exception as exc:
        logger.warning(f"Database connection check failed: {exc}")
        return {
            "connected": False,
            "status": "error",
            "message": str(exc),
        }


def check_storage_connection() -> Dict[str, Any]:
    """Verify connectivity to Supabase Storage API without modifying files or buckets."""
    client = init_supabase_client()
    if not client:
        return {
            "connected": False,
            "status": "not_configured" if not settings.SUPABASE_URL else "client_init_failed",
            "message": "Supabase client not initialized",
        }

    try:
        # Inspect existing storage buckets without uploading or creating buckets
        buckets = client.storage.list_buckets()
        bucket_count = len(buckets) if isinstance(buckets, list) else 0
        return {
            "connected": True,
            "status": "connected",
            "bucket_count": bucket_count,
            "message": f"Storage API reachable. Found {bucket_count} existing bucket(s)",
        }
    except Exception as exc:
        logger.warning(f"Storage connection check failed: {exc}")
        return {
            "connected": False,
            "status": "error",
            "message": str(exc),
        }


def check_auth_connection() -> Dict[str, Any]:
    """Verify connectivity to Supabase Auth service without authenticating users."""
    client = init_supabase_client()
    if not client:
        return {
            "connected": False,
            "status": "not_configured" if not settings.SUPABASE_URL else "client_init_failed",
            "message": "Supabase client not initialized",
        }

    try:
        # Check Auth service endpoint responsiveness without performing login/signup
        response = client.postgrest.session.get(f"{settings.SUPABASE_URL}/auth/v1/health")
        if response.status_code in (200, 400, 401, 403, 404):
            return {
                "connected": True,
                "status": "connected",
                "message": "Auth API endpoint is reachable",
            }
        else:
            return {
                "connected": False,
                "status": "unreachable",
                "message": f"Auth API returned status code {response.status_code}",
            }
    except Exception as exc:
        logger.warning(f"Auth connection check failed: {exc}")
        return {
            "connected": False,
            "status": "error",
            "message": str(exc),
        }


def get_supabase_health_status() -> Dict[str, Any]:
    """Aggregate health and connectivity statuses for all Supabase services."""
    client_status = check_supabase_client()
    db_status = check_database_connection()
    storage_status = check_storage_connection()
    auth_status = check_auth_connection()

    return {
        "client": client_status,
        "database": db_status,
        "storage": storage_status,
        "auth": auth_status,
    }
