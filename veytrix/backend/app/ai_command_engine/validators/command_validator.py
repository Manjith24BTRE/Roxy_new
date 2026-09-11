from typing import Dict, Any, Type
from .base_validator import CommandValidationResult
from ..schemas.command_schemas import BaseCommandPayload, CommandAction


class CommandValidator:
    """Validates payload inputs for registered backend AI commands."""

    REQUIRED_PARAMS: Dict[CommandAction, list[str]] = {
        CommandAction.EXPORT: ["format"],
        CommandAction.SUBTITLES: ["language"],
        CommandAction.CREDITS: ["title"],
        CommandAction.RENDER_JOB: ["preset"],
        CommandAction.AI_GENERATION: ["prompt"],
    }

    @classmethod
    def validate(cls, payload: BaseCommandPayload) -> CommandValidationResult:
        required = cls.REQUIRED_PARAMS.get(payload.action, [])
        missing = [param for param in required if param not in payload.params]

        if missing:
            return CommandValidationResult(
                is_valid=False,
                error_message=f"Missing required parameters for {payload.action.value}: {', '.join(missing)}",
                missing_fields=missing,
            )

        return CommandValidationResult(is_valid=True)
