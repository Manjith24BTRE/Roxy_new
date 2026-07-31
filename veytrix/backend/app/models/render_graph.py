"""FFmpeg Render Graph and Command models representing generated FFmpeg filter graphs and execution parameters without running FFmpeg."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class FFmpegInput(BaseModel):
    """FFmpeg input file definition."""

    index: int = Field(..., description="Zero-based input index flag -i")
    path: str = Field(..., description="Local file path or lavfi source string")
    format: Optional[str] = Field(None, description="Input format specifier e.g. -f lavfi")
    options: List[str] = Field(default_factory=list, description="Input-specific flags (e.g. -ss, -t, -loop 1)")


class FilterNode(BaseModel):
    """FFmpeg filter node in a complex filter graph chain."""

    inputs: List[str] = Field(default_factory=list, description="Input stream labels e.g. ['0:v', '1:v']")
    filter_name: str = Field(..., description="FFmpeg filter name e.g. 'scale', 'drawtext', 'xfade'")
    args: str = Field(default="", description="Filter arguments string")
    outputs: List[str] = Field(default_factory=list, description="Output stream labels e.g. ['v1_scaled']")

    def to_filter_string(self) -> str:
        """Serializes filter node to standard FFmpeg filtergraph syntax."""
        in_str = "".join(f"[{i}]" for i in self.inputs)
        out_str = "".join(f"[{o}]" for o in self.outputs)
        args_str = f"={self.args}" if self.args else ""
        return f"{in_str}{self.filter_name}{args_str}{out_str}"


class RenderGraphDefinition(BaseModel):
    """Complete FFmpeg command render definition payload produced by FFmpegBuilder."""

    inputs: List[FFmpegInput] = Field(default_factory=list, description="All input file streams")
    filter_graph: List[FilterNode] = Field(default_factory=list, description="Complex filter graph nodes")
    video_map: str = Field(default="[outv]", description="Final video stream label")
    audio_map: Optional[str] = Field(default="[outa]", description="Final audio stream label")
    vcodec: str = Field(default="libx264", description="Target video encoder codec")
    acodec: str = Field(default="aac", description="Target audio encoder codec")
    bitrate: str = Field(default="8M", description="Target video bitrate")
    audio_bitrate: str = Field(default="192k", description="Target audio bitrate")
    fps: int = Field(default=30, description="Target frame rate")
    resolution: str = Field(default="1080p", description="Target output resolution label")
    width: int = Field(default=1920, description="Target frame width")
    height: int = Field(default=1080, description="Target frame height")
    format: str = Field(default="mp4", description="Output container format extension")
    command_args: List[str] = Field(default_factory=list, description="Full ordered FFmpeg CLI execution arguments array")
    command_string: str = Field(default="", description="Human-readable CLI command string")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Build metadata details")
