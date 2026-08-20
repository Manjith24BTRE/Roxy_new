"""Unit and integration tests for TimelineParser and timeline normalization."""

from uuid import uuid4
import pytest
from app.models.enums import AssetType
from app.models.timeline import TimelineModel, TrackType
from app.services.timeline_parser import TimelineParser, TimelineParserError


@pytest.fixture
def parser():
    return TimelineParser()


def test_simple_timeline_parsing(parser):
    raw_timeline = {
        "duration": 10.0,
        "resolution": "1080p",
        "fps": 30,
        "tracks": [
            {
                "id": "v1",
                "name": "Video Track 1",
                "type": "VIDEO",
                "clips": [
                    {
                        "id": "clip-1",
                        "start_time": 0.0,
                        "duration": 5.0,
                        "asset_type": "VIDEO",
                    },
                    {
                        "id": "clip-2",
                        "start_time": 5.0,
                        "duration": 5.0,
                        "asset_type": "VIDEO",
                    },
                ],
            }
        ],
    }

    result = parser.parse(raw_timeline)
    assert isinstance(result, TimelineModel)
    assert result.duration == 10.0
    assert len(result.tracks) == 1
    assert result.tracks[0].type == TrackType.VIDEO
    assert len(result.tracks[0].clips) == 2
    assert result.tracks[0].clips[0].end_time == 5.0
    assert result.tracks[0].clips[1].end_time == 10.0


def test_multiple_tracks_and_types(parser):
    raw_timeline = {
        "duration": 15.0,
        "tracks": [
            {
                "id": "v1",
                "name": "Video Track",
                "type": "VIDEO",
                "order": 0,
                "clips": [{"id": "v-clip", "start_time": 0.0, "duration": 10.0}],
            },
            {
                "id": "a1",
                "name": "Audio Track",
                "type": "AUDIO",
                "order": 1,
                "clips": [{"id": "a-clip", "start_time": 0.0, "duration": 15.0, "volume": 0.8}],
            },
            {
                "id": "t1",
                "name": "Text Track",
                "type": "TEXT",
                "order": 2,
                "clips": [
                    {
                        "id": "t-clip",
                        "start_time": 2.0,
                        "duration": 4.0,
                        "text": {"content": "Hello World", "font": "Inter", "size": 32, "color": "#FF0000"},
                    }
                ],
            },
        ],
    }

    result = parser.parse(raw_timeline)
    assert len(result.tracks) == 3
    assert result.duration == 15.0
    assert result.tracks[1].clips[0].volume == 0.8
    assert result.tracks[2].clips[0].text.content == "Hello World"


def test_transitions_effects_filters_parsing(parser):
    raw_timeline = {
        "tracks": [
            {
                "id": "t-main",
                "type": "VIDEO",
                "clips": [
                    {
                        "id": "fx-clip",
                        "start_time": 0.0,
                        "duration": 6.0,
                        "transition": {
                            "transition_type": "cross_dissolve",
                            "duration": 1.0,
                            "direction": "cross",
                        },
                        "effect": {
                            "effect_id": "blur-heavy",
                            "engine_key": "gl_blur",
                            "parameters": {"radius": 15},
                        },
                        "filter": {
                            "filter_id": "vintage-sepia",
                            "intensity": 0.85,
                        },
                    }
                ],
            }
        ]
    }

    result = parser.parse(raw_timeline)
    clip = result.tracks[0].clips[0]
    assert clip.transition.transition_type == "cross_dissolve"
    assert clip.transition.duration == 1.0
    assert clip.effect.effect_id == "blur-heavy"
    assert clip.filter.intensity == 0.85


