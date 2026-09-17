import logging
import asyncio
from typing import Optional, Dict, Any
from app.core.supabase import get_supabase_client

logger = logging.getLogger("veytrix.backend_logs")

async def log_backend_event(service: str, level: str, message: str, metadata: Optional[Dict[str, Any]] = None) -> None:
    """
    Logs backend execution events into public.backend_logs table for real-time monitoring in Command Center.
    """
    payload = {
        "service": service,
        "level": level.lower(),
        "message": message,
        "metadata": metadata or {}
    }
    
    # Standard logger output
    log_msg = f"[BACKEND] [{level.upper()}] [{service}] {message}"
    if level.lower() == "error":
        logger.error(log_msg)
    elif level.lower() == "warning":
        logger.warning(log_msg)
    else:
        logger.info(log_msg)

    # Persist to Supabase backend_logs database table
    try:
        supabase = get_supabase_client()
        if supabase:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: supabase.table("backend_logs").insert(payload).execute()
            )
    except Exception as e:
        logger.warning(f"Could not persist backend_logs row: {str(e)}")

def log_info(service: str, message: str, metadata: Optional[Dict[str, Any]] = None) -> None:
    try:
        asyncio.create_task(log_backend_event(service, "info", message, metadata))
    except Exception:
        pass

def log_warning(service: str, message: str, metadata: Optional[Dict[str, Any]] = None) -> None:
    try:
        asyncio.create_task(log_backend_event(service, "warning", message, metadata))
    except Exception:
        pass

def log_error(service: str, message: str, metadata: Optional[Dict[str, Any]] = None) -> None:
    try:
        asyncio.create_task(log_backend_event(service, "error", message, metadata))
    except Exception:
        pass
