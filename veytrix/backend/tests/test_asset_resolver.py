"""Unit and integration tests for AssetResolver and Asset Rendering Layer."""

import pytest
from app.models.enums import AssetType, PlanType
from app.models.render_definition import RenderDefinition, RenderKind, StackedRenderDefinition
from app.models.timeline import ClipModel, EffectData, FilterData, TransitionData
from app.services.asset_resolver import AssetResolver, PluginRegistry, RenderPlugin


@pytest.fixture
def resolver():
    return AssetResolver()


def test_resolve_effect_all_catalogs(resolver):
    # Test resolving effect from 450 mapped catalog
    for i in range(1, 451, 50):
        eff_id = f"fx-{i:03d}"
        eff_data = EffectData(effect_id=eff_id, parameters={"intensity": 0.9})
        render_def = resolver.resolve_effect(eff_data, user_id=None)

        assert isinstance(render_def, RenderDefinition)
        assert render_def.id == eff_id
        assert render_def.kind == RenderKind.EFFECT
        assert render_def.asset_type == AssetType.EFFECT
        assert len(render_def.filter_chain) > 0


def test_resolve_filter_all_catalogs(resolver):
    # Test resolving filter from 200 mapped catalog
    for i in range(1, 201, 25):
        filt_id = f"fl-{i:03d}"
        filt_data = FilterData(filter_id=filt_id, intensity=0.75)
        render_def = resolver.resolve_filter(filt_data, user_id=None)

        assert isinstance(render_def, RenderDefinition)
        assert render_def.id == filt_id
        assert render_def.kind == RenderKind.FILTER
        assert render_def.asset_type == AssetType.FILTER
        assert len(render_def.filter_chain) > 0


def test_resolve_transition_all_catalogs(resolver):
    # Test resolving transition from 200 mapped catalog
    for i in range(1, 201, 25):
        t_id = f"tr-{i:03d}"
        trans_data = TransitionData(transition_type=t_id, duration=0.8, direction="left")
        render_def = resolver.resolve_transition(trans_data, user_id=None)

        assert isinstance(render_def, RenderDefinition)
        assert render_def.kind == RenderKind.TRANSITION
        assert render_def.parameters["duration"] == 0.8


def test_stacking_and_layer_priority(resolver):
    clip = ClipModel(
        track_id="track-1",
        start_time=0.0,
        end_time=5.0,
        duration=5.0,
        effect=EffectData(effect_id="fx-001", parameters={"intensity": 0.8}),
        filter=FilterData(filter_id="fl-001", intensity=0.9),
        transition=TransitionData(transition_type="tr-001", duration=0.5),
    )

    stack: StackedRenderDefinition = resolver.resolve_clip_stack(clip, user_id=None)
    assert len(stack.effects) == 1
    assert len(stack.filters) == 1
    assert stack.transition is not None
    assert len(stack.combined_filter_chain) == 3



def test_plugin_architecture_extensibility(resolver):
    class CustomHologramPlugin(RenderPlugin):
        def can_handle(self, engine_key: str, category: str) -> bool:
            return "hologram" in engine_key.lower()

        def generate_render_definition(self, **kwargs) -> RenderDefinition:
            res = super().generate_render_definition(**kwargs)
            res.filter_chain = ["colorchannelmixer=0.2:0.8:0.2:0:0.8:0.2:0.2:0:0.2:0.2:0.8"]
            return res

    registry = PluginRegistry()
    registry.register_plugin(CustomHologramPlugin())
    custom_resolver = AssetResolver(plugin_registry=registry)

    eff_data = EffectData(effect_id="fx-custom", engine_key="fx_engine_v1_hologram_999")
    render_def = custom_resolver.resolve_effect(eff_data)

    assert render_def.filter_chain == ["colorchannelmixer=0.2:0.8:0.2:0:0.8:0.2:0.2:0:0.2:0.2:0.8"]


def test_entitlement_integration_plan_restrictions(resolver):
    # fx-003 requires PRO or PREMIUM plan
    eff_data = EffectData(effect_id="fx-003")

    # FREE plan user -> user_has_access should be False
    render_def_free = resolver.resolve_effect(eff_data, user_id=None)
    assert render_def_free.required_plan in (PlanType.PRO, PlanType.PREMIUM)
    assert render_def_free.user_has_access is False
