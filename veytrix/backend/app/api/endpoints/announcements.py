from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import uuid
import logging
from app.core.supabase import get_supabase_client, get_supabase_admin_client

logger = logging.getLogger(__name__)

router = APIRouter()

class AnnouncementCreateSchema(BaseModel):
    title: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)
    announcement_type: str = Field(default="General")
    priority: str = Field(default="Medium")
    status: str = Field(default="Active")
    target_audience: str = Field(default="All Users")
    cta_text: Optional[str] = None
    cta_url: Optional[str] = None
    banner_color: Optional[str] = "blue"
    icon: Optional[str] = "bell"
    starts_at: Optional[str] = None
    expires_at: Optional[str] = None

class AnnouncementUpdateSchema(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    announcement_type: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    target_audience: Optional[str] = None
    cta_text: Optional[str] = None
    cta_url: Optional[str] = None
    banner_color: Optional[str] = None
    icon: Optional[str] = None
    starts_at: Optional[str] = None
    expires_at: Optional[str] = None

def get_db():
    client = get_supabase_admin_client() or get_supabase_client()
    if not client:
        logger.critical("[ANNOUNCEMENT BOOT] Supabase client could not be initialized")
        raise HTTPException(status_code=500, detail="Database client unavailable")
    return client

@router.get("", response_model=List[Dict[str, Any]])
@router.get("/", response_model=List[Dict[str, Any]])
async def get_announcements(status_filter: Optional[str] = Query("All", alias="status")):
    """Fetch platform announcements directly from public.platform_announcements."""
    logger.info(f"[ANNOUNCEMENT] Querying public.platform_announcements with filter={status_filter}")
    db = get_db()
    try:
        query = db.from_("platform_announcements").select("*")
        if status_filter and status_filter.lower() != "all":
            query = query.or_(f"status.eq.{status_filter},is_active.eq.true")
        
        res = query.order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"[ANNOUNCEMENT ERROR] Failed to fetch announcements: {e}")
        if "schema cache" in str(e).lower() or "42p01" in str(e).lower():
            raise HTTPException(
                status_code=500,
                detail="Database Table Missing Error: public.platform_announcements not found in schema cache. Reload schema or execute migration."
            )
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")

@router.post("", status_code=201)
@router.post("/", status_code=201)
async def create_announcement(payload: AnnouncementCreateSchema):
    """Creates a new announcement record in public.platform_announcements."""
    logger.info(f"[ANNOUNCEMENT CREATE] title='{payload.title}', status='{payload.status}'")
    db = get_db()

    is_act = payload.status not in ["Draft", "Archived"]
    now_iso = datetime.now(timezone.utc).isoformat()

    record = {
        "id": str(uuid.uuid4()),
        "title": payload.title.strip(),
        "content": payload.message.strip(),
        "message": payload.message.strip(),
        "type": payload.announcement_type,
        "announcement_type": payload.announcement_type,
        "priority": payload.priority,
        "status": payload.status,
        "target_audience": payload.target_audience,
        "banner_style": payload.banner_color or "blue",
        "banner_color": payload.banner_color or "blue",
        "icon": payload.icon or "bell",
        "cta_text": payload.cta_text,
        "cta_url": payload.cta_url,
        "start_date": payload.starts_at,
        "starts_at": payload.starts_at,
        "end_date": payload.expires_at,
        "expires_at": payload.expires_at,
        "is_active": is_act,
        "created_at": now_iso,
        "updated_at": now_iso
    }
    try:
        res = db.from_("platform_announcements").insert(record).execute()
        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to insert announcement row into public.platform_announcements")
        
        logger.info(f"[ANNOUNCEMENT SUCCESS] Created row ID: {res.data[0]['id']}")
        return res.data[0]
    except Exception as e:
        logger.error(f"[ANNOUNCEMENT INSERT ERROR] {e}")
        if "schema cache" in str(e).lower() or "does not exist" in str(e).lower():
            raise HTTPException(
                status_code=500,
                detail="Database Table Missing: Table 'public.platform_announcements' not found in Supabase schema."
            )
        raise HTTPException(status_code=500, detail=f"Database insertion failed: {str(e)}")

@router.patch("/{announcement_id}")
async def update_announcement(announcement_id: str, payload: AnnouncementUpdateSchema):
    """Updates an existing announcement record in public.platform_announcements."""
    logger.info(f"[ANNOUNCEMENT UPDATE] ID={announcement_id}")
    db = get_db()
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    if "message" in updates:
        updates["content"] = updates["message"]
    if "status" in updates:
        updates["is_active"] = updates["status"] not in ["Draft", "Archived"]
    
    try:
        res = db.from_("platform_announcements").update(updates).eq("id", announcement_id).execute()
        return res.data or {"status": "success"}
    except Exception as e:
        logger.error(f"[ANNOUNCEMENT UPDATE ERROR] ID={announcement_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{announcement_id}")
async def delete_announcement(announcement_id: str):
    """Deletes an announcement record from public.platform_announcements."""
    logger.info(f"[ANNOUNCEMENT DELETE] ID={announcement_id}")
    db = get_db()
    try:
        res = db.from_("platform_announcements").delete().eq("id", announcement_id).execute()
        return {"status": "deleted", "id": announcement_id}
    except Exception as e:
        logger.error(f"[ANNOUNCEMENT DELETE ERROR] ID={announcement_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{announcement_id}/publish")
async def publish_announcement(announcement_id: str):
    """Publishes an announcement by setting is_active=true & status='Active'."""
    logger.info(f"[ANNOUNCEMENT PUBLISH] ID={announcement_id}")
    db = get_db()
    try:
        updates = {
            "status": "Active",
            "is_active": True,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        res = db.from_("platform_announcements").update(updates).eq("id", announcement_id).execute()
        return res.data[0] if res.data else {"status": "Active"}
    except Exception as e:
        logger.error(f"[ANNOUNCEMENT PUBLISH ERROR] {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{announcement_id}/archive")
async def archive_announcement(announcement_id: str):
    """Archives an announcement by setting is_active=false & status='Archived'."""
    logger.info(f"[ANNOUNCEMENT ARCHIVE] ID={announcement_id}")
    db = get_db()
    try:
        updates = {
            "status": "Archived",
            "is_active": False,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        res = db.from_("platform_announcements").update(updates).eq("id", announcement_id).execute()
        return res.data[0] if res.data else {"status": "Archived"}
    except Exception as e:
        logger.error(f"[ANNOUNCEMENT ARCHIVE ERROR] {e}")
        raise HTTPException(status_code=500, detail=str(e))
