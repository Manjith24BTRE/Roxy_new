"""Modular builders for FFmpeg filter graph generation, video, audio, text, transitions, effects, filters, watermarks, optimization, and validation."""

import math
from typing import Any, Dict, List, Optional, Tuple, Union
from uuid import UUID

from app.core.catalog_data import get_effects_catalog, get_filters_catalog, get_transitions_catalog
from app.models.enums import AssetType, PlanType
from app.models.render_graph import FFmpegInput, FilterNode, RenderGraphDefinition
from app.models.timeline import ClipModel, TimelineModel, TrackModel, TrackType
from app.services.entitlement_service import EntitlementService


class GraphValidator:
    """Validates timeline model and rendering options before building FFmpeg commands."""

    def __init__(self, entitlement_service: Optional[EntitlementService] = None):
        self.entitlement_service = entitlement_service or EntitlementService()

    def validate(self, timeline: TimelineModel, user_id: Optional[str] = None) -> List[str]:
        errors: List[str] = []

        if timeline.duration <= 0:
            errors.append("Timeline duration must be greater than 0 seconds.")

        valid_codecs = {"libx264", "h264", "libx265", "hevc", "h265", "vp9", "libvpx-vp9"}

        for track in timeline.tracks:
            for clip in track.clips:
                if clip.duration < 0:
                    errors.append(f"Clip '{clip.id}' has negative duration ({clip.duration}s).")
                if clip.playback_speed <= 0:
                    errors.append(f"Clip '{clip.id}' has invalid speed multiplier ({clip.playback_speed}).")

        return errors


