"""Category Renderers for Asset Rendering Layer: Translates asset metadata into FFmpeg filter instructions."""

import math
from typing import Any, Dict, List, Optional
from app.models.enums import AssetType, PlanType
from app.models.render_definition import RenderDefinition, RenderKind
from app.services.renderers.base_renderer import BaseRenderer, ParameterValidationError


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


class RenderPlugin(BaseRenderer):
    """Base class for category render plugins, inheriting from BaseRenderer."""

    plugin_type: str = "generic"
    renderer_id: str = "generic"
    category: str = "general"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        return True

    def generate_filters(self, item_id: str, parameters: Dict[str, Any], metadata: Dict[str, Any]) -> List[str]:
        return []

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
        return self.build(
            item_id=item_id,
            name=name,
            kind=kind,
            asset_type=asset_type,
            engine_key=engine_key,
            category=category,
            required_plan=required_plan,
            enabled=enabled,
            user_has_access=user_has_access,
            parameters=parameters,
            metadata=metadata,
            **kwargs,
        )


class FilterRenderer(RenderPlugin):
    """
    Renderer for Filters (Brightness, Contrast, Exposure, Saturation, Hue, Temperature, Tint,
    Vibrance, Sharpen, Blur, Noise, Grain, Vignette, LUT, HDR, Monochrome, Sepia).
    """

    plugin_type: str = "filter"
    renderer_id: str = "filter"
    category: str = "color"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        if asset_type == AssetType.FILTER:
            return True
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["color", "lut", "warm", "cool", "monochrome", "pastel", "moody", "dramatic", "brightness", "contrast", "exposure", "saturation", "hue", "sharpen", "sepia", "vibrance", "hdr"])

    def get_layer_priority(self, item_id: str) -> int:
        return 5

    def generate_filters(self, item_id: str, parameters: Dict[str, Any], metadata: Dict[str, Any]) -> List[str]:
        raw_int = parameters.get("intensity") if parameters.get("intensity") is not None else metadata.get("defaultIntensity", 80)
        intensity = _safe_float(raw_int, 80.0) / 100.0
        id_lower = item_id.lower()
        cat_lower = metadata.get("category", "").lower()

        filters: List[str] = []

        # Specific filter logic
        if "brightness" in id_lower or "exposure" in id_lower:
            b = (intensity - 0.5) * 0.8 if parameters.get("brightness") is None else (_safe_float(parameters.get("brightness")) - 50.0) / 50.0
            filters.append(f"eq=brightness={b:.2f}")
        elif "contrast" in id_lower:
            c = 1.0 + (intensity * 0.8)
            filters.append(f"eq=contrast={c:.2f}")
        elif "saturation" in id_lower or "vibrance" in id_lower:
            s = 1.0 + ((intensity - 0.5) * 1.5)
            filters.append(f"eq=saturation={s:.2f}")
        elif "hue" in id_lower:
            h = (intensity - 0.5) * 180.0
            filters.append(f"hue=h={h:.1f}")
        elif "sharpen" in id_lower:
            amount = max(0.1, intensity * 2.5)
            filters.append(f"unsharp=luma_msize_x=5:luma_msize_y=5:luma_amount={amount:.2f}")
        elif "noise" in id_lower or "grain" in id_lower:
            filters.append(f"noise=alls={int(30 * intensity)}:allf=t+u")
        elif "vignette" in id_lower:
            filters.append(f"vignette=PI/{max(1.5, 4.0 - (2.0 * intensity)):.2f}")
        elif "monochrome" in id_lower or "b&w" in cat_lower or "black" in cat_lower:
            filters.append(f"hue=s={1.0 - intensity:.2f}")
        elif "sepia" in id_lower or "sepia" in cat_lower:
            filters.append(f"colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131")
        elif "hdr" in id_lower:
            filters.append(f"eq=contrast={1.0 + (0.3 * intensity):.2f}:saturation={1.0 + (0.4 * intensity):.2f}")
        elif "lut" in id_lower:
            lut_file = parameters.get("lut_file", "lut.cube")
            filters.append(f"lut3d=file='{lut_file}'")
        elif "warm" in cat_lower or "autumn" in cat_lower or "temperature" in id_lower:
            filters.append(f"eq=gamma_r={1.0 + (0.2 * intensity):.2f}:saturation={1.0 + (0.3 * intensity):.2f}")
        elif "cool" in cat_lower or "nordic" in cat_lower or "tint" in id_lower:
            filters.append(f"eq=gamma_b={1.0 + (0.25 * intensity):.2f}:contrast={1.0 + (0.1 * intensity):.2f}")
        else:
            filters.append(f"eq=contrast={1.0 + (0.15 * intensity):.2f}:saturation={1.0 + (0.1 * intensity):.2f}")

        return filters


