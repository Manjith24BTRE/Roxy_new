"""Timeline models for parsing, validating, and normalizing frontend editor timeline JSON."""

from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from app.models.enums import AssetType, PlanType


class TrackType(str, Enum):
    """Supported timeline track types."""

    VIDEO = "VIDEO"
    AUDIO = "AUDIO"
    TEXT = "TEXT"
    OVERLAY = "OVERLAY"
    IMAGE = "IMAGE"
    STICKER = "STICKER"
    EFFECT = "EFFECT"
    FILTER = "FILTER"
    TRANSITION = "TRANSITION"
    AI = "AI"


class TransitionData(BaseModel):
    """Timeline transition metadata model."""

    transition_type: str = Field(..., description="Transition type name (e.g., fade, wipe, dissolve)")
    duration: float = Field(..., ge=0.0, description="Transition duration in seconds")
    direction: Optional[str] = Field("none", description="Transition direction: 'left', 'right', 'up', 'down', 'cw', 'ccw', 'center', 'none'")
    speed: Optional[float] = Field(1.0, ge=0.1, le=5.0, description="Speed rate multiplier")
    intensity: Optional[float] = Field(50.0, ge=0.0, le=100.0, description="Effect intensity percentage")
    easing: Optional[str] = Field("ease-in-out", description="Easing curve algorithm")
    motion_blur: Optional[bool] = Field(True, description="Whether motion blur pass is enabled")
    category: Optional[str] = Field(None, description="Transition category classification")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Additional transition parameters")


class EffectData(BaseModel):
    """Effect metadata model."""

    effect_id: str = Field(..., description="Unique effect identifier")
    engine_key: Optional[str] = Field(None, description="Engine key for rendering effect")
    intensity: float = Field(default=1.0, ge=0.0, le=1.0, description="Effect intensity multiplier")
    opacity: float = Field(default=1.0, ge=0.0, le=1.0, description="Effect opacity level")
    blend_mode: str = Field(default="normal", description="Blend mode (e.g. normal, multiply, screen)")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Effect parameters")
    keyframes: List[Dict[str, Any]] = Field(default_factory=list, description="Keyframe animation points")
    required_plan: PlanType = Field(default=PlanType.FREE, description="Subscription plan required for effect")


class FilterData(BaseModel):
    """Filter metadata model."""

    filter_id: str = Field(..., description="Filter identifier")
    intensity: float = Field(default=1.0, ge=0.0, le=1.0, description="Filter intensity factor from 0.0 to 1.0")
    opacity: float = Field(default=1.0, ge=0.0, le=1.0, description="Filter opacity level from 0.0 to 1.0")
    blend_mode: str = Field(default="normal", description="Blend mode (e.g. normal, multiply, screen)")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Filter parameters")
    keyframes: List[Dict[str, Any]] = Field(default_factory=list, description="Keyframe animation points")


class TextData(BaseModel):
    """Text clip metadata model."""

    content: str = Field(..., description="Text content string")
    font: str = Field(default="Inter", description="Font family name")
    size: float = Field(default=24.0, gt=0.0, description="Font size in points/pixels")
    weight: str = Field(default="normal", description="Font weight (e.g. bold, normal, 700)")
    color: str = Field(default="#FFFFFF", description="Text color hex code")
    stroke: Optional[Dict[str, Any]] = Field(None, description="Stroke options: color, width")
    shadow: Optional[Dict[str, Any]] = Field(None, description="Shadow options: color, blur, offset_x, offset_y")
    alignment: str = Field(default="center", description="Text alignment: left, center, right")
    animation: Optional[Dict[str, Any]] = Field(None, description="Text animation settings")
    timing: Optional[Dict[str, Any]] = Field(None, description="In-clip text timing keyframes")


