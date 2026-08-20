"""Tests for Phase B Renderer Architecture: BaseRenderer, CategoryRenderers, RendererRegistry, and Parameter Validation."""

import pytest
from app.models.enums import AssetType, PlanType
from app.models.render_definition import RenderKind
from app.services.renderers import (
    BaseRenderer,
    ParameterValidationError,
    RendererRegistry,
    renderer_registry,
    BlurRenderer,
    CameraRenderer,
    GlitchRenderer,
    RetroRenderer,
    LightRenderer,
    CinematicRenderer,
    TransitionRenderer,
    FilterRenderer,
    EffectRenderer,
)


def test_base_renderer_parameter_validation():
    blur = BlurRenderer()

    # Valid parameters
    valid_params = {
        "intensity": 75.0,
        "strength": 50.0,
        "radius": 15.0,
        "amount": 20.0,
        "opacity": 90.0,
        "scale": 1.2,
        "rotation": 45.0,
        "speed": 2.0,
        "direction": "left",
        "duration": 1.5,
        "curve": "ease_in",
        "interpolation": "linear",
        "blend_mode": "multiply",
    }
    sanitized = blur.validate_parameters(valid_params)
    assert sanitized["intensity"] == 75.0
    assert sanitized["direction"] == "left"
    assert blur.validate(valid_params) is True

    # Invalid intensity > 100
    with pytest.raises(ParameterValidationError) as excinfo:
        blur.validate_parameters({"intensity": 150.0})
    assert "intensity" in str(excinfo.value)
    assert blur.validate({"intensity": 150.0}) is False

    # Invalid direction
    with pytest.raises(ParameterValidationError) as excinfo:
        blur.validate_parameters({"direction": "unknown_dir"})
    assert "direction" in str(excinfo.value)


def test_category_renderer_ffmpeg_graph_generation():
    # 1. BlurRenderer
    blur = BlurRenderer()
    res_gaussian = blur.build(item_id="gaussian_blur", parameters={"radius": 10.0})
    assert "gblur=sigma=10.00" in res_gaussian.filter_chain[0]

    res_motion = blur.build(item_id="motion_blur", parameters={"intensity": 50.0})
    assert "tblend" in res_motion.filter_chain[0]

    # 2. CameraRenderer
    camera = CameraRenderer()
    res_shake = camera.build(item_id="camera_shake", parameters={"intensity": 60.0})
    assert "crop=" in res_shake.filter_chain[0]
    assert "scale=" in res_shake.filter_chain[0]

    res_pan = camera.build(item_id="pan_left", parameters={"intensity": 40.0})
    assert "scale=" in res_pan.filter_chain[0]

    # 3. GlitchRenderer
    glitch = GlitchRenderer()
    res_vhs = glitch.build(item_id="vhs_glitch", parameters={"intensity": 70.0})
    assert any("noise=" in f for f in res_vhs.filter_chain)
    assert any("chromashift=" in f for f in res_vhs.filter_chain)

    # 4. RetroRenderer
    retro = RetroRenderer()
    res_retro = retro.build(item_id="retro_vhs", parameters={"intensity": 50.0})
    assert any("vintage" in f for f in res_retro.filter_chain)

    # 5. LightRenderer
    light = LightRenderer()
    res_glow = light.build(item_id="glow_light", parameters={"intensity": 80.0})
    assert any("brightness=" in f for f in res_glow.filter_chain)

    # 6. CinematicRenderer
    cinematic = CinematicRenderer()
    res_teal = cinematic.build(item_id="teal_orange", parameters={"intensity": 50.0})
    assert any("gamma_b=" in f for f in res_teal.filter_chain)

    # 7. TransitionRenderer
    trans = TransitionRenderer()
    res_trans = trans.build(item_id="cross_dissolve", kind=RenderKind.TRANSITION, asset_type=AssetType.TRANSITION, parameters={"duration": 1.2})
    assert "xfade=transition=dissolve:duration=1.20" in res_trans.filter_chain[0]

    # 8. FilterRenderer
    filt = FilterRenderer()
    res_bright = filt.build(item_id="brightness_boost", asset_type=AssetType.FILTER, parameters={"intensity": 70.0})
    assert "eq=brightness=" in res_bright.filter_chain[0]


def test_renderer_registry():
    registry = RendererRegistry()

    # Resolution by category/item_id
    b_renderer = registry.get_renderer(category="blur", item_id="motion_blur")
    assert isinstance(b_renderer, BlurRenderer)

    c_renderer = registry.get_renderer(category="camera", item_id="camera_shake")
    assert isinstance(c_renderer, CameraRenderer)

    g_renderer = registry.get_renderer(category="glitch", item_id="vhs_glitch")
    assert isinstance(g_renderer, GlitchRenderer)

    r_renderer = registry.get_renderer(category="retro", item_id="retro_film")
    assert isinstance(r_renderer, RetroRenderer)

    l_renderer = registry.get_renderer(category="light", item_id="glow")
    assert isinstance(l_renderer, LightRenderer)

    cin_renderer = registry.get_renderer(category="cinematic", item_id="teal_orange")
    assert isinstance(cin_renderer, CinematicRenderer)

    t_renderer = registry.get_renderer(category="transition", asset_type=AssetType.TRANSITION, item_id="cross_dissolve")
    assert isinstance(t_renderer, TransitionRenderer)

    f_renderer = registry.get_renderer(category="color", asset_type=AssetType.FILTER, item_id="brightness")
    assert isinstance(f_renderer, FilterRenderer)


def test_extensibility_plugin_registration():
    registry = RendererRegistry()

    class CustomPluginRenderer(BaseRenderer):
        renderer_id = "custom_cyber"
        category = "cyberpunk"

        def can_handle(self, engine_key: str, category: str, asset_type=None, item_id: str = "") -> bool:
            return "cyberpunk" in category.lower() or "cyber" in item_id.lower()

        def generate_filters(self, item_id: str, parameters: dict, metadata: dict):
            return ["hue=h=90,eq=contrast=1.5"]

    custom_renderer = CustomPluginRenderer()
    registry.register_renderer(custom_renderer)

    resolved = registry.get_renderer(category="cyberpunk", item_id="cyber_grid")
    assert isinstance(resolved, CustomPluginRenderer)

    res = resolved.build(item_id="cyber_grid", category="cyberpunk")
    assert res.filter_chain == ["hue=h=90,eq=contrast=1.5"]
