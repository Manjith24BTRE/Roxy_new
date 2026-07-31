from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.schemas.user import UserProfile, UserResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse, status_code=200)
async def get_me(current_user: UserProfile = Depends(get_current_user)) -> UserResponse:
    """Returns the currently authenticated user's profile information.

    Requires a valid Supabase JWT Bearer token in the Authorization header.
    """
    return UserResponse(
        success=True,
        user=current_user,
    )
