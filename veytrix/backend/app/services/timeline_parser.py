"""Production-ready Timeline Parser service for parsing, validating, normalizing, and resolving frontend editor timeline JSON into an internal backend timeline model."""

from typing import Any, Dict, List, Optional, Tuple, Union
from uuid import UUID
from fastapi import HTTPException, status
from pydantic import ValidationError

from app.core.config import settings
from app.core.logging import logger
from app.models.enums import AssetType
from app.models.timeline import (
    ClipModel,
    EffectData,
    FilterData,
    TextData,
    TimelineModel,
    TimelineValidationError,
    TrackModel,
    TrackType,
    TransitionData,
)
from app.services.asset_service import AssetService


class TimelineParserError(HTTPException):
    """Exception raised when timeline validation or parsing fails."""

    def __init__(self, errors: List[TimelineValidationError], status_code: int = status.HTTP_422_UNPROCESSABLE_ENTITY):
        self.errors = errors
        detail = {
            "error_code": "INVALID_TIMELINE",
            "message": "Timeline JSON failed validation.",
            "details": [e.model_dump() for e in errors],
        }
        super().__init__(status_code=status_code, detail=detail)


import traceback


class TimelineParser:
    """Production Timeline Parser that converts frontend timeline JSON into a normalized internal TimelineModel."""

    def __init__(self, asset_service: Optional[AssetService] = None):
        self.asset_service = asset_service or AssetService()

    def parse(
        self,
        timeline_json: Union[Dict[str, Any], List[Any], None],
        user_id: Optional[str] = None,
        default_resolution: str = "1080p",
        default_fps: int = 30,
        default_aspect_ratio: str = "16:9",
    ) -> TimelineModel:
        """Parses, validates, normalizes, and resolves assets for a raw frontend timeline structure."""
        logger.info(
            f"[TimelineParser.parse] ENTER - User ID: {user_id}, Resolution: {default_resolution}, FPS: {default_fps}, Aspect Ratio: {default_aspect_ratio}"
        )
        try:
            res = self._parse_internal(
                timeline_json=timeline_json,
                user_id=user_id,
                default_resolution=default_resolution,
                default_fps=default_fps,
                default_aspect_ratio=default_aspect_ratio,
            )
            logger.info(
                f"[TimelineParser.parse] EXIT - Timeline Duration: {res.duration}s, Tracks: {len(res.tracks)}, FPS: {res.frame_rate}"
            )
            return res
        except Exception as exc:
            logger.error(
                f"[TimelineParser.parse] EXCEPTION - Type: {type(exc).__name__}, Message: {str(exc)}, User ID: {user_id}\n"
                f"Stack Trace:\n{traceback.format_exc()}"
            )
            raise

    def _parse_internal(
        self,
        timeline_json: Union[Dict[str, Any], List[Any], None],
        user_id: Optional[str] = None,
        default_resolution: str = "1080p",
        default_fps: int = 30,
        default_aspect_ratio: str = "16:9",
    ) -> TimelineModel:
        errors: List[TimelineValidationError] = []

        if timeline_json is None:
            timeline_json = {}

        # 1. Standardize envelope format
        raw_tracks: List[Dict[str, Any]] = []
        global_duration: float = 0.0
        frame_rate: int = default_fps
        resolution: str = default_resolution
        aspect_ratio: str = default_aspect_ratio
        metadata: Dict[str, Any] = {}

        if isinstance(timeline_json, list):
            raw_tracks = [t for t in timeline_json if isinstance(t, dict)]
        elif isinstance(timeline_json, dict):
            metadata = timeline_json.get("metadata", {})
            if isinstance(metadata, dict):
                resolution = str(metadata.get("resolution", timeline_json.get("resolution", default_resolution)))
                aspect_ratio = str(metadata.get("aspect_ratio", timeline_json.get("aspect_ratio", default_aspect_ratio)))
            else:
                resolution = str(timeline_json.get("resolution", default_resolution))
                aspect_ratio = str(timeline_json.get("aspect_ratio", default_aspect_ratio))

            try:
                raw_fps = timeline_json.get("fps") or timeline_json.get("frame_rate") or default_fps
                frame_rate = int(raw_fps)
                if frame_rate < 15 or frame_rate > 60:
                    frame_rate = default_fps
            except (ValueError, TypeError):
                frame_rate = default_fps

            try:
                global_duration = max(0.0, float(timeline_json.get("duration", 0.0)))
            except (ValueError, TypeError):
                global_duration = 0.0

            if "tracks" in timeline_json and isinstance(timeline_json["tracks"], list):
                raw_tracks = [t for t in timeline_json["tracks"] if isinstance(t, dict)]
            elif "clips" in timeline_json and isinstance(timeline_json["clips"], list):
                # Flat list of clips fallback into a single default Video Track
                raw_tracks = [{
                    "id": "default-track-1",
                    "name": "Main Track",
                    "type": "VIDEO",
                    "order": 0,
                    "clips": timeline_json["clips"],
                }]

        # 2. Track & Clip Processing
        normalized_tracks: List[TrackModel] = []
        seen_track_ids: set = set()
        seen_clip_ids: set = set()
        max_timeline_end_time: float = 0.0

        for track_idx, raw_track in enumerate(raw_tracks):
            track_id = str(raw_track.get("id", f"track-{track_idx + 1}"))

            if track_id in seen_track_ids:
                errors.append(
                    TimelineValidationError(
                        code="DUPLICATE_TRACK_ID",
                        message=f"Duplicate track ID '{track_id}' found.",
                        track_id=track_id,
                        field="id",
                    )
                )

            seen_track_ids.add(track_id)

            raw_type_str = str(raw_track.get("type", "VIDEO")).upper()
            try:
                track_type = TrackType[raw_type_str]
            except KeyError:
                # Map or fallback
                if "AUDIO" in raw_type_str:
                    track_type = TrackType.AUDIO
                elif "TEXT" in raw_type_str:
                    track_type = TrackType.TEXT
                elif "EFFECT" in raw_type_str:
                    track_type = TrackType.EFFECT
                elif "FILTER" in raw_type_str:
                    track_type = TrackType.FILTER
                elif "TRANSITION" in raw_type_str:
                    track_type = TrackType.TRANSITION
                elif "STICKER" in raw_type_str:
                    track_type = TrackType.STICKER
                elif "OVERLAY" in raw_type_str:
                    track_type = TrackType.OVERLAY
                elif "IMAGE" in raw_type_str:
                    track_type = TrackType.IMAGE
                elif "AI" in raw_type_str:
                    track_type = TrackType.AI
                else:
                    track_type = TrackType.VIDEO

            order = raw_track.get("order", track_idx)
            if not isinstance(order, int):
                order = track_idx

            muted = bool(raw_track.get("muted", False))
            hidden = bool(raw_track.get("hidden", False))
            locked = bool(raw_track.get("locked", False))

            raw_clips = raw_track.get("clips", [])
            if not isinstance(raw_clips, list):
                errors.append(
                    TimelineValidationError(
                        code="INVALID_CLIPS_FIELD",
                        message=f"Track '{track_id}' clips field must be a list.",
                        track_id=track_id,
                        field="clips",
                    )
                )
                raw_clips = []

            normalized_clips: List[ClipModel] = []
            track_max_end_time: float = 0.0

            for clip_idx, raw_clip in enumerate(raw_clips):
                if not isinstance(raw_clip, dict):
                    errors.append(
                        TimelineValidationError(
                            code="MALFORMED_CLIP_JSON",
                            message=f"Clip at index {clip_idx} in track '{track_id}' is not a valid object.",
                            track_id=track_id,
                        )
                    )
                    continue

                clip_id = str(raw_clip.get("id", f"{track_id}-clip-{clip_idx + 1}"))
                if clip_id in seen_clip_ids:
                    errors.append(
                        TimelineValidationError(
                            code="DUPLICATE_CLIP",
                            message=f"Duplicate clip ID '{clip_id}' found in timeline.",
                            track_id=track_id,
                            clip_id=clip_id,
                            field="id",
                        )
                    )
                seen_clip_ids.add(clip_id)

                # Timing validation
                raw_start = raw_clip.get("start_time") or raw_clip.get("startTime") or raw_clip.get("start") or 0.0
                try:
                    start_time = float(raw_start)
                except (ValueError, TypeError):
                    start_time = 0.0

                if start_time < 0:
                    errors.append(
                        TimelineValidationError(
                            code="NEGATIVE_TIMING",
                            message=f"Clip '{clip_id}' has negative start time ({start_time}s).",
                            track_id=track_id,
                            clip_id=clip_id,
                            field="start_time",
                        )
                    )
                    start_time = 0.0

                raw_duration = raw_clip.get("duration", None)
                end_time_raw = raw_clip.get("end_time", raw_clip.get("endTime", raw_clip.get("end", None)))

                if raw_duration is not None:
                    try:
                        clip_dur = float(raw_duration)
                    except (ValueError, TypeError):
                        clip_dur = 0.0
                elif end_time_raw is not None:
                    try:
                        clip_dur = float(end_time_raw) - start_time
                    except (ValueError, TypeError):
                        clip_dur = 0.0
                else:
                    clip_dur = 5.0  # default clip duration

                if clip_dur < 0:
                    errors.append(
                        TimelineValidationError(
                            code="NEGATIVE_DURATION",
                            message=f"Clip '{clip_id}' has negative duration ({clip_dur}s).",
                            track_id=track_id,
                            clip_id=clip_id,
                            field="duration",
                        )
                    )
                    clip_dur = max(0.0, clip_dur)

                end_time = start_time + clip_dur
                if end_time > track_max_end_time:
                    track_max_end_time = end_time

                # Asset type mapping
                raw_asset_type = str(raw_clip.get("asset_type", raw_clip.get("assetType", raw_clip.get("type", track_type.value)))).upper()
                try:
                    asset_type = AssetType[raw_asset_type]
                except KeyError:
                    if "VIDEO" in raw_asset_type:
                        asset_type = AssetType.VIDEO
                    elif "AUDIO" in raw_asset_type:
                        asset_type = AssetType.AUDIO
                    elif "IMAGE" in raw_asset_type:
                        asset_type = AssetType.IMAGE
                    elif "EFFECT" in raw_asset_type:
                        asset_type = AssetType.EFFECT
                    elif "FILTER" in raw_asset_type:
                        asset_type = AssetType.FILTER
                    elif "TRANSITION" in raw_asset_type:
                        asset_type = AssetType.TRANSITION
                    else:
                        asset_type = AssetType.IMAGE

                # Asset Resolution & Reference Validation
                raw_asset_id = raw_clip.get("asset_id", raw_clip.get("assetId"))
                raw_media_url = raw_clip.get("media_url", raw_clip.get("mediaUrl", raw_clip.get("src", raw_clip.get("url"))))
                raw_file_path = raw_clip.get("file_path", raw_clip.get("filePath", raw_clip.get("path")))
                parsed_asset_id: Optional[UUID] = None

                if raw_asset_id:
                    try:
                        parsed_asset_id = UUID(str(raw_asset_id))
                        if user_id:
                            try:
                                self.asset_service.get_asset_by_id(parsed_asset_id, user_id)
                            except Exception:
                                errors.append(
                                    TimelineValidationError(
                                        code="MISSING_ASSET",
                                        message=f"Referenced asset '{parsed_asset_id}' could not be found.",
                                        track_id=track_id,
                                        clip_id=clip_id,
                                        field="asset_id",
                                    )
                                )
                    except ValueError:
                        pass

                # Sub-model extraction
                # 1. Transitions
                transition_obj: Optional[TransitionData] = None
                raw_trans = raw_clip.get("transition") or raw_clip.get("appliedTransition")
                if isinstance(raw_trans, str):
                    raw_trans = {"transition_type": raw_trans, "duration": 0.5, "direction": "none"}
                
                if isinstance(raw_trans, dict):
                    trans_type = str(raw_trans.get("transition_type", raw_trans.get("type", raw_trans.get("name", "fade"))))
                    try:
                        trans_dur = float(raw_trans.get("duration", 0.5))
                        if trans_dur < 0:
                            errors.append(
                                TimelineValidationError(
                                    code="INVALID_TRANSITION",
                                    message=f"Transition on clip '{clip_id}' has negative duration.",
                                    track_id=track_id,
                                    clip_id=clip_id,
                                    field="transition.duration",
                                )
                            )
                            trans_dur = 0.5
                    except (ValueError, TypeError):
                        trans_dur = 0.5

                    speed_val = 1.0
                    try:
                        if "speed" in raw_trans:
                            speed_val = float(raw_trans.get("speed", 1.0))
                    except (ValueError, TypeError):
                        speed_val = 1.0

                    intensity_val = 50.0
                    try:
                        if "intensity" in raw_trans:
                            intensity_val = float(raw_trans.get("intensity", 50.0))
                    except (ValueError, TypeError):
                        intensity_val = 50.0

                    motion_blur_val = True
                    if "motion_blur" in raw_trans:
                        motion_blur_val = bool(raw_trans.get("motion_blur"))
                    elif "motionBlur" in raw_trans:
                        motion_blur_val = bool(raw_trans.get("motionBlur"))

                    raw_cat = raw_trans.get("category")
                    cat_val = str(raw_cat) if raw_cat is not None else None
                    raw_params = raw_trans.get("parameters")
                    params_val = raw_params if isinstance(raw_params, dict) else {}

                    transition_obj = TransitionData(
                        transition_type=trans_type,
                        duration=trans_dur,
                        direction=str(raw_trans.get("direction", "none")),
                        speed=speed_val,
                        intensity=intensity_val,
                        easing=str(raw_trans.get("easing", "ease-in-out")),
                        motion_blur=motion_blur_val,
                        category=cat_val,
                        parameters=params_val,
                    )

                # 2. Effects List Parsing (with backward compatibility for single 'effect' key)
                effects_list: List[EffectData] = []
                raw_effects = raw_clip.get("applied_effects") or raw_clip.get("appliedEffects") or []
                if not isinstance(raw_effects, list):
                    raw_effects = []
                if not raw_effects and raw_clip.get("effect") and isinstance(raw_clip.get("effect"), dict):
                    raw_effects = [raw_clip.get("effect")]

                for eff_item in raw_effects:
                    if isinstance(eff_item, dict):
                        eff_id = str(eff_item.get("effect_id", eff_item.get("id", eff_item.get("presetId", "effect-1"))))
                        eng_key = eff_item.get("engine_key", eff_item.get("engineKey", eff_item.get("presetId")))
                        try:
                            eff_int = float(eff_item.get("intensity", 1.0))
                        except (ValueError, TypeError):
                            eff_int = 1.0
                        try:
                            eff_op = float(eff_item.get("opacity", 1.0))
                        except (ValueError, TypeError):
                            eff_op = 1.0
                        b_mode = str(eff_item.get("blend_mode", eff_item.get("blendMode", "normal")))
                        kfs = eff_item.get("keyframes", []) if isinstance(eff_item.get("keyframes"), list) else []

                        effects_list.append(
                            EffectData(
                                effect_id=eff_id,
                                engine_key=str(eng_key) if eng_key else None,
                                intensity=max(0.0, min(1.0, eff_int)),
                                opacity=max(0.0, min(1.0, eff_op)),
                                blend_mode=b_mode,
                                parameters=eff_item.get("parameters", eff_item),
                                keyframes=kfs,
                            )
                        )

                # 3. Filters List Parsing (with backward compatibility for single 'filter' key)
                filters_list: List[FilterData] = []
                raw_filters = raw_clip.get("filters") or raw_clip.get("appliedFilters") or []
                if not isinstance(raw_filters, list):
                    raw_filters = []
                if not raw_filters and raw_clip.get("filter") and isinstance(raw_clip.get("filter"), dict):
                    raw_filters = [raw_clip.get("filter")]

                for filt_item in raw_filters:
                    if isinstance(filt_item, dict):
                        filt_id = str(filt_item.get("filter_id", filt_item.get("id", filt_item.get("filterId", "filter-1"))))
                        try:
                            intensity = float(filt_item.get("intensity", 1.0))
                            if intensity > 1.0:
                                intensity = intensity / 100.0
                        except (ValueError, TypeError):
                            intensity = 1.0
                        try:
                            filt_op = float(filt_item.get("opacity", 1.0))
                        except (ValueError, TypeError):
                            filt_op = 1.0
                        b_mode = str(filt_item.get("blend_mode", filt_item.get("blendMode", "normal")))
                        kfs = filt_item.get("keyframes", []) if isinstance(filt_item.get("keyframes"), list) else []

                        filters_list.append(
                            FilterData(
                                filter_id=filt_id,
                                intensity=max(0.0, min(1.0, intensity)),
                                opacity=max(0.0, min(1.0, filt_op)),
                                blend_mode=b_mode,
                                parameters=filt_item.get("parameters", filt_item),
                                keyframes=kfs,
                            )
                        )

                # 4. Text
                text_obj: Optional[TextData] = None
                raw_text = raw_clip.get("text")
                if isinstance(raw_text, dict):
                    text_obj = TextData(
                        content=str(raw_text.get("content", "")),
                        font=str(raw_text.get("font", "Inter")),
                        size=float(raw_text.get("size", 24.0)),
                        weight=str(raw_text.get("weight", "normal")),
                        color=str(raw_text.get("color", "#FFFFFF")),
                        stroke=raw_text.get("stroke"),
                        shadow=raw_text.get("shadow"),
                        alignment=str(raw_text.get("alignment", "center")),
                        animation=raw_text.get("animation"),
                        timing=raw_text.get("timing"),
                    )

                raw_media_url_str = str(raw_media_url) if raw_media_url else None
                if raw_media_url_str and "/storage/v1/object/public/" in raw_media_url_str:
                    parts = raw_media_url_str.split("/storage/v1/object/public/")
                    domain_part = parts[0]
                    if not domain_part and settings.SUPABASE_URL:
                        domain_part = settings.SUPABASE_URL.rstrip('/')
                    prefix = domain_part + "/storage/v1/object/public/"
                    remainder = parts[1]
                    known_buckets = ["videos", "assets", "images", "audio", "uploads", "exports", "thumbnails"]
                    if not any(remainder.startswith(f"{b}/") for b in known_buckets):
                        if asset_type == AssetType.VIDEO:
                            raw_media_url_str = f"{prefix}videos/{remainder}"
                        elif asset_type == AssetType.AUDIO:
                            raw_media_url_str = f"{prefix}audio/{remainder}"
                        elif asset_type == AssetType.IMAGE:
                            raw_media_url_str = f"{prefix}images/{remainder}"
                        else:
                            raw_media_url_str = f"{prefix}assets/{remainder}"
                    else:
                        raw_media_url_str = f"{prefix}{remainder}"
                elif raw_media_url_str and raw_media_url_str.startswith("/"):
                    if settings.SUPABASE_URL:
                        raw_media_url_str = f"{settings.SUPABASE_URL.rstrip('/')}{raw_media_url_str}"

                clip_keyframes = raw_clip.get("keyframes", [])
                if not isinstance(clip_keyframes, list):
                    clip_keyframes = []

                clip_model = ClipModel(
                    id=clip_id,
                    track_id=track_id,
                    asset_id=parsed_asset_id,
                    media_url=raw_media_url_str,
                    file_path=str(raw_file_path) if raw_file_path else None,
                    asset_type=asset_type,
                    start_time=start_time,
                    end_time=end_time,
                    duration=clip_dur,
                    trim_start=float(raw_clip.get("trim_start") or raw_clip.get("trimStart") or 0.0),
                    trim_end=float(raw_clip.get("trim_end") or raw_clip.get("trimEnd") or 0.0),
                    volume=float(raw_clip.get("volume") if raw_clip.get("volume") is not None else 1.0),
                    playback_speed=float(raw_clip.get("playback_speed") or raw_clip.get("speed") or 1.0),
                    opacity=float(raw_clip.get("opacity") if raw_clip.get("opacity") is not None else 1.0),
                    rotation=float(raw_clip.get("rotation") or 0.0),
                    scale=float(raw_clip.get("scale") or 1.0),
                    position=raw_clip.get("position", {"x": 0.0, "y": 0.0}),
                    layer=int(raw_clip.get("layer", 0)),
                    enabled=bool(raw_clip.get("enabled", True)),
                    locked=bool(raw_clip.get("locked", False)),
                    muted=bool(raw_clip.get("muted", False)),
                    hidden=bool(raw_clip.get("hidden", False)),
                    transition=transition_obj,
                    filters=filters_list,
                    applied_effects=effects_list,
                    text=text_obj,
                    keyframes=clip_keyframes,
                    metadata=raw_clip.get("metadata", {}),
                )
                normalized_clips.append(clip_model)

            # Check for overlapping clips within same track
            normalized_clips.sort(key=lambda c: c.start_time)
            for i in range(len(normalized_clips) - 1):
                c1 = normalized_clips[i]
                c2 = normalized_clips[i + 1]
                if c2.start_time < c1.end_time - 1e-4:
                    errors.append(
                        TimelineValidationError(
                            code="OVERLAPPING_CLIPS",
                            message=f"Overlapping clips detected on track '{track_id}': '{c1.id}' ends at {c1.end_time}s while '{c2.id}' starts at {c2.start_time}s.",
                            track_id=track_id,
                            clip_id=c2.id,
                        )
                    )

            if track_max_end_time > max_timeline_end_time:
                max_timeline_end_time = track_max_end_time

            track_model = TrackModel(
                id=track_id,
                name=str(raw_track.get("name", f"Track {track_idx + 1}")),
                type=track_type,
                order=order,
                muted=muted,
                hidden=hidden,
                locked=locked,
                clips=normalized_clips,
                duration=track_max_end_time,
            )
            normalized_tracks.append(track_model)

        normalized_tracks.sort(key=lambda t: t.order)
        final_timeline_duration = max(global_duration, max_timeline_end_time)

        if errors:
            logger.warning(f"Timeline Parser encountered {len(errors)} validation errors.")
            raise TimelineParserError(errors=errors)

        return TimelineModel(
            version="1.0",
            duration=final_timeline_duration,
            frame_rate=frame_rate,
            resolution=resolution,
            aspect_ratio=aspect_ratio,
            tracks=normalized_tracks,
            metadata=metadata,
        )
