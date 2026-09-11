from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any

from app.ai_command_engine import (
    AICommandEngineService,
    CommandExecutionRequest,
    CommandExecutionResult,
)

router = APIRouter()
command_service = AICommandEngineService()


@router.post("/execute", response_model=CommandExecutionResult, summary="Execute AI Command")
async def execute_command(request: CommandExecutionRequest) -> CommandExecutionResult:
    """
    Executes an AI Command Engine request safely through backend command registry.
    """
    try:
        result = await command_service.execute_command(request)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI Command Engine execution error: {str(exc)}")
