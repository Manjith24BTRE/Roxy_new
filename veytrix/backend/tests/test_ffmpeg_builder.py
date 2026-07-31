"""Unit and integration tests for FFmpegBuilder and filter graph generation without executing FFmpeg."""

from uuid import uuid4
import pytest
from app.builders.ffmpeg_builder import (
    AudioBuilder,
    CommandOptimizer,
    EffectBuilder,
    FFmpegBuilder,
    FilterBuilder,
    GraphValidator,
    TextOverlayBuilder,
    TransitionBuilder,
    VideoBuilder,
    WatermarkBuilder,
)
from app.models.enums import AssetType
from app.models.render_graph import RenderGraphDefinition
from app.models.timeline import TimelineModel, TrackModel, TrackType
from app.services.timeline_parser import TimelineParser


@pytest.fixture
def parser():
    return TimelineParser()


@pytest.fixture
def ffmpeg_builder():
    return FFmpegBuilder()


def test_ffmpeg_builder_basic_command_generation(parser, ffmpeg_builder):
    raw_timeline = {
        "duration": 5.0,
        "resolution": "1080p",
        "fps": 30,
        "tracks": [
            {
                "id": "v1",
                "name": "Main Track",
                "type": "VIDEO",
                "clips": [
                    {
                        "id": "clip-1",
                        "start_time": 0.0,
                        "duration": 5.0,
                        "playback_speed": 1.2,
                        "rotation": 90.0,
                        "opacity": 0.9,
                    }
                ],
            }
        ],
    }

    timeline_model = parser.parse(raw_timeline)
    render_def = ffmpeg_builder.build_render_definition(
        timeline=timeline_model,
        resolution="1080p",
        fps=30,
        codec="h264",
        bitrate="standard",
        watermark=True,
        output_filename="test_render.mp4",
    )

    assert isinstance(render_def, RenderGraphDefinition)
    assert render_def.vcodec == "libx264"
    assert render_def.bitrate == "6M"
    assert render_def.resolution == "1080p"
    assert render_def.width == 1920
    assert render_def.height == 1080
    assert render_def.format == "mp4"

    # Command line array verification
    cmd_str = render_def.command_string
    assert "ffmpeg -y" in cmd_str
    assert "-filter_complex" in cmd_str
    assert "-map [outv]" in cmd_str
    assert "-map [outa]" in cmd_str
    assert "setpts=0.8333*PTS" in cmd_str
    assert "rotate=1.5708" in cmd_str
    assert "colorchannelmixer=aa=0.90" in cmd_str


def test_text_overlay_builder():
    from app.models.timeline import ClipModel, TextData

    clip = ClipModel(
        track_id="t1",
        start_time=1.0,
        end_time=4.0,
        duration=3.0,
        text=TextData(
            content="VEYTRIX PRO",
            font="Roboto",
            size=36,
            color="#00FF00",
            alignment="center",
            stroke={"color": "black", "width": 3},
        ),
    )

    filter_str = TextOverlayBuilder.build_drawtext_filter(clip, 1920, 1080)
    assert filter_str is not None
    assert "drawtext=text='VEYTRIX PRO'" in filter_str
    assert "fontsize=36" in filter_str
    assert "borderw=3" in filter_str
    assert "enable='between(t,1.00,4.00)'" in filter_str


def test_effect_and_filter_builders():
    from app.models.timeline import ClipModel, EffectData, FilterData

    clip_fx = ClipModel(
        track_id="t1",
        start_time=0.0,
        end_time=5.0,
        duration=5.0,
        effect=EffectData(effect_id="fx-001", engine_key="glitch_v1", parameters={"radius": 12}),
        filter=FilterData(filter_id="fl-001", intensity=0.9),
    )

    eff_str = EffectBuilder.build_effect_filter(clip_fx)
    filt_str = FilterBuilder.build_filter_chain(clip_fx)

    assert eff_str is not None
    assert filt_str is not None
    assert ("boxblur" in eff_str or "eq" in eff_str or "noise" in eff_str)
    assert "eq=" in filt_str


def test_transition_builder():
    node = TransitionBuilder.build_video_transition(
        input_label_1="v1",
        input_label_2="v2",
        output_label="v_out",
        transition_type="cross_dissolve",
        duration=1.0,
        offset=4.0,
    )

    assert node.filter_name == "xfade"
    assert "transition=fade" in node.args
    assert "duration=1.00" in node.args
    assert "offset=4.00" in node.args
    assert node.to_filter_string() == "[v1][v2]xfade=transition=fade:duration=1.00:offset=4.00[v_out]"


def test_watermark_builder():
    wm_builder = WatermarkBuilder()
    node, inp = wm_builder.build_watermark_node(
        input_label="v_in",
        output_label="outv",
        user_id=None,
        user_requested_watermark=True,
        width=1920,
        height=1080,
    )

    assert node is not None
    assert node.filter_name == "drawtext"
    assert "VEYTRIX WATERMARK" in node.args


def test_command_optimizer():
    from app.models.render_graph import FilterNode

    nodes = [
        FilterNode(inputs=["0:v"], filter_name="scale", args="1920:1080", outputs=["v1"]),
        FilterNode(inputs=["0:v"], filter_name="scale", args="1920:1080", outputs=["v1"]),
        FilterNode(inputs=["v1"], filter_name="drawtext", args="text='Hi'", outputs=["outv"]),
    ]

    opt = CommandOptimizer.optimize(nodes)
    assert len(opt) == 2


def test_graph_validator_invalid_timeline(parser):
    validator = GraphValidator()
    raw_timeline = {"duration": 0.0, "tracks": []}
    timeline_model = parser.parse(raw_timeline)

    errors = validator.validate(timeline_model)
    assert len(errors) > 0
    assert "Timeline duration must be greater than 0" in errors[0]
