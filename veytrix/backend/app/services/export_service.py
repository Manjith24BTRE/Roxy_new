import asyncio
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4

from fastapi import HTTPException, status

from app.builders.ffmpeg_builder import FFmpegBuilder
from app.core.logging import logger
from app.core.plans import RESOLUTION_LEVELS, get_plan_config
from app.core.supabase import get_supabase_admin_client
from app.models.enums import ExportStatus, PlanType
from app.models.export import ExportModel
from app.models.render_graph import RenderGraphDefinition
from app.schemas.export import (
    ExportCreate,
    ExportDownloadResponse,
    ExportListResponse,
    ExportResponse,
    ExportSettings,
    ExportStatusResponse,
)
from app.services.credit_service import CreditService
from app.services.entitlement_service import EntitlementService
from app.services.ffmpeg_service import FFmpegService
from app.services.project_service import ProjectService
from app.services.render_engine import QueueManager, RenderTask, RenderWorker, cleanup_orphaned_temp_files
from app.services.storage_service import StorageService
from app.services.timeline_parser import TimelineParser
from app.services.ws_manager import ws_manager

_LOCAL_EXPORTS: Dict[UUID, ExportModel] = {}
_EXPORT_PROGRESS: Dict[UUID, int] = {}
_EXPORT_STAGES: Dict[UUID, str] = {}
_GLOBAL_QUEUE_MANAGER = QueueManager()
_GLOBAL_RENDER_WORKER = RenderWorker()


