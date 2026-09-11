import { MultiCommandParser } from './MultiCommandParser';
import { CommandValidator, ValidationResult } from './CommandValidator';
import { AICommand, ParseResult } from '../types/commands';
import { EditorContext } from '../types/context';
import { EditorContextProvider } from './EditorContextProvider';

export interface CommandEngineResult {
  success: boolean;
  command?: AICommand;
  commands?: AICommand[];
  isMultiCommand?: boolean;
  error?: string;
  context?: EditorContext;
}

export class CommandEngine {
  public static parse(prompt: string, context?: EditorContext): ParseResult {
    const activeContext = context ?? EditorContextProvider.getContext();
    return MultiCommandParser.parse(prompt, activeContext);
  }

  public static validate(command: AICommand, context?: EditorContext): ValidationResult {
    const activeContext = context ?? EditorContextProvider.getContext();
    return CommandValidator.validate(command, activeContext);
  }

  public static process(prompt: string, context?: EditorContext): CommandEngineResult {
    const activeContext = context ?? EditorContextProvider.getContext();
    const parseResult = MultiCommandParser.parse(prompt, activeContext);

    if (!parseResult.success || (!parseResult.command && (!parseResult.commands || parseResult.commands.length === 0))) {
      return {
        success: false,
        error: parseResult.error || 'Could not understand command',
        context: activeContext,
      };
    }

    if (parseResult.commands && parseResult.commands.length > 0) {
      for (const cmd of parseResult.commands) {
        const valRes = CommandValidator.validate(cmd, activeContext);
        if (!valRes.valid) {
          return {
            success: false,
            command: cmd,
            error: valRes.error || `Validation failed for ${cmd.action}`,
            context: activeContext,
          };
        }
      }
      return {
        success: true,
        command: parseResult.commands[0],
        commands: parseResult.commands,
        isMultiCommand: true,
        context: activeContext,
      };
    }

    const validationResult = CommandValidator.validate(parseResult.command!, activeContext);
    if (!validationResult.valid) {
      return {
        success: false,
        command: parseResult.command,
        error: validationResult.error || 'Command validation failed',
        context: activeContext,
      };
    }

    return {
      success: true,
      command: parseResult.command,
      context: activeContext,
    };
  }
}
