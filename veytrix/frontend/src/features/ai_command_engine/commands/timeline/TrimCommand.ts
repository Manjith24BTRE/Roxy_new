import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const TRIM_PATTERNS = [
  /\btrim\b/i,
  /\bshorten\b/i,
  /\bcut\b/i,
  /\bremove\s+(intro|beginning|head|start)\b/i,
  /\bcrop\s+start\b/i,
  /\btrim\s+first\b/i,
  /\bcut\s+(off\s+)?first\b/i,
  /\bshave\s+off\b/i,
];

export class TrimCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'trim',
    name: 'Trim Clip',
    action: 'trim',
    category: 'timeline',
    aliases: ['trim', 'shorten', 'cut beginning', 'remove intro', 'shave off'],
    description: 'Trims clip from start duration.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();
    const isTrimIntent = TRIM_PATTERNS.some((p) => p.test(lower));

    if (!isTrimIntent) {
      return { matched: false, confidence: 0 };
    }

    const durationMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:seconds?|sec|s|minutes?|min|m)?\b/i);
    if (!durationMatch) {
      return {
        matched: true,
        confidence: 0.85,
        missingParams: ['duration'],
        message: 'How many seconds would you like to trim?',
      };
    }

    const rawVal = parseFloat(durationMatch[1]);
    const isMin = /\b(minutes?|min|m)\b/i.test(lower);
    const seconds = isMin ? rawVal * 60 : rawVal;

    return {
      matched: true,
      confidence: 0.98,
      extractedParams: {
        start: 0,
        end: seconds,
        target: context?.selectedClipId,
      },
    };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    if (typeof params.start !== 'number' || typeof params.end !== 'number') {
      return { valid: false, error: 'Trim command requires numeric start and end parameters' };
    }
    if (params.start < 0 || params.end < 0) {
      return { valid: false, error: 'Trim parameters must be positive numbers' };
    }
    if (params.start >= params.end) {
      return { valid: false, error: 'Trim start time must be less than end time' };
    }

    const trimAmount = params.end - params.start;
    if (context?.clipDuration && trimAmount >= context.clipDuration) {
      return { valid: false, error: 'Cannot trim beyond clip duration' };
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
      return { success: false, error: 'Trim command target missing. Please select a clip first.' };
    }

    const start = typeof params.start === 'number' ? params.start : 0;
    const end = params.end;
    if (typeof end !== 'number') {
      return { success: false, error: 'Trim command requires a numeric end parameter.' };
    }

    if (!editorApi?.trimClip) {
      return { success: false, error: 'Trim execution handler is not connected to the editor.' };
    }

    try {
      editorApi.trimClip(targetClipId, start, end);
      return {
        success: true,
        message: `Successfully trimmed clip ${targetClipId} from ${start}s to ${end}s`,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error executing trim command on editor.' };
    }
  }
}