def test_transition_metadata_hydration_and_legacy_compatibility(parser):
    # 1. Legacy string transition parsing
    legacy_string_timeline = {
        "tracks": [{
            "id": "t-legacy-str",
            "type": "VIDEO",
            "clips": [{
                "id": "clip-leg-1",
                "start_time": 0.0,
                "duration": 5.0,
                "appliedTransition": "wipe-left-legacy"
            }]
        }]
    }
    res_str = parser.parse(legacy_string_timeline)
    trans_str = res_str.tracks[0].clips[0].transition
    assert trans_str.transition_type == "wipe-left-legacy"
    assert trans_str.duration == 0.5
    assert trans_str.direction == "none"

    # 2. Legacy object missing new fields
    legacy_obj_timeline = {
        "tracks": [{
            "id": "t-legacy-obj",
            "type": "VIDEO",
            "clips": [{
                "id": "clip-leg-2",
                "start_time": 0.0,
                "duration": 5.0,
                "transition": {
                    "transition_type": "fade",
                    "duration": 1.2
                }
            }]
        }]
    }
    res_obj = parser.parse(legacy_obj_timeline)
    trans_obj = res_obj.tracks[0].clips[0].transition
    assert trans_obj.transition_type == "fade"
    assert trans_obj.duration == 1.2
    assert trans_obj.speed == 1.0
    assert trans_obj.intensity == 50.0
    assert trans_obj.easing == "ease-in-out"

    # 3. New full Phase 1 payload hydration
    full_payload_timeline = {
        "tracks": [{
            "id": "t-full",
            "type": "VIDEO",
            "clips": [{
                "id": "clip-full-1",
                "start_time": 0.0,
                "duration": 5.0,
                "transition": {
                    "transition_type": "whip-pan-left-premium",
                    "duration": 0.8,
                    "direction": "left",
                    "speed": 1.5,
                    "intensity": 85.0,
                    "easing": "ease-in-out",
                    "motion_blur": True,
                    "category": "camera",
                    "parameters": {
                        "gpuOptimized": True,
                        "customPresetKey": "preset_val_123"
                    }
                }
            }]
        }]
    }
    res_full = parser.parse(full_payload_timeline)
    trans_full = res_full.tracks[0].clips[0].transition
    assert trans_full.transition_type == "whip-pan-left-premium"
    assert trans_full.duration == 0.8
    assert trans_full.direction == "left"
    assert trans_full.speed == 1.5
    assert trans_full.intensity == 85.0
    assert trans_full.easing == "ease-in-out"
    assert trans_full.motion_blur is True
    assert trans_full.category == "camera"
    assert trans_full.parameters["gpuOptimized"] is True
    assert trans_full.parameters["customPresetKey"] == "preset_val_123"


def test_validation_negative_duration(parser):
    raw_timeline = {
        "tracks": [
            {
                "id": "t1",
                "clips": [{"id": "c1", "start_time": 0.0, "duration": -5.0}],
            }
        ]
    }

    with pytest.raises(TimelineParserError) as exc_info:
        parser.parse(raw_timeline)

    errors = exc_info.value.errors
    assert any(e.code == "NEGATIVE_DURATION" for e in errors)


def test_validation_overlapping_clips(parser):
    raw_timeline = {
        "tracks": [
            {
                "id": "t1",
                "clips": [
                    {"id": "c1", "start_time": 0.0, "duration": 6.0},
                    {"id": "c2", "start_time": 4.0, "duration": 5.0},
                ],
            }
        ]
    }

    with pytest.raises(TimelineParserError) as exc_info:
        parser.parse(raw_timeline)

    errors = exc_info.value.errors
    assert any(e.code == "OVERLAPPING_CLIPS" for e in errors)


def test_validation_duplicate_clips(parser):
    raw_timeline = {
        "tracks": [
            {
                "id": "t1",
                "clips": [
                    {"id": "dup-id", "start_time": 0.0, "duration": 3.0},
                    {"id": "dup-id", "start_time": 4.0, "duration": 3.0},
                ],
            }
        ]
    }

    with pytest.raises(TimelineParserError) as exc_info:
        parser.parse(raw_timeline)

    errors = exc_info.value.errors
    assert any(e.code == "DUPLICATE_CLIP" for e in errors)


def test_validation_missing_asset(parser):
    fake_asset_id = str(uuid4())
    raw_timeline = {
        "tracks": [
            {
                "id": "t1",
                "clips": [
                    {
                        "id": "c1",
                        "asset_id": fake_asset_id,
                        "start_time": 0.0,
                        "duration": 4.0,
                    }
                ],
            }
        ]
    }

    with pytest.raises(TimelineParserError) as exc_info:
        parser.parse(raw_timeline, user_id="00000000-0000-0000-0000-000000000001")

    errors = exc_info.value.errors
    assert any(e.code == "MISSING_ASSET" for e in errors)
