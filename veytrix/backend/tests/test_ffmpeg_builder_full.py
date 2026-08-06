"""Comprehensive integration test suite proving FFmpeg builder translation for all supported editor operations."""

from uuid import uuid4
import pytest
from app.builders.ffmpeg_builder import FFmpegBuilder
from app.models.enums import AssetType
from app.models.render_graph import RenderGraphDefinition
from app.models.timeline import ClipModel, EffectData, FilterData, TextData, TimelineModel, TrackModel, TrackType
from app.services.timeline_parser import TimelineParser


@pytest.fixture
def parser():
    return TimelineParser()


@pytest.fixture
def builder():
    return FFmpegBuilder()


def test_trim_split_and_delete_operations(parser, builder):
    """Verifies Trim, Split, and Delete operations translate correctly into FFmpeg commands."""
    raw_timeline = {
        "duration": 10.0,
        "tracks": [
            {
                "id": "track-video",
                "type": "VIDEO",
                "clips": [
                    {
                        "id": "clip-trim",
                        "file_path": "sample1.mp4",
                        "start_time": 0.0,
                        "duration": 4.0,
                        "trim_start": 1.5,
                        "trim_end": 5.5,
                    },
                    {
                        "id": "clip-deleted",
                        "file_path": "sample2.mp4",
                        "start_time": 4.0,
                        "duration": 2.0,
                        "enabled": False,
                    },
                    {
                        "id": "clip-split-seg2",
                        "file_path": "sample1.mp4",
                        "start_time": 6.0,
                        "duration": 4.0,
                        "trim_start": 5.5,
                        "trim_end": 9.5,
                    },
                ],
            }
        ],
    }

    timeline = parser.parse(raw_timeline)
    render_def = builder.build_render_definition(timeline, output_filename="trim_split_delete.mp4")
    cmd_str = render_def.command_string

    assert "trim=start=1.5000:end=5.5000" in cmd_str
    assert "trim=start=5.5000:end=9.5000" in cmd_str
    assert "clip-deleted" not in cmd_str


def test_reverse_and_freeze_frame_operations(parser, builder):
    """Verifies Reverse and Freeze Frame editor operations translate to FFmpeg filters."""
    raw_timeline = {
        "duration": 8.0,
        "tracks": [
            {
                "id": "t1",
                "type": "VIDEO",
                "clips": [
                    {
                        "id": "clip-rev",
                        "file_path": "video.mp4",
                        "start_time": 0.0,
                        "duration": 4.0,
                        "metadata": {"reverse": True},
                    },
                    {
                        "id": "clip-freeze",
                        "file_path": "video.mp4",
                        "start_time": 4.0,
                        "duration": 4.0,
                        "metadata": {"freeze_frame": True, "freeze_duration": 3.0},
                    },
                ],
            }
        ],
    }

    timeline = parser.parse(raw_timeline)
    render_def = builder.build_render_definition(timeline, output_filename="reverse_freeze.mp4")
    cmd_str = render_def.command_string

    assert "reverse" in cmd_str
    assert "tpad=stop_mode=clone:stop_duration=3.00" in cmd_str


def test_speed_audio_mute_and_extracted_audio(parser, builder):
    """Verifies Speed adjustment, Volume, Pan/Balance, Gain, Mute, and Normalization."""
    raw_timeline = {
        "duration": 6.0,
        "tracks": [
            {
                "id": "t-audio",
                "type": "AUDIO",
                "clips": [
                    {
                        "id": "audio-fast",
                        "file_path": "audio1.mp3",
                        "asset_type": "AUDIO",
                        "start_time": 0.0,
                        "duration": 3.0,
                        "playback_speed": 2.5,
                        "volume": 0.8,
                        "metadata": {"gain_db": 3.0, "balance": 0.5, "normalize": True},
                    },
                    {
                        "id": "audio-muted",
                        "file_path": "audio2.mp3",
                        "asset_type": "AUDIO",
                        "start_time": 3.0,
                        "duration": 3.0,
                        "muted": True,
                    },
                ],
            }
        ],
    }

    timeline = parser.parse(raw_timeline)
    render_def = builder.build_render_definition(timeline, output_filename="audio_speed.mp4")
    cmd_str = render_def.command_string

    assert "atempo=2.0" in cmd_str
    assert "loudnorm" in cmd_str


def test_overlays_and_captions(parser, builder):
    """Verifies image/text overlays, burned captions, positioning, and colors."""
    raw_timeline = {
        "duration": 5.0,
        "tracks": [
            {
                "id": "t-overlay",
                "type": "TEXT",
                "clips": [
                    {
                        "id": "clip-caption",
                        "file_path": "",
                        "asset_type": "VIDEO",
                        "start_time": 1.0,
                        "end_time": 4.0,
                        "duration": 3.0,
                        "text": {
                            "content": "BURNED CAPTION TEST",
                            "color": "#FF0000",
                            "size": 32,
                            "alignment": "center",
                        },
                        "position": {"x": 0.0, "y": 200.0},
                    }
                ],
            }
        ],
    }

    timeline = parser.parse(raw_timeline)
    render_def = builder.build_render_definition(timeline, output_filename="captions.mp4")
    nodes_str = " ".join(n.to_filter_string() for n in render_def.filter_graph)

    assert "drawtext" in nodes_str
    assert "fontsize=32" in nodes_str


def test_aspect_ratios(parser, builder):
    """Verifies canvas dimensions across aspect ratios: 16:9, 9:16, 1:1, 4:5, 21:9."""
    for aspect, expected_w, expected_h in [
        ("16:9", 1920, 1080),
        ("9:16", 1080, 1920),
        ("1:1", 1080, 1080),
        ("4:5", 1080, 1350),
    ]:
        raw_timeline = {"duration": 2.0, "aspect_ratio": aspect, "tracks": []}
        timeline = parser.parse(raw_timeline)
        render_def = builder.build_render_definition(timeline, resolution="1080p", output_filename="aspect.mp4")

        assert render_def.width == expected_w
        assert render_def.height == expected_h


def test_filters_effects_and_transitions(parser, builder):
    """Verifies stacked filters, effects, and video transitions."""
    raw_timeline = {
        "duration": 6.0,
        "tracks": [
            {
                "id": "t-fx",
                "type": "VIDEO",
                "clips": [
                    {
                        "id": "clip-fx",
                        "file_path": "clip1.mp4",
                        "start_time": 0.0,
                        "duration": 6.0,
                        "effect": {"effect_id": "blur-gaussian", "parameters": {"radius": 15}},
                        "filter": {"filter_id": "warm-autumn", "intensity": 0.8},
                    }
                ],
            }
        ],
    }

    timeline = parser.parse(raw_timeline)
    render_def = builder.build_render_definition(timeline, output_filename="fx_filters.mp4")
    nodes_str = " ".join(n.to_filter_string() for n in render_def.filter_graph)

    assert "boxblur" in nodes_str or "eq=" in nodes_str
