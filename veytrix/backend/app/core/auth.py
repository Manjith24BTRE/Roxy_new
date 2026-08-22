from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import settings
from app.core.logging import logger
from app.core.supabase import init_supabase_client
from app.schemas.user import UserProfile
from app.services.profile_service import sync_user_profile

security_scheme = HTTPBearer(auto_error=False)


def verify_jwt_token(token: str) -> UserProfile:
    """Verify Supabase-issued JWT access token.

    Verifies the supplied token against Supabase Auth or JWT signature/expiration.
    Rejects invalid, expired, revoked, or malformed tokens with structured 401 errors.
    """
    if not token or not isinstance(token, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "INVALID_TOKEN", "message": "The supplied access token is invalid or expired."},
        )

    # 1. Attempt verification via Supabase Auth API
    client = init_supabase_client()
    if client:
        try:
            user_response = client.auth.get_user(jwt=token)
            if user_response and getattr(user_response, "user", None):
                sb_user = user_response.user
                user_meta = getattr(sb_user, "user_metadata", {}) or {}
                app_meta = getattr(sb_user, "app_metadata", {}) or {}

                return UserProfile(
                    id=str(sb_user.id),
                    email=getattr(sb_user, "email", None),
                    full_name=user_meta.get("full_name") or user_meta.get("name"),
                    avatar_url=user_meta.get("avatar_url") or user_meta.get("picture"),
                    role=getattr(sb_user, "role", "authenticated") or "authenticated",
                    app_metadata=app_meta,
                    user_metadata=user_meta,
                    created_at=str(getattr(sb_user, "created_at", "")) if getattr(sb_user, "created_at", None) else None,
                )
        except Exception as exc:
            logger.warning(f"Supabase Auth token verification notice: {exc}")

    # 2. Local JWT decoding / fallback verification
    try:
        # Decode token header to check algorithm without verifying signature if secret not provided
        unverified_payload = jwt.decode(token, options={"verify_signature": False, "verify_aud": False})

        # Check expiration claim 'exp'
        import time

        exp = unverified_payload.get("exp")
        if exp and time.time() >= exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error": "INVALID_TOKEN", "message": "The supplied access token is invalid or expired."},
            )

        # Signature verification if JWT_SECRET is configured
            if not settings.JWT_SECRET:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={"error": "INVALID_TOKEN", "message": "The supplied access token is invalid or expired."},
                )

            try:
                verified_payload = jwt.decode(
                    token,
                    settings.JWT_SECRET,
                    algorithms=["HS256", "RS256"],
                    options={"verify_aud": False},
                )
                payload = verified_payload
            except jwt.ExpiredSignatureError:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={"error": "INVALID_TOKEN", "message": "The supplied access token is invalid or expired."},
                )
            except jwt.PyJWTError:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={"error": "INVALID_TOKEN", "message": "The supplied access token is invalid or expired."},
                )

        sub = payload.get("sub")
        if not sub:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error": "INVALID_TOKEN", "message": "The supplied access token is invalid or expired."},
            )

        user_meta = payload.get("user_metadata", {}) or {}
        app_meta = payload.get("app_metadata", {}) or {}

        return UserProfile(
            id=str(sub),
            email=payload.get("email"),
            full_name=user_meta.get("full_name") or user_meta.get("name"),
            avatar_url=user_meta.get("avatar_url") or user_meta.get("picture"),
            role=payload.get("role", "authenticated"),
            app_metadata=app_meta,
            user_metadata=user_meta,
            created_at=payload.get("created_at"),
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning(f"JWT parsing failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "INVALID_TOKEN", "message": "The supplied access token is invalid or expired."},
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> UserProfile:
    """Reusable FastAPI dependency that resolves the authenticated user.

    Exposes the verified user's identity and profile information for protected endpoints.
    In DEVELOPER_MODE, falls back to a default developer profile if unauthenticated.
    """
    if not credentials or not credentials.credentials:
        if settings.DEVELOPER_MODE:
            return sync_user_profile(
                UserProfile(
                    id="00000000-0000-0000-0000-000000000001",
                    email="developer@veytrix.local",
                    full_name="Developer User",
                    role="authenticated",
                )
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "UNAUTHORIZED", "message": "Authentication required."},
        )

    try:
        user = verify_jwt_token(credentials.credentials)
        synchronized_user = sync_user_profile(user)
        return synchronized_user
    except HTTPException:
        if settings.DEVELOPER_MODE:
            return sync_user_profile(
                UserProfile(
                    id="00000000-0000-0000-0000-000000000001",
                    email="developer@veytrix.local",
                    full_name="Developer User",
                    role="authenticated",
                )
            )
        raise

