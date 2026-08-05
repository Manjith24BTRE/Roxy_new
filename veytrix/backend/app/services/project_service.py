from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from uuid import NAMESPACE_DNS, UUID, uuid4, uuid5
from fastapi import HTTPException, status
from app.core.logging import logger
from app.core.supabase import init_supabase_client
from app.models.enums import ProjectStatus
from app.models.profile import utc_now
from app.models.project import ProjectModel
from app.schemas.project import (
    ProjectAutosave,
    ProjectCreate,
    ProjectRename,
    ProjectUpdate,
)

# Thread-safe in-memory storage fallback for projects when DB is offline or in test environments
_projects_store: Dict[str, ProjectModel] = {}


def parse_uuid(val: UUID | str) -> UUID:
    """Safely convert string or UUID object to a valid UUID."""
    if isinstance(val, UUID):
        return val
    try:
        return UUID(val)
    except ValueError:
        return uuid5(NAMESPACE_DNS, val)


class ProjectService:
    """Central service responsible for project persistence and lifecycle management."""

    @staticmethod
    def create_project(user_id: UUID | str, data: ProjectCreate) -> ProjectModel:
        """Create a new project entity for the authenticated user."""
        u_id = parse_uuid(user_id)
        now = utc_now()

        project = ProjectModel(
            id=uuid4(),
            user_id=u_id,
            title=data.title or "Untitled Project",
            thumbnail_url=data.thumbnail_url,
            timeline_json=data.timeline_json or {},
            status=ProjectStatus.DRAFT,
            duration=data.duration or 0.0,
            aspect_ratio=data.aspect_ratio or "16:9",
            fps=data.fps or 30,
            resolution=data.resolution or "1080p",
            created_at=now,
            updated_at=now,
            last_opened_at=now,
        )

        client = init_supabase_client()
        if client:
            try:
                payload = {
                    "id": str(project.id),
                    "user_id": str(project.user_id),
                    "title": project.title,
                    "thumbnail_url": project.thumbnail_url,
                    "timeline_json": project.timeline_json,
                    "status": project.status.value,
                    "created_at": project.created_at.isoformat(),
                    "updated_at": project.updated_at.isoformat(),
                }
                client.table("projects").insert(payload).execute()
                logger.info(f"Created project {project.id} in Supabase DB for user {u_id}")
            except Exception as exc:
                logger.warning(f"Supabase DB insert notice: {exc}")

        _projects_store[str(project.id)] = project
        return project

    @staticmethod
    def get_project_by_id(project_id: UUID | str, user_id: UUID | str, allow_deleted: bool = False) -> ProjectModel:
        """Retrieve project by ID ensuring strict ownership enforcement."""
        p_id = str(project_id)
        u_id = str(parse_uuid(user_id))

        project = _projects_store.get(p_id)

        if not project and (client := init_supabase_client()):
            try:
                res = client.table("projects").select("*").eq("id", p_id).execute()
                if res.data and len(res.data) > 0:
                    row = res.data[0]
                    project = ProjectModel(
                        id=UUID(row["id"]),
                        user_id=UUID(row["user_id"]),
                        title=row.get("title", "Untitled Project"),
                        thumbnail_url=row.get("thumbnail_url"),
                        timeline_json=row.get("timeline_json", {}),
                        status=ProjectStatus(row.get("status", "draft")),
                        created_at=datetime.fromisoformat(row["created_at"]) if row.get("created_at") else utc_now(),
                        updated_at=datetime.fromisoformat(row["updated_at"]) if row.get("updated_at") else utc_now(),
                    )
                    _projects_store[p_id] = project
            except Exception as exc:
                logger.warning(f"Supabase DB fetch notice: {exc}")

        if not project or str(project.user_id) != u_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "NOT_FOUND", "message": "Project not found or unauthorized."},
            )

        if project.deleted_at is not None and not allow_deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "PROJECT_DELETED", "message": "The requested project has been soft-deleted."},
            )

        # Update last_opened_at timestamp
        project.last_opened_at = utc_now()
        return project

    @staticmethod
    def list_projects(
        user_id: UUID | str,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        status_filter: Optional[str] = None,
        include_archived: bool = True,
        include_deleted: bool = False,
        sort_by: str = "updated_at",
        sort_order: str = "desc",
    ) -> Tuple[List[ProjectModel], int]:
        """List user's projects with search by title, status filtering, sorting, and pagination."""
        u_id = str(parse_uuid(user_id))

        user_projects: List[ProjectModel] = [
            p for p in _projects_store.values() if str(p.user_id) == u_id
        ]

        # Apply soft-delete filter
        if not include_deleted:
            user_projects = [p for p in user_projects if p.deleted_at is None]

        # Apply archive filter
        if not include_archived:
            user_projects = [p for p in user_projects if p.status != ProjectStatus.ARCHIVED]

        # Apply status filter
        if status_filter:
            user_projects = [p for p in user_projects if p.status.value == status_filter.lower()]

        # Apply title search filter
        if search and search.strip():
            query = search.strip().lower()
            user_projects = [p for p in user_projects if query in p.title.lower()]

        # Apply sorting
        reverse = sort_order.lower() == "desc"
        if sort_by == "title":
            user_projects.sort(key=lambda p: p.title.lower(), reverse=reverse)
        elif sort_by == "created_at":
            user_projects.sort(key=lambda p: p.created_at, reverse=reverse)
        else:
            user_projects.sort(key=lambda p: p.updated_at, reverse=reverse)

        total = len(user_projects)
        start = (page - 1) * limit
        end = start + limit
        paginated_projects = user_projects[start:end]

        return paginated_projects, total

    @staticmethod
    def update_project(project_id: UUID | str, user_id: UUID | str, data: ProjectUpdate) -> ProjectModel:
        """Update project metadata and timeline data."""
        project = ProjectService.get_project_by_id(project_id, user_id)

        if data.title is not None:
            project.title = data.title
        if data.thumbnail_url is not None:
            project.thumbnail_url = data.thumbnail_url
        if data.timeline_json is not None:
            project.timeline_json = data.timeline_json
        if data.status is not None:
            project.status = data.status
        if data.duration is not None:
            project.duration = data.duration
        if data.aspect_ratio is not None:
            project.aspect_ratio = data.aspect_ratio
        if data.fps is not None:
            project.fps = data.fps
        if data.resolution is not None:
            project.resolution = data.resolution

        project.updated_at = utc_now()
        _projects_store[str(project.id)] = project

        client = init_supabase_client()
        if client:
            try:
                payload = {
                    "title": project.title,
                    "thumbnail_url": project.thumbnail_url,
                    "timeline_json": project.timeline_json,
                    "status": project.status.value,
                    "updated_at": project.updated_at.isoformat(),
                }
                client.table("projects").update(payload).eq("id", str(project.id)).execute()
            except Exception as exc:
                logger.warning(f"Supabase DB update notice: {exc}")

        return project

    @staticmethod
    def rename_project(project_id: UUID | str, user_id: UUID | str, data: ProjectRename) -> ProjectModel:
        """Rename project title."""
        project = ProjectService.get_project_by_id(project_id, user_id)
        project.title = data.title
        project.updated_at = utc_now()
        _projects_store[str(project.id)] = project
        return project

    @staticmethod
    def duplicate_project(project_id: UUID | str, user_id: UUID | str) -> ProjectModel:
        """Clone an existing project creating a duplicate for the authenticated user."""
        source_project = ProjectService.get_project_by_id(project_id, user_id)
        now = utc_now()

        duplicate = ProjectModel(
            id=uuid4(),
            user_id=source_project.user_id,
            title=f"Copy of {source_project.title}",
            thumbnail_url=source_project.thumbnail_url,
            timeline_json=dict(source_project.timeline_json),
            status=ProjectStatus.DRAFT,
            duration=source_project.duration,
            aspect_ratio=source_project.aspect_ratio,
            fps=source_project.fps,
            resolution=source_project.resolution,
            created_at=now,
            updated_at=now,
            last_opened_at=now,
        )

        _projects_store[str(duplicate.id)] = duplicate
        logger.info(f"Duplicated project {source_project.id} into {duplicate.id}")
        return duplicate

    @staticmethod
    def autosave_project(project_id: UUID | str, user_id: UUID | str, data: ProjectAutosave) -> ProjectModel:
        """Autosave editor timeline JSON and update timestamps cleanly."""
        project = ProjectService.get_project_by_id(project_id, user_id)

        project.timeline_json = data.timeline_json
        if data.duration is not None:
            project.duration = data.duration
        if data.aspect_ratio is not None:
            project.aspect_ratio = data.aspect_ratio

        project.updated_at = utc_now()
        _projects_store[str(project.id)] = project

        return project

    @staticmethod
    def archive_project(project_id: UUID | str, user_id: UUID | str) -> ProjectModel:
        """Archive a project."""
        project = ProjectService.get_project_by_id(project_id, user_id)
        project.status = ProjectStatus.ARCHIVED
        project.updated_at = utc_now()
        _projects_store[str(project.id)] = project
        return project

    @staticmethod
    def restore_project(project_id: UUID | str, user_id: UUID | str) -> ProjectModel:
        """Restore an archived or soft-deleted project."""
        project = ProjectService.get_project_by_id(project_id, user_id, allow_deleted=True)
        project.status = ProjectStatus.DRAFT
        project.deleted_at = None
        project.updated_at = utc_now()
        _projects_store[str(project.id)] = project
        return project

    @staticmethod
    def soft_delete_project(project_id: UUID | str, user_id: UUID | str) -> ProjectModel:
        """Soft-delete a project setting deleted_at timestamp."""
        project = ProjectService.get_project_by_id(project_id, user_id)
        project.deleted_at = utc_now()
        project.updated_at = utc_now()
        _projects_store[str(project.id)] = project
        return project

    @staticmethod
    def permanent_delete_project(project_id: UUID | str, user_id: UUID | str) -> bool:
        """Permanently delete project entity from memory and database."""
        project = ProjectService.get_project_by_id(project_id, user_id, allow_deleted=True)
        p_id = str(project.id)

        if p_id in _projects_store:
            del _projects_store[p_id]

        client = init_supabase_client()
        if client:
            try:
                client.table("projects").delete().eq("id", p_id).execute()
            except Exception as exc:
                logger.warning(f"Supabase DB delete notice: {exc}")

        return True


project_service = ProjectService()
