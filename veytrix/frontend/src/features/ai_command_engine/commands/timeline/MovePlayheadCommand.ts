import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const MOVE_PLAYHEAD_PATTERNS = [
  /\b(move\s+playhead|seek|jump|go)\s+(to\s+)?(\d+):(\d+)\b/i,
  /\b(move\s+playhead|seek|jump|go)\s+(to\s+)?(\d+(\.\d+)?)\s*s(ec|econds?)?\b/i,
  /\bplayhead\s+(to\s+)?(\d+(\.\d+)?)\s*s(ec|econds?)?\b/i,
];

export class MovePlayheadCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'move_playhead',
    name: 'Move Playhead',
    action: 'move_playhead',
    category: 'timeline',
    aliases: ['move playhead', 'seek', 'jump to', 'go to time'],
    description: 'Seeks playhead to specific timestamp or seconds on timeline.',
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();

    // MM:SS format check
    const mmssMatch = lower.match(/\b(move\s+playhead|seek|jump|go)\s+(to\s+)?(\d+):(\d+)\b/i);
    if (mmssMatch) {
      const minutes = parseInt(mmssMatch[3], 10);
      const seconds = parseInt(mmssMatch[4], 10);
      const totalSeconds = minutes * 60 + seconds;
      return {
        matched: true,
        confidence: 0.96,
        extractedParams: { time: totalSeconds },
      };
    }

    for (const pattern of MOVE_PLAYHEAD_PATTERNS) {
      const match = lower.match(pattern);
      if (match) {
        const seconds = parseFloat(match[3]);
        return {
          matched: true,
          confidence: 0.95,
          extractedParams: { time: seconds },
        };
      }
    }

    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    if (typeof params.time !== 'number' || params.time < 0) {
      return { valid: false, error: 'Target playhead time must be a valid positive number.' };
    }
    return { valid: true };
  }

  public execute(
    params: Record<string, any>,
    editorApi?: EditorActionApi,
    context?: EditorContext
  ): CommandExecutionResult {
    if (!editorApi?.seekPlayhead) {
      return { success: false, error: 'Seek playhead handler is not connected to editor.' };
    }

    editorApi.seekPlayhead(params.time);
    return { success: true, message: `Seeked playhead to ${params.time}s.` };
  }
}
