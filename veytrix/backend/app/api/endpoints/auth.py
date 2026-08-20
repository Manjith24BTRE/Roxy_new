from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user
from app.schemas.user import UserProfile, UserProfileUpdate, UserResponse
from app.services.profile_service import update_user_profile

router = APIRouter()


@router.get("/me", response_model=UserResponse, status_code=200)
async def get_me(current_user: UserProfile = Depends(get_current_user)) -> UserResponse:
    """Returns the currently authenticated user's profile information.

    Requires a valid Supabase JWT Bearer token in the Authorization header.
    """
    return UserResponse(
        success=True,
        profile=current_user,
        user=current_user,
    )


@router.put("/me/profile", response_model=UserResponse, status_code=200)
async def update_me_profile(
    payload: UserProfileUpdate,
    current_user: UserProfile = Depends(get_current_user),
) -> UserResponse:
    """Updates the currently authenticated user's profile and account settings.

    Allows partial updates. Validates payload and returns updated profile.
    """
    if not current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID missing from authenticated token context.",
        )

    updated_user = update_user_profile(
        user_id=current_user.id,
        update_data=payload,
        current_user=current_user,
    )

    return UserResponse(
        success=True,
        profile=updated_user,
        user=updated_user,
    )
