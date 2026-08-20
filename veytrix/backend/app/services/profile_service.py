from typing import Dict, Any, Optional
from app.core.logging import logger
from app.core.supabase import init_supabase_client
from app.schemas.user import UserProfile, UserProfileUpdate

# In-memory fallback cache for profile records when Supabase DB is offline/unconfigured
_profiles_cache: Dict[str, UserProfile] = {}


def sync_user_profile(user: UserProfile) -> UserProfile:
    """Synchronize authenticated user's profile record."""
    if not user.id:
        return user

    user_id_str = str(user.id)
    if user_id_str in _profiles_cache:
        logger.info(f"Reusing cached profile record for user: {user_id_str}")
        return _profiles_cache[user_id_str]

    client = init_supabase_client()
    if client:
        try:
            # Check if profile exists in Supabase DB 'profiles' table using user_id
            response = client.table("profiles").select("*").eq("user_id", user.id).execute()
            if response.data and len(response.data) > 0:
                profile_data = response.data[0]
                existing_profile = UserProfile(
                    id=str(user.id),
                    email=user.email,
                    full_name=profile_data.get("display_name") or user.full_name,
                    display_name=profile_data.get("display_name") or user.full_name,
                    avatar_url=profile_data.get("avatar_url") or user.avatar_url,
                    username=profile_data.get("username"),
                    phone=profile_data.get("phone"),
                    country=profile_data.get("country"),
                    language=profile_data.get("language") or "English (US)",
                    timezone=profile_data.get("timezone") or "UTC+5:30 (IST)",
                    bio=profile_data.get("bio"),
                    occupation=profile_data.get("occupation"),
                    company=profile_data.get("company"),
                    website=profile_data.get("website"),
                    portfolio=profile_data.get("portfolio"),
                    social_links=profile_data.get("social_links") or {},
                    role=user.role,
                    app_metadata=user.app_metadata,
                    user_metadata=user.user_metadata,
                    created_at=str(profile_data.get("created_at") or user.created_at or ""),
                )
                _profiles_cache[str(user.id)] = existing_profile
                logger.info(f"Retrieved existing profile record from Supabase DB for user: {user.id}")
                return existing_profile
            else:
                # Create minimal profile record in Supabase DB
                new_profile_data = {
                    "user_id": user.id,
                    "display_name": user.full_name or user.user_metadata.get("full_name"),
                    "avatar_url": user.avatar_url or user.user_metadata.get("avatar_url"),
                    "language": "English (US)",
                    "timezone": "UTC+5:30 (IST)",
                    "social_links": {},
                }
                client.table("profiles").upsert(new_profile_data, on_conflict="user_id").execute()
                logger.info(f"Synchronized new profile record to Supabase DB for user: {user.id}")
        except Exception as exc:
            logger.warning(f"Profile synchronization DB query notice: {exc}")

    # Fallback to local profile record caching
    _profiles_cache[str(user.id)] = user
    return user


def update_user_profile(user_id: str, update_data: UserProfileUpdate, current_user: UserProfile) -> UserProfile:
    """Update user profile in Supabase database and update cache."""
    payload: Dict[str, Any] = {}

    if update_data.display_name is not None:
        payload["display_name"] = update_data.display_name
    if update_data.avatar_url is not None:
        payload["avatar_url"] = update_data.avatar_url
    if update_data.username is not None:
        payload["username"] = update_data.username
    if update_data.phone is not None:
        payload["phone"] = update_data.phone
    if update_data.country is not None:
        payload["country"] = update_data.country
    if update_data.language is not None:
        payload["language"] = update_data.language
    if update_data.timezone is not None:
        payload["timezone"] = update_data.timezone
    if update_data.bio is not None:
        payload["bio"] = update_data.bio
    if update_data.occupation is not None:
        payload["occupation"] = update_data.occupation
    if update_data.company is not None:
        payload["company"] = update_data.company
    if update_data.website is not None:
        payload["website"] = update_data.website
    if update_data.portfolio is not None:
        payload["portfolio"] = update_data.portfolio
    if update_data.social_links is not None:
        payload["social_links"] = update_data.social_links

    client = init_supabase_client()
    if client and payload:
        try:
            client.table("profiles").update(payload).eq("user_id", user_id).execute()
            logger.info(f"Updated profile record in Supabase DB for user: {user_id}")
        except Exception as exc:
            logger.warning(f"Profile update DB query notice: {exc}")

    # Return updated user profile object
    updated_dict = current_user.model_dump()
    for k, v in payload.items():
        if k == "display_name":
            updated_dict["display_name"] = v
            updated_dict["full_name"] = v
        else:
            updated_dict[k] = v

    updated_profile = UserProfile(**updated_dict)
    _profiles_cache[str(user_id)] = updated_profile
    return updated_profile
