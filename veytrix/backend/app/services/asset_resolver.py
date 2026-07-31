"""Asset Rendering Layer & Plugin Architecture: AssetResolver, PluginRegistry, and metadata-driven translation components."""

from typing import Any, Dict, List, Optional, Type
from uuid import UUID

from app.core.catalog_data import get_effects_catalog, get_filters_catalog, get_transitions_catalog
from app.core.plans import is_plan_sufficient
from app.models.enums import AssetType, PlanType
from app.models.render_definition import RenderDefinition, RenderKind, StackedRenderDefinition
from app.models.timeline import ClipModel, EffectData, FilterData, TimelineModel, TrackModel, TransitionData
from app.services.asset_service import AssetService
from app.services.entitlement_service import EntitlementService


class RenderPlugin:
    """Base class for plugin-based render definition generators."""

    plugin_type: str = "generic"

    def can_handle(self, engine_key: str, category: str) -> bool:
        return True

    def generate_render_definition(
        self,
        item_id: str,
        name: str,
        kind: RenderKind,
        asset_type: AssetType,
        engine_key: str,
        category: str,
        required_plan: PlanType,
        enabled: bool,
        user_has_access: bool,
        parameters: Dict[str, Any],
        metadata: Dict[str, Any],
    ) -> RenderDefinition:
        """Translates asset metadata into reusable RenderDefinition without executing FFmpeg."""
        filter_chain: List[str] = []

        if kind == RenderKind.EFFECT:
            intensity = float(parameters.get("intensity", metadata.get("intensity", 0.8)))
            preset = parameters.get("preset_id", metadata.get("preset_id", "default"))

            if "glitch" in category.lower() or "glitch" in engine_key.lower():
                filter_chain = [f"noise=alls={int(20 * intensity)}:allf=t+u", f"chromashift=cx={int(5 * intensity)}"]
            elif "blur" in category.lower() or "blur" in engine_key.lower():
                r = int(15 * intensity)
                filter_chain = [f"boxblur={r}:{r}"]
            elif "retro" in category.lower() or "vhs" in category.lower():
                filter_chain = ["curves=vintage", f"eq=saturation={1.0 + (0.3 * intensity):.2f}"]
            elif "cinematic" in category.lower():
                filter_chain = [f"eq=contrast={1.0 + (0.2 * intensity):.2f}:saturation={1.0 + (0.1 * intensity):.2f}"]
            else:
                filter_chain = [f"eq=contrast={1.0 + (0.15 * intensity):.2f}:brightness=0.05"]

        elif kind == RenderKind.FILTER:
            intensity = float(parameters.get("intensity", 1.0))
            if "warm" in category.lower():
                filter_chain = [f"eq=gamma_r={1.0 + (0.2 * intensity):.2f}:saturation={1.0 + (0.3 * intensity):.2f}"]
            elif "cool" in category.lower():
                filter_chain = [f"eq=gamma_b={1.0 + (0.25 * intensity):.2f}:contrast={1.0 + (0.1 * intensity):.2f}"]
            elif "monochrome" in category.lower():
                filter_chain = [f"hue=s={1.0 - intensity:.2f}"]
            else:
                filter_chain = [f"eq=contrast={1.0 + (0.15 * intensity):.2f}"]

        elif kind == RenderKind.TRANSITION:
            duration = float(parameters.get("duration", metadata.get("default_duration_ms", 500) / 1000.0))
            direction = str(parameters.get("direction", "left"))
            filter_chain = [f"xfade=transition={category.lower().split()[0]}:duration={duration:.2f}"]

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
            parameters=parameters,
            filter_chain=filter_chain,
            layer_priority=10 if kind == RenderKind.EFFECT else (5 if kind == RenderKind.FILTER else 1),
            user_has_access=user_has_access,
            metadata=metadata,
        )


class PluginRegistry:
    """Plugin registry for extending rendering definitions without modifying backend code."""

    def __init__(self):
        self._plugins: List[RenderPlugin] = [RenderPlugin()]

    def register_plugin(self, plugin: RenderPlugin):
        self._plugins.insert(0, plugin)

    def get_plugin(self, engine_key: str, category: str) -> RenderPlugin:
        for plugin in self._plugins:
            if plugin.can_handle(engine_key, category):
                return plugin
        return self._plugins[-1]


