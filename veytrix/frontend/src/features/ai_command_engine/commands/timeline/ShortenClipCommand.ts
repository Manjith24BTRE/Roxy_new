import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const SHORTEN_CLIP_PATTERNS = [
  /\bshorten(\s+clip)?\s+by\s+(\d+(\.\d+)?)\s*s(ec|econds?)?\b/i,
  /\bmake\s+clip\s+shorter\s+by\s+(\d+(\.\d+)?)\s*s(ec|econds?)?\b/i,
  /\breduce\s+clip\s+by\s+(\d+(\.\d+)?)\s*s(ec|econds?)?\b/i,
];

export class ShortenClipCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'shorten_clip',
    name: 'Shorten Clip',
    action: 'shorten_clip',
    category: 'timeline',
    aliases: ['shorten clip', 'make clip shorter', 'reduce clip'],
    description: 'Shortens clip end boundary by specified seconds.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();
    for (const pattern of SHORTEN_CLIP_PATTERNS) {
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
      return { valid: false, error: 'No clip selected to shorten.' };
    }
    if (typeof params.duration !== 'number' || params.duration <= 0) {
      return { valid: false, error: 'Shorten duration must be a positive number of seconds.' };
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
      return { success: false, error: 'No clip selected to shorten.' };
    }
    if (!editorApi?.shortenClip) {
      return { success: false, error: 'Shorten clip handler is not connected to editor.' };
    }

    editorApi.shortenClip(targetClipId, params.duration);
    return { success: true, message: `Shortened clip by ${params.duration}s.` };
  }
}
