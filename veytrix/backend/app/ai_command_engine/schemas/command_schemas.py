from enum import Enum
from typing import Any, Dict, Optional, List
from pydantic import BaseModel, Field


class CommandAction(str, Enum):
    # Heavy & Backend Operations
    EXPORT = "export"
    SUBTITLES = "subtitles"
    CREDITS = "credits"
    RENDER_JOB = "render_job"
    AI_GENERATION = "ai_generation"

    # Placeholder extension points for editor syncing if needed in future
    TRANSCODE = "transcode"
    AUDIO_ENHANCE = "audio_enhance"


class CommandStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class BaseCommandPayload(BaseModel):
    action: CommandAction
    params: Dict[str, Any] = Field(default_factory=dict)
    project_id: Optional[str] = None
    user_id: Optional[str] = None


class CommandExecutionRequest(BaseModel):
    command_id: Optional[str] = None
    payload: BaseCommandPayload


class CommandExecutionResult(BaseModel):
    command_id: Optional[str] = None
    action: CommandAction
    status: CommandStatus
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
