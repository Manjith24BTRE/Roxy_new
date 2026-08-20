"""Unit and integration tests for AssetResolver and Asset Rendering Layer."""

from typing import Any, Dict, Optional
import pytest
from app.models.enums import AssetType, PlanType
from app.models.render_definition import RenderDefinition, RenderKind, StackedRenderDefinition
from app.models.timeline import ClipModel, EffectData, FilterData, TransitionData
from app.services.asset_resolver import AssetResolver, PluginRegistry, RenderPlugin
from app.core.catalog_data import get_effects_catalog, get_filters_catalog, get_transitions_catalog


@pytest.fixture
def resolver():
    return AssetResolver()


def test_resolve_effect_all_catalogs(resolver):
    effects = get_effects_catalog()
    assert len(effects) == 641
    for cat_item in effects[::50]:
        eff_data = EffectData(effect_id=cat_item.id, parameters={"intensity": 0.9})
        render_def = resolver.resolve_effect(eff_data, user_id=None)

        assert isinstance(render_def, RenderDefinition)
        assert render_def.id == cat_item.id
        assert render_def.name == cat_item.name
        assert render_def.kind == RenderKind.EFFECT
        assert render_def.asset_type == AssetType.EFFECT


def test_resolve_filter_all_catalogs(resolver):
    filters = get_filters_catalog()
    assert len(filters) == 214
    for cat_item in filters[::25]:
        filt_data = FilterData(filter_id=cat_item.id, intensity=0.75)
        render_def = resolver.resolve_filter(filt_data, user_id=None)

        assert isinstance(render_def, RenderDefinition)
        assert render_def.id == cat_item.id
        assert render_def.name == cat_item.name
        assert render_def.kind == RenderKind.FILTER
        assert render_def.asset_type == AssetType.FILTER


def test_resolve_transition_all_catalogs(resolver):
    transitions = get_transitions_catalog()
    assert len(transitions) == 200
    for cat_item in transitions[::25]:
        trans_data = TransitionData(transition_type=cat_item.id, duration=0.8, direction="left")
        render_def = resolver.resolve_transition(trans_data, user_id=None)

        assert isinstance(render_def, RenderDefinition)
        assert render_def.id == cat_item.id
        assert render_def.name == cat_item.name
        assert render_def.kind == RenderKind.TRANSITION
        assert render_def.parameters["duration"] == 0.8


def test_stacking_and_layer_priority(resolver):
    clip = ClipModel(
        track_id="track-1",
        start_time=0.0,
        end_time=5.0,
        duration=5.0,
        effect=EffectData(effect_id="blur-gaussian", parameters={"intensity": 0.8}),
        filter=FilterData(filter_id="hollywood-gold", intensity=0.9),
        transition=TransitionData(transition_type="cross-dissolve-premium", duration=0.5),
    )

    stack: StackedRenderDefinition = resolver.resolve_clip_stack(clip, user_id=None)
    assert len(stack.effects) == 1
    assert len(stack.filters) == 1
    assert stack.transition is not None
    assert stack.effects[0].id == "blur-gaussian"
    assert stack.filters[0].id == "hollywood-gold"
    assert stack.transition.id == "cross-dissolve-premium"


def test_plugin_architecture_extensibility(resolver):
    class CustomHologramPlugin(RenderPlugin):
        def can_handle(self, engine_key: str, category: str, asset_type: Optional[AssetType] = None, item_id: str = "") -> bool:
            return "hologram" in engine_key.lower() or "hologram" in category.lower()

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
            res.filter_chain = ["colorchannelmixer=0.2:0.8:0.2:0:0.8:0.2:0.2:0:0.2:0.2:0.8"]
            return res

    registry = PluginRegistry()
    registry.register_plugin(CustomHologramPlugin())
    custom_resolver = AssetResolver(plugin_registry=registry)

    eff_data = EffectData(effect_id="blur-gaussian", engine_key="hologram_v1")
    render_def = custom_resolver.resolve_effect(eff_data)

    assert render_def.filter_chain == ["colorchannelmixer=0.2:0.8:0.2:0:0.8:0.2:0.2:0:0.2:0.2:0.8"]


def test_entitlement_integration_plan_restrictions(resolver):
    eff_data = EffectData(effect_id="blur-gaussian")
    render_def_free = resolver.resolve_effect(eff_data, user_id=None)
    assert render_def_free.required_plan == PlanType.FREE
    assert render_def_free.user_has_access is True