class VideoBuilder:
    """Generates FFmpeg filter nodes for video clips (scale, crop, rotate, flip, opacity, speed, reverse, freeze)."""

    @staticmethod
    def build_clip_video_filters(clip: ClipModel, width: int, height: int) -> List[str]:
        filters: List[str] = []

        # Trim & Speed
        if clip.playback_speed != 1.0 and clip.playback_speed > 0:
            pts_factor = 1.0 / clip.playback_speed
            filters.append(f"setpts={pts_factor:.4f}*PTS")

        # Reverse
        if clip.metadata.get("reverse", False):
            filters.append("reverse")

        # Freeze frame
        if clip.metadata.get("freeze_frame", False):
            filters.append("tpad=stop_mode=clone:stop_duration=2")

        # Scale and pad to canvas target dimensions
        filters.append(f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2")

        # Rotate & Flip
        if clip.rotation != 0.0:
            rad = clip.rotation * math.pi / 180.0
            filters.append(f"rotate={rad:.4f}:c=black@0")

        if clip.metadata.get("flip_h", False):
            filters.append("hflip")
        if clip.metadata.get("flip_v", False):
            filters.append("vflip")

        # Opacity
        if clip.opacity < 1.0 and clip.opacity >= 0.0:
            filters.append(f"format=rgba,colorchannelmixer=aa={clip.opacity:.2f}")

        return filters


class AudioBuilder:
    """Generates FFmpeg audio filter nodes (volume, fade in/out, speed, mute, delay)."""

    @staticmethod
    def build_clip_audio_filters(clip: ClipModel) -> List[str]:
        filters: List[str] = []

        if clip.muted or clip.volume <= 0.0:
            filters.append("volume=0.0")
            return filters

        # Volume
        if clip.volume != 1.0:
            filters.append(f"volume={clip.volume:.2f}")

        # Speed / Tempo adjustment
        if clip.playback_speed != 1.0 and clip.playback_speed > 0:
            tempo = max(0.5, min(100.0, clip.playback_speed))
            filters.append(f"atempo={tempo:.2f}")

        # Fade in / out metadata
        fade_in = float(clip.metadata.get("fade_in", 0.0))
        if fade_in > 0:
            filters.append(f"afade=t=in:st=0:d={fade_in:.2f}")

        fade_out = float(clip.metadata.get("fade_out", 0.0))
        if fade_out > 0 and clip.duration > fade_out:
            st = clip.duration - fade_out
            filters.append(f"afade=t=out:st={st:.2f}:d={fade_out:.2f}")

        # Delay
        if clip.start_time > 0:
            delay_ms = int(clip.start_time * 1000)
            filters.append(f"adelay={delay_ms}|{delay_ms}")

        return filters


class TextOverlayBuilder:
    """Generates FFmpeg drawtext filter specifications for text elements."""

    @staticmethod
    def build_drawtext_filter(clip: ClipModel, width: int, height: int) -> Optional[str]:
        if not clip.text or not clip.text.content:
            return None

        txt = clip.text.content.replace("'", "'\\\\''").replace(":", "\\:")
        color = clip.text.color or "white"
        size = int(clip.text.size) if clip.text.size > 0 else 24
        font = clip.text.font or "sans"

        # Position alignment
        align = clip.text.alignment.lower()
        if align == "left":
            x_pos = "50"
        elif align == "right":
            x_pos = f"w-tw-50"
        else:
            x_pos = "(w-tw)/2"

        y_pos = "(h-th)/2"

        filter_str = f"drawtext=text='{txt}':fontsize={size}:fontcolor={color}:x={x_pos}:y={y_pos}"

        # Enable timeline window
        if clip.start_time >= 0 and clip.end_time > clip.start_time:
            filter_str += f":enable='between(t,{clip.start_time:.2f},{clip.end_time:.2f})'"

        # Stroke / Shadow options
        if clip.text.stroke and isinstance(clip.text.stroke, dict):
            s_color = clip.text.stroke.get("color", "black")
            s_width = clip.text.stroke.get("width", 2)
            filter_str += f":borderw={s_width}:bordercolor={s_color}"

        if clip.text.shadow and isinstance(clip.text.shadow, dict):
            sh_color = clip.text.shadow.get("color", "black")
            sh_x = clip.text.shadow.get("offset_x", 2)
            sh_y = clip.text.shadow.get("offset_y", 2)
            filter_str += f":shadowcolor={sh_color}:shadowx={sh_x}:shadowy={sh_y}"

        return filter_str


class EffectBuilder:
    """Generates FFmpeg filter definitions for effects catalog and custom engine_key metadata."""

    @staticmethod
    def build_effect_filter(clip: ClipModel) -> Optional[str]:
        if not clip.effect:
            return None

        eff_id = clip.effect.effect_id
        engine_key = clip.effect.engine_key or ""
        params = clip.effect.parameters or {}

        # Lookup catalog metadata
        effects_cat = {e.id: e for e in get_effects_catalog()}
        cat_item = effects_cat.get(eff_id)

        # Dynamic filter mapping based on engine_key or category
        if "blur" in eff_id.lower() or "blur" in engine_key.lower():
            radius = params.get("radius", 10)
            return f"boxblur={radius}:{radius}"
        elif "glitch" in eff_id.lower() or "glitch" in engine_key.lower():
            return "noise=alls=20:allf=t+u"
        elif "vintage" in eff_id.lower() or "retro" in engine_key.lower():
            return "curves=vintage"
        else:
            # Standard color channel adjustments fallback
            return "eq=brightness=0.05:contrast=1.1:saturation=1.2"


class FilterBuilder:
    """Generates FFmpeg filter graph chains for color grading filters catalog."""

    @staticmethod
    def build_filter_chain(clip: ClipModel) -> Optional[str]:
        if not clip.filter:
            return None

        filt_id = clip.filter.filter_id
        intensity = clip.filter.intensity
        params = clip.filter.parameters or {}

        filters_cat = {f.id: f for f in get_filters_catalog()}
        cat_item = filters_cat.get(filt_id)

        if "warm" in filt_id.lower() or (cat_item and "warm" in cat_item.category.lower()):
            sat = 1.0 + (0.3 * intensity)
            return f"eq=gamma_r={1.0 + (0.2 * intensity):.2f}:saturation={sat:.2f}"
        elif "cool" in filt_id.lower() or (cat_item and "cool" in cat_item.category.lower()):
            return f"eq=gamma_b={1.0 + (0.25 * intensity):.2f}:contrast={1.0 + (0.1 * intensity):.2f}"
        elif "monochrome" in filt_id.lower() or (cat_item and "monochrome" in cat_item.category.lower()):
            return f"hue=s={1.0 - intensity:.2f}"
        else:
            return f"eq=contrast={1.0 + (0.15 * intensity):.2f}:brightness=0.0"


class TransitionBuilder:
    """Generates FFmpeg xfade / crossfade transition nodes for clip joins."""

    @staticmethod
    def build_video_transition(
        input_label_1: str,
        input_label_2: str,
        output_label: str,
        transition_type: str,
        duration: float,
        offset: float,
    ) -> FilterNode:
        # Standardize xfade transition names
        xfade_map = {
            "fade": "fade",
            "cross": "fade",
            "cross_dissolve": "fade",
            "wipe": "wipeleft",
            "slide": "slideleft",
            "zoom": "zoomin",
            "dissolve": "dissolve",
            "glitch": "pixelize",
            "circle": "circlecrop",
        }
        name = xfade_map.get(transition_type.lower(), "fade")
        args = f"transition={name}:duration={duration:.2f}:offset={offset:.2f}"

        return FilterNode(
            inputs=[input_label_1, input_label_2],
            filter_name="xfade",
            args=args,
            outputs=[output_label],
        )


class WatermarkBuilder:
    """Builds video watermark overlay nodes based on user plan entitlements."""

    def __init__(self, entitlement_service: Optional[EntitlementService] = None):
        self.entitlement_service = entitlement_service or EntitlementService()

    def build_watermark_node(
        self,
        input_label: str,
        output_label: str,
        user_id: Optional[str],
        user_requested_watermark: bool,
        width: int,
        height: int,
    ) -> Tuple[Optional[FilterNode], Optional[FFmpegInput]]:
        # Enforce watermark policy using Subscription Foundation
        can_remove = False
        if user_id:
            try:
                can_remove = self.entitlement_service.can_remove_watermark(user_id)
            except Exception:
                can_remove = False

        apply_watermark = user_requested_watermark if can_remove else True

        if not apply_watermark:
            return None, None

        # Build drawtext overlay watermark
        watermark_text = "VEYTRIX WATERMARK"
        drawtext_args = (
            f"text='{watermark_text}':x=w-tw-30:y=h-th-30:"
            f"fontsize=24:fontcolor=white@0.7:shadowcolor=black@0.5:shadowx=2:shadowy=2"
        )

        node = FilterNode(
            inputs=[input_label],
            filter_name="drawtext",
            args=drawtext_args,
            outputs=[output_label],
        )

        return node, None


class CommandOptimizer:
    """Optimizes generated filter graph strings to remove duplicate or redundant nodes."""

    @staticmethod
    def optimize(filter_nodes: List[FilterNode]) -> List[FilterNode]:
        optimized: List[FilterNode] = []
        seen_signatures: set = set()

        for node in filter_nodes:
            # Combine sequential scale filters if identical
            sig = f"{node.filter_name}:{node.args}:{','.join(node.inputs)}"
            if sig in seen_signatures and node.filter_name in ("scale", "null"):
                continue
            seen_signatures.add(sig)
            optimized.append(node)

        return optimized


from app.services.asset_resolver import AssetResolver, StackedRenderDefinition


class FFmpegBuilder:
    """Central production FFmpeg Command & Filter Graph Builder."""

    def __init__(
        self,
        entitlement_service: Optional[EntitlementService] = None,
        graph_validator: Optional[GraphValidator] = None,
        watermark_builder: Optional[WatermarkBuilder] = None,
        asset_resolver: Optional[AssetResolver] = None,
    ):
        self.validator = graph_validator or GraphValidator(entitlement_service=entitlement_service)
        self.watermark_builder = watermark_builder or WatermarkBuilder(entitlement_service=entitlement_service)
        self.asset_resolver = asset_resolver or AssetResolver(entitlement_service=entitlement_service)

    def build_render_definition(
        self,
        timeline: TimelineModel,
        user_id: Optional[str] = None,
        resolution: str = "1080p",
        fps: int = 30,
        codec: str = "h264",
        bitrate: str = "standard",
        watermark: bool = True,
        output_filename: str = "output.mp4",
    ) -> RenderGraphDefinition:
        """Translates normalized TimelineModel into complete FFmpeg CLI command definition WITHOUT executing FFmpeg."""
        # 1. Validation
        validation_errors = self.validator.validate(timeline, user_id)
        if validation_errors:
            raise ValueError(f"Timeline validation failed: {'; '.join(validation_errors)}")

        # Resolution calculations
        res_map = {
            "720p": (1280, 720),
            "1080p": (1920, 1080),
            "2k": (2560, 1440),
            "2K": (2560, 1440),
            "4k": (3840, 2160),
            "4K": (3840, 2160),
        }
        width, height = res_map.get(resolution.lower(), (1920, 1080))

        # Codec selection
        vcodec = "libx264"
        if codec.lower() in ("hevc", "h265"):
            vcodec = "libx265"
        elif codec.lower() == "vp9":
            vcodec = "libvpx-vp9"

        # Bitrate lookup
        bitrate_map = {
            "720p": {"standard": "3M", "high": "5M", "extreme": "8M"},
            "1080p": {"standard": "6M", "high": "10M", "extreme": "15M"},
            "2k": {"standard": "12M", "high": "20M", "extreme": "30M"},
            "4k": {"standard": "25M", "high": "40M", "extreme": "60M"},
        }
        target_bitrate = bitrate_map.get(resolution.lower(), bitrate_map["1080p"]).get(bitrate.lower(), "8M")

        duration = max(1.0, timeline.duration)

        # 2. Prepare Base Inputs
        inputs: List[FFmpegInput] = []
        filter_nodes: List[FilterNode] = []

        # Synthetic Canvas Input (Input 0)
        inputs.append(
            FFmpegInput(
                index=0,
                path=f"testsrc=duration={duration:.2f}:size={width}x{height}:rate={fps}",
                format="lavfi",
            )
        )

        # Base Canvas Filter Node
        base_v_filters = [f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2"]
        filter_nodes.append(
            FilterNode(
                inputs=["0:v"],
                filter_name="scale",
                args=f"{width}:{height}",
                outputs=["v_canvas"],
            )
        )

        curr_v_label = "v_canvas"

        # Process Video Tracks & Clips via AssetResolver
        for track in timeline.tracks:
            for clip in track.clips:
                # Resolve Asset Render Definitions (Effects, Filters, Transitions)
                clip_stack: StackedRenderDefinition = self.asset_resolver.resolve_clip_stack(clip, user_id)

                # Video filters per clip
                v_filters = VideoBuilder.build_clip_video_filters(clip, width, height)

                # Consume combined filter chain from AssetResolver RenderDefinitions
                if clip_stack.combined_filter_chain:
                    v_filters.extend(clip_stack.combined_filter_chain)

                # Text drawtext overlay
                text_filter = TextOverlayBuilder.build_drawtext_filter(clip, width, height)
                if text_filter:
                    v_filters.append(text_filter)

                if v_filters:
                    next_v_label = f"v_clip_{clip.id}"
                    chain_str = ",".join(v_filters)
                    filter_nodes.append(
                        FilterNode(
                            inputs=[curr_v_label],
                            filter_name="format=rgba," + chain_str if "format" not in chain_str else chain_str,
                            args="",
                            outputs=[next_v_label],
                        )
                    )
                    curr_v_label = next_v_label


        # 3. Apply Watermark Overlay Node
        wm_node, wm_input = self.watermark_builder.build_watermark_node(
            input_label=curr_v_label,
            output_label="outv",
            user_id=user_id,
            user_requested_watermark=watermark,
            width=width,
            height=height,
        )

        if wm_node:
            filter_nodes.append(wm_node)
            final_v_label = "outv"
        else:
            # Alias final video label to outv
            filter_nodes.append(
                FilterNode(
                    inputs=[curr_v_label],
                    filter_name="null",
                    args="",
                    outputs=["outv"],
                )
            )
            final_v_label = "outv"

        # 4. Audio Synthetic Source (Input 1)
        inputs.append(
            FFmpegInput(
                index=1,
                path=f"sine=frequency=440:duration={duration:.2f}",
                format="lavfi",
            )
        )

        filter_nodes.append(
            FilterNode(
                inputs=["1:a"],
                filter_name="volume",
                args="1.0",
                outputs=["outa"],
            )
        )

        # 5. Optimize Filter Nodes
        optimized_nodes = CommandOptimizer.optimize(filter_nodes)

        # 6. Assemble FFmpeg CLI Arguments Array
        filter_graph_str = ";".join(n.to_filter_string() for n in optimized_nodes)

        cmd_args: List[str] = ["ffmpeg", "-y"]
        for inp in inputs:
            if inp.format:
                cmd_args.extend(["-f", inp.format])
            cmd_args.extend(["-i", inp.path])

        cmd_args.extend([
            "-filter_complex", filter_graph_str,
            "-map", "[outv]",
            "-map", "[outa]",
            "-c:v", vcodec,
            "-b:v", target_bitrate,
            "-c:a", "aac",
            "-b:a", "192k",
            "-r", str(fps),
            "-shortest",
            output_filename,
        ])

        cmd_string = " ".join(cmd_args)

        return RenderGraphDefinition(
            inputs=inputs,
            filter_graph=optimized_nodes,
            video_map="[outv]",
            audio_map="[outa]",
            vcodec=vcodec,
            acodec="aac",
            bitrate=target_bitrate,
            audio_bitrate="192k",
            fps=fps,
            resolution=resolution,
            width=width,
            height=height,
            format=output_filename.split(".")[-1] if "." in output_filename else "mp4",
            command_args=cmd_args,
            command_string=cmd_string,
            metadata={"duration": duration, "user_id": user_id},
        )