class EffectRenderer(RenderPlugin):
    """Base Effect Renderer derived from BaseRenderer."""

    plugin_type: str = "effect"
    renderer_id: str = "effect"
    category: str = "effect"

    def get_layer_priority(self, item_id: str) -> int:
        return 10


class TransitionRenderer(RenderPlugin):
    """
    Renderer for Transitions (Fade, Cross Dissolve, Slide, Push, Zoom, Spin, Blur, Wipe, Whip, Glitch, Morph, 3D, Circle, Iris, Cube, Flip).
    """

    plugin_type: str = "transition"
    renderer_id: str = "transition"
    category: str = "transition"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        if asset_type == AssetType.TRANSITION:
            return True
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["wipe", "dissolve", "fade", "slide", "spin", "push", "transition", "whip", "morph", "circle", "iris", "cube", "flip", "zoom"])

    def get_layer_priority(self, item_id: str) -> int:
        return 2

    def generate_filters(self, item_id: str, parameters: Dict[str, Any], metadata: Dict[str, Any]) -> List[str]:
        return self.generate_transitions(item_id, parameters, metadata, duration=_safe_float(parameters.get("duration"), 0.8))

    def generate_transitions(self, item_id: str, parameters: Dict[str, Any], metadata: Dict[str, Any], duration: float = 1.0) -> List[str]:
        raw_dur = parameters.get("duration") if parameters.get("duration") is not None else metadata.get("defaultDuration", duration)
        dur = _safe_float(raw_dur, duration)

        id_lower = item_id.lower()
        cat_lower = metadata.get("category", "").lower()
        combined = f"{id_lower} {cat_lower}"

        xfade_transition = "fade"
        if "cross" in combined or "dissolve" in combined:
            xfade_transition = "dissolve"
        elif "slide" in combined or "push" in combined:
            direction = parameters.get("direction", "left")
            xfade_transition = f"slide{direction}" if direction in ("left", "right", "up", "down") else "slideleft"
        elif "wipe" in combined or "whip" in combined:
            xfade_transition = "wipeleft"
        elif "zoom" in combined:
            xfade_transition = "zoomin"
        elif "spin" in combined or "rotate" in combined:
            xfade_transition = "circlecrop"
        elif "blur" in combined:
            xfade_transition = "rectcrop"
        elif "glitch" in combined:
            xfade_transition = "pixelize"
        elif "circle" in combined or "iris" in combined:
            xfade_transition = "circlecrop"
        elif "3d" in combined or "cube" in combined or "flip" in combined:
            xfade_transition = "horzopen"
        elif "morph" in combined:
            xfade_transition = "distance"

        return [f"xfade=transition={xfade_transition}:duration={dur:.2f}"]