class AssetResolver:
    """Production Asset Resolver translating frontend timeline & asset metadata into reusable RenderDefinitions."""

    def __init__(
        self,
        asset_service: Optional[AssetService] = None,
        entitlement_service: Optional[EntitlementService] = None,
        plugin_registry: Optional[PluginRegistry] = None,
    ):
        self.asset_service = asset_service or AssetService()
        self.entitlement_service = entitlement_service or EntitlementService()
        self.plugin_registry = plugin_registry or PluginRegistry()

        # Build in-memory lookup catalogs for fast metadata resolution
        self._effects_map = {e.id: e for e in get_effects_catalog()}
        self._filters_map = {f.id: f for f in get_filters_catalog()}
        self._transitions_map = {t.id: t for t in get_transitions_catalog()}

    def _get_user_plan(self, user_id: Optional[str]) -> PlanType:
        if not user_id:
            return PlanType.FREE
        try:
            return self.entitlement_service.get_effective_plan(user_id)
        except Exception:
            return PlanType.FREE

    def resolve_effect(self, effect_data: EffectData, user_id: Optional[str] = None) -> RenderDefinition:
        """Resolves an effect metadata request into a reusable RenderDefinition."""
        cat_item = self._effects_map.get(effect_data.effect_id)

        eff_id = effect_data.effect_id
        name = cat_item.name if cat_item else f"Effect {eff_id}"
        engine_key = effect_data.engine_key or (cat_item.engine_key if cat_item else f"fx_{eff_id}")
        category = cat_item.category if cat_item else "General"
        required_plan = cat_item.required_plan if cat_item else effect_data.required_plan
        enabled = cat_item.enabled if cat_item else True
        metadata = cat_item.metadata if cat_item else {}

        user_plan = self._get_user_plan(user_id)
        user_has_access = is_plan_sufficient(user_plan, required_plan)

        plugin = self.plugin_registry.get_plugin(engine_key, category)
        return plugin.generate_render_definition(
            item_id=eff_id,
            name=name,
            kind=RenderKind.EFFECT,
            asset_type=AssetType.EFFECT,
            engine_key=engine_key,
            category=category,
            required_plan=required_plan,
            enabled=enabled,
            user_has_access=user_has_access,
            parameters=effect_data.parameters,
            metadata=metadata,
        )

    def resolve_filter(self, filter_data: FilterData, user_id: Optional[str] = None) -> RenderDefinition:
        """Resolves a filter metadata request into a reusable RenderDefinition."""
        cat_item = self._filters_map.get(filter_data.filter_id)

        filt_id = filter_data.filter_id
        name = cat_item.name if cat_item else f"Filter {filt_id}"
        engine_key = cat_item.engine_key if cat_item else f"fl_{filt_id}"
        category = cat_item.category if cat_item else "Color"
        required_plan = cat_item.required_plan if cat_item else PlanType.FREE
        enabled = cat_item.enabled if cat_item else True
        metadata = cat_item.metadata if cat_item else {}

        user_plan = self._get_user_plan(user_id)
        user_has_access = is_plan_sufficient(user_plan, required_plan)

        params = dict(filter_data.parameters)
        params["intensity"] = filter_data.intensity

        plugin = self.plugin_registry.get_plugin(engine_key, category)
        return plugin.generate_render_definition(
            item_id=filt_id,
            name=name,
            kind=RenderKind.FILTER,
            asset_type=AssetType.FILTER,
            engine_key=engine_key,
            category=category,
            required_plan=required_plan,
            enabled=enabled,
            user_has_access=user_has_access,
            parameters=params,
            metadata=metadata,
        )

    def resolve_transition(self, transition_data: TransitionData, user_id: Optional[str] = None) -> RenderDefinition:
        """Resolves a transition metadata request into a reusable RenderDefinition."""
        t_id = transition_data.transition_type
        cat_item = self._transitions_map.get(t_id)

        name = cat_item.name if cat_item else f"Transition {t_id}"
        engine_key = cat_item.engine_key if cat_item else f"tr_{t_id}"
        category = cat_item.category if cat_item else "Wipe"
        required_plan = cat_item.required_plan if cat_item else PlanType.FREE
        enabled = cat_item.enabled if cat_item else True
        metadata = cat_item.metadata if cat_item else {}

        user_plan = self._get_user_plan(user_id)
        user_has_access = is_plan_sufficient(user_plan, required_plan)

        params = dict(transition_data.parameters)
        params["duration"] = transition_data.duration
        params["direction"] = transition_data.direction

        plugin = self.plugin_registry.get_plugin(engine_key, category)
        return plugin.generate_render_definition(
            item_id=t_id,
            name=name,
            kind=RenderKind.TRANSITION,
            asset_type=AssetType.TRANSITION,
            engine_key=engine_key,
            category=category,
            required_plan=required_plan,
            enabled=enabled,
            user_has_access=user_has_access,
            parameters=params,
            metadata=metadata,
        )

    def resolve_clip_stack(self, clip: ClipModel, user_id: Optional[str] = None) -> StackedRenderDefinition:
        """Resolves all stacked effects, filters, and transitions on a clip into a StackedRenderDefinition."""
        effects: List[RenderDefinition] = []
        filters: List[RenderDefinition] = []
        transition_def: Optional[RenderDefinition] = None
        combined_chain: List[str] = []

        if clip.effect:
            eff_def = self.resolve_effect(clip.effect, user_id)
            effects.append(eff_def)
            combined_chain.extend(eff_def.filter_chain)

        if clip.filter:
            filt_def = self.resolve_filter(clip.filter, user_id)
            filters.append(filt_def)
            combined_chain.extend(filt_def.filter_chain)

        if clip.transition:
            transition_def = self.resolve_transition(clip.transition, user_id)

        return StackedRenderDefinition(
            clip_id=clip.id,
            track_id=clip.track_id,
            effects=effects,
            filters=filters,
            transition=transition_def,
            combined_filter_chain=combined_chain,
        )

    def resolve_timeline_render_definitions(
        self, timeline: TimelineModel, user_id: Optional[str] = None
    ) -> List[StackedRenderDefinition]:
        """Resolves full timeline clip stacks into render definitions."""
        stacks: List[StackedRenderDefinition] = []
        for track in timeline.tracks:
            for clip in track.clips:
                stacks.append(self.resolve_clip_stack(clip, user_id))
        return stacks
