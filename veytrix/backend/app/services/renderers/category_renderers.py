"""Category Renderers for Asset Rendering Layer: Translates asset metadata into FFmpeg filter instructions."""

import math
from typing import Any, Dict, List, Optional
from app.models.enums import AssetType, PlanType
from app.models.render_definition import RenderDefinition, RenderKind


def _safe_float(val: Any, default: float = 0.0) -> float:
    if val is None:
        return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


def _safe_int(val: Any, default: int = 0) -> int:
    if val is None:
        return default
    try:
        return int(val)
    except (ValueError, TypeError):
        return default


class RenderPlugin:
    """Base class for category render plugins."""

    plugin_type: str = "generic"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        return True

    def generate_render_definition(
        self,
        item_id: str = "",
        name: str = "",
        kind: RenderKind = RenderKind.EFFECT,
        asset_type: AssetType = AssetType.EFFECT,
        engine_key: str = "",
        category: str = "",
        required_plan: PlanType = PlanType.FREE,
        enabled: bool = True,
        user_has_access: bool = True,
        parameters: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> RenderDefinition:
        params = parameters if parameters is not None else kwargs.get("parameters", {})
        meta = metadata if metadata is not None else kwargs.get("metadata", {})
        filter_chain: List[str] = []
        return RenderDefinition(
            id=item_id,
            name=name,
            kind=kind,
            asset_type=asset_type,
            engine_key=engine_key,
            category=category,
            version=1,
            required_plan=required_plan,
            enabled=enabled,
            parameters=params,
            filter_chain=filter_chain,
            layer_priority=0,
            user_has_access=user_has_access,
            metadata=meta,
        )


class BlurRenderer(RenderPlugin):
    """Renderer for Blur effects (Gaussian, motion, zoom, radial, directional blur)."""

    plugin_type: str = "blur"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return "blur" in combined

    def generate_render_definition(
        self,
        item_id: str = "",
        name: str = "",
        kind: RenderKind = RenderKind.EFFECT,
        asset_type: AssetType = AssetType.EFFECT,
        engine_key: str = "",
        category: str = "",
        required_plan: PlanType = PlanType.FREE,
        enabled: bool = True,
        user_has_access: bool = True,
        parameters: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> RenderDefinition:
        res = super().generate_render_definition(
            item_id=item_id, name=name, kind=kind, asset_type=asset_type, engine_key=engine_key,
            category=category, required_plan=required_plan, enabled=enabled, user_has_access=user_has_access,
            parameters=parameters, metadata=metadata, **kwargs
        )
        params = res.parameters
        meta = res.metadata

        raw_int = params.get("intensity") if params.get("intensity") is not None else meta.get("defaultIntensity", 50)
        intensity = _safe_float(raw_int, 50.0) / 100.0
        id_lower = res.id.lower()

        if "motion" in id_lower:
            filters = [f"tblend=all_mode=average,boxblur={int(20 * intensity)}:1"]
        elif "zoom" in id_lower or "radial" in id_lower:
            filters = [f"sab=r={max(1, int(10 * intensity))}:pf={max(1, int(5 * intensity))}:color_coeff=1.0"]
        elif "directional" in id_lower:
            filters = [f"boxblur={int(25 * intensity)}:{int(5 * intensity)}"]
        else:
            r = max(1, int(20 * intensity))
            filters = [f"boxblur={r}:{r}"]

        res.filter_chain = filters
        res.layer_priority = 10
        return res


class CameraRenderer(RenderPlugin):
    """Renderer for Camera effects (pan, zoom, tilt, roll, camera shake)."""

    plugin_type: str = "camera"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["camera", "shake", "pan", "tilt", "roll"])

    def generate_render_definition(
        self,
        item_id: str = "",
        name: str = "",
        kind: RenderKind = RenderKind.EFFECT,
        asset_type: AssetType = AssetType.EFFECT,
        engine_key: str = "",
        category: str = "",
        required_plan: PlanType = PlanType.FREE,
        enabled: bool = True,
        user_has_access: bool = True,
        parameters: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> RenderDefinition:
        res = super().generate_render_definition(
            item_id=item_id, name=name, kind=kind, asset_type=asset_type, engine_key=engine_key,
            category=category, required_plan=required_plan, enabled=enabled, user_has_access=user_has_access,
            parameters=parameters, metadata=metadata, **kwargs
        )
        params = res.parameters
        meta = res.metadata

        raw_int = params.get("intensity") if params.get("intensity") is not None else meta.get("defaultIntensity", 50)
        intensity = _safe_float(raw_int, 50.0) / 100.0
        id_lower = res.id.lower()

        if "shake" in id_lower:
            dx = int(10 * intensity)
            dy = int(10 * intensity)
            filters = [f"crop=iw-{2*dx}:ih-{2*dy}:{dx}:{dy},scale=iw+{2*dx}:ih+{2*dy}"]
        elif "tilt" in id_lower or "roll" in id_lower:
            angle_deg = int(5 * intensity)
            rad = angle_deg * math.pi / 180.0
            filters = [f"rotate={rad:.4f}:c=black@0"]
        else:
            z = 1.0 + (0.15 * intensity)
            filters = [f"scale=iw*{z:.2f}:ih*{z:.2f}"]

        res.filter_chain = filters
        res.layer_priority = 8
        return res


class GlitchRenderer(RenderPlugin):
    """Renderer for Glitch effects (chromatic aberration, RGB split, digital noise, VHS glitch)."""

    plugin_type: str = "glitch"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["glitch", "distortion", "analog", "vhs", "rgb"])

    def generate_render_definition(
        self,
        item_id: str = "",
        name: str = "",
        kind: RenderKind = RenderKind.EFFECT,
        asset_type: AssetType = AssetType.EFFECT,
        engine_key: str = "",
        category: str = "",
        required_plan: PlanType = PlanType.FREE,
        enabled: bool = True,
        user_has_access: bool = True,
        parameters: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> RenderDefinition:
        res = super().generate_render_definition(
            item_id=item_id, name=name, kind=kind, asset_type=asset_type, engine_key=engine_key,
            category=category, required_plan=required_plan, enabled=enabled, user_has_access=user_has_access,
            parameters=parameters, metadata=metadata, **kwargs
        )
        params = res.parameters
        meta = res.metadata

        raw_int = params.get("intensity") if params.get("intensity") is not None else meta.get("defaultIntensity", 50)
        intensity = _safe_float(raw_int, 50.0) / 100.0
        filters = [
            f"noise=alls={int(25 * intensity)}:allf=t+u",
            f"chromashift=cx={int(6 * intensity)}:cy={int(3 * intensity)}"
        ]
        res.filter_chain = filters
        res.layer_priority = 12
        return res


class CinematicRenderer(RenderPlugin):
    """Renderer for Cinematic styling (letterbox, film grain, vignetting, warm/cool tone)."""

    plugin_type: str = "cinematic"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["cinematic", "film", "vignette", "grain", "movie", "hollywood"])

    def generate_render_definition(
        self,
        item_id: str = "",
        name: str = "",
        kind: RenderKind = RenderKind.EFFECT,
        asset_type: AssetType = AssetType.EFFECT,
        engine_key: str = "",
        category: str = "",
        required_plan: PlanType = PlanType.FREE,
        enabled: bool = True,
        user_has_access: bool = True,
        parameters: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> RenderDefinition:
        res = super().generate_render_definition(
            item_id=item_id, name=name, kind=kind, asset_type=asset_type, engine_key=engine_key,
            category=category, required_plan=required_plan, enabled=enabled, user_has_access=user_has_access,
            parameters=parameters, metadata=metadata, **kwargs
        )
        params = res.parameters
        meta = res.metadata

        raw_int = params.get("intensity") if params.get("intensity") is not None else meta.get("defaultIntensity", 60)
        intensity = _safe_float(raw_int, 60.0) / 100.0
        contrast = 1.0 + (0.2 * intensity)
        saturation = 1.0 + (0.1 * intensity)
        filters = [
            f"eq=contrast={contrast:.2f}:saturation={saturation:.2f}",
            f"vignette=PI/{max(2.0, 4.0 - intensity):.2f}"
        ]
        res.filter_chain = filters
        res.layer_priority = 6
        return res


class LightRenderer(RenderPlugin):
    """Renderer for Light effects (lens flare, glow, light leak, flash, rainbow)."""

    plugin_type: str = "light"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["light", "flare", "leak", "glow", "flash", "spark"])

    def generate_render_definition(
        self,
        item_id: str = "",
        name: str = "",
        kind: RenderKind = RenderKind.EFFECT,
        asset_type: AssetType = AssetType.EFFECT,
        engine_key: str = "",
        category: str = "",
        required_plan: PlanType = PlanType.FREE,
        enabled: bool = True,
        user_has_access: bool = True,
        parameters: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> RenderDefinition:
        res = super().generate_render_definition(
            item_id=item_id, name=name, kind=kind, asset_type=asset_type, engine_key=engine_key,
            category=category, required_plan=required_plan, enabled=enabled, user_has_access=user_has_access,
            parameters=parameters, metadata=metadata, **kwargs
        )
        params = res.parameters
        meta = res.metadata

        raw_int = params.get("intensity") if params.get("intensity") is not None else meta.get("defaultIntensity", 50)
        intensity = _safe_float(raw_int, 50.0) / 100.0
        brightness = 0.05 * intensity
        contrast = 1.0 + (0.15 * intensity)

        filters = [f"eq=brightness={brightness:.2f}:contrast={contrast:.2f}"]
        res.filter_chain = filters
        res.layer_priority = 9
        return res


class RetroRenderer(RenderPlugin):
    """Renderer for Retro effects (VHS scanlines, CRT flicker, 80s duotone, sepia, vintage film)."""

    plugin_type: str = "retro"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["retro", "vintage", "crt", "80s", "duotone", "sepia"])

    def generate_render_definition(
        self,
        item_id: str = "",
        name: str = "",
        kind: RenderKind = RenderKind.EFFECT,
        asset_type: AssetType = AssetType.EFFECT,
        engine_key: str = "",
        category: str = "",
        required_plan: PlanType = PlanType.FREE,
        enabled: bool = True,
        user_has_access: bool = True,
        parameters: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> RenderDefinition:
        res = super().generate_render_definition(
            item_id=item_id, name=name, kind=kind, asset_type=asset_type, engine_key=engine_key,
            category=category, required_plan=required_plan, enabled=enabled, user_has_access=user_has_access,
            parameters=parameters, metadata=metadata, **kwargs
        )
        params = res.parameters
        meta = res.metadata

        raw_int = params.get("intensity") if params.get("intensity") is not None else meta.get("defaultIntensity", 50)
        intensity = _safe_float(raw_int, 50.0) / 100.0
        filters = [
            "curves=vintage",
            f"eq=saturation={1.0 + (0.25 * intensity):.2f}:contrast={1.0 + (0.1 * intensity):.2f}"
        ]
        res.filter_chain = filters
        res.layer_priority = 7
        return res


class ThreeDRenderer(RenderPlugin):
    """Renderer for 3D effects (3D cube, page curl, flip, perspective projection)."""

    plugin_type: str = "threed"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["3d", "cube", "vr", "curl", "flip", "perspective"])

    def generate_render_definition(
        self,
        item_id: str = "",
        name: str = "",
        kind: RenderKind = RenderKind.EFFECT,
        asset_type: AssetType = AssetType.EFFECT,
        engine_key: str = "",
        category: str = "",
        required_plan: PlanType = PlanType.FREE,
        enabled: bool = True,
        user_has_access: bool = True,
        parameters: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> RenderDefinition:
        res = super().generate_render_definition(
            item_id=item_id, name=name, kind=kind, asset_type=asset_type, engine_key=engine_key,
            category=category, required_plan=required_plan, enabled=enabled, user_has_access=user_has_access,
            parameters=parameters, metadata=metadata, **kwargs
        )
        filters = [f"perspective=x0=0:y0=0:x1=w:y1=0:x2=0:y2=h:x3=w:y3=h:sense=destination"]
        res.filter_chain = filters
        res.layer_priority = 11
        return res


class FilterRenderer(RenderPlugin):
    """Renderer for Filter presets (LUT color grading, contrast, saturation, hue shift, brightness, gamma, monochrome)."""

    plugin_type: str = "filter"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        if asset_type == AssetType.FILTER:
            return True
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["color", "lut", "warm", "cool", "monochrome", "pastel", "moody", "dramatic"])

    def generate_render_definition(
        self,
        item_id: str = "",
        name: str = "",
        kind: RenderKind = RenderKind.FILTER,
        asset_type: AssetType = AssetType.FILTER,
        engine_key: str = "",
        category: str = "",
        required_plan: PlanType = PlanType.FREE,
        enabled: bool = True,
        user_has_access: bool = True,
        parameters: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> RenderDefinition:
        res = super().generate_render_definition(
            item_id=item_id, name=name, kind=kind, asset_type=asset_type, engine_key=engine_key,
            category=category, required_plan=required_plan, enabled=enabled, user_has_access=user_has_access,
            parameters=parameters, metadata=metadata, **kwargs
        )
        params = res.parameters
        meta = res.metadata

        raw_int = params.get("intensity") if params.get("intensity") is not None else meta.get("defaultIntensity", 80)
        intensity = _safe_float(raw_int, 80.0) / 100.0
        cat_lower = res.category.lower()

        if "warm" in cat_lower or "autumn" in cat_lower:
            filters = [f"eq=gamma_r={1.0 + (0.2 * intensity):.2f}:saturation={1.0 + (0.3 * intensity):.2f}"]
        elif "cool" in cat_lower or "nordic" in cat_lower:
            filters = [f"eq=gamma_b={1.0 + (0.25 * intensity):.2f}:contrast={1.0 + (0.1 * intensity):.2f}"]
        elif "monochrome" in cat_lower or "b&w" in cat_lower or "black" in cat_lower:
            filters = [f"hue=s={1.0 - intensity:.2f}"]
        elif "vintage" in cat_lower or "retro" in cat_lower:
            filters = [f"curves=vintage,eq=contrast={1.0 + (0.15 * intensity):.2f}"]
        else:
            filters = [f"eq=contrast={1.0 + (0.15 * intensity):.2f}:saturation={1.0 + (0.1 * intensity):.2f}"]

        res.filter_chain = filters
        res.layer_priority = 5
        return res


class TransitionRenderer(RenderPlugin):
    """Renderer for Transitions (cross dissolve, fade black/white, wipe, slide, zoom, push, glitch)."""

    plugin_type: str = "transition"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        if asset_type == AssetType.TRANSITION:
            return True
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["wipe", "dissolve", "fade", "slide", "spin", "push", "transition"])

    def generate_render_definition(
        self,
        item_id: str = "",
        name: str = "",
        kind: RenderKind = RenderKind.TRANSITION,
        asset_type: AssetType = AssetType.TRANSITION,
        engine_key: str = "",
        category: str = "",
        required_plan: PlanType = PlanType.FREE,
        enabled: bool = True,
        user_has_access: bool = True,
        parameters: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> RenderDefinition:
        res = super().generate_render_definition(
            item_id=item_id, name=name, kind=kind, asset_type=asset_type, engine_key=engine_key,
            category=category, required_plan=required_plan, enabled=enabled, user_has_access=user_has_access,
            parameters=parameters, metadata=metadata, **kwargs
        )
        params = res.parameters
        meta = res.metadata

        raw_dur = params.get("duration") if params.get("duration") is not None else meta.get("defaultDuration", 0.8)
        duration = _safe_float(raw_dur, 0.8)
        cat_first = res.category.lower().split()[0] if res.category else "fade"

        xfade_transition = "fade"
        if "wipe" in cat_first or "slide" in cat_first:
            xfade_transition = "wipeleft"
        elif "zoom" in cat_first or "push" in cat_first:
            xfade_transition = "zoomin"
        elif "glitch" in cat_first:
            xfade_transition = "pixelize"

        filters = [f"xfade=transition={xfade_transition}:duration={duration:.2f}"]
        res.filter_chain = filters
        res.layer_priority = 2
        return res


class TextRenderer(RenderPlugin):
    """Renderer for Text & Subtitle overlays (font styling, position, stroke, color)."""

    plugin_type: str = "text"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["text", "title", "caption", "subtitle", "drawtext"])

    def generate_render_definition(
        self,
        item_id: str = "",
        name: str = "",
        kind: RenderKind = RenderKind.OVERLAY,
        asset_type: AssetType = AssetType.EFFECT,
        engine_key: str = "",
        category: str = "",
        required_plan: PlanType = PlanType.FREE,
        enabled: bool = True,
        user_has_access: bool = True,
        parameters: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> RenderDefinition:
        res = super().generate_render_definition(
            item_id=item_id, name=name, kind=kind, asset_type=asset_type, engine_key=engine_key,
            category=category, required_plan=required_plan, enabled=enabled, user_has_access=user_has_access,
            parameters=parameters, metadata=metadata, **kwargs
        )
        params = res.parameters
        text_content = str(params.get("text", "Text Overlay"))
        font_size = _safe_int(params.get("font_size"), 36)
        font_color = str(params.get("font_color", "white"))

        filter_str = f"drawtext=text='{text_content}':fontsize={font_size}:fontcolor={font_color}:x=(w-tw)/2:y=(h-th)/2"
        res.filter_chain = [filter_str]
        res.layer_priority = 15
        return res


class AudioRenderer(RenderPlugin):
    """Renderer for Audio clips (volume, fade in/out, tempo speed adjust)."""

    plugin_type: str = "audio"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        if asset_type == AssetType.AUDIO:
            return True
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["audio", "sound", "volume", "music"])

    def generate_render_definition(
        self,
        item_id: str = "",
        name: str = "",
        kind: RenderKind = RenderKind.COMPOSITE,
        asset_type: AssetType = AssetType.AUDIO,
        engine_key: str = "",
        category: str = "",
        required_plan: PlanType = PlanType.FREE,
        enabled: bool = True,
        user_has_access: bool = True,
        parameters: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> RenderDefinition:
        res = super().generate_render_definition(
            item_id=item_id, name=name, kind=kind, asset_type=asset_type, engine_key=engine_key,
            category=category, required_plan=required_plan, enabled=enabled, user_has_access=user_has_access,
            parameters=parameters, metadata=metadata, **kwargs
        )
        params = res.parameters
        volume = _safe_float(params.get("volume"), 1.0)
        fade_in = _safe_float(params.get("fade_in"), 0.0)
        fade_out = _safe_float(params.get("fade_out"), 0.0)

        filters: List[str] = []
        if volume != 1.0:
            filters.append(f"volume={volume:.2f}")
        if fade_in > 0:
            filters.append(f"afade=t=in:st=0:d={fade_in:.2f}")
        if fade_out > 0:
            filters.append(f"afade=t=out:st=0:d={fade_out:.2f}")

        if not filters:
            filters = ["anull"]

        res.filter_chain = filters
        res.layer_priority = 0
        return res


class AIRenderer(RenderPlugin):
    """Placeholder/pass-through renderer for AI enhancement effects. Marks unsupported items explicitly."""

    plugin_type: str = "ai"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["ai", "smart", "enhancement", "generative"])

    def generate_render_definition(
        self,
        item_id: str = "",
        name: str = "",
        kind: RenderKind = RenderKind.EFFECT,
        asset_type: AssetType = AssetType.EFFECT,
        engine_key: str = "",
        category: str = "",
        required_plan: PlanType = PlanType.FREE,
        enabled: bool = True,
        user_has_access: bool = True,
        parameters: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> RenderDefinition:
        res = super().generate_render_definition(
            item_id=item_id, name=name, kind=kind, asset_type=asset_type, engine_key=engine_key,
            category=category, required_plan=required_plan, enabled=enabled, user_has_access=user_has_access,
            parameters=parameters, metadata=metadata, **kwargs
        )
        res.filter_chain = ["null"]
        res.layer_priority = 100
        res.metadata["is_ai_placeholder"] = True
        return res


class BasicRenderer(RenderPlugin):
    """Renderer for Basic transforms (opacity, scale, position, rotation, crop, flip, speed, reverse, freeze)."""

    plugin_type: str = "basic"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        return True

    def generate_render_definition(
        self,
        item_id: str = "",
        name: str = "",
        kind: RenderKind = RenderKind.EFFECT,
        asset_type: AssetType = AssetType.EFFECT,
        engine_key: str = "",
        category: str = "",
        required_plan: PlanType = PlanType.FREE,
        enabled: bool = True,
        user_has_access: bool = True,
        parameters: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> RenderDefinition:
        res = super().generate_render_definition(
            item_id=item_id, name=name, kind=kind, asset_type=asset_type, engine_key=engine_key,
            category=category, required_plan=required_plan, enabled=enabled, user_has_access=user_has_access,
            parameters=parameters, metadata=metadata, **kwargs
        )
        params = res.parameters
        meta = res.metadata
        filters: List[str] = []

        raw_op = params.get("opacity") if params.get("opacity") is not None else meta.get("defaultOpacity", 100)
        opacity = _safe_float(raw_op, 100.0) / 100.0
        raw_angle = params.get("angle") if params.get("angle") is not None else meta.get("defaultAngle", 0)
        angle = _safe_float(raw_angle, 0.0)
        scale = _safe_float(params.get("scale"), 1.0)
        flip_h = bool(params.get("flip_h", meta.get("flip_h", False)))
        flip_v = bool(params.get("flip_v", meta.get("flip_v", False)))

        if flip_h:
            filters.append("hflip")
        if flip_v:
            filters.append("vflip")

        if angle != 0:
            rad = angle * math.pi / 180.0
            filters.append(f"rotate={rad:.4f}:c=black@0")

        if opacity < 1.0 and opacity >= 0.0:
            filters.append(f"format=rgba,colorchannelmixer=aa={opacity:.2f}")

        if scale != 1.0 and scale > 0:
            filters.append(f"scale=iw*{scale:.2f}:ih*{scale:.2f}")

        if not filters:
            filters = ["null"]

        res.filter_chain = filters
        res.layer_priority = 1
        return res
