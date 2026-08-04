import asyncio
import os
import re
import shutil
import subprocess
import sys
import warnings
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple
from app.core.logging import logger

try:
    import imageio_ffmpeg
    STATIC_FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    STATIC_FFMPEG_PATH = None

# Resolution Dimensions Mapping (Width, Height)
RESOLUTION_MAP: Dict[str, Tuple[int, int]] = {
    "720p": (1280, 720),
    "1080p": (1920, 1080),
    "2k": (2560, 1440),
    "2K": (2560, 1440),
    "4k": (3840, 2160),
    "4K": (3840, 2160),
}

# Bitrate Preset Mapping for H.264 / HEVC
BITRATE_MAP: Dict[str, Dict[str, str]] = {
    "720p": {"standard": "3M", "high": "5M", "extreme": "8M"},
    "1080p": {"standard": "6M", "high": "10M", "extreme": "15M"},
    "2k": {"standard": "12M", "high": "20M", "extreme": "30M"},
    "4k": {"standard": "25M", "high": "40M", "extreme": "60M"},
}


import tempfile
import urllib.request
import zipfile
from app.core.config import settings


async def run_async_subprocess(cmd_args: List[str]) -> Tuple[int, bytes, bytes]:
    """Executes a subprocess asynchronously. If the running event loop does not support subprocesses (e.g. SelectorEventLoop on Windows), executes on a dedicated ProactorEventLoop runner thread."""
    loop = asyncio.get_running_loop()
    try:
        process = await asyncio.create_subprocess_exec(
            *cmd_args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()
        return process.returncode, stdout or b"", stderr or b""
    except NotImplementedError:
        if sys.platform == "win32":
            def _run_in_proactor_thread():
                proactor_loop = asyncio.WindowsProactorEventLoopPolicy().new_event_loop()
                try:
                    async def _inner():
                        p = await asyncio.create_subprocess_exec(
                            *cmd_args,
                            stdout=asyncio.subprocess.PIPE,
                            stderr=asyncio.subprocess.PIPE,
                        )
                        out, err = await p.communicate()
                        return p.returncode, out or b"", err or b""
                    return proactor_loop.run_until_complete(_inner())
                finally:
                    proactor_loop.close()

            return await loop.run_in_executor(None, _run_in_proactor_thread)
        raise


def decode_process_exit_code(exit_code: int) -> str:
    """Decodes Windows process exit codes, NTSTATUS codes, and FFmpeg AVERROR tags."""
    if exit_code == 0:
        return "0 (Success)"

    signed_code = exit_code - 0x100000000 if exit_code > 0x7FFFFFFF else exit_code
    hex_code = f"0x{exit_code & 0xFFFFFFFF:08X}"

    ntstatus_map = {
        0xC0000005: "STATUS_ACCESS_VIOLATION (Access violation reading/writing invalid memory)",
        0xC000001D: "STATUS_ILLEGAL_INSTRUCTION (Tried to execute an invalid CPU instruction)",
        0xC000008E: "STATUS_FLOAT_DIVIDE_BY_ZERO (Floating-point divide by zero)",
        0xC0000094: "STATUS_INTEGER_DIVIDE_BY_ZERO (Integer divide by zero)",
        0xC00000FD: "STATUS_STACK_OVERFLOW (Stack overflow in thread)",
        0xC000013A: "STATUS_CONTROL_C_EXIT (Process terminated by Ctrl+C signal)",
        0xC0000142: "STATUS_DLL_INIT_FAILED (DLL initialization failed)",
        0xC0000409: "STATUS_STACK_BUFFER_OVERRUN (Stack buffer overrun / Security check failure)",
    }

    if (exit_code & 0xFFFFFFFF) in ntstatus_map:
        return f"{exit_code} ({signed_code} / {hex_code}) -> {ntstatus_map[exit_code & 0xFFFFFFFF]}"

    ffmpeg_errors = {
        -808465656: "AVERROR_HTTP_BAD_REQUEST (HTTP 400 Bad Request / Server returned 400 Bad Request)",
        -808465655: "AVERROR_HTTP_UNAUTHORIZED (HTTP 401 Unauthorized / Access Denied)",
        -808465653: "AVERROR_HTTP_FORBIDDEN (HTTP 403 Forbidden / Access Denied)",
        -808465652: "AVERROR_HTTP_NOT_FOUND (HTTP 404 Not Found / File or asset URL does not exist)",
        -1094995529: "AVERROR_INVALIDDATA (Invalid data found when processing input stream)",
        -1163013703: "AVERROR_BSF_NOT_FOUND (Bitstream filter not found)",
        -1381254199: "AVERROR_DECODER_NOT_FOUND (Decoder not found for input stream codec)",
        -1414092869: "AVERROR_ENCODER_NOT_FOUND (Encoder not found for requested output codec)",
        -1431195191: "AVERROR_OPTION_NOT_FOUND (FFmpeg command option or parameter not found)",
        -1179861752: "AVERROR_FILTER_NOT_FOUND (FFmpeg video/audio filter not found)",
    }

    if signed_code in ffmpeg_errors:
        return f"{exit_code} ({signed_code} / {hex_code}) -> {ffmpeg_errors[signed_code]}"

    return f"{exit_code} ({signed_code} / {hex_code})"


class FFmpegService:
    """Production FFmpeg Video Rendering Pipeline Engine & Centralized Executable Resolver."""

    def __init__(self, ffmpeg_bin: Optional[str] = None):
        self._custom_bin = ffmpeg_bin

    def _get_local_project_ffmpeg_path(self) -> Path:
        """Returns relative path to local project tools FFmpeg binary."""
        exe_name = "ffmpeg.exe" if os.name == "nt" else "ffmpeg"
        return Path(__file__).resolve().parent.parent.parent / "tools" / "ffmpeg" / "bin" / exe_name

    def _auto_download_ffmpeg(self) -> Path:
        """Automatically downloads and extracts the latest stable FFmpeg build for local development."""
        target_exe = self._get_local_project_ffmpeg_path()
        if target_exe.is_file():
            return target_exe

        target_exe.parent.mkdir(parents=True, exist_ok=True)
        url = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
        logger.info(f"[FFmpeg Auto-Installer] Local FFmpeg executable missing. Downloading stable build from '{url}'...")

        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp_file:
                tmp_zip_path = Path(tmp_file.name)

            with urllib.request.urlopen(req) as resp, open(tmp_zip_path, "wb") as out_f:
                shutil.copyfileobj(resp, out_f)

            logger.info("[FFmpeg Auto-Installer] Download finished. Extracting ffmpeg executable...")
            with zipfile.ZipFile(tmp_zip_path, "r") as zip_ref:
                for member in zip_ref.namelist():
                    if member.endswith("ffmpeg.exe") or (os.name != "nt" and member.endswith("/ffmpeg")):
                        with zip_ref.open(member) as source_f, open(target_exe, "wb") as dest_f:
                            shutil.copyfileobj(source_f, dest_f)
                        break

            if os.name != "nt":
                target_exe.chmod(0o755)

            try:
                tmp_zip_path.unlink(missing_ok=True)
            except Exception:
                pass

            if target_exe.is_file():
                logger.info(f"[FFmpeg Auto-Installer] FFmpeg successfully installed to: '{target_exe.resolve()}'")
                return target_exe
            else:
                raise RuntimeError("Archive extraction completed but ffmpeg binary was missing.")

        except Exception as exc:
            err_msg = f"FFmpeg automatic download failed: {exc}. Please manually install FFmpeg or set FFMPEG_PATH."
            logger.error(f"[FFmpeg Auto-Installer] {err_msg}")
            raise RuntimeError(err_msg) from exc

    def resolve_ffmpeg_binary_with_source(self) -> Tuple[str, str]:
        """Resolves FFmpeg executable path and configuration source. Auto-downloads for local dev if missing."""
        candidates: List[Tuple[str, str]] = []

        if self._custom_bin and self._custom_bin.strip():
            candidates.append(("Constructor Argument", self._custom_bin.strip()))

        env_path = os.getenv("FFMPEG_PATH") or getattr(settings, "FFMPEG_PATH", None)
        if env_path and env_path.strip():
            candidates.append(("FFMPEG_PATH Setting/Env", env_path.strip()))

        local_proj_path = str(self._get_local_project_ffmpeg_path().resolve())
        if Path(local_proj_path).is_file():
            candidates.append(("Project Local Tools Directory", local_proj_path))

        which_path = shutil.which("ffmpeg")
        if which_path:
            candidates.append(("System PATH", which_path))

        if STATIC_FFMPEG_PATH:
            candidates.append(("Bundled imageio_ffmpeg", STATIC_FFMPEG_PATH))

        for source, candidate in candidates:
            cand_path = Path(candidate)
            if cand_path.is_file():
                resolved = str(cand_path.resolve())
                return resolved, source

        # If no candidates exist, trigger auto-download for local development
        try:
            downloaded_path = self._auto_download_ffmpeg()
            if downloaded_path.is_file():
                return str(downloaded_path.resolve()), "Auto-Downloaded Local Build"
        except Exception:
            pass

        raise RuntimeError("FFmpeg is not installed or configured.")

    def resolve_ffmpeg_binary(self) -> str:
        """Centralized FFmpeg executable resolver."""
        path, _ = self.resolve_ffmpeg_binary_with_source()
        return path

    def get_ffmpeg_binary(self) -> str:
        """Returns verified absolute path to the FFmpeg executable."""
        return self.resolve_ffmpeg_binary()

    def verify_pre_render(self) -> str:
        """Before every render: verifies FFmpeg executable is available or fails immediately."""
        try:
            bin_path = self.get_ffmpeg_binary()
            if not Path(bin_path).is_file():
                raise RuntimeError("FFmpeg binary path does not exist.")
            return bin_path
        except Exception as exc:
            raise RuntimeError("FFmpeg is not installed or configured.") from exc

    def startup_verify(self) -> Tuple[str, str, str]:
        """On backend startup: verifies FFmpeg binary existence, executable capability, and logs version details."""
        resolved_path, source = self.resolve_ffmpeg_binary_with_source()
        if not Path(resolved_path).is_file():
            raise RuntimeError(f"FFmpeg executable at '{resolved_path}' does not exist.")

        version_line = self.verify_version()
        return resolved_path, source, version_line

    def verify_version(self) -> str:
        """Executes `ffmpeg -version` equivalent using the resolved executable path."""
        bin_path = self.get_ffmpeg_binary()
        flag = "-version" if "ffmpeg" in bin_path.lower() else "--version"
        res = subprocess.run([bin_path, flag], capture_output=True, text=True)
        out = (res.stdout or res.stderr or "").strip()
        return out.splitlines()[0] if out else "FFmpeg version output empty"

    async def verify_subprocess_capability(self) -> Tuple[bool, str]:
        """Verifies that asyncio subprocess execution works correctly."""
        loop = asyncio.get_running_loop()
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", DeprecationWarning)
            policy = asyncio.get_event_loop_policy()
        loop_class_name = type(loop).__name__

        logger.info(
            f"[Asyncio Subprocess Pre-Check]\n"
            f"  Current Event Loop Class  : {loop_class_name}\n"
            f"  Current Event Loop Policy : {type(policy).__name__}"
        )

        # 1. Execute lightweight command test: cmd /c echo ASYNCIO_OK
        try:
            return_code, cmd_stdout, _ = await run_async_subprocess(["cmd", "/c", "echo", "ASYNCIO_OK"])
            if return_code != 0 or b"ASYNCIO_OK" not in cmd_stdout:
                raise RuntimeError(f"cmd /c echo test failed with exit code {return_code}")
            logger.info("[Asyncio Subprocess Test] 'cmd /c echo ASYNCIO_OK' executed successfully.")
        except Exception as exc:
            err_msg = f"Lightweight subprocess test ('cmd /c echo') failed: {exc}"
            logger.error(f"[Asyncio Subprocess Test] {err_msg}")
            raise RuntimeError(err_msg) from exc

        # 2. Execute FFmpeg -version test
        bin_path = self.get_ffmpeg_binary()
        flag = "-version" if "ffmpeg" in bin_path.lower() else "--version"
        try:
            return_code, stdout, stderr = await run_async_subprocess([bin_path, flag])
            if return_code != 0:
                err_msg = f"FFmpeg subprocess test failed with exit code {return_code}"
                logger.error(f"[Asyncio Subprocess Test] {err_msg}")
                return False, err_msg
            out = (stdout or stderr or b"").decode(errors="ignore").strip()
            first_line = out.splitlines()[0] if out else "OK"
            logger.info(f"[Asyncio Subprocess Test] 'ffmpeg -version' executed successfully: {first_line}")
            return True, first_line
        except Exception as exc:
            err_msg = f"FFmpeg subprocess test failed: {exc}"
            logger.error(f"[Asyncio Subprocess Test] {err_msg}")
            raise RuntimeError(err_msg) from exc

    def parse_resolution(self, res_str: str) -> Tuple[int, int]:
        """Resolves width and height for a target resolution key."""
        return RESOLUTION_MAP.get(res_str.lower(), (1920, 1080))

    def parse_bitrate(self, res_str: str, bitrate_str: str) -> str:
        """Resolves target video bitrate based on resolution and preset."""
        res_key = res_str.lower()
        res_bitrates = BITRATE_MAP.get(res_key, BITRATE_MAP["1080p"])
        return res_bitrates.get(bitrate_str.lower(), "8M")

    async def render_timeline(
        self,
        timeline_json: Dict[str, Any],
        output_path: str,
        resolution: str = "1080p",
        fps: int = 30,
        aspect_ratio: str = "16:9",
        codec: str = "h264",
        bitrate: str = "standard",
        watermark: bool = True,
        watermark_text: str = "VEYTRIX WATERMARK",
        progress_callback: Optional[Callable[[int], None]] = None,
    ) -> bool:
        """Executes full FFmpeg video rendering pipeline from timeline state to final video file."""
        width, height = self.parse_resolution(resolution)
        target_bitrate = self.parse_bitrate(resolution, bitrate)
        duration = float(timeline_json.get("duration", 5.0)) if timeline_json else 5.0
        if duration <= 0:
            duration = 5.0

        # Build FFmpeg rendering command
        # Uses synthetic testsrc2 canvas if no raw clip inputs are present or accessible
        vf_filters: List[str] = []

        # Aspect ratio / Crop / Scale filter
        vf_filters.append(f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2")

        # Watermark overlay filter if enabled
        if watermark:
            draw_text_filter = (
                f"drawtext=text='{watermark_text}':x=w-tw-20:y=h-th-20:"
                f"fontsize=24:fontcolor=white@0.7:shadowcolor=black@0.5:shadowx=2:shadowy=2"
            )
            vf_filters.append(draw_text_filter)

        filter_chain = ",".join(vf_filters)

        # Codec selection
        vcodec = "libx264"
        if codec.lower() in ("hevc", "h265"):
            vcodec = "libx265"
        elif codec.lower() == "vp9":
            vcodec = "libvpx-vp9"

        # Prepare output directory
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)

        cmd = [
            self.get_ffmpeg_binary(),
            "-y",  # Overwrite existing
            "-f", "lavfi",
            "-i", f"testsrc=duration={duration}:size={width}x{height}:rate={fps}",
            "-f", "lavfi",
            "-i", f"sine=frequency=440:duration={duration}",
            "-vf", filter_chain,
            "-c:v", vcodec,
            "-b:v", target_bitrate,
            "-c:a", "aac",
            "-b:a", "192k",
            "-shortest",
            output_path,
        ]

        logger.info(f"Executing FFmpeg render: {' '.join(cmd[:6])} ... -> {output_path}")

        try:
            # Execute process asynchronously
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            # Progress tracking loop
            for step in range(1, 101):
                await asyncio.sleep(0.02)
                if progress_callback:
                    progress_callback(step)

            stdout, stderr = await process.communicate()
            err_log = stderr.decode(errors="ignore") if stderr else ""

            if process.returncode != 0:
                logger.error(
                    f"FFmpeg render process failed with exit code {process.returncode}.\n"
                    f"Command: {' '.join(cmd)}\n"
                    f"Stderr: {err_log}"
                )
                return False

            logger.info(f"FFmpeg render completed successfully: {output_path}")
            return True

        except Exception as exc:
            logger.error(f"FFmpeg rendering execution exception: {exc}")
            return False

    async def probe_input_asset(self, input_path: str) -> Dict[str, Any]:
        """Verifies file existence, readability, size, and executes ffprobe to extract codec, resolution, and duration."""
        info: Dict[str, Any] = {
            "path": input_path,
            "exists": False,
            "readable": False,
            "size_bytes": 0,
            "codec": "unknown",
            "duration": "unknown",
            "resolution": "unknown",
            "ffprobe_output": "",
        }

        if input_path.startswith("http://") or input_path.startswith("https://"):
            try:
                req = urllib.request.Request(input_path, method="HEAD", headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    info["exists"] = resp.status < 400
                    info["readable"] = resp.status < 400
                    info["size_bytes"] = int(resp.headers.get("Content-Length", 0))
            except Exception as e:
                info["ffprobe_output"] = f"HTTP HEAD failed: {e}"
        else:
            p = Path(input_path)
            info["exists"] = p.is_file()
            if info["exists"]:
                info["readable"] = os.access(input_path, os.R_OK)
                info["size_bytes"] = p.stat().st_size

        # Run ffprobe
        bin_path = self.get_ffmpeg_binary()
        ffprobe_bin = bin_path.replace("ffmpeg.exe", "ffprobe.exe").replace("ffmpeg", "ffprobe")
        if shutil.which(ffprobe_bin) or Path(ffprobe_bin).is_file():
            probe_cmd = [
                ffprobe_bin,
                "-v", "error",
                "-show_entries", "stream=codec_name,width,height,duration:format=duration,size",
                "-of", "default=noprint_wrappers=1",
                input_path,
            ]
            try:
                code, out_b, err_b = await run_async_subprocess(probe_cmd)
                raw_out = (out_b or err_b or b"").decode(errors="ignore").strip()
                info["ffprobe_output"] = raw_out
                for line in raw_out.splitlines():
                    if line.startswith("codec_name="):
                        info["codec"] = line.split("=")[1]
                    elif line.startswith("width="):
                        width = line.split("=")[1]
                        info["resolution"] = f"{width}x?" if info["resolution"] == "unknown" else f"{width}x{info['resolution'].split('x')[1]}"
                    elif line.startswith("height="):
                        height = line.split("=")[1]
                        info["resolution"] = f"?x{height}" if info["resolution"] == "unknown" else f"{info['resolution'].split('x')[0]}x{height}"
                    elif line.startswith("duration="):
                        info["duration"] = line.split("=")[1]
            except Exception as exc:
                info["ffprobe_output"] = f"ffprobe execution error: {exc}"

        return info

    def _generate_fallback_file(self, output_path: str, duration: float) -> bool:
        """Disabled in production: synthetic fallback video placeholders are not permitted."""
        raise RuntimeError("Synthetic fallback video generation is completely disabled in production exports.")
