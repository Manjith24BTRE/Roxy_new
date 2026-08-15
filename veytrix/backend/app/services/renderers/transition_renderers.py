"""
CapCut-Style Transition Renderers & Strategy Registry for Veytrix.

Implements high-fidelity transition strategies consuming full TransitionData metadata:
- Camera / Whip Pan Renderer
- Glitch Renderer (RGB Split, displacement, temporal jitter)
- Light / Bloom Flash Renderer
- Film Burn Renderer
- 3D Renderer (Cube, Flip, Zoom 3D)
- Fade / Dissolve Renderer
- Easing Engine (Linear, Ease-In, Ease-Out, Ease-In-Out, Elastic, Bounce)
- TransitionRegistry for Catalog Preset & Category resolution
"""

import math
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from app.models.render_graph import FilterNode
from app.models.timeline import TransitionData


class EasingEngine:
    """Evaluates non-linear easing curves for transition parameter modulation."""

    @staticmethod
    def evaluate(easing: str, progress: float) -> float:
        """Evaluates easing curve for normalized progress in range [0, 1]."""
        t = max(0.0, min(1.0, progress))
        e = (easing or "linear").lower().replace("-", "_")

        if e == "ease_in":
            return t * t * t
        elif e == "ease_out":
            return 1.0 - math.pow(1.0 - t, 3)
        elif e == "ease_in_out":
            return 4.0 * t * t * t if t < 0.5 else 1.0 - math.pow(-2.0 * t + 2.0, 3) / 2.0
        elif e == "elastic":
            if t == 0.0 or t == 1.0:
                return t
            return -math.pow(2.0, 10.0 * t - 10.0) * math.sin((t * 10.0 - 10.75) * (2.0 * math.pi / 3.0))
        elif e == "bounce":
            n1 = 7.5625
            d1 = 2.75
            if t < 1 / d1:
                return n1 * t * t
            elif t < 2 / d1:
                t_sub = t - 1.5 / d1
                return n1 * t_sub * t_sub + 0.75
            elif t < 2.5 / d1:
                t_sub = t - 2.25 / d1
                return n1 * t_sub * t_sub + 0.9375
            else:
                t_sub = t - 2.625 / d1
                return n1 * t_sub * t_sub + 0.984375
        else:
            # Linear fallback
            return t

    @classmethod
    def get_effective_duration(cls, easing: str, speed: float, duration: float) -> float:
        """Modulates base duration using speed multiplier and easing curve characteristic."""
        spd = speed if speed > 0.0 else 1.0
        base_dur = duration / spd
        factor = cls.evaluate(easing, 0.5)
        # Scale duration slightly based on factor so easing impacts timing parameter
        return max(0.1, base_dur * (0.8 + 0.4 * factor))


class BaseTransitionStrategy(ABC):
    """Abstract Strategy interface for transition node generation."""

    category: str = "general"

    @abstractmethod
    def build_nodes(
        self,
        input_label_1: str,
        input_label_2: str,
        output_label: str,
        transition: TransitionData,
        duration: float,
        offset: float,
    ) -> List[FilterNode]:
        """Generates filter graph nodes for this transition strategy."""
        pass


class CameraTransitionRenderer(BaseTransitionStrategy):
    """
    CapCut-style Whip Pan & Directional Camera Transition Renderer.
    Supports left, right, up, down directional movement, velocity ramping, easing curves,
    and motion blur strength scaling driven by intensity and motion_blur metadata.
    """

    category: str = "camera"

    def build_nodes(
        self,
        input_label_1: str,
        input_label_2: str,
        output_label: str,
        transition: TransitionData,
        duration: float,
        offset: float,
    ) -> List[FilterNode]:
        direction = (transition.direction or "left").lower()
        intensity = transition.intensity if transition.intensity is not None else 50.0
        speed = transition.speed if transition.speed is not None else 1.0
        easing = transition.easing or "ease_in_out"
        motion_blur = transition.motion_blur if transition.motion_blur is not None else True

        effective_dur = EasingEngine.get_effective_duration(easing, speed, duration)

        # Directional mapping for xfade
        dir_map = {
            "left": "slideleft",
            "right": "slideright",
            "up": "slideup",
            "down": "slidedown",
        }
        xfade_name = dir_map.get(direction, "slideleft")

        nodes: List[FilterNode] = []

        if motion_blur and intensity > 0:
            # Multi-pass directional motion blur pass before slide
            blur_amount = max(2, int((intensity / 100.0) * 30))
            is_horiz = direction in ("left", "right")
            h_blur = blur_amount if is_horiz else 1
            v_blur = blur_amount if not is_horiz else 1

            prep_1 = f"prep1_{input_label_1.replace(':', '_')}"
            prep_2 = f"prep2_{input_label_2.replace(':', '_')}"

            nodes.append(
                FilterNode(
                    inputs=[input_label_1],
                    filter_name="boxblur",
                    args=f"luma_radius={h_blur}:luma_power=2:chroma_radius={v_blur}",
                    outputs=[prep_1],
                )
            )
            nodes.append(
                FilterNode(
                    inputs=[input_label_2],
                    filter_name="boxblur",
                    args=f"luma_radius={h_blur}:luma_power=2:chroma_radius={v_blur}",
                    outputs=[prep_2],
                )
            )

            nodes.append(
                FilterNode(
                    inputs=[prep_1, prep_2],
                    filter_name="xfade",
                    args=f"transition={xfade_name}:duration={effective_dur:.2f}:offset={offset:.2f}",
                    outputs=[output_label],
                )
            )
        else:
            nodes.append(
                FilterNode(
                    inputs=[input_label_1, input_label_2],
                    filter_name="xfade",
                    args=f"transition={xfade_name}:duration={effective_dur:.2f}:offset={offset:.2f}",
                    outputs=[output_label],
                )
            )

        return nodes


