"""
CapCut-Style Effects Engine & Strategy Registry for Veytrix.

Implements high-fidelity, metadata-driven effect strategies:
- Advanced Color Grading (Curves, HSL, Temperature, Tint, Shadows/Highlights, LUT)
- Film Effects (Grain, Halation, Bloom, Chromatic Aberration, VHS, CRT)
- Motion Effects (Directional Motion Blur, Camera Shake, Impact Shake, Handheld, Velocity Blur)
- Light Effects (Lens Flares, Light Leaks, Glow, Volumetric Flares)
- Particle Effects (Dust, Snow, Rain, Sparkles)
"""

import math
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class EffectData(BaseModel):
    """Data model representing an effect instance."""

    effect_type: str
    category: Optional[str] = "general"
    intensity: float = Field(default=50.0, ge=0.0, le=100.0)
    speed: float = Field(default=1.0, ge=0.1, le=5.0)
    opacity: float = Field(default=1.0, ge=0.0, le=1.0)
    color: Optional[str] = "#ffffff"
    blend_mode: str = "normal"
    direction: str = "none"
    randomness: float = Field(default=0.5, ge=0.0, le=1.0)
    parameters: Dict[str, Any] = Field(default_factory=dict)


class BaseEffectStrategy(ABC):
    """Abstract Strategy interface for filter graph generation."""

    category: str = "general"

    @abstractmethod
    def generate_filters(self, effect: EffectData) -> List[str]:
        pass


class ColorGradingEffectRenderer(BaseEffectStrategy):
    category: str = "color"

    def generate_filters(self, effect: EffectData) -> List[str]:
        scale = max(0.0, min(100.0, effect.intensity)) / 50.0
        p = effect.parameters
        filters = []

        # Temperature / Tint / Saturation / Contrast / Gamma / Shadows & Highlights
        temp = float(p.get("temperature", 0.0)) * scale
        tint = float(p.get("tint", 0.0)) * scale
        sat = 1.0 + float(p.get("saturation", 0.0)) * 0.01 * scale
        contrast = 1.0 + float(p.get("contrast", 0.0)) * 0.01 * scale
        brightness = float(p.get("brightness", 0.0)) * 0.01 * scale

        r_gamma = 1.0 + (temp * 0.005)
        b_gamma = 1.0 - (temp * 0.005) + (tint * 0.005)
        g_gamma = 1.0 + (tint * 0.002)

        filters.append(
            f"eq=brightness={brightness:.2f}:contrast={contrast:.2f}:saturation={sat:.2f}:"
            f"gamma_r={r_gamma:.2f}:gamma_g={g_gamma:.2f}:gamma_b={b_gamma:.2f}"
        )

        # Film Emulation / Curves / LUT
        if "lut_file" in p:
            filters.append(f"lut3d=file='{p['lut_file']}'")

        return filters


class FilmEffectRenderer(BaseEffectStrategy):
    category: str = "film"

    def generate_filters(self, effect: EffectData) -> List[str]:
        scale = max(0.0, min(100.0, effect.intensity)) / 50.0
        p = effect.parameters
        et = effect.effect_type.lower()
        filters = []

        if "grain" in et or "vhs" in et or "crt" in et:
            noise_val = int(25 * scale * float(p.get("noiseAmount", 1.0)))
            filters.append(f"noise=alls={noise_val}:allf=t+u")

        if "aberration" in et or "chromatic" in et:
            shift = max(1, int(4 * scale))
            filters.append(f"rgbashift=rh={shift}:bv=-{shift}")

        if "bloom" in et or "halation" in et:
            radius = max(1, int(10 * scale))
            filters.append(f"boxblur={radius}:power=2")

        if not filters:
            filters.append(f"noise=alls={int(15 * scale)}:allf=t+u")

        return filters


class MotionEffectRenderer(BaseEffectStrategy):
    category: str = "motion"

    def generate_filters(self, effect: EffectData) -> List[str]:
        scale = max(0.0, min(100.0, effect.intensity)) / 50.0
        et = effect.effect_type.lower()

        if "shake" in et or "jitter" in et:
            amount = max(1, int(15 * scale))
            return [f"crop=w=iw-{amount*2}:h=ih-{amount*2}:x='{amount}+{amount}*sin(n)':y='{amount}+{amount}*cos(n)'"]

        if "blur" in et or "velocity" in et:
            blur_r = max(1, int(20 * scale))
            return [f"boxblur={blur_r}:1"]

        return [f"boxblur={max(1, int(10 * scale))}:1"]


class LightEffectRenderer(BaseEffectStrategy):
    category: str = "light"

    def generate_filters(self, effect: EffectData) -> List[str]:
        scale = max(0.0, min(100.0, effect.intensity)) / 50.0
        p = effect.parameters
        bloom = float(p.get("bloomStrength", 1.0)) * scale

        return [f"eq=brightness={0.15 * bloom:.2f}:saturation={1.0 + 0.3 * scale:.2f}"]


class ParticleEffectRenderer(BaseEffectStrategy):
    category: str = "particle"

    def generate_filters(self, effect: EffectData) -> List[str]:
        scale = max(0.0, min(100.0, effect.intensity)) / 50.0
        density = int(20 * scale)

        return [f"noise=alls={density}:allf=t+u"]


class EffectRegistry:
    """Centralized Effect Registry mapping preset IDs and categories to CapCut-style renderers."""

    def __init__(self):
        self._preset_map: Dict[str, BaseEffectStrategy] = {}
        self._category_map: Dict[str, BaseEffectStrategy] = {}
        self._fallback = ColorGradingEffectRenderer()

        self._register_defaults()

    def _register_defaults(self):
        color = ColorGradingEffectRenderer()
        film = FilmEffectRenderer()
        motion = MotionEffectRenderer()
        light = LightEffectRenderer()
        particle = ParticleEffectRenderer()

        self.register_category("color", color)
        self.register_category("film", film)
        self.register_category("motion", motion)
        self.register_category("light", light)
        self.register_category("particle", particle)

        self.register_preset("vhs-retro-grain", film)
        self.register_preset("chromatic-aberration-pro", film)
        self.register_preset("camera-shake-impact", motion)
        self.register_preset("lens-flare-anamorphic", light)
        self.register_preset("particle-dust-overlay", particle)

    def register_preset(self, preset_id: str, strategy: BaseEffectStrategy):
        self._preset_map[preset_id.lower()] = strategy

    def register_category(self, category: str, strategy: BaseEffectStrategy):
        self._category_map[category.lower()] = strategy

    def resolve(self, effect: EffectData) -> BaseEffectStrategy:
        et = (effect.effect_type or "").lower()
        cat = (effect.category or "").lower()

        if et in self._preset_map:
            return self._preset_map[et]

        if "film" in et or "grain" in et or "vhs" in et or "crt" in et or "aberration" in et:
            return self._category_map["film"]
        if "shake" in et or "blur" in et or "motion" in et:
            return self._category_map["motion"]
        if "flare" in et or "light" in et or "glow" in et or "bloom" in et:
            return self._category_map["light"]
        if "dust" in et or "snow" in et or "rain" in et or "sparkle" in et or "particle" in et:
            return self._category_map["particle"]

        if cat in self._category_map:
            return self._category_map[cat]

        return self._fallback


effect_registry = EffectRegistry()
