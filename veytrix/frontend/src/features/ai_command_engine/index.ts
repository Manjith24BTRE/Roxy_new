// Components
export { AiAssistantPanel, default as AiAssistantPanelDefault } from './components/AiAssistantPanel';
export type { ChatMessage } from './components/AiAssistantPanel';

// Services
export { CommandEngine } from './services/CommandEngine';
export type { CommandEngineResult } from './services/CommandEngine';

export { CommandParser } from './services/CommandParser';

export { CommandValidator } from './services/CommandValidator';
export type { ValidationResult } from './services/CommandValidator';

export { CommandExecutor } from './services/CommandExecutor';
export type { CommandExecutionOptions, CommandExecutionResult } from './services/CommandExecutor';

export { EditorContextProvider } from './services/EditorContextProvider';

// Hooks
export { useAICommandEngine } from './hooks/useAICommandEngine';
export type { UseAICommandEngineReturn } from './hooks/useAICommandEngine';

// Types
export * from './types/commands';
export * from './types/context';

// Registry & Commands
export * from './registry';
export * from './commands/base/types';
export * from './commands/base/BaseCommand';