class BlurRenderer(EffectRenderer):
    """
    Renderer for Blur effects (Gaussian, Box, Lens, Motion, Radial, Zoom, Bokeh, Directional, Surface, Smart, Dynamic).
    """

    plugin_type: str = "blur"
    renderer_id: str = "blur"
    category: str = "blur"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return "blur" in combined or "bokeh" in combined

    def generate_filters(self, item_id: str, parameters: Dict[str, Any], metadata: Dict[str, Any]) -> List[str]:
        raw_int = parameters.get("intensity") if parameters.get("intensity") is not None else metadata.get("defaultIntensity", 50)
        intensity = _safe_float(raw_int, 50.0) / 100.0
        radius = _safe_float(parameters.get("radius"), 0.0)
        id_lower = item_id.lower()

        if "gaussian" in id_lower or "gblur" in id_lower:
            sigma = max(1.0, radius if radius > 0 else 12.0 * intensity)
            return [f"gblur=sigma={sigma:.2f}"]
        elif "motion" in id_lower:
            return [f"tblend=all_mode=average,boxblur={int(20 * intensity)}:1"]
        elif "zoom" in id_lower or "radial" in id_lower:
            return [f"sab=r={max(1, int(10 * intensity))}:pf={max(1, int(5 * intensity))}:color_coeff=1.0"]
        elif "directional" in id_lower:
            return [f"boxblur={int(25 * intensity)}:{int(5 * intensity)}"]
        elif "lens" in id_lower or "bokeh" in id_lower:
            return [f"boxblur={max(1, int(15 * intensity))}:power=2"]
        elif "surface" in id_lower or "smart" in id_lower:
            return [f"smartblur=lr={max(1, int(5 * intensity))}:ls=1.0:lt=-1.0"]
        else:
            r = max(1, int(radius if radius > 0 else 20 * intensity))
            return [f"boxblur={r}:{r}"]


class CameraRenderer(EffectRenderer):
    """
    Renderer for Camera effects (Zoom, Dolly, Push, Pull, Pan, Tilt, Orbit, Crane, Drone, Shake, Handheld, Steadicam, Gimbal, Rack Focus, Focus Pull).
    """

    plugin_type: str = "camera"
    renderer_id: str = "camera"
    category: str = "camera"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["camera", "shake", "pan", "tilt", "roll", "dolly", "push", "pull", "orbit", "crane", "drone", "steadicam", "gimbal", "focus"])

    def get_layer_priority(self, item_id: str) -> int:
        return 8

    def generate_filters(self, item_id: str, parameters: Dict[str, Any], metadata: Dict[str, Any]) -> List[str]:
        raw_int = parameters.get("intensity") if parameters.get("intensity") is not None else metadata.get("defaultIntensity", 50)
        intensity = _safe_float(raw_int, 50.0) / 100.0
        id_lower = item_id.lower()

        if "shake" in id_lower or "handheld" in id_lower or "steadicam" in id_lower or "gimbal" in id_lower:
            dx = max(1, int(10 * intensity))
            dy = max(1, int(10 * intensity))
            return [f"crop=iw-{2*dx}:ih-{2*dy}:{dx}:{dy},scale=iw+{2*dx}:ih+{2*dy}"]
        elif "tilt" in id_lower or "roll" in id_lower or "orbit" in id_lower or "crane" in id_lower:
            angle_deg = (5.0 * intensity) if "tilt" in id_lower else (10.0 * intensity)
            rad = angle_deg * math.pi / 180.0
            return [f"rotate={rad:.4f}:c=black@0"]
        elif "focus" in id_lower or "rack" in id_lower:
            return [f"boxblur={max(1, int(8 * intensity))}:1"]
        elif "pan" in id_lower or "push" in id_lower or "pull" in id_lower or "drone" in id_lower:
            z = 1.0 + (0.2 * intensity)
            return [f"scale=iw*{z:.2f}:ih*{z:.2f}"]
        else:
            z = 1.0 + (0.15 * intensity)
            return [f"scale=iw*{z:.2f}:ih*{z:.2f}"]