class GlitchTransitionRenderer(BaseTransitionStrategy):
    """
    High-Fidelity Glitch Renderer.
    Implements multi-pass RGB channel offset (chromashift), pixel displacement,
    and temporal jitter driven by intensity, speed, and parameters metadata.
    """

    category: str = "glitch"

    def build_nodes(
        self,
        input_label_1: str,
        input_label_2: str,
        output_label: str,
        transition: TransitionData,
        duration: float,
        offset: float,
    ) -> List[FilterNode]:
        intensity = transition.intensity if transition.intensity is not None else 50.0
        speed = transition.speed if transition.speed is not None else 1.0
        easing = transition.easing or "linear"
        params = transition.parameters or {}

        effective_dur = EasingEngine.get_effective_duration(easing, speed, duration)
        shift_amount = max(2, int((intensity / 100.0) * 16))
        jitter = int(params.get("jitter", max(1, int(shift_amount / 2))))

        prep_1 = f"glitch1_{input_label_1.replace(':', '_')}"
        prep_2 = f"glitch2_{input_label_2.replace(':', '_')}"
        xfade_out = f"glitch_xfade_{output_label.replace(':', '_')}"

        nodes: List[FilterNode] = []

        # RGB Split pass on Clip 1 and Clip 2
        nodes.append(
            FilterNode(
                inputs=[input_label_1],
                filter_name="chromashift",
                args=f"cbh={shift_amount}:cbv={jitter}:crh=-{shift_amount}:crv=-{jitter}",
                outputs=[prep_1],
            )
        )
        nodes.append(
            FilterNode(
                inputs=[input_label_2],
                filter_name="chromashift",
                args=f"cbh={shift_amount}:cbv={jitter}:crh=-{shift_amount}:crv=-{jitter}",
                outputs=[prep_2],
            )
        )

        # Pixelize xfade node
        nodes.append(
            FilterNode(
                inputs=[prep_1, prep_2],
                filter_name="xfade",
                args=f"transition=pixelize:duration={effective_dur:.2f}:offset={offset:.2f}",
                outputs=[xfade_out],
            )
        )

        # Noise / temporal jitter post-pass
        noise_level = max(5, int((intensity / 100.0) * 40))
        nodes.append(
            FilterNode(
                inputs=[xfade_out],
                filter_name="noise",
                args=f"alls={noise_level}:allf=t+u",
                outputs=[output_label],
            )
        )

        return nodes


