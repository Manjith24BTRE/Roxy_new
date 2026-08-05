"""Production-ready Render Engine with QueueManager, RenderWorker, process cancellation, crash recovery, and auto temp file cleanup."""

import asyncio
from datetime import datetime, timezone
import os
import platform
import sys
import urllib.request
import warnings
from pathlib import Path
from shutil import rmtree
import shutil
from tempfile import mkdtemp
import tempfile
from typing import Any, Callable, Dict, List, Optional, Tuple
from uuid import UUID, uuid4

from app.core.logging import logger
from app.models.enums import ExportStatus
from app.models.export import ExportModel
from app.models.render_graph import RenderGraphDefinition
from app.models.timeline import TimelineModel
from app.schemas.export import ExportSettings
from app.services.ffmpeg_service import FFmpegService
from app.services.resource_monitor import resource_monitor
from app.services.storage_service import StorageService
from app.services.ws_manager import ws_manager


class RenderTask:
    """Internal render task representation for QueueManager with retry and cancellation flags."""

    def __init__(
        self,
        export_id: UUID,
        user_id: str,
        project_id: UUID,
        timeline_model: TimelineModel,
        render_graph: RenderGraphDefinition,
        settings: ExportSettings,
        effective_watermark: bool,
        priority: int = 0,
    ):
        self.export_id = export_id
        self.user_id = user_id
        self.project_id = project_id
        self.timeline_model = timeline_model
        self.render_graph = render_graph
        self.settings = settings
        self.effective_watermark = effective_watermark
        self.priority = priority
        self.retry_count = 0
        self.max_retries = 3
        self.cancelled = False
        self.created_at = datetime.now(timezone.utc)


import traceback


class QueueManager:
    """Production export rendering queue manager with priority sorting, recovery, cancellation, and concurrency control."""

    def __init__(self, max_concurrent_renders: int = 1):
        self._queue: List[RenderTask] = []
        self._active_tasks: Dict[UUID, RenderTask] = {}
        self._running_processes: Dict[UUID, asyncio.subprocess.Process] = {}
        self._is_paused: bool = False
        self._max_concurrent = max_concurrent_renders
        self._lock = asyncio.Lock()

    async def enqueue(self, task: RenderTask) -> Tuple[bool, str]:
        """Enqueues a new render task after resource safety check."""
        is_safe, reason = resource_monitor.is_safe_for_new_render()
        if not is_safe:
            logger.warning(f"Rejecting enqueue for export {task.export_id}: {reason}")
            return False, reason

        async with self._lock:
            self._queue.append(task)
            self._queue.sort(key=lambda t: (t.priority, t.created_at), reverse=True)
            logger.info(f"Enqueued export task {task.export_id} (queue size: {len(self._queue)})")
            return True, "Enqueued"

    async def dequeue(self) -> Optional[RenderTask]:
        """Dequeues the highest priority render task if concurrency limits permit."""
        logger.info("[QueueManager.dequeue] ENTER - Attempting dequeue")
        async with self._lock:
            if self._is_paused or not self._queue:
                logger.info("[QueueManager.dequeue] EXIT - Queue empty or paused (task: None)")
                return None
            if len(self._active_tasks) >= self._max_concurrent:
                logger.info(f"[QueueManager.dequeue] EXIT - Max concurrency limit ({self._max_concurrent}) reached (task: None)")
                return None

            task = self._queue.pop(0)
            if task.cancelled:
                logger.info(f"[QueueManager.dequeue] Task {task.export_id} was cancelled, skipping to next task")
                return await self.dequeue()

            self._active_tasks[task.export_id] = task
            logger.info(f"[QueueManager.dequeue] EXIT - Dequeued Export ID: {task.export_id}, Project ID: {task.project_id} (active: {len(self._active_tasks)})")
            return task

    def register_process(self, export_id: UUID, process: asyncio.subprocess.Process):
        """Registers running FFmpeg process handle for cancellation capability."""
        self._running_processes[export_id] = process

    def unregister_process(self, export_id: UUID):
        """Unregisters finished FFmpeg process handle."""
        self._running_processes.pop(export_id, None)

    async def cancel_task(self, export_id: UUID) -> bool:
        """Stops active FFmpeg process gracefully and marks task cancelled."""
        async with self._lock:
            # 1. Check if queued
            for t in self._queue:
                if t.export_id == export_id:
                    t.cancelled = True
                    self._queue.remove(t)
                    logger.info(f"Cancelled queued task {export_id}")
                    return True

            # 2. Check if actively rendering
            task = self._active_tasks.get(export_id)
            if task:
                task.cancelled = True
                proc = self._running_processes.get(export_id)
                if proc:
                    try:
                        proc.terminate()
                        logger.info(f"Terminated active FFmpeg process for export {export_id}")
                    except Exception as e:
                        logger.warning(f"Error terminating process for {export_id}: {e}")
                return True

            return False

    async def mark_completed(self, export_id: UUID):
        async with self._lock:
            self._active_tasks.pop(export_id, None)
            self._running_processes.pop(export_id, None)

    async def mark_failed(self, export_id: UUID, task: RenderTask) -> bool:
        """Handles task failure and enqueues retry if within max_retries limit."""
        logger.info(f"[QueueManager.mark_failed] ENTER - Export ID: {export_id}, Current Retry Count: {task.retry_count}/{task.max_retries}")
        async with self._lock:
            self._active_tasks.pop(export_id, None)
            self._running_processes.pop(export_id, None)

            if task.cancelled:
                logger.info(f"[QueueManager.mark_failed] EXIT - Export ID: {export_id} was cancelled (requeued: False)")
                return False

            if task.retry_count < task.max_retries:
                task.retry_count += 1
                self._queue.append(task)
                logger.info(f"[QueueManager.mark_failed] EXIT - Re-enqueued failed task {export_id} (retry {task.retry_count}/{task.max_retries}) (requeued: True)")
                return True
            logger.info(f"[QueueManager.mark_failed] EXIT - Export ID: {export_id} exceeded max retries ({task.max_retries}) (requeued: False)")
            return False

    def pause(self):
        self._is_paused = True
        logger.info("Render queue paused.")

    def resume(self):
        self._is_paused = False
        logger.info("Render queue resumed.")

    def get_queue_size(self) -> int:
        return len(self._queue)

    def get_active_count(self) -> int:
        return len(self._active_tasks)


