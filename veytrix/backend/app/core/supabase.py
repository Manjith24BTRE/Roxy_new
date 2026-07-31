from typing import Any, Optional
from app.core.config import settings
from app.core.logging import logger

try:
    from supabase import create_client
    try:
        from supabase._sync.client import Client
    except ImportError:
        try:
            from supabase.client import Client
        except ImportError:
            Client = Any
except ImportError:
    create_client = None
    Client = Any

_supabase_client: Optional[Any] = None
_supabase_admin_client: Optional[Any] = None


def init_supabase_client() -> Optional[Any]:
    """Initialize and return the shared Supabase client singleton."""
    global _supabase_client

    if _supabase_client is not None:
        return _supabase_client

    url = settings.SUPABASE_URL
    key = settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY

    if not url or not key or not create_client:
        logger.warning("Supabase credentials or client library not configured.")
        return None

    try:
        _supabase_client = create_client(url, key)
        logger.info("Supabase client initialized successfully")
        return _supabase_client
    except Exception as exc:
        logger.error(f"Failed to initialize Supabase client: {exc}")
        return None


def init_supabase_admin_client() -> Optional[Any]:
    """Initialize and return the shared Supabase admin client using service role key."""
    global _supabase_admin_client

    if _supabase_admin_client is not None:
        return _supabase_admin_client

    url = settings.SUPABASE_URL
    service_key = settings.SUPABASE_SERVICE_ROLE_KEY

    if not url or not service_key or not create_client:
        logger.warning("Supabase service role key or client library not configured.")
        return None

    try:
        _supabase_admin_client = create_client(url, service_key)
        logger.info("Supabase admin client initialized successfully")
        return _supabase_admin_client
    except Exception as exc:
        logger.error(f"Failed to initialize Supabase admin client: {exc}")
        return None


def get_supabase_client() -> Optional[Any]:
    """FastAPI dependency provider for shared Supabase client."""
    return init_supabase_client()


def get_supabase_admin_client() -> Optional[Any]:
    """FastAPI dependency provider for shared Supabase admin client."""
    return init_supabase_admin_client()
