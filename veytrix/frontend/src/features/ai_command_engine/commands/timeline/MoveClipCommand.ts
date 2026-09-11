import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const MOVE_CLIP_PATTERNS = [
  /\bmove\s+(selected\s+)?clip\s+to\s+(\d+(\.\d+)?)\s*s(ec|econds?)?\b/i,
  /\bshift\s+(selected\s+)?clip\s+to\s+(\d+(\.\d+)?)\s*s(ec|econds?)?\b/i,
  /\bposition\s+clip\s+at\s+(\d+(\.\d+)?)\s*s(ec|econds?)?\b/i,
];

export class MoveClipCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'move_clip',
    name: 'Move Clip',
    action: 'move_clip',
    category: 'timeline',
    aliases: ['move clip', 'shift clip', 'position clip'],
    description: 'Moves selected clip to target start time on timeline.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();
    for (const pattern of MOVE_CLIP_PATTERNS) {
      const match = lower.match(pattern);
      if (match) {
        const timeVal = parseFloat(match[2]);
        return {
          matched: true,
          confidence: 0.95,
          extractedParams: { target: context?.selectedClipId, targetTime: timeVal },
        };
      }
    }
    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    const targetClipId = params.target || context?.selectedClipId;
    if (!targetClipId) {
      return { valid: false, error: 'No clip selected to move.' };
    }
    if (typeof params.targetTime !== 'number' || params.targetTime < 0) {
      return { valid: false, error: 'Target time must be a positive number of seconds.' };
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
      return { success: false, error: 'No clip selected to move.' };
    }
    if (!editorApi?.moveClip) {
      return { success: false, error: 'Move clip handler is not connected to editor.' };
    }

    editorApi.moveClip(targetClipId, params.targetTime);
    return { success: true, message: `Moved clip to ${params.targetTime}s.` };
  }
}