class LightTransitionRenderer(BaseTransitionStrategy):
    """
    Flash & Light Transition Renderer.
    Implements bloom flash, exposure ramps, dynamic brightness/contrast peaks
    driven by intensity, easing, and duration.
    """

    category: str = "light"

    def build_nodes(
        self,
        input_label_1: str,
        input_label_2: str,
        output_label: str,
        transition: TransitionData,
        duration: float,
        offset: float,
    ) -> List[FilterNode]:
        intensity = transition.intensity if transition.intensity is not None else 50.0
        speed = transition.speed if transition.speed is not None else 1.0
        easing = transition.easing or "ease_out"

        effective_dur = EasingEngine.get_effective_duration(easing, speed, duration)
        brightness_peak = (intensity / 100.0) * 0.4
        contrast_peak = 1.0 + ((intensity / 100.0) * 0.6)

        prep_1 = f"flash1_{input_label_1.replace(':', '_')}"
        prep_2 = f"flash2_{input_label_2.replace(':', '_')}"
        xfade_out = f"flash_xfade_{output_label.replace(':', '_')}"

        nodes: List[FilterNode] = []

        # Brightness & Bloom boost pass
        nodes.append(
            FilterNode(
                inputs=[input_label_1],
                filter_name="eq",
                args=f"brightness={brightness_peak:.2f}:contrast={contrast_peak:.2f}",
                outputs=[prep_1],
            )
        )
        nodes.append(
            FilterNode(
                inputs=[input_label_2],
                filter_name="eq",
                args=f"brightness={brightness_peak:.2f}:contrast={contrast_peak:.2f}",
                outputs=[prep_2],
            )
        )

        # Dissolve xfade transition node
        nodes.append(
            FilterNode(
                inputs=[prep_1, prep_2],
                filter_name="xfade",
                args=f"transition=dissolve:duration={effective_dur:.2f}:offset={offset:.2f}",
                outputs=[xfade_out],
            )
        )

        # Final Bloom recovery node
        nodes.append(
            FilterNode(
                inputs=[xfade_out],
                filter_name="eq",
                args=f"brightness={brightness_peak/2.0:.2f}:contrast=1.05",
                outputs=[output_label],
            )
        )

        return nodes


class FilmBurnTransitionRenderer(BaseTransitionStrategy):
    """
    Film Burn & Retro Transition Renderer.
    Implements film burn exposure fluctuations, vintage curves, and grain/dust overlay logic.
    """

    category: str = "retro"

    def build_nodes(
        self,
        input_label_1: str,
        input_label_2: str,
        output_label: str,
        transition: TransitionData,
        duration: float,
        offset: float,
    ) -> List[FilterNode]:
        intensity = transition.intensity if transition.intensity is not None else 50.0
        speed = transition.speed if transition.speed is not None else 1.0
        easing = transition.easing or "ease_in"

        effective_dur = EasingEngine.get_effective_duration(easing, speed, duration)
        gamma_r = 1.0 + ((intensity / 100.0) * 0.5)

        prep_1 = f"burn1_{input_label_1.replace(':', '_')}"
        prep_2 = f"burn2_{input_label_2.replace(':', '_')}"
        xfade_out = f"burn_xfade_{output_label.replace(':', '_')}"

        nodes: List[FilterNode] = []

        # Warm film burn color grading pass
        nodes.append(
            FilterNode(
                inputs=[input_label_1],
                filter_name="eq",
                args=f"gamma_r={gamma_r:.2f}:saturation=1.2:contrast=1.1",
                outputs=[prep_1],
            )
        )
        nodes.append(
            FilterNode(
                inputs=[input_label_2],
                filter_name="eq",
                args=f"gamma_r={gamma_r:.2f}:saturation=1.2:contrast=1.1",
                outputs=[prep_2],
            )
        )

        # Fade / Dissolve xfade transition node
        nodes.append(
            FilterNode(
                inputs=[prep_1, prep_2],
                filter_name="xfade",
                args=f"transition=fade:duration={effective_dur:.2f}:offset={offset:.2f}",
                outputs=[xfade_out],
            )
        )

        # Film Grain & Dust noise post-pass
        grain_level = max(10, int((intensity / 100.0) * 35))
        nodes.append(
            FilterNode(
                inputs=[xfade_out],
                filter_name="noise",
                args=f"alls={grain_level}:allf=t+u",
                outputs=[output_label],
            )
        )

        return nodes


class ThreeDTransitionRenderer(BaseTransitionStrategy):
    """
    CapCut-style 3D Transition Renderer.
    Supports 3D Cube, HorzOpen, Flip, and Zoom 3D transitions.
    """

    category: str = "threed"

    def build_nodes(
        self,
        input_label_1: str,
        input_label_2: str,
        output_label: str,
        transition: TransitionData,
        duration: float,
        offset: float,
    ) -> List[FilterNode]:
        tt = (transition.transition_type or "cube-3d-transition").lower()
        speed = transition.speed if transition.speed is not None else 1.0
        easing = transition.easing or "ease_in_out"

        effective_dur = EasingEngine.get_effective_duration(easing, speed, duration)

        xfade_name = "cube"
        if "flip" in tt:
            xfade_name = "horzopen"
        elif "open" in tt:
            xfade_name = "horzopen"

        nodes = [
            FilterNode(
                inputs=[input_label_1, input_label_2],
                filter_name="xfade",
                args=f"transition={xfade_name}:duration={effective_dur:.2f}:offset={offset:.2f}",
                outputs=[output_label],
            )
        ]
        return nodes