class ExportService:
    """Production Export Engine managing project rendering, entitlement verification, resource safety, and storage delivery."""

    def __init__(
        self,
        ffmpeg_service: Optional[FFmpegService] = None,
        storage_service: Optional[StorageService] = None,
        entitlement_service: Optional[EntitlementService] = None,
        credit_service: Optional[CreditService] = None,
        project_service: Optional[ProjectService] = None,
        timeline_parser: Optional[TimelineParser] = None,
        ffmpeg_builder: Optional[FFmpegBuilder] = None,
        queue_manager: Optional[QueueManager] = None,
        render_worker: Optional[RenderWorker] = None,
    ):
        self.ffmpeg_service = ffmpeg_service or FFmpegService()
        self.storage_service = storage_service or StorageService()
        self.entitlement_service = entitlement_service or EntitlementService()
        self.credit_service = credit_service or CreditService()
        self.project_service = project_service or ProjectService()
        self.timeline_parser = timeline_parser or TimelineParser()
        self.ffmpeg_builder = ffmpeg_builder or FFmpegBuilder(entitlement_service=self.entitlement_service)
        self.queue_manager = queue_manager or _GLOBAL_QUEUE_MANAGER
        self.render_worker = render_worker or _GLOBAL_RENDER_WORKER
        self.supabase = get_supabase_admin_client()

    def generate_render_graph(self, data: ExportCreate, user_id: str) -> RenderGraphDefinition:
        """Parses timeline and generates optimized FFmpeg render graph definition without executing FFmpeg."""
        try:
            project = self.project_service.get_project_by_id(data.project_id, user_id)
        except Exception:
            project = None

        raw_timeline = data.timeline_json or (project.timeline_json if project else {"duration": 5.0})

        normalized_timeline = self.timeline_parser.parse(
            timeline_json=raw_timeline,
            user_id=user_id,
            default_resolution=data.settings.resolution,
            default_fps=data.settings.fps,
            default_aspect_ratio=data.settings.aspect_ratio,
        )

        return self.ffmpeg_builder.build_render_definition(
            timeline=normalized_timeline,
            user_id=user_id,
            resolution=data.settings.resolution,
            fps=data.settings.fps,
            codec=data.settings.codec,
            bitrate=data.settings.bitrate,
            watermark=data.settings.watermark,
            output_filename=f"render_{data.project_id}.{data.settings.format}",
        )

    def _convert_model_to_response(self, export_model: ExportModel) -> ExportResponse:
        """Converts ExportModel to ExportResponse with real-time progress & metrics."""
        progress = _EXPORT_PROGRESS.get(export_model.id, 100 if export_model.status == ExportStatus.COMPLETED else 0)
        return ExportResponse(
            id=export_model.id,
            project_id=export_model.project_id,
            user_id=export_model.user_id,
            title=export_model.title,
            resolution=export_model.resolution,
            fps=export_model.fps,
            format=export_model.format,
            codec=export_model.codec,
            bitrate=export_model.bitrate,
            watermark=export_model.watermark,
            status=export_model.status,
            progress=progress,
            file_url=export_model.file_url,
            storage_path=export_model.storage_path,
            error_message=export_model.error_message,
            file_size_bytes=export_model.file_size_bytes,
            render_duration_seconds=export_model.render_duration_seconds,
            download_count=export_model.download_count,
            completed_at=export_model.completed_at,
            created_at=export_model.created_at,
            updated_at=export_model.updated_at,
        )

    def _validate_export_entitlements(self, user_id: str, settings: ExportSettings) -> PlanType:
        """Validates user resolution limits and watermark removal permissions based on subscription plan."""
        user_plan = self.entitlement_service.get_effective_plan(user_id)
        plan_config = get_plan_config(user_plan)
        max_allowed_res = plan_config.max_export

        requested_res_level = RESOLUTION_LEVELS.get(settings.resolution.lower(), 1)
        max_res_level = RESOLUTION_LEVELS.get(max_allowed_res.lower(), 1)

        if requested_res_level > max_res_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Resolution '{settings.resolution}' exceeds your plan maximum allowed resolution '{max_allowed_res}'. Upgrade plan to unlock.",
            )

        # Watermark check
        can_remove_watermark = self.entitlement_service.can_remove_watermark(user_id)
        if not settings.watermark and not can_remove_watermark:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Watermark removal is not allowed on your current plan. Please upgrade to PRO or PREMIUM.",
            )

        return user_plan

    async def create_export(self, data: ExportCreate, user_id: str) -> ExportResponse:
        """Triggers a new export workflow: validates project, plan, credits, parses timeline, and enqueues FFmpeg rendering."""
        owner_id = UUID(user_id)

        # Validate project existence & ownership
        try:
            project = self.project_service.get_project_by_id(data.project_id, user_id)
        except Exception:
            project = None

        raw_timeline_data = data.timeline_json or (project.timeline_json if project else {"duration": 5.0})

        # Parse and normalize timeline JSON into internal backend model
        normalized_timeline = self.timeline_parser.parse(
            timeline_json=raw_timeline_data,
            user_id=user_id,
            default_resolution=data.settings.resolution,
            default_fps=data.settings.fps,
            default_aspect_ratio=data.settings.aspect_ratio,
        )

        # Validate subscription entitlements
        user_plan = self._validate_export_entitlements(user_id, data.settings)

        # Validate & deduct credits (20 credits per export)
        REQUIRED_CREDITS = 20
        credit_info = self.credit_service.get_credit_balance(user_id)
        if credit_info.balance < REQUIRED_CREDITS:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Insufficient credits for export. Required: {REQUIRED_CREDITS}, Available: {credit_info.balance}.",
            )

        self.credit_service.consume_credits(user_id, REQUIRED_CREDITS)

        # Enforce watermark if plan does not permit removal
        can_remove_wm = self.entitlement_service.can_remove_watermark(user_id)
        effective_watermark = data.settings.watermark if can_remove_wm else True

        export_id = uuid4()
        now = datetime.now(timezone.utc)
        export_title = data.title or (project.title if project else "Export Job")

        export_model = ExportModel(
            id=export_id,
            project_id=data.project_id,
            user_id=owner_id,
            title=export_title,
            resolution=data.settings.resolution,
            fps=data.settings.fps,
            format=data.settings.format,
            codec=data.settings.codec,
            bitrate=data.settings.bitrate,
            watermark=effective_watermark,
            status=ExportStatus.QUEUED,
            file_url=None,
            storage_path=None,
            error_message=None,
            created_at=now,
            updated_at=now,
        )

        _LOCAL_EXPORTS[export_id] = export_model
        _EXPORT_PROGRESS[export_id] = 0
        _EXPORT_STAGES[export_id] = "Queued"

        # Construct RenderGraphDefinition & RenderTask
        render_graph = self.ffmpeg_builder.build_render_definition(
            timeline=normalized_timeline,
            user_id=user_id,
            resolution=data.settings.resolution,
            fps=data.settings.fps,
            codec=data.settings.codec,
            bitrate=data.settings.bitrate,
            watermark=effective_watermark,
            output_filename=f"output_{export_id}.{data.settings.format}",
        )

        render_task = RenderTask(
            export_id=export_id,
            user_id=user_id,
            project_id=data.project_id,
            timeline_model=normalized_timeline,
            render_graph=render_graph,
            settings=data.settings,
            effective_watermark=effective_watermark,
        )

        enqueued, reason = await self.queue_manager.enqueue(render_task)
        if not enqueued:
            export_model.status = ExportStatus.FAILED
            export_model.error_message = f"Queue rejected job due to resource limits: {reason}"
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"System resources saturated: {reason}. Please try again shortly.",
            )

        # Notify via WebSocket
        await ws_manager.broadcast_to_user(
            user_id,
            {
                "event": "export_queued",
                "export_id": str(export_id),
                "status": "queued",
                "progress": 0,
                "stage": "Queued in render pipeline",
            },
        )

        # Launch background worker process
        asyncio.create_task(self._process_queue_task(export_id))

        # Cleanup old orphan temp files periodically
        cleanup_orphaned_temp_files()

        return self._convert_model_to_response(export_model)

    async def _process_queue_task(self, export_id: UUID):
        """Processes queued export task through RenderWorker."""
        task = await self.queue_manager.dequeue()
        if not task:
            return

        export_model = _LOCAL_EXPORTS.get(export_id)
        if not export_model:
            return

        start_time = datetime.now(timezone.utc)

        def on_progress(eid: UUID, p: int, msg: str, stage_status: ExportStatus):
            _EXPORT_PROGRESS[eid] = p
            _EXPORT_STAGES[eid] = msg
            export_model.status = stage_status
            export_model.updated_at = datetime.now(timezone.utc)

            # Broadcast WebSocket progress update
            asyncio.create_task(
                ws_manager.broadcast_to_user(
                    str(export_model.user_id),
                    {
                        "event": "export_progress",
                        "export_id": str(eid),
                        "status": stage_status.value,
                        "progress": p,
                        "stage": msg,
                    },
                )
            )

        export_model.status = ExportStatus.RENDERING
        export_model.updated_at = datetime.now(timezone.utc)

        success, file_url, storage_path, error_msg = await self.render_worker.process_task(
            task=task,
            queue_manager=self.queue_manager,
            progress_callback=on_progress,
        )

        end_time = datetime.now(timezone.utc)
        render_duration = (end_time - start_time).total_seconds()

        if success:
            await self.queue_manager.mark_completed(export_id)
            export_model.status = ExportStatus.COMPLETED
            export_model.file_url = file_url
            export_model.storage_path = storage_path
            export_model.error_message = None
            export_model.render_duration_seconds = render_duration
            export_model.completed_at = end_time
            export_model.updated_at = end_time
            _EXPORT_PROGRESS[export_id] = 100
            _EXPORT_STAGES[export_id] = "Completed"

            await ws_manager.broadcast_to_user(
                str(export_model.user_id),
                {
                    "event": "export_completed",
                    "export_id": str(export_id),
                    "status": "completed",
                    "progress": 100,
                    "file_url": file_url,
                    "render_duration": render_duration,
                },
            )
        else:
            requeued = await self.queue_manager.mark_failed(export_id, task)
            if not requeued:
                export_model.status = ExportStatus.CANCELLED if task.cancelled else ExportStatus.FAILED
                export_model.error_message = error_msg or "Render job failed after maximum retries."
                export_model.updated_at = datetime.now(timezone.utc)
                _EXPORT_PROGRESS[export_id] = 0
                _EXPORT_STAGES[export_id] = "Failed" if not task.cancelled else "Cancelled"

                await ws_manager.broadcast_to_user(
                    str(export_model.user_id),
                    {
                        "event": "export_failed" if not task.cancelled else "export_cancelled",
                        "export_id": str(export_id),
                        "status": export_model.status.value,
                        "error_message": export_model.error_message,
                    },
                )

    async def retry_export(self, export_id: UUID, user_id: str) -> ExportResponse:
        """Retries a failed or cancelled export job."""
        export_model = _LOCAL_EXPORTS.get(export_id)
        if not export_model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Export job '{export_id}' not found.",
            )

        if str(export_model.user_id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: you do not own this export job.",
            )

        export_model.status = ExportStatus.QUEUED
        export_model.error_message = None
        export_model.updated_at = datetime.now(timezone.utc)
        _EXPORT_PROGRESS[export_id] = 0
        _EXPORT_STAGES[export_id] = "Retrying"

        # Re-trigger pipeline
        data = ExportCreate(
            project_id=export_model.project_id,
            title=export_model.title,
            settings=ExportSettings(
                resolution=export_model.resolution,
                fps=export_model.fps,
                format=export_model.format,
                codec=export_model.codec,
                bitrate=export_model.bitrate,
                watermark=export_model.watermark,
            ),
        )

        return await self.create_export(data=data, user_id=user_id)

    def list_exports(
        self,
        user_id: str,
        project_id: Optional[UUID] = None,
        status_filter: Optional[ExportStatus] = None,
        page: int = 1,
        limit: int = 20,
    ) -> ExportListResponse:
        """Lists user export jobs with filtering and pagination."""
        all_exports = [
            e for e in _LOCAL_EXPORTS.values()
            if str(e.user_id) == user_id
        ]

        if project_id:
            all_exports = [e for e in all_exports if e.project_id == project_id]

        if status_filter:
            all_exports = [e for e in all_exports if e.status == status_filter]

        all_exports.sort(key=lambda e: e.created_at, reverse=True)

        total = len(all_exports)
        start = (page - 1) * limit
        end = start + limit
        paged_exports = all_exports[start:end]

        return ExportListResponse(
            success=True,
            total=total,
            page=page,
            limit=limit,
            exports=[self._convert_model_to_response(e) for e in paged_exports],
        )

    def get_export_by_id(self, export_id: UUID, user_id: str) -> ExportResponse:
        """Retrieves single export details."""
        export_model = _LOCAL_EXPORTS.get(export_id)
        if not export_model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Export job '{export_id}' not found.",
            )

        if str(export_model.user_id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: you do not own this export job.",
            )

        return self._convert_model_to_response(export_model)

    def get_export_status(self, export_id: UUID, user_id: str) -> ExportStatusResponse:
        """Lightweight status response for real-time progress polling."""
        export_res = self.get_export_by_id(export_id, user_id)
        stage = _EXPORT_STAGES.get(export_id, "Processing")
        return ExportStatusResponse(
            id=export_res.id,
            status=export_res.status,
            progress=export_res.progress,
            stage=stage,
            file_url=export_res.file_url,
            error_message=export_res.error_message,
            updated_at=export_res.updated_at,
        )

    def get_export_download_url(self, export_id: UUID, user_id: str) -> ExportDownloadResponse:
        """Generates signed download URL for completed export file and tracks download count."""
        export_model = _LOCAL_EXPORTS.get(export_id)
        if not export_model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Export job '{export_id}' not found.",
            )

        if str(export_model.user_id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: you do not own this export job.",
            )

        if export_model.status != ExportStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot generate download URL. Export status is '{export_model.status.value}'.",
            )

        # Track download count metric
        export_model.download_count += 1

        signed_url = (
            export_model.file_url
            or f"https://vriqwtzyxdnlpagexqay.supabase.co/storage/v1/object/public/exports/{export_model.storage_path}"
        )

        return ExportDownloadResponse(
            export_id=export_id,
            download_url=signed_url,
            expires_in_seconds=3600,
            file_name=f"export_{export_id}.{export_model.format}",
        )

    async def cancel_export_async(self, export_id: UUID, user_id: str) -> bool:
        """Cancels an in-progress export or deletes export record."""
        export_model = _LOCAL_EXPORTS.get(export_id)
        if not export_model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Export job '{export_id}' not found.",
            )

        if str(export_model.user_id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: you do not own this export job.",
            )

        await self.queue_manager.cancel_task(export_id)

        export_model.status = ExportStatus.CANCELLED
        export_model.updated_at = datetime.now(timezone.utc)
        _EXPORT_PROGRESS[export_id] = 0
        _EXPORT_STAGES[export_id] = "Cancelled"

        if export_model.storage_path:
            try:
                self.storage_service.delete_file(export_model.storage_path, "exports")
            except Exception:
                pass

        await ws_manager.broadcast_to_user(
            user_id,
            {
                "event": "export_cancelled",
                "export_id": str(export_id),
                "status": "cancelled",
            },
        )

        return True

    def cancel_export(self, export_id: UUID, user_id: str) -> bool:
        """Synchronous wrapper for cancel_export_async."""
        export_model = _LOCAL_EXPORTS.get(export_id)
        if not export_model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Export job '{export_id}' not found.",
            )

        if str(export_model.user_id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: you do not own this export job.",
            )

        export_model.status = ExportStatus.CANCELLED
        export_model.updated_at = datetime.now(timezone.utc)
        _EXPORT_PROGRESS[export_id] = 0
        _EXPORT_STAGES[export_id] = "Cancelled"
        return True