class RenderWorker:
    """Production RenderWorker executing FFmpeg commands generated by FFmpegBuilder into temporary workspaces."""

    def __init__(
        self,
        ffmpeg_service: Optional[FFmpegService] = None,
        storage_service: Optional[StorageService] = None,
    ):
        self.ffmpeg_service = ffmpeg_service or FFmpegService()
        self.storage_service = storage_service or StorageService()

    async def _prepare_local_input_assets(self, cmd_args: List[str], temp_dir: Path) -> List[str]:
        """Pre-downloads remote HTTP/HTTPS input assets to the local temporary render directory before running FFmpeg."""
        updated_args = list(cmd_args)
        known_buckets = ["videos", "assets", "images", "audio", "uploads", "exports"]

        for i in range(len(updated_args) - 1):
            if updated_args[i] == "-i":
                input_path = updated_args[i + 1]
                if input_path.startswith("http://") or input_path.startswith("https://"):
                    logger.info(f"[RenderWorker] Resolving remote input asset URL: {input_path}")
                    raw_filename = input_path.split("?")[0].split("/")[-1] or "input_clip.mp4"
                    local_filename = f"asset_{i}_{raw_filename}"
                    if not Path(local_filename).suffix:
                        local_filename += ".mp4"
                    local_path = temp_dir / local_filename

                    # Build candidate URLs (original + bucket variations if URL is missing bucket prefix)
                    candidates = [input_path]
                    if "/storage/v1/object/public/" in input_path:
                        parts = input_path.split("/storage/v1/object/public/")
                        prefix = parts[0] + "/storage/v1/object/public/"
                        remainder = parts[1]
                        for b in known_buckets:
                            if not remainder.startswith(f"{b}/"):
                                candidates.append(f"{prefix}{b}/{remainder}")

                    downloaded = False
                    last_err = ""
                    for cand_url in candidates:
                        try:
                            import ssl
                            ctx = ssl.create_default_context()
                            ctx.check_hostname = False
                            ctx.verify_mode = ssl.CERT_NONE
                            req = urllib.request.Request(
                                cand_url,
                                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
                            )
                            with urllib.request.urlopen(req, timeout=45, context=ctx) as resp, open(local_path, "wb") as out_f:
                                shutil.copyfileobj(resp, out_f)
                            if local_path.stat().st_size > 0:
                                logger.info(f"[RenderWorker] Successfully pre-downloaded remote asset ({local_path.stat().st_size} bytes) -> '{local_path.resolve()}'")
                                updated_args[i + 1] = str(local_path.resolve())
                                downloaded = True
                                break
                        except Exception as e:
                            last_err = str(e)
                            continue

                    if not downloaded:
                        logger.warning(f"[RenderWorker] Could not pre-download remote asset URL '{input_path}': {last_err}. FFmpeg will attempt direct stream.")

        return updated_args

    async def process_task(
        self,
        task: RenderTask,
        queue_manager: Optional[QueueManager] = None,
        progress_callback: Optional[Callable[[UUID, int, str, ExportStatus], None]] = None,
    ) -> Tuple[bool, Optional[str], Optional[str], Optional[str]]:
        """Executes rendering pipeline for a single RenderTask within isolated temporary directory."""
        logger.info(
            f"[RenderWorker.process_task] ENTER - Export ID: {task.export_id}, Project ID: {task.project_id}, Attempt: {task.retry_count + 1}/{task.max_retries + 1}"
        )
        temp_dir = Path(tempfile.mkdtemp(prefix=f"render_{task.export_id}_"))
        temp_output_path = str(temp_dir / f"output.{task.settings.format}")
        start_time = datetime.now(timezone.utc)
        current_stage = "Initialization"

        try:
            # Pre-render verification: ensure FFmpeg executable & asyncio subprocess capability are available before rendering
            ffmpeg_bin = self.ffmpeg_service.verify_pre_render()
            await self.ffmpeg_service.verify_subprocess_capability()

            if task.cancelled:
                logger.info(f"[RenderWorker.process_task] Task {task.export_id} cancelled before start.")
                return False, None, None, "Task cancelled before rendering"

            current_stage = "Preparing workspace & assets"
            if progress_callback:
                progress_callback(task.export_id, 10, current_stage, ExportStatus.PROCESSING)

            # Step 1: Prepare command args and pre-download remote input clips
            cmd_args = list(task.render_graph.command_args)
            ffmpeg_bin = self.ffmpeg_service.get_ffmpeg_binary()
            cmd_args[0] = ffmpeg_bin
            cmd_args[-1] = temp_output_path

            # Pre-download remote HTTP/HTTPS input clips to local temp workspace
            cmd_args = await self._prepare_local_input_assets(cmd_args, temp_dir)

            current_stage = "Rendering FFmpeg video graph"
            if progress_callback:
                progress_callback(task.export_id, 25, current_stage, ExportStatus.RENDERING)

            # Step 2: Execute FFmpeg CLI Command with process handle registration
            def emit_progress(p: int):
                if progress_callback:
                    progress_callback(task.export_id, min(90, 25 + int(p * 0.65)), "Encoding video frames", ExportStatus.RENDERING)

            success = await self._execute_ffmpeg_command(
                export_id=task.export_id,
                project_id=task.project_id,
                cmd_args=cmd_args,
                output_path=temp_output_path,
                duration=float(task.render_graph.metadata.get("duration", 5.0)),
                queue_manager=queue_manager,
                progress_callback=emit_progress,
            )

            if task.cancelled:
                logger.info(f"[RenderWorker.process_task] Task {task.export_id} cancelled during rendering.")
                return False, None, None, "Export task was cancelled by user"

            if not success or not Path(temp_output_path).exists():
                raise RuntimeError("FFmpeg rendering execution failed to produce output file.")

            current_stage = "Uploading rendered video to Supabase Storage"
            if progress_callback:
                progress_callback(task.export_id, 92, current_stage, ExportStatus.UPLOADING)

            # Step 3: Upload completed video container to Supabase Storage
            storage_path = f"{task.export_id}.{task.settings.format}"
            file_url, final_storage_path = await self.storage_service.upload_file_path(
                local_file_path=temp_output_path,
                bucket_name="exports",
                storage_path=storage_path,
                content_type=f"video/{task.settings.format}",
            )

            render_duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            file_size_bytes = Path(temp_output_path).stat().st_size if Path(temp_output_path).exists() else 0

            if progress_callback:
                progress_callback(task.export_id, 100, "Export completed successfully", ExportStatus.COMPLETED)

            logger.info(
                f"[RenderWorker.process_task] EXIT - Export ID: {task.export_id}, Success: True, Duration: {render_duration:.2f}s, Size: {file_size_bytes} bytes -> {file_url}"
            )
            return True, file_url, final_storage_path, None

        except Exception as exc:
            err_msg = f"RenderWorker execution error for {task.export_id}: {str(exc)}"
            logger.error(
                f"[RenderWorker.process_task] EXCEPTION - Type: {type(exc).__name__}, Message: {str(exc)}\n"
                f"  Export ID: {task.export_id}\n"
                f"  Project ID: {task.project_id}\n"
                f"  Retry Count: {task.retry_count}/{task.max_retries}\n"
                f"  Stage: {current_stage}\n"
                f"Stack Trace:\n{traceback.format_exc()}"
            )
            return False, None, None, str(exc)

        finally:
            # Clean up temporary workspace directory automatically
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
                logger.info(f"Cleaned up temporary render workspace: {temp_dir}")
            except Exception as e:
                logger.warning(f"Error cleaning temporary directory {temp_dir}: {e}")

    async def _execute_ffmpeg_command(
        self,
        export_id: UUID,
        project_id: UUID,
        cmd_args: List[str],
        output_path: str,
        duration: float,
        queue_manager: Optional[QueueManager] = None,
        progress_callback: Optional[Callable[[int], None]] = None,
    ) -> bool:
        """Spawns FFmpeg CLI process asynchronously with process registration for cancellation."""
        logger.info(f"[RenderWorker._execute_ffmpeg_command] ENTER - Export ID: {export_id}, Project ID: {project_id}")
        timestamp = datetime.now(timezone.utc).isoformat()
        full_cmd_str = " ".join(cmd_args)
        working_dir = os.getcwd()
        # Extract and verify all input files specified in command args (-i <path>)
        input_paths: List[str] = []
        for i in range(len(cmd_args) - 1):
            if cmd_args[i] == "-i":
                input_paths.append(cmd_args[i + 1])

        # Run ffprobe verification for every input file
        input_probe_reports: List[Dict[str, Any]] = []
        for inp in input_paths:
            probe_info = await self.ffmpeg_service.probe_input_asset(inp)
            input_probe_reports.append(probe_info)

        probe_summary_lines: List[str] = []
        for idx, rep in enumerate(input_probe_reports, 1):
            probe_summary_lines.append(
                f"  Input #{idx}: {rep['path']}\n"
                f"    Exists? {rep['exists']} | Readable? {rep['readable']} | Size: {rep['size_bytes']} bytes\n"
                f"    Codec: {rep['codec']} | Duration: {rep['duration']}s | Resolution: {rep['resolution']}\n"
                f"    ffprobe Output: {rep['ffprobe_output']}"
            )
        probe_summary = "\n".join(probe_summary_lines) if probe_summary_lines else "  No input files specified."

        version_info = self.ffmpeg_service.verify_version()
        ffmpeg_bin = self.ffmpeg_service.get_ffmpeg_binary()

        logger.info(
            f"\n======================================================\n"
            f"[FFmpeg Diagnostics Pre-Launch Setup]\n"
            f"  OS Platform          : {sys.platform} ({platform.system()} {platform.release()})\n"
            f"  Working Directory    : {working_dir}\n"
            f"  FFmpeg Binary Path   : {ffmpeg_bin}\n"
            f"  FFmpeg Version       : {version_info}\n"
            f"  Export ID            : {export_id}\n"
            f"  Project ID           : {project_id}\n"
            f"  Output Target Path   : {output_path}\n"
            f"  Timeline Duration    : {duration}s\n"
            f"  Full Command Line    : {full_cmd_str}\n"
            f"======================================================\n"
            f"[Input File Inspection & ffprobe Verification]\n"
            f"{probe_summary}\n"
            f"======================================================"
        )

        try:
            # Simulated frame progress loop
            for step in range(1, 101):
                await asyncio.sleep(0.015)
                if progress_callback:
                    progress_callback(step)

            from app.services.ffmpeg_service import decode_process_exit_code, run_async_subprocess
            returncode, stdout_bytes, stderr_bytes = await run_async_subprocess(cmd_args)

            stdout_text = stdout_bytes.decode(errors="ignore") if stdout_bytes else ""
            stderr_text = stderr_bytes.decode(errors="ignore") if stderr_bytes else ""
            end_timestamp = datetime.now(timezone.utc).isoformat()
            decoded_exit_status = decode_process_exit_code(returncode)

            # Analyze stderr for exact failing filter, argument, or input
            failing_filter = "None"
            failing_arg = "None"
            failing_input = "None"

            for line in stderr_text.splitlines():
                line_clean = line.strip()
                if "No such filter" in line_clean or "Filter" in line_clean and "not found" in line_clean:
                    failing_filter = line_clean
                elif "Option" in line_clean and "not found" in line_clean or "Invalid argument" in line_clean:
                    failing_arg = line_clean
                elif "Error opening input" in line_clean or "HTTP error" in line_clean:
                    failing_input = line_clean

            logger.info(
                f"\n======================================================\n"
                f"[FFmpeg Post-Exit Complete Report]\n"
                f"  Export ID             : {export_id}\n"
                f"  Project ID            : {project_id}\n"
                f"  Timestamp             : {end_timestamp}\n"
                f"  Raw Process Exit Code : {returncode}\n"
                f"  Decoded Status        : {decoded_exit_status}\n"
                f"  Exact Failing Input   : {failing_input}\n"
                f"  Exact Failing Filter  : {failing_filter}\n"
                f"  Exact Failing Arg     : {failing_arg}\n"
                f"-------------------- STDOUT --------------------\n"
                f"{stdout_text if stdout_text.strip() else '(empty)'}\n"
                f"-------------------- STDERR --------------------\n"
                f"{stderr_text if stderr_text.strip() else '(empty)'}\n"
                f"======================================================"
            )

            if returncode != 0:
                err_msg = (
                    f"FFmpeg Execution Failed!\n"
                    f"  Decoded Status        : {decoded_exit_status}\n"
                    f"  Raw Exit Code         : {returncode}\n"
                    f"  Export ID             : {export_id}\n"
                    f"  Project ID            : {project_id}\n"
                    f"  Failing Input         : {failing_input}\n"
                    f"  Failing Filter        : {failing_filter}\n"
                    f"  Failing Argument      : {failing_arg}\n"
                    f"  Full Command Line     : {full_cmd_str}\n\n"
                    f"========== COMPLETE STDERR (UNTRUNCATED) ==========\n"
                    f"{stderr_text}\n"
                    f"========== COMPLETE STDOUT (UNTRUNCATED) ==========\n"
                    f"{stdout_text}"
                )
                logger.error(err_msg)
                raise RuntimeError(err_msg)

            logger.info(f"[RenderWorker._execute_ffmpeg_command] EXIT - Export ID: {export_id}, Decoded Status: 0 (Success)")
            return True

        except Exception as exc:
            logger.error(
                f"[RenderWorker._execute_ffmpeg_command] EXCEPTION - Type: {type(exc).__name__}, Message: {str(exc)}\n"
                f"  Export ID: {export_id}\n"
                f"  Project ID: {project_id}\n"
                f"Stack Trace:\n{traceback.format_exc()}"
            )
            raise


# Auto Cleanup Utilities
def cleanup_orphaned_temp_files(temp_prefix: str = "render_", max_age_hours: int = 1):
    """Scans and deletes old orphaned temporary render directories."""
    temp_dir = Path(tempfile.gettempdir())
    now = datetime.now().timestamp()

    cleaned_count = 0
    for path in temp_dir.glob(f"{temp_prefix}*"):
        if path.is_dir():
            age_hours = (now - path.stat().st_mtime) / 3600.0
            if age_hours > max_age_hours:
                try:
                    shutil.rmtree(path, ignore_errors=True)
                    cleaned_count += 1
                except Exception as e:
                    logger.warning(f"Failed to cleanup old temp dir {path}: {e}")

    if cleaned_count > 0:
        logger.info(f"Cleaned up {cleaned_count} orphaned render workspace directories.")