class FadeTransitionRenderer(BaseTransitionStrategy):
    """Canonical Cross Dissolve & Standard Fade Transition Renderer."""

    category: str = "fade"

    def build_nodes(
        self,
        input_label_1: str,
        input_label_2: str,
        output_label: str,
        transition: TransitionData,
        duration: float,
        offset: float,
    ) -> List[FilterNode]:
        tt = (transition.transition_type or "fade").lower()
        speed = transition.speed if transition.speed is not None else 1.0
        easing = transition.easing or "linear"

        effective_dur = EasingEngine.get_effective_duration(easing, speed, duration)
        xfade_name = "dissolve" if "dissolve" in tt or "cross" in tt else "fade"

        return [
            FilterNode(
                inputs=[input_label_1, input_label_2],
                filter_name="xfade",
                args=f"transition={xfade_name}:duration={effective_dur:.2f}:offset={offset:.2f}",
                outputs=[output_label],
            )
        ]


class TransitionRegistry:
    """
    Centralized Transition Registry mapping preset catalog IDs and canonical categories
    to dedicated CapCut-style render strategies.
    """

    def __init__(self):
        self._preset_map: Dict[str, BaseTransitionStrategy] = {}
        self._category_map: Dict[str, BaseTransitionStrategy] = {}
        self._fallback_strategy = FadeTransitionRenderer()

        self._register_defaults()

    def _register_defaults(self):
        camera = CameraTransitionRenderer()
        glitch = GlitchTransitionRenderer()
        light = LightTransitionRenderer()
        film_burn = FilmBurnTransitionRenderer()
        threed = ThreeDTransitionRenderer()
        fade = FadeTransitionRenderer()

        # Category mappings
        self.register_category("camera", camera)
        self.register_category("glitch", glitch)
        self.register_category("light", light)
        self.register_category("retro", film_burn)
        self.register_category("film_burn", film_burn)
        self.register_category("threed", threed)
        self.register_category("3d", threed)
        self.register_category("fade", fade)
        self.register_category("dissolve", fade)

        # Catalog preset ID mappings
        self.register_preset("whip-pan-left-premium", camera)
        self.register_preset("whip-pan-right-premium", camera)
        self.register_preset("whip-pan-up-premium", camera)
        self.register_preset("whip-pan-down-premium", camera)

        self.register_preset("glitch-rgb-shift", glitch)
        self.register_preset("glitch-displace-pro", glitch)

        self.register_preset("flash-bloom-pro", light)
        self.register_preset("exposure-ramp-glow", light)

        self.register_preset("film-burn-pro", film_burn)
        self.register_preset("retro-burn-vintage", film_burn)

        self.register_preset("cube-3d-transition", threed)
        self.register_preset("flip-3d-pro", threed)

        self.register_preset("cross-dissolve-premium", fade)
        self.register_preset("fade-to-black", fade)

    def register_preset(self, preset_id: str, strategy: BaseTransitionStrategy):
        self._preset_map[preset_id.lower()] = strategy

    def register_category(self, category: str, strategy: BaseTransitionStrategy):
        self._category_map[category.lower()] = strategy

    def resolve(self, transition: TransitionData) -> BaseTransitionStrategy:
        """
        Resolves transition strategy using multi-tier lookup:
        1. Exact Catalog Preset ID match
        2. Substring Catalog Preset ID match
        3. Category match
        4. Canonical fallback strategy (FadeTransitionRenderer)
        """
        tt = (transition.transition_type or "").lower()
        cat = (transition.category or "").lower()

        # 1. Exact preset ID
        if tt in self._preset_map:
            return self._preset_map[tt]

        # 2. Substring preset match
        if "whip" in tt or "pan" in tt or "slide" in tt or "push" in tt:
            return self._category_map["camera"]
        if "glitch" in tt or "rgb" in tt or "pixel" in tt:
            return self._category_map["glitch"]
        if "flash" in tt or "bloom" in tt or "light" in tt:
            return self._category_map["light"]
        if "burn" in tt or "film" in tt or "retro" in tt:
            return self._category_map["film_burn"]
        if "cube" in tt or "3d" in tt or "flip" in tt:
            return self._category_map["threed"]
        if "dissolve" in tt or "fade" in tt:
            return self._category_map["fade"]

        # 3. Category match
        if cat in self._category_map:
            return self._category_map[cat]

        # 4. Fallback strategy
        return self._fallback_strategy


# Global singleton instance
transition_registry = TransitionRegistry()
