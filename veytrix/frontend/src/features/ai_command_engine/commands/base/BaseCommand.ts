import { ICommandModule, CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from './types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

export abstract class BaseCommand implements ICommandModule {
  public abstract metadata: CommandMetadata;

  public abstract parse(prompt: string, context?: EditorContext): CommandParseMatch;

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    return { valid: true };
  }

  public abstract execute(
    params: Record<string, any>,
    editorApi?: EditorActionApi,
    context?: EditorContext
  ): Promise<CommandExecutionResult> | CommandExecutionResult;
}
