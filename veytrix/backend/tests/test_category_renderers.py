"""Automated unit and integration tests for Category Renderers, Asset Resolver, and Render Logic."""

import pytest
from app.models.enums import AssetType, PlanType
from app.models.render_definition import RenderDefinition, RenderKind, StackedRenderDefinition
from app.models.timeline import ClipModel, EffectData, FilterData, TimelineModel, TrackModel, TransitionData
from app.services.asset_resolver import AssetResolver, PluginRegistry
from app.services.renderers import (
    AIRenderer,
    AudioRenderer,
    BasicRenderer,
    BlurRenderer,
    CameraRenderer,
    CinematicRenderer,
    FilterRenderer,
    GlitchRenderer,
    LightRenderer,
    RetroRenderer,
    TextRenderer,
    ThreeDRenderer,
    TransitionRenderer,
)


@pytest.fixture
def resolver():
    return AssetResolver()


def test_basic_renderer_transforms(resolver):
    eff_data = EffectData(effect_id="basic-transform", parameters={"opacity": 80, "angle": 90, "flip_h": True})
    render_def = resolver.resolve_effect(eff_data)
    assert render_def.kind == RenderKind.EFFECT
    assert len(render_def.filter_chain) > 0


def test_blur_renderer_variants(resolver):
    blur_eff = EffectData(effect_id="blur-gaussian", parameters={"intensity": 60})
    render_def = resolver.resolve_effect(blur_eff)
    assert any("gblur" in f or "boxblur" in f or "sab" in f for f in render_def.filter_chain)


def test_camera_renderer_shake(resolver):
    cam_eff = EffectData(effect_id="camera-shake", parameters={"intensity": 70})
    render_def = resolver.resolve_effect(cam_eff)
    assert any("crop" in f or "rotate" in f or "scale" in f for f in render_def.filter_chain)


def test_glitch_renderer(resolver):
    glitch_eff = EffectData(effect_id="glitch-chromatic", parameters={"intensity": 80})
    render_def = resolver.resolve_effect(glitch_eff)
    assert any("noise" in f or "chromashift" in f for f in render_def.filter_chain)


def test_cinematic_renderer(resolver):
    cine_eff = EffectData(effect_id="cinematic-vignette", parameters={"intensity": 75})
    render_def = resolver.resolve_effect(cine_eff)
    assert any("eq=" in f or "vignette" in f for f in render_def.filter_chain)


def test_filter_renderer_presets(resolver):
    filt_data = FilterData(filter_id="hollywood-gold", intensity=0.9)
    render_def = resolver.resolve_filter(filt_data)
    assert render_def.kind == RenderKind.FILTER
    assert len(render_def.filter_chain) > 0


def test_transition_renderer_xfade(resolver):
    trans_data = TransitionData(transition_type="cross-dissolve-premium", duration=0.8)
    render_def = resolver.resolve_transition(trans_data)
    assert render_def.kind == RenderKind.TRANSITION
    assert any("xfade=" in f for f in render_def.filter_chain)


def test_mixed_effects_filters_transitions_stacking(resolver):
    clip = ClipModel(
        track_id="t1",
        start_time=0.0,
        end_time=5.0,
        duration=5.0,
        effect=EffectData(effect_id="blur-gaussian", parameters={"intensity": 50}),
        filter=FilterData(filter_id="hollywood-gold", intensity=0.8),
        transition=TransitionData(transition_type="cross-dissolve-premium", duration=0.5),
    )

    stack = resolver.resolve_clip_stack(clip)
    assert len(stack.effects) == 1
    assert len(stack.filters) == 1
    assert stack.transition is not None
    assert len(stack.combined_filter_chain) >= 2


def test_multiple_effects_order_preservation(resolver):
    clip = ClipModel(
        track_id="t1",
        start_time=0.0,
        end_time=5.0,
        duration=5.0,
        effect=EffectData(effect_id="blur-gaussian", parameters={"intensity": 50}),
        filter=FilterData(filter_id="hollywood-gold", intensity=0.8),
    )
    stack = resolver.resolve_clip_stack(clip)
    assert stack.effects[0].id == "blur-gaussian"
    assert stack.filters[0].id == "hollywood-gold"


def test_text_and_audio_renderers():
    text_renderer = TextRenderer()
    text_def = text_renderer.generate_render_definition(
        item_id="text-1", name="Title Text", kind=RenderKind.OVERLAY,
        asset_type=AssetType.EFFECT, engine_key="text_v1", category="Text",
        required_plan=PlanType.FREE, enabled=True, user_has_access=True,
        parameters={"text": "Veytrix Video", "font_size": 42}, metadata={}
    )
    assert any("drawtext=" in f for f in text_def.filter_chain)

    audio_renderer = AudioRenderer()
    audio_def = audio_renderer.generate_render_definition(
        item_id="audio-1", name="Background Track", kind=RenderKind.COMPOSITE,
        asset_type=AssetType.AUDIO, engine_key="audio_v1", category="Audio",
        required_plan=PlanType.FREE, enabled=True, user_has_access=True,
        parameters={"volume": 0.8, "fade_in": 1.0, "fade_out": 1.5}, metadata={}
    )
    assert any("volume=" in f for f in audio_def.filter_chain)
    assert any("afade=" in f for f in audio_def.filter_chain)


def test_ai_renderer_placeholder():
    ai_renderer = AIRenderer()
    ai_def = ai_renderer.generate_render_definition(
        item_id="ai-enhance-1", name="AI Upscale", kind=RenderKind.EFFECT,
        asset_type=AssetType.EFFECT, engine_key="ai_enhance_v1", category="AI",
        required_plan=PlanType.PRO, enabled=True, user_has_access=True,
        parameters={}, metadata={}
    )
    assert ai_def.metadata.get("is_ai_placeholder") is True
