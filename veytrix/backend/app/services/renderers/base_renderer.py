"""
Phase B Architecture: Reusable Renderer System for Export Engine

Core Hierarchy:
  BaseRenderer
    ↓
  FilterRenderer / EffectRenderer / TransitionRenderer
    ↓
  Category Renderers (BlurRenderer, CameraRenderer, GlitchRenderer, RetroRenderer, LightRenderer, CinematicRenderer, TransitionRenderer, FilterRenderer)

This architecture provides a scalable, modular, metadata-driven renderer system that eliminates hardcoded FFmpeg logic in FFmpegBuilder.
"""

from abc import ABC, abstractmethod
import math
from typing import Any, Dict, List, Optional, Tuple, Union

from app.models.enums import AssetType, PlanType
from app.models.render_definition import RenderDefinition, RenderKind


class ParameterValidationError(ValueError):
    """Exception raised when renderer parameter validation fails."""
    pass


class BaseRenderer(ABC):
    """
    Abstract Base Renderer.
    Defines common interfaces for all renderers:
    - validate(params)
    - build(...)
    - generateFilters(...)
    - generateTransitions(...)
    - generateMetadata(...)
    - validateParameters(...)
    """

    renderer_id: str = "base"
    category: str = "general"

    def validate_parameters(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates parameters: Intensity, Strength, Radius, Amount, Opacity, Scale,
        Rotation, Speed, Direction, Duration, Curve, Interpolation, Blend Mode.
        Rejects invalid values (raising ParameterValidationError).
        Returns sanitized/normalized parameters.
        """
        sanitized = dict(parameters)

        # Helper numeric validator
        def check_range(key: str, min_val: Optional[float] = None, max_val: Optional[float] = None, default: Optional[float] = None):
            if key in sanitized and sanitized[key] is not None:
                try:
                    val = float(sanitized[key])
                    if min_val is not None and val < min_val:
                        raise ParameterValidationError(f"Parameter '{key}' value {val} is below minimum {min_val}")
                    if max_val is not None and val > max_val:
                        raise ParameterValidationError(f"Parameter '{key}' value {val} is above maximum {max_val}")
                    sanitized[key] = val
                except (ValueError, TypeError) as e:
                    if isinstance(e, ParameterValidationError):
                        raise
                    raise ParameterValidationError(f"Parameter '{key}' must be a valid number, got '{sanitized[key]}'")
            elif default is not None:
                sanitized[key] = default

        # Validate standard properties
        check_range("intensity", 0.0, 100.0)
        check_range("strength", 0.0, 100.0)
        check_range("radius", 0.0, 1000.0)
        check_range("amount", 0.0, 100.0)
        check_range("opacity", 0.0, 100.0)
        check_range("scale", 0.01, 100.0)
        check_range("rotation", -3600.0, 3600.0)
        check_range("speed", 0.0, 100.0)
        check_range("duration", 0.0, 3600.0)

        # Enum & String Validations
        valid_directions = {"left", "right", "up", "down", "in", "out", "center", "horizontal", "vertical", "none", ""}
        if "direction" in sanitized and sanitized["direction"] is not None:
            dir_val = str(sanitized["direction"]).lower()
            if dir_val not in valid_directions:
                raise ParameterValidationError(f"Invalid direction '{sanitized['direction']}'. Must be one of {valid_directions}")
            sanitized["direction"] = dir_val

        valid_curves = {"linear", "ease_in", "ease_out", "ease_in_out", "bounce", "exponential", "bezier", "smooth", ""}
        if "curve" in sanitized and sanitized["curve"] is not None:
            c_val = str(sanitized["curve"]).lower()
            if c_val not in valid_curves:
                raise ParameterValidationError(f"Invalid curve '{sanitized['curve']}'. Must be one of {valid_curves}")
            sanitized["curve"] = c_val

        valid_interpolations = {"linear", "bilinear", "bicubic", "nearest", "spline", "step", ""}
        if "interpolation" in sanitized and sanitized["interpolation"] is not None:
            interp_val = str(sanitized["interpolation"]).lower()
            if interp_val not in valid_interpolations:
                raise ParameterValidationError(f"Invalid interpolation '{sanitized['interpolation']}'. Must be one of {valid_interpolations}")
            sanitized["interpolation"] = interp_val

        valid_blend_modes = {
            "normal", "multiply", "screen", "overlay", "darken", "lighten", "color_dodge",
            "color_burn", "hard_light", "soft_light", "difference", "exclusion", "add", "subtract", "average", ""
        }
        if "blend_mode" in sanitized and sanitized["blend_mode"] is not None:
            bm_val = str(sanitized["blend_mode"]).lower()
            if bm_val not in valid_blend_modes:
                raise ParameterValidationError(f"Invalid blend_mode '{sanitized['blend_mode']}'. Must be one of {valid_blend_modes}")
            sanitized["blend_mode"] = bm_val

        return sanitized

    def validate(self, parameters: Dict[str, Any]) -> bool:
        """Convenience method returning True if parameters are valid, False otherwise."""
        try:
            self.validate_parameters(parameters)
            return True
        except ParameterValidationError:
            return False

    @abstractmethod
    def generate_filters(
        self,
        item_id: str,
        parameters: Dict[str, Any],
        metadata: Dict[str, Any],
    ) -> List[str]:
        """Generates FFmpeg filter graph strings for this renderer."""
        pass

    def generate_transitions(
        self,
        item_id: str,
        parameters: Dict[str, Any],
        metadata: Dict[str, Any],
        duration: float = 1.0,
    ) -> List[str]:
        """Generates transition FFmpeg graph instructions if supported by renderer."""
        return []

    def generate_metadata(
        self,
        item_id: str,
        parameters: Dict[str, Any],
        metadata: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Generates output metadata describing the applied renderer state."""
        return {
            "renderer": self.__class__.__name__,
            "category": self.category,
            "item_id": item_id,
            "parameters": parameters,
        }

    def build(
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
        """Builds a complete RenderDefinition container."""
        params = parameters if parameters is not None else kwargs.get("parameters", {})
        meta = metadata if metadata is not None else kwargs.get("metadata", {})

        # Sanitize parameters
        sanitized_params = self.validate_parameters(params)

        if kind == RenderKind.TRANSITION or asset_type == AssetType.TRANSITION:
            filters = self.generate_transitions(item_id, sanitized_params, meta, duration=float(sanitized_params.get("duration", 1.0)))
        else:
            filters = self.generate_filters(item_id, sanitized_params, meta)

        meta_out = self.generate_metadata(item_id, sanitized_params, meta)

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
            parameters=sanitized_params,
            filter_chain=filters,
            layer_priority=self.get_layer_priority(item_id),
            user_has_access=user_has_access,
            metadata=meta_out,
        )

    def get_layer_priority(self, item_id: str) -> int:
        return 5

    def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
        """Determines if this renderer can handle the given asset metadata."""
        if not category:
            return False
        return category.lower() == self.category.lower()
