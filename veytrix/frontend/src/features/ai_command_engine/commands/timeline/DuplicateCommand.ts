import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const DUPLICATE_PATTERNS = [
  /\bduplicate(\s+clip|\s+video|\s+track)?\b/i,
  /\bcopy\s+(this\s+)?clip\b/i,
  /\bmake\s+a?\s*copy\b/i,
  /\bclone(\s+clip|\s+video|\s+track)?\b/i,
  /\breplicate(\s+clip)?\b/i,
];

export class DuplicateCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'duplicate',
    name: 'Duplicate Clip',
    action: 'delete',
    category: 'timeline',
    aliases: ['duplicate', 'duplicate clip', 'copy clip', 'clone clip', 'make a copy', 'replicate clip'],
    description: 'Duplicates the currently selected clip on the timeline.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();
    const isMatch = DUPLICATE_PATTERNS.some((p) => p.test(lower));
    if (isMatch) {
      return {
        matched: true,
        confidence: 0.98,
        extractedParams: { target: context?.selectedClipId },
      };
    }
    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    const targetClipId = params.target || context?.selectedClipId;
    if (!targetClipId) {
      return { valid: false, error: 'No clip selected for duplication.' };
    }
    return { valid: true };
  }

  public execute(
    params: Record<string, any>,
    editorApi?: EditorActionApi,
    context?: EditorContext
  ): CommandExecutionResult {
    const targetClipId = params.target || context?.selectedClipId;
    if (!targetClipId) {
      return { success: false, error: 'No clip selected for duplication.' };
    }
    if (!editorApi?.duplicateClip) {
      return { success: false, error: 'Duplicate handler is not connected to editor.' };
    }

    editorApi.duplicateClip(targetClipId);
    return { success: true, message: 'Duplicated clip successfully.' };
  }
}
