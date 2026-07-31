from typing import Dict
from app.core.logging import logger
from app.core.supabase import init_supabase_client
from app.schemas.user import UserProfile

# In-memory fallback cache for profile records when Supabase DB is offline/unconfigured
_profiles_cache: Dict[str, UserProfile] = {}


def sync_user_profile(user: UserProfile) -> UserProfile:
    """Synchronize authenticated user's profile record.

    Inspects if a profile record exists for user.id; creates the minimum required
    profile if not found, or returns the existing profile record without duplicating users.
    """
    if not user.id:
        return user

    # 1. Check in-memory profile store first
    if user.id in _profiles_cache:
        logger.info(f"Reusing cached profile record for user: {user.id}")
        return _profiles_cache[user.id]

    client = init_supabase_client()
    if client:
        try:
            # Check if profile exists in Supabase DB 'profiles' table
            response = client.table("profiles").select("*").eq("id", user.id).execute()
            if response.data and len(response.data) > 0:
                profile_data = response.data[0]
                existing_profile = UserProfile(
                    id=profile_data.get("id", user.id),
                    email=profile_data.get("email", user.email),
                    full_name=profile_data.get("full_name", user.full_name),
                    avatar_url=profile_data.get("avatar_url", user.avatar_url),
                    role=profile_data.get("role", user.role),
                    app_metadata=user.app_metadata,
                    user_metadata=user.user_metadata,
                    created_at=profile_data.get("created_at", user.created_at),
                )
                _profiles_cache[user.id] = existing_profile
                logger.info(f"Retrieved existing profile record from Supabase DB for user: {user.id}")
                return existing_profile
            else:
                # Create minimal profile record in Supabase DB
                new_profile_data = {
                    "id": user.id,
                    "email": user.email,
                    "full_name": user.full_name or user.user_metadata.get("full_name"),
                    "avatar_url": user.avatar_url or user.user_metadata.get("avatar_url"),
                }
                client.table("profiles").upsert(new_profile_data).execute()
                logger.info(f"Synchronized new profile record to Supabase DB for user: {user.id}")
        except Exception as exc:
            logger.warning(f"Profile synchronization DB query notice: {exc}")

    # Fallback to local profile record caching
    _profiles_cache[user.id] = user
    return user
