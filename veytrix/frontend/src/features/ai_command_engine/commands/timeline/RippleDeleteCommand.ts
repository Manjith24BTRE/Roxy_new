import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const RIPPLE_DELETE_PATTERNS = [
  /\bripple\s+delete(\s+clip)?\b/i,
  /\bripple\s+remove(\s+clip)?\b/i,
  /\bdelete\s+and\s+close\s+gap\b/i,
  /\bremove\s+and\s+close\s+gap\b/i,
  /\bclose\s+gap\s+delete\b/i,
];

export class RippleDeleteCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'ripple_delete',
    name: 'Ripple Delete Clip',
    action: 'ripple_delete',
    category: 'timeline',
    aliases: ['ripple delete', 'ripple remove', 'delete and close gap', 'remove and close gap'],
    description: 'Deletes selected clip and shifts subsequent clips left to close the timeline gap.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();
    const isMatch = RIPPLE_DELETE_PATTERNS.some((p) => p.test(lower));
    if (isMatch) {
      return {
        matched: true,
        confidence: 0.98,
        extractedParams: { target: context?.selectedClipId, ripple: true },
      };
    }
    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    const targetClipId = params.target || context?.selectedClipId;
    if (!targetClipId) {
      return { valid: false, error: 'No clip selected for ripple deletion.' };
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
      return { success: false, error: 'No clip selected for ripple deletion.' };
    }

    if (!editorApi?.deleteClip) {
      return { success: false, error: 'Delete handler is not connected to editor.' };
    }

    editorApi.deleteClip(targetClipId, true);
    return { success: true, message: 'Ripple deleted clip and closed timeline gap.' };
  }
}
