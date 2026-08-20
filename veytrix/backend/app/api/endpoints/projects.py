from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from app.core.auth import get_current_user
from app.schemas.project import (
    ProjectAutosave,
    ProjectCreate,
    ProjectListResponse,
    ProjectRename,
    ProjectResponse,
    ProjectUpdate,
)
from app.schemas.user import UserProfile
from app.services.project_service import ProjectService

router = APIRouter()


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    current_user: UserProfile = Depends(get_current_user),
) -> ProjectResponse:
    """Create a new project entity for the currently authenticated user."""
    project = ProjectService.create_project(user_id=current_user.id, data=data)
    return ProjectResponse(success=True, project=project)


@router.get("", response_model=ProjectListResponse, status_code=status.HTTP_200_OK)
async def list_projects(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query by project title"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by project status (draft, published, archived)"),
    include_archived: bool = Query(True, description="Include archived projects"),
    include_deleted: bool = Query(False, description="Include soft-deleted projects"),
    sort_by: str = Query("updated_at", description="Field to sort by (updated_at, created_at, title)"),
    sort_order: str = Query("desc", description="Sort direction (asc, desc)"),
    current_user: UserProfile = Depends(get_current_user),
) -> ProjectListResponse:
    """List authenticated user's projects with filtering, title search, and pagination."""
    projects, total = ProjectService.list_projects(
        user_id=current_user.id,
        page=page,
        limit=limit,
        search=search,
        status_filter=status_filter,
        include_archived=include_archived,
        include_deleted=include_deleted,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return ProjectListResponse(
        success=True,
        projects=projects,
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/{project_id}", response_model=ProjectResponse, status_code=status.HTTP_200_OK)
async def get_project(
    project_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
) -> ProjectResponse:
    """Retrieve a project by ID ensuring ownership verification."""
    project = ProjectService.get_project_by_id(project_id=project_id, user_id=current_user.id)
    return ProjectResponse(success=True, project=project)


@router.put("/{project_id}", response_model=ProjectResponse, status_code=status.HTTP_200_OK)
async def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    current_user: UserProfile = Depends(get_current_user),
) -> ProjectResponse:
    """Update project metadata and timeline JSON."""
    project = ProjectService.update_project(project_id=project_id, user_id=current_user.id, data=data)
    return ProjectResponse(success=True, project=project)


@router.patch("/{project_id}/rename", response_model=ProjectResponse, status_code=status.HTTP_200_OK)
async def rename_project(
    project_id: UUID,
    data: ProjectRename,
    current_user: UserProfile = Depends(get_current_user),
) -> ProjectResponse:
    """Rename a project title."""
    project = ProjectService.rename_project(project_id=project_id, user_id=current_user.id, data=data)
    return ProjectResponse(success=True, project=project)


@router.post("/{project_id}/duplicate", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_project(
    project_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
) -> ProjectResponse:
    """Duplicate an existing project for the authenticated user."""
    duplicate = ProjectService.duplicate_project(project_id=project_id, user_id=current_user.id)
    return ProjectResponse(success=True, project=duplicate)


@router.post("/{project_id}/autosave", response_model=ProjectResponse, status_code=status.HTTP_200_OK)
async def autosave_project(
    project_id: UUID,
    data: ProjectAutosave,
    current_user: UserProfile = Depends(get_current_user),
) -> ProjectResponse:
    """Autosave editor timeline JSON and updated timestamps."""
    project = ProjectService.autosave_project(project_id=project_id, user_id=current_user.id, data=data)
    return ProjectResponse(success=True, project=project)


@router.post("/{project_id}/archive", response_model=ProjectResponse, status_code=status.HTTP_200_OK)
async def archive_project(
    project_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
) -> ProjectResponse:
    """Archive a project."""
    project = ProjectService.archive_project(project_id=project_id, user_id=current_user.id)
    return ProjectResponse(success=True, project=project)


@router.post("/{project_id}/restore", response_model=ProjectResponse, status_code=status.HTTP_200_OK)
async def restore_project(
    project_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
) -> ProjectResponse:
    """Restore an archived or soft-deleted project."""
    project = ProjectService.restore_project(project_id=project_id, user_id=current_user.id)
    return ProjectResponse(success=True, project=project)


@router.delete("/{project_id}", response_model=ProjectResponse, status_code=status.HTTP_200_OK)
async def soft_delete_project(
    project_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
) -> ProjectResponse:
    """Soft delete a project."""
    project = ProjectService.soft_delete_project(project_id=project_id, user_id=current_user.id)
    return ProjectResponse(success=True, project=project)


@router.delete("/{project_id}/permanent", status_code=status.HTTP_200_OK)
async def permanent_delete_project(
    project_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
) -> dict:
    """Permanently delete a project entity."""
    ProjectService.permanent_delete_project(project_id=project_id, user_id=current_user.id)
    return {"success": True, "message": "Project permanently deleted."}