class ClipModel(BaseModel):
    """Normalized internal clip representation."""

    id: str = Field(default_factory=lambda: str(uuid4()))
    track_id: str = Field(..., description="Parent track identifier")
    asset_id: Optional[UUID] = Field(None, description="Referenced asset UUID if applicable")
    media_url: Optional[str] = Field(None, description="Direct URL or media source path")
    file_path: Optional[str] = Field(None, description="Local file system path")
    asset_type: AssetType = Field(default=AssetType.VIDEO, description="Type of asset/clip")
    start_time: float = Field(..., ge=0.0, description="Clip start time on timeline in seconds")
    end_time: float = Field(..., ge=0.0, description="Clip end time on timeline in seconds")
    duration: float = Field(..., ge=0.0, description="Calculated clip duration in seconds")
    trim_start: float = Field(default=0.0, ge=0.0, description="Media trim start offset")
    trim_end: float = Field(default=0.0, ge=0.0, description="Media trim end offset")
    volume: float = Field(default=1.0, ge=0.0, le=2.0, description="Audio volume multiplier")
    playback_speed: float = Field(default=1.0, gt=0.0, description="Playback speed multiplier")
    opacity: float = Field(default=1.0, ge=0.0, le=1.0, description="Visual opacity")
    rotation: float = Field(default=0.0, description="Rotation angle in degrees")
    scale: float = Field(default=1.0, gt=0.0, description="Scale factor")
    position: Dict[str, float] = Field(default_factory=lambda: {"x": 0.0, "y": 0.0}, description="Position offset (x, y)")
    layer: int = Field(default=0, description="Z-layer ordering")
    enabled: bool = Field(default=True, description="Whether clip is active")
    locked: bool = Field(default=False, description="Whether clip is locked")
    muted: bool = Field(default=False, description="Whether audio is muted")
    hidden: bool = Field(default=False, description="Whether clip is hidden from view")
    transition: Optional[TransitionData] = Field(None, description="Optional transition attached to clip")
    filters: List[FilterData] = Field(default_factory=list, description="List of applied filters")
    applied_effects: List[EffectData] = Field(default_factory=list, description="List of applied effects")
    text: Optional[TextData] = Field(None, description="Optional text properties if text clip")
    keyframes: List[Dict[str, Any]] = Field(default_factory=list, description="Clip transform keyframes")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Custom metadata attributes")

    @property
    def filter(self) -> Optional[FilterData]:
        """Backwards compatibility accessor for primary filter."""
        return self.filters[0] if self.filters else None

    @property
    def effect(self) -> Optional[EffectData]:
        """Backwards compatibility accessor for primary effect."""
        return self.applied_effects[0] if self.applied_effects else None


class TrackModel(BaseModel):
    """Normalized internal track representation."""

    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str = Field(default="Track", description="Track label")
    type: TrackType = Field(default=TrackType.VIDEO, description="Track category type")
    order: int = Field(default=0, description="Track visual/rendering order index")
    muted: bool = Field(default=False, description="Track-wide audio mute")
    hidden: bool = Field(default=False, description="Track-wide hidden flag")
    locked: bool = Field(default=False, description="Track-wide lock flag")
    clips: List[ClipModel] = Field(default_factory=list, description="Clips residing on this track")
    duration: float = Field(default=0.0, ge=0.0, description="Calculated track total duration")


class TimelineModel(BaseModel):
    """Normalized internal backend timeline model."""

    version: str = Field(default="1.0", description="Timeline model schema version")
    duration: float = Field(default=0.0, ge=0.0, description="Total project timeline duration in seconds")
    frame_rate: int = Field(default=30, ge=15, le=60, description="Target frame rate")
    resolution: str = Field(default="1080p", description="Project resolution standard")
    aspect_ratio: str = Field(default="16:9", description="Canvas aspect ratio")
    tracks: List[TrackModel] = Field(default_factory=list, description="Ordered list of tracks")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Global timeline metadata")


class TimelineValidationError(BaseModel):
    """Structured validation error detail."""

    code: str = Field(..., description="Error classification code")
    message: str = Field(..., description="Human-readable error description")
    track_id: Optional[str] = Field(None, description="Affected track ID if applicable")
    clip_id: Optional[str] = Field(None, description="Affected clip ID if applicable")
    field: Optional[str] = Field(None, description="Affected JSON field name")
