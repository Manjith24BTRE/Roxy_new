from abc import ABC, abstractmethod
from typing import Any, Dict
from pydantic import BaseModel
from ..schemas.command_schemas import BaseCommandPayload


class CommandValidationResult(BaseModel):
    is_valid: bool
    error_message: str = ""
    missing_fields: list[str] = []


class BaseCommandValidator(ABC):
    """Abstract base validator class."""

    @abstractmethod
    def validate(self, payload: BaseCommandPayload) -> CommandValidationResult:
        pass

