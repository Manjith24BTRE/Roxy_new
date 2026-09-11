from abc import ABC, abstractmethod
from typing import Any, Dict
from ..schemas.command_schemas import CommandAction, BaseCommandPayload, CommandExecutionResult, CommandStatus


class BaseBackendCommand(ABC):
    """Abstract base class for all backend AI commands."""

    action: CommandAction

    def __init__(self, payload: BaseCommandPayload):
        self.payload = payload

    @abstractmethod
    def validate(self) -> bool:
        """Validate command parameters prior to execution."""
        pass

    @abstractmethod
    async def execute(self) -> CommandExecutionResult:
        """Execute the command asynchronously."""
        pass
