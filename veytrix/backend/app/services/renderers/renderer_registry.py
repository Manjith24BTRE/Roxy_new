"""Renderer Registry for registering, resolving, validating, caching, and extending renderers."""

from typing import Dict, List, Optional
from app.models.enums import AssetType
from app.services.renderers.base_renderer import BaseRenderer
from app.services.renderers.category_renderers import (
    AIRenderer,
    AudioRenderer,
    BasicRenderer,
    BlurRenderer,
    CameraRenderer,
    CinematicRenderer,
    EffectRenderer,
    FilterRenderer,
    GlitchRenderer,
    LightRenderer,
    RetroRenderer,
    TextRenderer,
    ThreeDRenderer,
    TransitionRenderer,
)


class RendererRegistry:
    """
    Central RendererRegistry.
    Responsibilities:
    - Register renderers
    - Resolve renderer by category, engine_key, asset_type, or item_id
    - Validate renderer availability
    - Return renderer instance
    - Cache renderer nodes for performance optimization
    - Allow future renderer plugins
    """

    def __init__(self):
        self._renderers: List[BaseRenderer] = []
        self._cache: Dict[str, BaseRenderer] = {}
        self._register_default_renderers()

    def _register_default_renderers(self):
        """Registers default core category renderers."""
        default_instances = [
            BlurRenderer(),
            CameraRenderer(),
            GlitchRenderer(),
            CinematicRenderer(),
            LightRenderer(),
            RetroRenderer(),
            ThreeDRenderer(),
            FilterRenderer(),
            TransitionRenderer(),
            TextRenderer(),
            AudioRenderer(),
            AIRenderer(),
            EffectRenderer(),
            BasicRenderer(),
        ]
        for renderer in default_instances:
            self._renderers.append(renderer)

    def register_renderer(self, renderer: BaseRenderer):
        """Registers a renderer instance at the top of the chain."""
        self._renderers.insert(0, renderer)
        self._cache.clear()

    def get_renderer(
        self,
        engine_key: str = "",
        category: str = "",
        asset_type: Optional[AssetType] = None,
        item_id: str = "",
    ) -> BaseRenderer:
        """
        Resolves renderer by category/engine_key/asset_type/item_id.
        Caches key resolutions to eliminate lookup overhead.
        """
        cache_key = f"{engine_key}:{category}:{asset_type}:{item_id}".lower()
        if cache_key in self._cache:
            return self._cache[cache_key]

        for renderer in self._renderers:
            try:
                if renderer.can_handle(engine_key, category, asset_type, item_id):
                    self._cache[cache_key] = renderer
                    return renderer
            except TypeError:
                try:
                    if renderer.can_handle(engine_key, category, asset_type):
                        self._cache[cache_key] = renderer
                        return renderer
                except TypeError:
                    if renderer.can_handle(engine_key, category):
                        self._cache[cache_key] = renderer
                        return renderer

        fallback = self._renderers[-1]
        self._cache[cache_key] = fallback
        return fallback

    def validate_renderer_availability(self, category: str, engine_key: str = "") -> bool:
        """Validates if a specialized renderer is registered and available for a given category."""
        r = self.get_renderer(engine_key=engine_key, category=category)
        return r is not None and r.__class__ != BasicRenderer

    def list_registered_renderers(self) -> List[str]:
        """Returns list of registered renderer names."""
        return [r.__class__.__name__ for r in self._renderers]


# Global singleton instance
renderer_registry = RendererRegistry()