class GlitchRenderer(EffectRenderer):
    """
    Renderer for Glitch effects (RGB Split, RGB Shift, VHS, CRT, Pixel Sort, Digital Noise, Scan Lines,
    TV Static, Frame Skip, Frame Freeze, Channel Shift, Analog Error, Data Corruption, Hologram, Cyber Effects).
    """

    plugin_type: str = "glitch"
    renderer_id: str = "glitch"
    category: str = "glitch"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["glitch", "distortion", "analog", "rgb", "pixel", "scan", "static", "corruption", "hologram", "cyber"])

    def get_layer_priority(self, item_id: str) -> int:
        return 12

    def generate_filters(self, item_id: str, parameters: Dict[str, Any], metadata: Dict[str, Any]) -> List[str]:
        raw_int = parameters.get("intensity") if parameters.get("intensity") is not None else metadata.get("defaultIntensity", 50)
        intensity = _safe_float(raw_int, 50.0) / 100.0
        id_lower = item_id.lower()

        if "rgb" in id_lower or "channel" in id_lower:
            shift = max(1, int(8 * intensity))
            return [f"chromashift=cx={shift}:cy={max(1, shift//2)}"]
        elif "vhs" in id_lower or "analog" in id_lower or "corruption" in id_lower:
            return [
                f"noise=alls={int(35 * intensity)}:allf=t+u",
                f"chromashift=cx={int(8 * intensity)}:cy={int(4 * intensity)}"
            ]
        elif "pixel" in id_lower:
            return [f"frei0r=filter_name=pixeliz0r:filter_params={0.05 * intensity:.3f}"]
        elif "scan" in id_lower or "crt" in id_lower or "static" in id_lower:
            return [f"noise=alls={int(20 * intensity)}:allf=t", f"eq=contrast={1.0 + (0.2 * intensity):.2f}"]
        elif "hologram" in id_lower or "cyber" in id_lower:
            return [f"colorchannelmixer=0.2:0.8:0.4:0:0.1:0.9:0.5:0:0.3:0.7:1.0", f"noise=alls={int(15 * intensity)}:allf=t"]
        else:
            return [
                f"noise=alls={int(25 * intensity)}:allf=t+u",
                f"chromashift=cx={int(6 * intensity)}:cy={int(3 * intensity)}"
            ]


class RetroRenderer(EffectRenderer):
    """
    Renderer for Retro effects (VHS, Film Grain, Film Burn, Dust, Scratches, Super 8, 16mm, 35mm,
    Camcorder, Old Cinema, Analog TV, Polaroid, Kodak, Fuji, Sepia, Vintage).
    """

    plugin_type: str = "retro"
    renderer_id: str = "retro"
    category: str = "retro"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["retro", "vintage", "80s", "duotone", "vhs", "grain", "burn", "dust", "scratch", "super8", "16mm", "35mm", "camcorder", "cinema", "polaroid", "kodak", "fuji"])

    def get_layer_priority(self, item_id: str) -> int:
        return 7

    def generate_filters(self, item_id: str, parameters: Dict[str, Any], metadata: Dict[str, Any]) -> List[str]:
        raw_int = parameters.get("intensity") if parameters.get("intensity") is not None else metadata.get("defaultIntensity", 50)
        intensity = _safe_float(raw_int, 50.0) / 100.0
        id_lower = item_id.lower()

        if "grain" in id_lower or "dust" in id_lower or "scratch" in id_lower:
            return [f"noise=alls={int(25 * intensity)}:allf=t+u", "eq=contrast=1.05"]
        elif "sepia" in id_lower or "polaroid" in id_lower:
            return ["colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131"]
        elif "kodak" in id_lower or "fuji" in id_lower or "35mm" in id_lower:
            return [f"eq=contrast={1.0 + (0.15 * intensity):.2f}:saturation={1.0 + (0.2 * intensity):.2f}"]
        elif "super 8" in id_lower or "super8" in id_lower or "16mm" in id_lower or "cinema" in id_lower:
            return ["curves=vintage", f"vignette=PI/{max(2.0, 4.0 - intensity):.2f}"]
        else:
            return [
                "curves=vintage",
                f"eq=saturation={1.0 + (0.25 * intensity):.2f}:contrast={1.0 + (0.1 * intensity):.2f}"
            ]


