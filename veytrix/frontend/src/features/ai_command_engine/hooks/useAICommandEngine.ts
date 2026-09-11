import { useCallback } from 'react';
import { CommandEngine } from '../services/CommandEngine';
import { CommandExecutor, CommandExecutionOptions, CommandExecutionResult } from '../services/CommandExecutor';
import { EditorContextProvider } from '../services/EditorContextProvider';
import { AICommand, ParseResult } from '../types/commands';
import { EditorContext } from '../types/context';
import { ValidationResult } from '../services/CommandValidator';

export interface UseAICommandEngineReturn {
  parsePrompt: (prompt: string, context?: EditorContext) => ParseResult;
  validateCommand: (command: AICommand, context?: EditorContext) => ValidationResult;
  executeCommand: (command: AICommand, options?: CommandExecutionOptions) => CommandExecutionResult;
  getCurrentContext: () => EditorContext;
}

export function useAICommandEngine(): UseAICommandEngineReturn {
  const parsePrompt = useCallback((prompt: string, context?: EditorContext): ParseResult => {
    return CommandEngine.parse(prompt, context);
  }, []);

  const validateCommand = useCallback((command: AICommand, context?: EditorContext): ValidationResult => {
    return CommandEngine.validate(command, context);
  }, []);

  const executeCommand = useCallback(
    (command: AICommand, options?: CommandExecutionOptions): CommandExecutionResult => {
      return CommandExecutor.execute(command, options);
    },
    []
  );

  const getCurrentContext = useCallback((): EditorContext => {
    return EditorContextProvider.getContext();
  }, []);

  return {
    parsePrompt,
    validateCommand,
    executeCommand,
    getCurrentContext,
  };
}
