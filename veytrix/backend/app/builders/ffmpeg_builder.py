"""Modular builders for FFmpeg filter graph generation, video, audio, text, transitions, effects, filters, watermarks, optimization, and validation."""

import math
from typing import Any, Dict, List, Optional, Tuple, Union
from uuid import UUID

from app.core.catalog_data import get_effects_catalog, get_filters_catalog, get_transitions_catalog
from app.models.enums import AssetType, PlanType
from app.models.render_graph import FFmpegInput, FilterNode, RenderGraphDefinition
from app.models.timeline import ClipModel, EffectData, FilterData, TimelineModel, TrackModel, TrackType, TransitionData
from app.services.entitlement_service import EntitlementService
from app.core.config import settings
from pathlib import Path

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
    """Generates FFmpeg filter nodes for video clips (scale, crop, rotate, flip, opacity, speed, reverse, freeze, keyframes, position)."""

    @staticmethod
    def build_clip_video_filters(clip: ClipModel, width: int, height: int, aspect_ratio: str = "16:9") -> List[str]:
        filters: List[str] = []

        # Ignore disabled clips
        if not clip.enabled or clip.hidden:
            return filters

        # Trim
        trim_start = max(0.0, clip.trim_start)
        trim_end = max(0.0, clip.trim_end)
        if trim_end > trim_start:
            filters.append(f"trim=start={trim_start:.4f}:end={trim_end:.4f}")
        elif clip.duration > 0:
            filters.append(f"trim=start={trim_start:.4f}:duration={clip.duration:.4f}")

        # Reverse
        if clip.metadata.get("reverse", False) or clip.metadata.get("is_reversed", False):
            filters.append("reverse")

        # PTS Shift & Speed Factor
        pts_expr = "PTS-STARTPTS"
        if clip.playback_speed != 1.0 and clip.playback_speed > 0:
            pts_factor = 1.0 / clip.playback_speed
            pts_expr = f"{pts_factor:.4f}*(PTS-STARTPTS)"
        
        if clip.start_time > 0:
            pts_expr = f"{pts_expr}+{clip.start_time:.4f}/TB"
            
        filters.append(f"setpts={pts_expr}")

        # Freeze frame
        freeze_val = clip.metadata.get("freeze_duration") or clip.metadata.get("freeze_frame_duration") or 0.0
        freeze_duration = float(freeze_val)
        if clip.metadata.get("freeze_frame", False) or freeze_duration > 0:
            dur = freeze_duration if freeze_duration > 0 else 2.0
            filters.append(f"tpad=stop_mode=clone:stop_duration={dur:.2f}")

        # Crop / Sizing mode & Scale
        sizing_val = clip.metadata.get("sizing_mode") or clip.metadata.get("fit") or "fit"
        sizing_mode = str(sizing_val).lower()
        if sizing_mode == "crop" or sizing_mode == "cover":
            filters.append(f"scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height}")
        else:
            filters.append(f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2")

        # Rotate & Flip
        if clip.rotation != 0.0:
            rad = clip.rotation * math.pi / 180.0
            filters.append(f"rotate={rad:.4f}:c=black@0")

        if clip.metadata.get("flip_h", False) or clip.metadata.get("hflip", False):
            filters.append("hflip")
        if clip.metadata.get("flip_v", False) or clip.metadata.get("vflip", False):
            filters.append("vflip")

        # Keyframes Animation Interpolation for Opacity / Scale / Position
        keyframes = clip.metadata.get("keyframes", [])
        if keyframes and isinstance(keyframes, list):
            # Parse dynamic animated keyframe expressions if present
            op_exprs = []
            for kf in keyframes:
                t = float(kf.get("time", 0.0))
                op = float(kf.get("opacity", clip.opacity))
                op_exprs.append(f"if(gte(t,{t:.2f}),{op:.2f}")
            if op_exprs:
                expr = ",".join(op_exprs) + f",{clip.opacity:.2f}" + (")" * len(op_exprs))
                filters.append(f"format=rgba,colorchannelmixer=aa='{expr}'")
        # Opacity
        if clip.opacity < 1.0 and clip.opacity >= 0.0:
            filters.append(f"format=rgba,colorchannelmixer=aa={clip.opacity:.2f}")

        # Video Fade In / Fade Out
        fade_in_val = clip.metadata.get("fade_in") or clip.metadata.get("fadeIn") or clip.metadata.get("fade_in_duration") or 0.0
        fade_in = float(fade_in_val)
        if fade_in > 0:
            filters.append(f"fade=t=in:st=0:d={fade_in:.2f}")

        fade_out_val = clip.metadata.get("fade_out") or clip.metadata.get("fadeOut") or clip.metadata.get("fade_out_duration") or 0.0
        fade_out = float(fade_out_val)
        if fade_out > 0 and clip.duration > fade_out:
            st = max(0.0, clip.duration - fade_out)
            filters.append(f"fade=t=out:st={st:.2f}:d={fade_out:.2f}")

        return filters


class AudioBuilder:
    """Generates FFmpeg audio filter nodes (volume, fade in/out, speed, mute, delay, balance, gain, normalization)."""

    @staticmethod
    def build_clip_audio_filters(clip: ClipModel) -> List[str]:
        filters: List[str] = []

        if not clip.enabled or clip.muted or clip.volume <= 0.0 or clip.metadata.get("mute", False):
            filters.append("volume=0.0")
            return filters

        # Trim
        trim_start = max(0.0, clip.trim_start)
        trim_end = max(0.0, clip.trim_end)
        if trim_end > trim_start:
            filters.append(f"atrim=start={trim_start:.4f}:end={trim_end:.4f}")
        elif clip.duration > 0:
            filters.append(f"atrim=start={trim_start:.4f}:duration={clip.duration:.4f}")

        # Reverse audio
        if clip.metadata.get("reverse", False) or clip.metadata.get("is_reversed", False):
            filters.append("areverse")

        # Speed / Tempo adjustment & PTS
        if clip.playback_speed != 1.0 and clip.playback_speed > 0:
            tempo = max(0.5, min(100.0, clip.playback_speed))
            filters.append("asetpts=PTS-STARTPTS")
            # Chain atempo if speed > 2.0 or < 0.5
            curr_tempo = tempo
            while curr_tempo > 2.0:
                filters.append("atempo=2.0")
                curr_tempo /= 2.0
            while curr_tempo < 0.5:
                filters.append("atempo=0.5")
                curr_tempo /= 0.5
            filters.append(f"atempo={curr_tempo:.2f}")
        else:
            filters.append("asetpts=PTS-STARTPTS")

        # Gain / Volume
        gain_val = clip.metadata.get("gain_db") or clip.metadata.get("gain") or 0.0
        gain_db = float(gain_val)
        effective_vol = clip.volume
        if gain_db != 0.0:
            effective_vol *= (10 ** (gain_db / 20.0))
        
        if effective_vol != 1.0:
            filters.append(f"volume={effective_vol:.2f}")

        # Stereo Balance / Pan
        pan_val = clip.metadata.get("balance") or clip.metadata.get("pan") or 0.0
        pan_bal = float(pan_val)
        if pan_bal != 0.0:
            left_vol = max(0.0, min(1.0, 1.0 - pan_bal))
            right_vol = max(0.0, min(1.0, 1.0 + pan_bal))
            filters.append(f"pan=stereo|c0={left_vol:.2f}*c0|c1={right_vol:.2f}*c1")

        # Audio Normalization
        if clip.metadata.get("normalize", False) or clip.metadata.get("loudnorm", False):
            filters.append("loudnorm=I=-16:TP=-1.5:LRA=11")

        # Fade in / out metadata
        fade_in_val = clip.metadata.get("fade_in") or clip.metadata.get("fadeIn") or 0.0
        fade_in = float(fade_in_val)
        if fade_in > 0:
            filters.append(f"afade=t=in:st=0:d={fade_in:.2f}")

        fade_out_val = clip.metadata.get("fade_out") or clip.metadata.get("fadeOut") or 0.0
        fade_out = float(fade_out_val)
        if fade_out > 0 and clip.duration > fade_out:
            st = max(0.0, clip.duration - fade_out)
            filters.append(f"afade=t=out:st={st:.2f}:d={fade_out:.2f}")

        # Delay offset on timeline
        if clip.start_time > 0:
            delay_ms = int(clip.start_time * 1000)
            filters.append(f"adelay={delay_ms}|{delay_ms}")

        return filters


class TextOverlayBuilder:
    """Generates FFmpeg drawtext filter specifications for text elements and burned captions."""

    @staticmethod
    def build_drawtext_filter(clip: ClipModel, width: int, height: int) -> Optional[str]:
        if not clip.text or not clip.text.content:
            # Check captions in metadata if clip text is empty
            captions = clip.metadata.get("captions")
            if not captions:
                return None
            txt = str(captions).replace("'", "'\\\\''").replace(":", "\\:")
            color = "white"
            size = 28
            font = "sans"
            align = "center"
        else:
            txt = clip.text.content.replace("'", "'\\\\''").replace(":", "\\:")
            color = clip.text.color or "white"
            size = int(clip.text.size) if clip.text.size > 0 else 24
            font = clip.text.font or "sans"
            align = clip.text.alignment.lower()

        if color.startswith("#"):
            color = "0x" + color[1:]

        # Position alignment
        pos_x = clip.position.get("x", 0.0) if isinstance(clip.position, dict) else 0.0
        pos_y = clip.position.get("y", 0.0) if isinstance(clip.position, dict) else 0.0

        if align == "left":
            x_pos = f"50+{pos_x:.1f}"
        elif align == "right":
            x_pos = f"w-tw-50+{pos_x:.1f}"
        else:
            x_pos = f"(w-tw)/2+{pos_x:.1f}"

        y_pos = f"(h-th)/2+{pos_y:.1f}"

        filter_str = f"drawtext=text='{txt}':fontsize={size}:fontcolor={color}:x={x_pos}:y={y_pos}"

        # Enable timeline window
        if clip.start_time >= 0 and clip.end_time > clip.start_time:
            filter_str += f":enable='between(t,{clip.start_time:.2f},{clip.end_time:.2f})'"

        # Stroke / Shadow options
        if clip.text and clip.text.stroke and isinstance(clip.text.stroke, dict):
            s_color = clip.text.stroke.get("color", "black")
            if s_color.startswith("#"):
                s_color = "0x" + s_color[1:]
            s_width = clip.text.stroke.get("width", 2)
            filter_str += f":borderw={s_width}:bordercolor={s_color}"

        if clip.text and clip.text.shadow and isinstance(clip.text.shadow, dict):
            sh_color = clip.text.shadow.get("color", "black")
            if sh_color.startswith("#"):
                sh_color = "0x" + sh_color[1:]
            sh_x = clip.text.shadow.get("offset_x", 2)
            sh_y = clip.text.shadow.get("offset_y", 2)
            filter_str += f":shadowcolor={sh_color}:shadowx={sh_x}:shadowy={sh_y}"

        return filter_str


class KeyframeExpressionBuilder:
    """Generates dynamic FFmpeg evaluation expressions for animated clip and filter properties."""

    @staticmethod
    def build_piecewise_expression(keyframes: List[Dict[str, Any]], default_val: float, val_transform=None) -> str:
        """Converts keyframe points into nested FFmpeg if(gte(t,T), VAL, ...) expressions."""
        if not keyframes:
            v = val_transform(default_val) if val_transform else default_val
            return f"{v:.4f}"

        # Sort keyframes by time
        sorted_kfs = sorted(keyframes, key=lambda k: float(k.get("time", 0.0)))
        if len(sorted_kfs) == 1:
            val = float(sorted_kfs[0].get("value", default_val))
            v = val_transform(val) if val_transform else val
            return f"{v:.4f}"

        # Build recursive piecewise linear string from last keyframe backward
        expr = ""
        for i in range(len(sorted_kfs) - 1, 0, -1):
            kf_prev = sorted_kfs[i - 1]
            kf_curr = sorted_kfs[i]
            t0 = float(kf_prev.get("time", 0.0))
            t1 = float(kf_curr.get("time", 1.0))
            v0 = float(kf_prev.get("value", default_val))
            v1 = float(kf_curr.get("value", default_val))

            if val_transform:
                v0 = val_transform(v0)
                v1 = val_transform(v1)

            dt = max(0.001, t1 - t0)
            slope = (v1 - v0) / dt

            segment_expr = f"({v0:.4f}+{slope:.4f}*(t-{t0:.4f}))"
            if not expr:
                expr = f"if(gte(t,{t1:.4f}),{v1:.4f},{segment_expr})"
            else:
                expr = f"if(gte(t,{t1:.4f}),{v1:.4f},if(gte(t,{t0:.4f}),{segment_expr},{expr}))"

        return expr


class EffectBuilder:
    """Generates FFmpeg filter definitions for effects catalog and custom engine_key metadata."""

    @staticmethod
    def build_single_effect_filter(eff: EffectData, clip: ClipModel) -> Optional[str]:
        eff_id = eff.effect_id
        engine_key = eff.engine_key or ""
        params = eff.parameters or {}
        intensity = eff.intensity
        opacity = eff.opacity
        blend_mode = eff.blend_mode.lower()

        eff_lower = eff_id.lower()
        key_lower = engine_key.lower()

        filter_str = None

        # Comprehensive filter mapping for all editor effects
        if "fade_out" in eff_lower or "fadeout" in eff_lower or "fade-out" in eff_lower or (eff_lower == "fade" and (params.get("type") == "out" or params.get("direction") == "out")):
            dur = float(params.get("duration") or params.get("fadeOut") or params.get("fade_out") or params.get("fade") or 1.0)
            if dur > 10.0:
                dur = min(2.0, (dur / 100.0) * clip.duration) if clip.duration > 0 else 1.0
            st = max(0.0, clip.duration - dur)
            filter_str = f"fade=t=out:st={st:.2f}:d={dur:.2f}"
        elif "fade" in eff_lower or "fade" in key_lower:
            dur = float(params.get("duration") or params.get("fadeIn") or params.get("fade_in") or params.get("fade") or 1.0)
            if dur > 10.0:
                dur = min(2.0, (dur / 100.0) * clip.duration) if clip.duration > 0 else 1.0
            filter_str = f"fade=t=in:st=0:d={dur:.2f}"
        elif "blur" in eff_lower or "blur" in key_lower:
            radius = int(params.get("radius", 10) * intensity)
            radius = max(1, radius)
            filter_str = f"boxblur={radius}:{radius}"
        elif "glitch" in eff_lower or "glitch" in key_lower:
            noise_val = int(25 * intensity)
            filter_str = f"noise=alls={noise_val}:allf=t+u,chromashift=cx=4:cy=2"
        elif "vintage" in eff_lower or "retro" in key_lower:
            sat = 1.0 + (0.2 * intensity)
            filter_str = f"curves=vintage,eq=saturation={sat:.2f}"
        elif "zoom" in eff_lower or "camera" in key_lower:
            sc = 1.0 + (0.1 * intensity)
            filter_str = f"scale=iw*{sc:.2f}:ih*{sc:.2f}"
        elif "shake" in eff_lower:
            filter_str = "crop=iw-20:ih-20:10:10,scale=iw+20:ih+20"
        elif "glow" in eff_lower or "light" in key_lower:
            br = 0.08 * intensity
            cont = 1.0 + (0.15 * intensity)
            filter_str = f"eq=brightness={br:.2f}:contrast={cont:.2f}"
        elif "3d" in eff_lower or "perspective" in key_lower:
            filter_str = "perspective=x0=0:y0=0:x1=w:y1=0:x2=0:y2=h:x3=w:y3=h:sense=destination"
        else:
            filter_str = f"eq=brightness={0.05 * intensity:.2f}:contrast={1.0 + (0.1 * intensity):.2f}:saturation={1.0 + (0.2 * intensity):.2f}"

        if opacity < 1.0 and filter_str:
            filter_str += f",colorchannelmixer=aa={opacity:.2f}"

        return filter_str

    @staticmethod
    def build_effect_filters(clip: ClipModel) -> List[str]:
        filters: List[str] = []
        effects = clip.applied_effects or ([clip.effect] if clip.effect else [])
        for eff in effects:
            if not eff:
                continue
            f = EffectBuilder.build_single_effect_filter(eff, clip)
            if f:
                filters.append(f)
        return filters

    @staticmethod
    def build_effect_filter(clip: ClipModel) -> Optional[str]:
        filters = EffectBuilder.build_effect_filters(clip)
        return ",".join(filters) if filters else None


class FilterBuilder:
    """Generates FFmpeg filter graph chains for color grading filters catalog."""

    @staticmethod
    def build_single_filter_chain(filt: FilterData, clip: ClipModel) -> Optional[str]:
        filt_id = filt.filter_id
        intensity = filt.intensity
        opacity = filt.opacity
        params = filt.parameters or {}

        filters_cat = {f.id: f for f in get_filters_catalog()}
        cat_item = filters_cat.get(filt_id)

        filt_lower = filt_id.lower()
        cat_str = cat_item.category.lower() if cat_item else ""

        filter_str = None

        if "warm" in filt_lower or "warm" in cat_str or "sepia" in filt_lower:
            sat = 1.0 + (0.3 * intensity)
            filter_str = f"eq=gamma_r={1.0 + (0.2 * intensity):.2f}:saturation={sat:.2f}"
        elif "cool" in filt_lower or "cool" in cat_str:
            filter_str = f"eq=gamma_b={1.0 + (0.25 * intensity):.2f}:contrast={1.0 + (0.1 * intensity):.2f}"
        elif "monochrome" in filt_lower or "bw" in filt_lower or "black" in filt_lower or "monochrome" in cat_str:
            filter_str = f"hue=s={1.0 - intensity:.2f}"
        elif "sharpen" in filt_lower:
            filter_str = f"unsharp=5:5:{1.0 * intensity:.2f}:5:5:0.0"
        elif "vignette" in filt_lower:
            filter_str = f"vignette=PI/{max(2.0, 4.0 - intensity):.2f}"
        elif "grain" in filt_lower or "noise" in filt_lower:
            filter_str = f"noise=alls={int(20 * intensity)}:allf=t+u"
        else:
            filter_str = f"eq=contrast={1.0 + (0.15 * intensity):.2f}:brightness=0.0"

        if opacity < 1.0 and filter_str:
            filter_str += f",colorchannelmixer=aa={opacity:.2f}"

        return filter_str

    @staticmethod
    def build_filter_chains(clip: ClipModel) -> List[str]:
        chains: List[str] = []
        filters = clip.filters or ([clip.filter] if clip.filter else [])
        for filt in filters:
            if not filt:
                continue
            chain = FilterBuilder.build_single_filter_chain(filt, clip)
            if chain:
                chains.append(chain)
        return chains

    @staticmethod
    def build_filter_chain(clip: ClipModel) -> Optional[str]:
        chains = FilterBuilder.build_filter_chains(clip)
        return ",".join(chains) if chains else None


class TransitionBuilder:
    """Generates FFmpeg xfade / crossfade transition nodes for clip joins."""

    @staticmethod
    def resolve_xfade_name(transition_type: str, direction: Optional[str] = "none", category: Optional[str] = None) -> str:
        """Dynamically maps transition presets and directions to native FFmpeg xfade transition names."""
        tt = (transition_type or "").lower().replace("_", "-")
        dir_val = (direction or "none").lower()

        # Direct directional xfade mappings
        dir_wipe_map = {
            "left": "wipeleft",
            "right": "wiperight",
            "up": "wipeup",
            "down": "wipedown",
        }
        dir_slide_map = {
            "left": "slideleft",
            "right": "slideright",
            "up": "slideup",
            "down": "slidedown",
        }
        dir_push_map = {
            "left": "pushleft",
            "right": "pushright",
            "up": "pushup",
            "down": "pushdown",
        }
        dir_zoom_map = {
            "center": "zoomin",
            "in": "zoomin",
            "out": "zoomout",
        }

        # 1. Check exact preset keyword patterns
        if "wipe" in tt:
            return dir_wipe_map.get(dir_val, "wipeleft")
        if "slide" in tt or "push" in tt or "whip" in tt:
            if "push" in tt:
                return dir_push_map.get(dir_val, "pushleft")
            return dir_slide_map.get(dir_val, "slideleft")
        if "zoom" in tt or "scale" in tt:
            return dir_zoom_map.get(dir_val, "zoomin")
        if "spin" in tt or "rotate" in tt:
            return "rotate"
        if "circle" in tt or "radial" in tt:
            return "circlecrop"
        if "rect" in tt or "box" in tt:
            return "rectcrop"
        if "glitch" in tt or "pixel" in tt:
            return "pixelize"
        if "3d" in tt or "cube" in tt:
            return "cube"
        if "dissolve" in tt:
            return "dissolve"
        if "blur" in tt:
            return "fade"

        # 2. Check direction fallback
        if dir_val in dir_wipe_map:
            return dir_wipe_map[dir_val]

        # Default standard fallback
        return "fade"

    @classmethod
    def build_video_transition(
        cls,
        input_label_1: str,
        input_label_2: str,
        output_label: str,
        transition: TransitionData,
        duration: float,
        offset: float,
    ) -> List[FilterNode]:
        """Builds one or more FilterNodes representing high-fidelity transition execution."""
        tt = (transition.transition_type or "fade").lower()
        dir_val = transition.direction or "none"
        cat_val = transition.category or ""
        intensity = transition.intensity if transition.intensity is not None else 50.0
        motion_blur = transition.motion_blur if transition.motion_blur is not None else True

        xfade_name = cls.resolve_xfade_name(tt, dir_val, cat_val)
        nodes: List[FilterNode] = []

        # Complex multi-pass transitions (e.g. Blur or Glitch with motion blur / intensity scaling)
        if "blur" in tt or cat_val.lower() == "blur":
            blur_amount = max(1, int((intensity / 100.0) * 20))
            prep_1 = f"v_trans_prep1_{input_label_1.replace(':', '_')}"
            prep_2 = f"v_trans_prep2_{input_label_2.replace(':', '_')}"
            nodes.append(FilterNode(inputs=[input_label_1], filter_name=f"gblur=sigma={blur_amount}", args="", outputs=[prep_1]))
            nodes.append(FilterNode(inputs=[input_label_2], filter_name=f"gblur=sigma={blur_amount}", args="", outputs=[prep_2]))
            nodes.append(FilterNode(inputs=[prep_1, prep_2], filter_name="xfade", args=f"transition=fade:duration={duration:.2f}:offset={offset:.2f}", outputs=[output_label]))
            return nodes

        if "glitch" in tt or cat_val.lower() == "glitch":
            pix_size = max(4, int((intensity / 100.0) * 32))
            nodes.append(FilterNode(inputs=[input_label_1, input_label_2], filter_name="xfade", args=f"transition=pixelize:duration={duration:.2f}:offset={offset:.2f}", outputs=[output_label]))
            return nodes

        # Standard / Enhanced xfade node pass
        args = f"transition={xfade_name}:duration={duration:.2f}:offset={offset:.2f}"
        nodes.append(FilterNode(
            inputs=[input_label_1, input_label_2],
            filter_name="xfade",
            args=args,
            outputs=[output_label],
        ))
        return nodes


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


import traceback
from app.core.logging import logger


from app.services.ffmpeg_service import FFmpegService


class FFmpegBuilder:
    """Central production FFmpeg Command & Filter Graph Builder."""

    def __init__(
        self,
        entitlement_service: Optional[EntitlementService] = None,
        graph_validator: Optional[GraphValidator] = None,
        watermark_builder: Optional[WatermarkBuilder] = None,
        asset_resolver: Optional[AssetResolver] = None,
        ffmpeg_service: Optional[FFmpegService] = None,
    ):
        self.validator = graph_validator or GraphValidator(entitlement_service=entitlement_service)
        self.watermark_builder = watermark_builder or WatermarkBuilder(entitlement_service=entitlement_service)
        self.asset_resolver = asset_resolver or AssetResolver(entitlement_service=entitlement_service)
        self.ffmpeg_service = ffmpeg_service or FFmpegService()

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
        logger.info(
            f"[FFmpegBuilder.build_render_definition] ENTER - Resolution: {resolution}, FPS: {fps}, Codec: {codec}, Bitrate: {bitrate}, Watermark: {watermark}, Output: '{output_filename}'"
        )
        try:
            res = self._build_render_definition_internal(
                timeline=timeline,
                user_id=user_id,
                resolution=resolution,
                fps=fps,
                codec=codec,
                bitrate=bitrate,
                watermark=watermark,
                output_filename=output_filename,
            )
            logger.info(
                f"[FFmpegBuilder.build_render_definition] EXIT - Output File: {output_filename}, Filter Nodes: {len(res.filter_graph)}, Inputs: {len(res.inputs)}"
            )
            return res
        except Exception as exc:
            logger.error(
                f"[FFmpegBuilder.build_render_definition] EXCEPTION - Type: {type(exc).__name__}, Message: {str(exc)}, User ID: {user_id}\n"
                f"Stack Trace:\n{traceback.format_exc()}"
            )
            raise

    def _build_render_definition_internal(
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
        # 1. Validation
        validation_errors = self.validator.validate(timeline, user_id)
        if validation_errors:
            raise ValueError(f"Timeline validation failed: {'; '.join(validation_errors)}")

        # Calculate canvas dimensions taking into account aspect_ratio
        aspect_ratio = timeline.aspect_ratio or "16:9"
        base_res_map = {
            "720p": (1280, 720),
            "1080p": (1920, 1080),
            "2k": (2560, 1440),
            "2K": (2560, 1440),
            "4k": (3840, 2160),
            "4K": (3840, 2160),
        }
        base_w, base_h = base_res_map.get(resolution.lower(), (1920, 1080))

        if aspect_ratio == "9:16":
            width, height = base_h, base_w
        elif aspect_ratio == "1:1":
            width, height = base_h, base_h
        elif aspect_ratio == "4:5":
            width, height = base_h, int(base_h * 1.25)
        elif aspect_ratio == "21:9":
            width, height = int(base_w * 21 / 16), base_h
        else:
            width, height = base_w, base_h

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

        # 2. Prepare Base Inputs & Clip File Bindings
        inputs: List[FFmpegInput] = []
        filter_nodes: List[FilterNode] = []

        # Find all clips with valid media sources or text/overlay clips
        media_clips: List[Tuple[Optional[int], ClipModel, str]] = []
        local_static_prefix = f"/static/storage/"
        for track in timeline.tracks:
            for clip in track.clips:
                if not clip.enabled or clip.hidden:
                    continue

                clip_src = (
                    clip.media_url
                    or clip.file_path
                    or clip.metadata.get("src")
                    or clip.metadata.get("url")
                    or clip.metadata.get("path")
                )
                if clip_src and not str(clip_src).startswith("blob:"):
                    src_str = str(clip_src)
                    if local_static_prefix in src_str:
                        rel_path = src_str.split(local_static_prefix)[-1]
                        local_abs = (Path(__file__).resolve().parent.parent.parent / "storage" / rel_path).resolve()
                        if local_abs.is_file():
                            src_str = str(local_abs)
                    elif "/storage/v1/object/public/" in src_str:
                        rel_path = src_str.split("/storage/v1/object/public/")[-1]
                        local_abs = (Path(__file__).resolve().parent.parent.parent / "storage" / rel_path).resolve()
                        if local_abs.is_file():
                            src_str = str(local_abs)

                    if "/storage/v1/object/public/" in src_str:
                        parts = src_str.split("/storage/v1/object/public/")
                        domain_part = parts[0]
                        if not domain_part and settings.SUPABASE_URL:
                            domain_part = settings.SUPABASE_URL.rstrip('/')
                        prefix = domain_part + "/storage/v1/object/public/"
                        remainder = parts[1]
                        known_buckets = ["videos", "assets", "images", "audio", "uploads", "exports", "thumbnails"]
                        if not any(remainder.startswith(f"{b}/") for b in known_buckets):
                            b_name = "videos"
                            if clip.asset_type == AssetType.AUDIO:
                                b_name = "audio"
                            elif clip.asset_type == AssetType.IMAGE:
                                b_name = "images"
                            elif str(clip.asset_type).upper() in ("ASSET", "ASSETS"):
                                b_name = "assets"
                            src_str = f"{prefix}{b_name}/{remainder}"
                        else:
                            src_str = f"{prefix}{remainder}"
                    elif (src_str.startswith("/storage/") or src_str.startswith("/")) and not (len(src_str) > 1 and src_str[1] == ":"):
                        if settings.SUPABASE_URL:
                            src_str = f"{settings.SUPABASE_URL.rstrip('/')}{src_str}"
                        else:
                            src_str = f"http://127.0.0.1:8000{src_str}"

                    input_idx = len(inputs)
                    inputs.append(FFmpegInput(index=input_idx, path=src_str))
                    media_clips.append((input_idx, clip, src_str))
                elif clip.text or clip.metadata.get("captions") or track.type == TrackType.TEXT:
                    media_clips.append((None, clip, ""))

        # 2a. Setup Base Canvas
        canvas_idx = len(inputs)
        inputs.append(
            FFmpegInput(
                index=canvas_idx,
                path=f"color=c=black:duration={duration:.2f}:size={width}x{height}:rate={fps}",
                format="lavfi",
            )
        )
        filter_nodes.append(
            FilterNode(
                inputs=[f"{canvas_idx}:v"],
                filter_name="scale",
                args=f"{width}:{height}",
                outputs=["v_canvas"],
            )
        )
        curr_v_label = "v_canvas"

        # Sort tracks by visual layer order
        sorted_tracks = sorted(timeline.tracks, key=lambda t: t.order)

        # Process Video Tracks & Clips via AssetResolver & TransitionBuilder
        for track in sorted_tracks:
            if track.hidden:
                continue

            track_clips = [c for c in track.clips if c.enabled and not c.hidden]
            if not track_clips:
                continue

            # Process individual clips into pre-processed stream nodes
            processed_clip_labels: List[Tuple[ClipModel, str]] = []

            for clip in track_clips:
                clip_entry = next(((idx, c, src) for idx, c, src in media_clips if c.id == clip.id), None)
                if clip_entry is None:
                    continue

                clip_idx, _, _ = clip_entry

                # Resolve Asset Render Definitions (Effects, Filters, Transitions)
                clip_stack: StackedRenderDefinition = self.asset_resolver.resolve_clip_stack(clip, user_id)

                # Video filters per clip
                v_filters = VideoBuilder.build_clip_video_filters(clip, width, height, aspect_ratio=aspect_ratio)

                # Direct Multi-Effect & Multi-Filter Builders
                eff_f = EffectBuilder.build_effect_filter(clip)
                if eff_f:
                    v_filters.append(eff_f)

                filt_f = FilterBuilder.build_filter_chain(clip)
                if filt_f:
                    v_filters.append(filt_f)

                # Consume combined filter chain from AssetResolver RenderDefinitions
                if clip_stack.combined_filter_chain:
                    v_filters.extend(clip_stack.combined_filter_chain)

                # Text drawtext overlay
                text_filter = TextOverlayBuilder.build_drawtext_filter(clip, width, height)
                if text_filter and clip_idx is not None:
                    v_filters.append(text_filter)

                clip_id_clean = clip.id.replace("-", "")
                next_v_label = f"v_clip_processed_{clip_id_clean}"

                if clip_idx is None:
                    drawtext_f = TextOverlayBuilder.build_drawtext_filter(clip, width, height)
                    if drawtext_f:
                        v_filters.append(drawtext_f)
                    if v_filters:
                        chain_str = ",".join(v_filters)
                        comp_label = f"v_comp_{clip_id_clean}"
                        filter_nodes.append(
                            FilterNode(
                                inputs=[curr_v_label],
                                filter_name=chain_str,
                                args="",
                                outputs=[comp_label],
                            )
                        )
                        curr_v_label = comp_label
                    continue

                if v_filters:
                    chain_str = ",".join(v_filters)
                    filter_nodes.append(
                        FilterNode(
                            inputs=[f"{clip_idx}:v"],
                            filter_name="format=rgba," + chain_str if "format" not in chain_str else chain_str,
                            args="",
                            outputs=[next_v_label],
                        )
                    )
                else:
                    filter_nodes.append(
                        FilterNode(
                            inputs=[f"{clip_idx}:v"],
                            filter_name="copy",
                            args="",
                            outputs=[next_v_label],
                        )
                    )

                processed_clip_labels.append((clip, next_v_label))

            # Apply xfade transitions between adjacent clips on the same track if defined
            if len(processed_clip_labels) > 1:
                prev_clip, prev_label = processed_clip_labels[0]
                for idx in range(1, len(processed_clip_labels)):
                    curr_clip, curr_label = processed_clip_labels[idx]

                    trans = prev_clip.transition or curr_clip.transition
                    if trans and trans.duration > 0:
                        trans_dur = min(trans.duration, prev_clip.duration / 2.0, curr_clip.duration / 2.0)
                        trans_dur = max(0.1, trans_dur)
                        offset = max(0.0, prev_clip.end_time - trans_dur)
                        trans_type = trans.transition_type

                        trans_out_label = f"v_trans_{prev_clip.id.replace('-', '')}_{curr_clip.id.replace('-', '')}"
                        trans_nodes = TransitionBuilder.build_video_transition(
                            input_label_1=prev_label,
                            input_label_2=curr_label,
                            output_label=trans_out_label,
                            transition=trans,
                            duration=trans_dur,
                            offset=offset,
                        )
                        filter_nodes.extend(trans_nodes)
                        prev_label = trans_out_label

                    prev_clip = curr_clip

            # Composite processed clip / sequence onto canvas
            for clip, clip_label in processed_clip_labels:
                clip_id_clean = clip.id.replace("-", "")
                comp_label = f"v_comp_{clip_id_clean}"
                pos_x = clip.position.get("x", 0.0) if isinstance(clip.position, dict) else 0.0
                pos_y = clip.position.get("y", 0.0) if isinstance(clip.position, dict) else 0.0
                x_expr = f"(W-w)/2+{pos_x:.1f}"
                y_expr = f"(H-h)/2+{pos_y:.1f}"

                overlay_filter = f"overlay=enable='between(t,{clip.start_time:.4f},{clip.end_time:.4f})':x='{x_expr}':y='{y_expr}'"
                filter_nodes.append(
                    FilterNode(
                        inputs=[curr_v_label, clip_label],
                        filter_name=overlay_filter,
                        args="",
                        outputs=[comp_label],
                    )
                )
                curr_v_label = comp_label

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

        # 4. Audio Inputs or Silent Fallback
        audio_labels = []
        for idx, clip, src_str in media_clips:
            if not clip.enabled or clip.hidden:
                continue
            if clip.asset_type in (AssetType.AUDIO, AssetType.VIDEO) and not clip.muted:
                if clip.asset_type == AssetType.VIDEO:
                    has_audio_attr = clip.metadata.get("has_audio", clip.metadata.get("hasAudio"))
                    if has_audio_attr is False:
                        continue
                    if has_audio_attr is not True and src_str and not self.ffmpeg_service.has_audio_stream(src_str):
                        continue

                a_filters = AudioBuilder.build_clip_audio_filters(clip)
                a_label = f"a_clip_{clip.id.replace('-', '')}"
                filter_nodes.append(
                    FilterNode(
                        inputs=[f"{idx}:a"],
                        filter_name=",".join(a_filters) if a_filters else "anull",
                        args="",
                        outputs=[a_label],
                    )
                )
                audio_labels.append(a_label)

        if not audio_labels:
            audio_idx = len(inputs)
            inputs.append(
                FFmpegInput(
                    index=audio_idx,
                    path=f"anullsrc=channel_layout=stereo:sample_rate=44100:duration={duration:.2f}",
                    format="lavfi",
                )
            )
            filter_nodes.append(
                FilterNode(
                    inputs=[f"{audio_idx}:a"],
                    filter_name="volume",
                    args="1.0",
                    outputs=["outa"],
                )
            )
        else:
            if len(audio_labels) == 1:
                filter_nodes.append(
                    FilterNode(
                        inputs=[audio_labels[0]],
                        filter_name="anull",
                        args="",
                        outputs=["outa"],
                    )
                )
            else:
                filter_nodes.append(
                    FilterNode(
                        inputs=audio_labels,
                        filter_name=f"amix=inputs={len(audio_labels)}:duration=longest",
                        args="",
                        outputs=["outa"],
                    )
                )

        # 5. Optimize Filter Nodes
        optimized_nodes = CommandOptimizer.optimize(filter_nodes)

        # 6. Assemble FFmpeg CLI Arguments Array
        filter_graph_str = ";".join(n.to_filter_string() for n in optimized_nodes)

        ffmpeg_bin = self.ffmpeg_service.get_ffmpeg_binary()
        cmd_args: List[str] = [ffmpeg_bin, "-y"]
        for inp in inputs:
            if inp.format:
                cmd_args.extend(["-f", inp.format])
            cmd_args.extend(["-i", inp.path])

        cmd_args.extend([
            "-filter_complex", filter_graph_str,
            "-map", "[outv]",
            "-map", "[outa]",
            "-c:v", vcodec,
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
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

