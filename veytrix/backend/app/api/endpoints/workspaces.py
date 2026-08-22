from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user
from app.core.supabase import init_supabase_client
from app.schemas.user import UserProfile

router = APIRouter()


@router.get("/current", status_code=200)
async def get_current_workspace(current_user: UserProfile = Depends(get_current_user)) -> Dict[str, Any]:
    """Fetch current active workspace, preferences, and member list."""
    client = init_supabase_client()
    workspace_data = None
    members_data: List[Dict[str, Any]] = []

    if client:
        try:
            # 1. Fetch user workspace membership
            wm_res = client.table("workspace_members").select("workspace_id, role").eq("user_id", current_user.id).execute()
            if wm_res.data and len(wm_res.data) > 0:
                ws_id = wm_res.data[0]["workspace_id"]
                ws_res = client.table("workspaces").select("*").eq("id", ws_id).execute()
                if ws_res.data and len(ws_res.data) > 0:
                    workspace_data = ws_res.data[0]

                # Fetch all members of this workspace
                members_res = client.table("workspace_members").select("id, user_id, role, joined_at").eq("workspace_id", ws_id).execute()
                if members_res.data:
                    for m in members_res.data:
                        # fetch member profile
                        p_res = client.table("users").select("full_name, avatar_url").eq("id", m["user_id"]).execute()
                        p = p_res.data[0] if (p_res.data and len(p_res.data) > 0) else {}
                        members_data.append({
                            "id": m["id"],
                            "user_id": m["user_id"],
                            "full_name": p.get("full_name") or "Team Member",
                            "username": p.get("username") or "",
                            "avatar_url": p.get("avatar_url") or None,
                            "role": m["role"],
                            "joined_at": m.get("joined_at") or "",
                        })
        except Exception:
            pass

    if not workspace_data:
        workspace_data = {
            "id": "default-workspace",
            "name": f"{current_user.full_name or 'Personal'}'s Workspace",
            "slug": "personal-workspace",
            "owner_id": current_user.id,
            "storage_limit_bytes": 10737418240,
            "preferences": {
                "auto_save": True,
                "auto_recovery": True,
                "default_export_resolution": "1080p",
            },
        }
        members_data = [{
            "id": "owner-member",
            "user_id": current_user.id,
            "full_name": current_user.full_name or current_user.display_name or "Mavros Member",
            "username": current_user.username or "owner",
            "avatar_url": current_user.avatar_url,
            "role": "owner",
            "joined_at": current_user.created_at or "",
        }]

    return {
        "success": True,
        "data": {
            "workspace": workspace_data,
            "members": members_data,
        },
    }


@router.put("/current", status_code=200)
async def update_current_workspace(
    payload: Dict[str, Any],
    current_user: UserProfile = Depends(get_current_user),
) -> Dict[str, Any]:
    """Update workspace name or preferences."""
    client = init_supabase_client()
    if client:
        try:
            wm_res = client.table("workspace_members").select("workspace_id, role").eq("user_id", current_user.id).execute()
            if wm_res.data and len(wm_res.data) > 0:
                ws_id = wm_res.data[0]["workspace_id"]
                user_role = wm_res.data[0]["role"]
                if user_role not in ("owner", "admin"):
                    raise HTTPException(status_code=403, detail="Only owners and admins can update workspace settings.")

                update_fields = {}
                if "name" in payload:
                    update_fields["name"] = payload["name"]
                if "preferences" in payload:
                    update_fields["settings"] = payload["preferences"]

                if update_fields:
                    client.table("workspaces").update(update_fields).eq("id", ws_id).execute()
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc))

    return {"success": True, "message": "Workspace updated successfully."}
