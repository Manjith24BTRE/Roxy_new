from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user
from app.core.supabase import init_supabase_client
from app.schemas.user import UserProfile

router = APIRouter()


@router.get("/account", status_code=200)
async def get_account_settings(current_user: UserProfile = Depends(get_current_user)) -> Dict[str, Any]:
    """Retrieve full account settings for the authenticated user."""
    client = init_supabase_client()
    profile_data = {}
    if client:
        try:
            res = client.table("profiles").select("*").eq("id", current_user.id).execute()
            if res.data and len(res.data) > 0:
                profile_data = res.data[0]
        except Exception as exc:
            pass

    return {
        "success": True,
        "data": {
            "id": current_user.id,
            "full_name": profile_data.get("full_name") or current_user.full_name or current_user.display_name or "Mavros Member",
            "username": profile_data.get("username") or current_user.username or "mavros_member",
            "email": current_user.email or "member@mavros.in",
            "phone": profile_data.get("phone") or current_user.phone or "",
            "country": profile_data.get("country") or current_user.country or "India",
            "language": profile_data.get("language") or current_user.language or "English (US)",
            "timezone": profile_data.get("timezone") or current_user.timezone or "UTC+5:30 (IST)",
            "bio": profile_data.get("bio") or current_user.bio or "",
            "avatar_url": profile_data.get("avatar_url") or current_user.avatar_url or None,
        },
    }


@router.get("/notifications", status_code=200)
async def get_notification_settings(current_user: UserProfile = Depends(get_current_user)) -> Dict[str, Any]:
    """Retrieve notification settings from user_notification_settings table."""
    client = init_supabase_client()
    notif_data = {
        "email_notifications": True,
        "push_notifications": True,
        "marketing_emails": False,
        "product_updates": True,
        "export_completion_notifications": True,
        "team_activity_notifications": True,
    }
    if client:
        try:
            res = client.table("user_notification_settings").select("*").eq("user_id", current_user.id).execute()
            if res.data and len(res.data) > 0:
                d = res.data[0]
                notif_data = {
                    "email_notifications": d.get("email_notifications", True),
                    "push_notifications": d.get("push_notifications", True),
                    "marketing_emails": d.get("marketing_emails", False),
                    "product_updates": d.get("product_updates", True),
                    "export_completion_notifications": d.get("export_completion_notifications", True),
                    "team_activity_notifications": d.get("team_activity_notifications", True),
                }
        except Exception:
            pass

    return {"success": True, "data": notif_data}


@router.put("/notifications", status_code=200)
async def update_notification_settings(
    payload: Dict[str, Any],
    current_user: UserProfile = Depends(get_current_user),
) -> Dict[str, Any]:
    """Update user notification preferences."""
    client = init_supabase_client()
    if client:
        try:
            payload["user_id"] = current_user.id
            client.table("user_notification_settings").upsert(payload, on_conflict="user_id").execute()
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc))

    return {"success": True, "message": "Notification preferences updated successfully."}


@router.get("/storage/summary", status_code=200)
async def get_storage_summary(current_user: UserProfile = Depends(get_current_user)) -> Dict[str, Any]:
    """Calculate and return storage usage summary for the current user."""
    client = init_supabase_client()
    storage_limit_bytes = 10737418240  # 10 GB
    asset_count = 0
    export_count = 0
    raw_videos_bytes = 0
    audio_files_bytes = 0
    images_bytes = 0
    export_renders_bytes = 0

    if client:
        try:
            # Query assets
            assets_res = client.table("assets").select("file_size, mime_type").eq("user_id", current_user.id).execute()
            assets = assets_res.data or []
            asset_count = len(assets)
            for a in assets:
                sz = a.get("file_size", 0) or 0
                mime = a.get("mime_type", "")
                if mime.startswith("video/"):
                    raw_videos_bytes += sz
                elif mime.startswith("audio/"):
                    audio_files_bytes += sz
                elif mime.startswith("image/"):
                    images_bytes += sz
                else:
                    raw_videos_bytes += sz

            # Query exports
            exports_res = client.table("exports").select("file_size").eq("user_id", current_user.id).execute()
            exports = exports_res.data or []
            export_count = len(exports)
            export_renders_bytes = sum((e.get("file_size", 0) or 0) for e in exports)
        except Exception:
            pass

    total_used_bytes = raw_videos_bytes + audio_files_bytes + images_bytes + export_renders_bytes
    used_pct = round((total_used_bytes / storage_limit_bytes) * 100, 2) if storage_limit_bytes > 0 else 0.0

    return {
        "success": True,
        "data": {
            "used_bytes": total_used_bytes,
            "limit_bytes": storage_limit_bytes,
            "used_percentage": used_pct,
            "asset_count": asset_count,
            "export_count": export_count,
            "breakdown": {
                "raw_videos_bytes": raw_videos_bytes,
                "audio_files_bytes": audio_files_bytes,
                "images_bytes": images_bytes,
                "export_renders_bytes": export_renders_bytes,
            },
        },
    }