class LightRenderer(EffectRenderer):
    """
    Renderer for Light effects (Glow, Bloom, Lens Flare, God Rays, Neon, HDR Light, Ambient Light,
    Rim Light, Stage Light, Reflection, Prism, Rainbow, Aurora).
    """

    plugin_type: str = "light"
    renderer_id: str = "light"
    category: str = "light"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["light", "flare", "leak", "glow", "flash", "spark", "bloom", "neon", "god", "ambient", "rim", "stage", "reflection", "prism", "rainbow", "aurora"])

    def get_layer_priority(self, item_id: str) -> int:
        return 9

    def generate_filters(self, item_id: str, parameters: Dict[str, Any], metadata: Dict[str, Any]) -> List[str]:
        raw_int = parameters.get("intensity") if parameters.get("intensity") is not None else metadata.get("defaultIntensity", 50)
        intensity = _safe_float(raw_int, 50.0) / 100.0
        id_lower = item_id.lower()

        if "glow" in id_lower or "bloom" in id_lower or "neon" in id_lower:
            b = 0.08 * intensity
            c = 1.0 + (0.25 * intensity)
            return [f"eq=brightness={b:.2f}:contrast={c:.2f}"]
        elif "flare" in id_lower or "prism" in id_lower or "rainbow" in id_lower:
            return [f"eq=brightness={0.06 * intensity:.2f}:saturation={1.0 + (0.3 * intensity):.2f}"]
        elif "god" in id_lower or "aurora" in id_lower:
            return [f"eq=brightness={0.05 * intensity:.2f}:gamma={1.0 + (0.2 * intensity):.2f}"]
        else:
            brightness = 0.05 * intensity
            contrast = 1.0 + (0.15 * intensity)
            return [f"eq=brightness={brightness:.2f}:contrast={contrast:.2f}"]


class CinematicRenderer(EffectRenderer):
    """
    Renderer for Cinematic styling (Letterbox, Color Grading, Film Look, Teal & Orange, Contrast,
    Vignette, Highlight Boost, Atmosphere, Fog, Mist, Smoke, Rain, Snow, Flashback, Noir, Dream Sequence).
    """

    plugin_type: str = "cinematic"
    renderer_id: str = "cinematic"
    category: str = "cinematic"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["cinematic", "movie", "hollywood", "teal", "orange", "noir", "letterbox", "atmosphere", "fog", "mist", "smoke", "rain", "snow", "flashback", "dream"])

    def get_layer_priority(self, item_id: str) -> int:
        return 6

    def generate_filters(self, item_id: str, parameters: Dict[str, Any], metadata: Dict[str, Any]) -> List[str]:
        raw_int = parameters.get("intensity") if parameters.get("intensity") is not None else metadata.get("defaultIntensity", 60)
        intensity = _safe_float(raw_int, 60.0) / 100.0
        id_lower = item_id.lower()

        if "teal" in id_lower or "orange" in id_lower:
            return [f"eq=gamma_b={1.0 + (0.15 * intensity):.2f}:gamma_r={1.0 + (0.1 * intensity):.2f}:contrast={1.0 + (0.2 * intensity):.2f}"]
        elif "noir" in id_lower:
            return [f"hue=s=0", f"eq=contrast={1.0 + (0.4 * intensity):.2f}"]
        elif "letterbox" in id_lower:
            return ["drawbox=y=0:h=ih*0.1:color=black:t=fill", "drawbox=y=ih*0.9:h=ih*0.1:color=black:t=fill"]
        elif "fog" in id_lower or "mist" in id_lower or "smoke" in id_lower or "dream" in id_lower:
            return [f"boxblur={max(1, int(4 * intensity))}:1", f"eq=brightness={0.05 * intensity:.2f}"]
        elif "rain" in id_lower or "snow" in id_lower:
            return [f"noise=alls={int(20 * intensity)}:allf=t"]
        else:
            contrast = 1.0 + (0.2 * intensity)
            saturation = 1.0 + (0.1 * intensity)
            return [
                f"eq=contrast={contrast:.2f}:saturation={saturation:.2f}",
                f"vignette=PI/{max(2.0, 4.0 - intensity):.2f}"
            ]


class ThreeDRenderer(EffectRenderer):
    """Renderer for 3D effects (3D cube, page curl, flip, perspective projection)."""

    plugin_type: str = "threed"
    renderer_id: str = "threed"
    category: str = "threed"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["3d", "cube", "vr", "curl", "flip", "perspective"])

    def get_layer_priority(self, item_id: str) -> int:
        return 11

    def generate_filters(self, item_id: str, parameters: Dict[str, Any], metadata: Dict[str, Any]) -> List[str]:
        return ["perspective=x0=0:y0=0:x1=w:y1=0:x2=0:y2=h:x3=w:y3=h:sense=destination"]


