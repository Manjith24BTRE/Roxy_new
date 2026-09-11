import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const DELETE_PATTERNS = [
  /\bdelete(\s+clip)?\b/i,
  /\bremove(\s+clip)?\b/i,
  /\btrash(\s+clip)?\b/i,
  /\berase(\s+clip)?\b/i,
  /\bdiscard(\s+clip)?\b/i,
  /\bget\s+rid\s+of(\s+clip)?\b/i,
  /\bclear\s+selected\b/i,
];

export class DeleteCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'delete',
    name: 'Delete Clip',
    action: 'delete',
    category: 'timeline',
    aliases: ['delete', 'remove clip', 'trash', 'remove', 'erase clip', 'discard', 'get rid of clip'],
    description: 'Deletes selected clip from timeline.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();
    const isDelete = DELETE_PATTERNS.some((p) => p.test(lower));
    if (isDelete) {
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
      return { valid: false, error: 'No clip selected for deletion.' };
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
      return { success: false, error: 'No clip selected for deletion.' };
    }

    if (!editorApi?.deleteClip) {
      return { success: false, error: 'Delete handler is not connected to editor.' };
    }

    editorApi.deleteClip(targetClipId);
    return { success: true, message: 'Deleted selected clip successfully.' };
  }
}
