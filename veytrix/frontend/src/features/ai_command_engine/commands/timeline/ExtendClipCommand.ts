import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const EXTEND_CLIP_PATTERNS = [
  /\bextend(\s+clip)?\s+by\s+(\d+(\.\d+)?)\s*s(ec|econds?)?\b/i,
  /\bmake\s+clip\s+longer\s+by\s+(\d+(\.\d+)?)\s*s(ec|econds?)?\b/i,
  /\blengthen\s+clip\s+by\s+(\d+(\.\d+)?)\s*s(ec|econds?)?\b/i,
];

export class ExtendClipCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'extend_clip',
    name: 'Extend Clip',
    action: 'extend_clip',
    category: 'timeline',
    aliases: ['extend clip', 'make clip longer', 'lengthen clip'],
    description: 'Extends clip end boundary by specified seconds.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();
    for (const pattern of EXTEND_CLIP_PATTERNS) {
      const match = lower.match(pattern);
      if (match) {
        const seconds = parseFloat(match[2]);
        return {
          matched: true,
          confidence: 0.95,
          extractedParams: { target: context?.selectedClipId, duration: seconds },
        };
      }
    }
    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    const targetClipId = params.target || context?.selectedClipId;
    if (!targetClipId) {
      return { valid: false, error: 'No clip selected to extend.' };
    }
    if (typeof params.duration !== 'number' || params.duration <= 0) {
      return { valid: false, error: 'Extension duration must be a positive number of seconds.' };
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
      return { success: false, error: 'No clip selected to extend.' };
    }
    if (!editorApi?.extendClip) {
      return { success: false, error: 'Extend clip handler is not connected to editor.' };
    }

    editorApi.extendClip(targetClipId, params.duration);
    return { success: true, message: `Extended clip by ${params.duration}s.` };
  }
}