class TextRenderer(RenderPlugin):
    """Renderer for Text & Subtitle overlays (font styling, position, stroke, color)."""

    plugin_type: str = "text"
    renderer_id: str = "text"
    category: str = "text"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["text", "title", "caption", "subtitle", "drawtext"])

    def get_layer_priority(self, item_id: str) -> int:
        return 15

    def generate_filters(self, item_id: str, parameters: Dict[str, Any], metadata: Dict[str, Any]) -> List[str]:
        text_content = str(parameters.get("text", "Text Overlay"))
        font_size = _safe_int(parameters.get("font_size"), 36)
        font_color = str(parameters.get("font_color", "white"))
        return [f"drawtext=text='{text_content}':fontsize={font_size}:fontcolor={font_color}:x=(w-tw)/2:y=(h-th)/2"]


class AudioRenderer(RenderPlugin):
    """Renderer for Audio clips (volume, fade in/out, tempo speed adjust)."""

    plugin_type: str = "audio"
    renderer_id: str = "audio"
    category: str = "audio"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        if asset_type == AssetType.AUDIO:
            return True
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["audio", "sound", "volume", "music"])

    def get_layer_priority(self, item_id: str) -> int:
        return 0

    def generate_filters(self, item_id: str, parameters: Dict[str, Any], metadata: Dict[str, Any]) -> List[str]:
        volume = _safe_float(parameters.get("volume"), 1.0)
        fade_in = _safe_float(parameters.get("fade_in"), 0.0)
        fade_out = _safe_float(parameters.get("fade_out"), 0.0)

        filters: List[str] = []
        if volume != 1.0:
            filters.append(f"volume={volume:.2f}")
        if fade_in > 0:
            filters.append(f"afade=t=in:st=0:d={fade_in:.2f}")
        if fade_out > 0:
            filters.append(f"afade=t=out:st=0:d={fade_out:.2f}")

        return filters if filters else ["anull"]


class AIRenderer(RenderPlugin):
    """Placeholder/pass-through renderer for AI enhancement effects. Marks unsupported items explicitly."""

    plugin_type: str = "ai"
    renderer_id: str = "ai"
    category: str = "ai"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        combined = f"{engine_key} {category} {item_id}".lower()
        return any(k in combined for k in ["ai", "smart", "enhancement", "generative"])

    def get_layer_priority(self, item_id: str) -> int:
        return 100

    def generate_metadata(self, item_id: str, parameters: Dict[str, Any], metadata: Dict[str, Any]) -> Dict[str, Any]:
        res_meta = super().generate_metadata(item_id, parameters, metadata)
        res_meta["is_ai_placeholder"] = True
        return res_meta

    def generate_filters(self, item_id: str, parameters: Dict[str, Any], metadata: Dict[str, Any]) -> List[str]:
        metadata["is_ai_placeholder"] = True
        return ["null"]


class BasicRenderer(RenderPlugin):
    """Renderer for Basic transforms (opacity, scale, position, rotation, crop, flip, speed, reverse, freeze)."""

    plugin_type: str = "basic"
    renderer_id: str = "basic"
    category: str = "basic"

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        return True

    def get_layer_priority(self, item_id: str) -> int:
        return 1

    def generate_filters(self, item_id: str, parameters: Dict[str, Any], metadata: Dict[str, Any]) -> List[str]:
        filters: List[str] = []

        raw_op = parameters.get("opacity") if parameters.get("opacity") is not None else metadata.get("defaultOpacity", 100)
        op_val = _safe_float(raw_op, 100.0)
        opacity = op_val / 100.0 if op_val > 1.0 else op_val
        raw_angle = parameters.get("angle") if parameters.get("angle") is not None else metadata.get("defaultAngle", 0)
        angle = _safe_float(raw_angle, 0.0)
        scale = _safe_float(parameters.get("scale"), 1.0)
        flip_h = bool(parameters.get("flip_h", metadata.get("flip_h", False)))
        flip_v = bool(parameters.get("flip_v", metadata.get("flip_v", False)))

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

        return filters if filters else ["null"]
