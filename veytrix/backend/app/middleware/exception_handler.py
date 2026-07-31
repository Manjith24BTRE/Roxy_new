from fastapi import Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.logging import logger


async def http_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handles HTTP exceptions and returns structured JSON response."""
    if isinstance(exc, StarletteHTTPException):
        status_code = exc.status_code
        detail = exc.detail
    else:
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        detail = str(exc)

    logger.warning(f"HTTPException {status_code}: {detail} [Path: {request.url.path}]")

    if isinstance(detail, dict):
        content = {
            "success": False,
            "error": detail.get("error", "HTTP_ERROR"),
            "message": detail.get("message", "An HTTP error occurred."),
        }
    else:
        content = {
            "success": False,
            "error": detail,
            "message": detail,
            "status": status_code,
        }

    return JSONResponse(
        status_code=status_code,
        content=content,
    )


async def validation_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handles Request Validation errors and returns structured JSON response."""
    errors = jsonable_encoder(exc.errors()) if isinstance(exc, RequestValidationError) else str(exc)
    logger.warning(f"ValidationError [Path: {request.url.path}]: {errors}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation Error",
            "error": errors,
            "status": status.HTTP_422_UNPROCESSABLE_ENTITY,
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handles all unhandled internal server exceptions and returns structured JSON response."""
    logger.error(f"Unhandled Exception: {str(exc)} [Path: {request.url.path}]", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Internal Server Error",
            "error": str(exc),
            "status": status.HTTP_500_INTERNAL_SERVER_ERROR,
        },
    )
