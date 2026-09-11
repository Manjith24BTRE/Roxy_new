from typing import Dict, Type, Optional
from ..schemas.command_schemas import (
    CommandAction,
    CommandStatus,
    BaseCommandPayload,
    CommandExecutionRequest,
    CommandExecutionResult,
)
from ..commands import (
    BaseBackendCommand,
    ExportCommand,
    SubtitlesCommand,
    CreditsCommand,
    RenderJobsCommand,
    AIGenerationCommand,
    PlaceholderCommand,
)
from ..validators import CommandValidator


class AICommandEngineService:
    """Core backend engine service orchestrating AI command validation and execution."""

    COMMAND_REGISTRY: Dict[CommandAction, Type[BaseBackendCommand]] = {
        CommandAction.EXPORT: ExportCommand,
        CommandAction.SUBTITLES: SubtitlesCommand,
        CommandAction.CREDITS: CreditsCommand,
        CommandAction.RENDER_JOB: RenderJobsCommand,
        CommandAction.AI_GENERATION: AIGenerationCommand,
    }

    async def execute_command(self, request: CommandExecutionRequest) -> CommandExecutionResult:
        payload = request.payload
        validation = CommandValidator.validate(payload)

        if not validation.is_valid:
            return CommandExecutionResult(
                command_id=request.command_id,
                action=payload.action,
                status=CommandStatus.FAILED,
                error=validation.error_message,
            )

        command_cls = self.COMMAND_REGISTRY.get(payload.action, PlaceholderCommand)
        if command_cls == PlaceholderCommand:
            command_instance = PlaceholderCommand(action=payload.action, payload=payload)
        else:
            command_instance = command_cls(payload=payload)

        return await command_instance.execute()
