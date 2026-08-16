import asyncio
import os
import platform
import sys
import threading
import warnings
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator


def configure_windows_asyncio_runtime():
    """Configures Windows event loop runtime on Windows."""
    # On Python 3.8+ WindowsProactorEventLoopPolicy is the default.
    # get/set_event_loop_policy are deprecated in Python 3.14+.
    pass


configure_windows_asyncio_runtime()

# Ensure backend root directory is on Python search path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.router import api_router
from app.core.config import settings
from app.core.logging import logger
from app.middleware.exception_handler import (
    generic_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager for startup and shutdown events."""
    try:
        loop = asyncio.get_running_loop()
        loop_class = type(loop).__name__
    except RuntimeError:
        loop_class = "No running loop"

    policy_name = "Default (Proactor)" if sys.platform == "win32" else "Default"
    is_proactor_policy = "Proactor" in loop_class or sys.platform == "win32"

    current_pid = os.getpid()
    current_thread = threading.current_thread().name

    logger.info(
        f"\n======================================================\n"
        f"Operating System                      : {platform.system()} {platform.release()} ({sys.platform})\n"
        f"Python Version                        : {sys.version.split()[0]}\n"
        f"Current Event Loop Policy             : {policy_name}\n"
        f"Current Event Loop Class              : {loop_class}\n"
        f"Current Process ID                    : {current_pid}\n"
        f"Current Thread                        : {current_thread}\n"
        f"Is WindowsProactorEventLoopPolicy active? : {'YES' if is_proactor_policy else 'NO'}\n"
        f"======================================================"
    )

    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} ({settings.ENVIRONMENT})")
    try:
        from app.services.ffmpeg_service import FFmpegService
        ffmpeg_svc = FFmpegService()
        exe_path, source, version_str = ffmpeg_svc.startup_verify()
        subprocess_ok, sub_msg = await ffmpeg_svc.verify_subprocess_capability()
        logger.info(
            f"[FFmpeg Local Dev Environment Setup]\n"
            f"  [OK] Executable Path: {exe_path}\n"
            f"  [OK] Configuration Source: {source}\n"
            f"  [OK] FFmpeg Version: {version_str}\n"
            f"  [OK] Asyncio Subprocess Test: {'Passed' if subprocess_ok else 'Failed'} ({sub_msg})"
        )
    except Exception as exc:
        logger.error(f"[FFmpeg Local Dev Setup Error] {exc}")

    try:
        from app.services.export_service import ExportService
        ExportService.recover_interrupted_jobs()
    except Exception as exc:
        logger.warning(f"Startup recovery notice: {exc}")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware configuration
if settings.ALLOWED_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin for origin in settings.ALLOWED_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Exception handlers registration
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

from fastapi.staticfiles import StaticFiles

# Mount local storage static directory
local_storage_path = Path(__file__).resolve().parent / "storage"
local_storage_path.mkdir(parents=True, exist_ok=True)
app.mount("/storage", StaticFiles(directory=str(local_storage_path)), name="storage")

# Mount API router
app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
        loop="asyncio",
    )

