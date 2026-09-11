import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const SPEED_EXPLICIT_PATTERNS = [
  /\bspeed\s+(up\s+to\s+)?(\d+(?:\.\d+)?)x?\b/i,
  /\bchange\s+speed\s+(to\s+)?(\d+(?:\.\d+)?)x?\b/i,
  /\bset\s+speed\s+(to\s+)?(\d+(?:\.\d+)?)x?\b/i,
  /\bplayback\s+rate\s+(to\s+)?(\d+(?:\.\d+)?)x?\b/i,
];

const SPEED_PRESET_PATTERNS: Array<{ pattern: RegExp; speed: number }> = [
  { pattern: /\bdouble\s+speed\b/i, speed: 2.0 },
  { pattern: /\bhalf\s+speed\b/i, speed: 0.5 },
  { pattern: /\btriple\s+speed\b/i, speed: 3.0 },
  { pattern: /\bmake\s+(it\s+)?faster\b/i, speed: 1.5 },
  { pattern: /\bslow\s+(it\s+)?down\b/i, speed: 0.75 },
  { pattern: /\bnormal\s+speed\b/i, speed: 1.0 },
  { pattern: /\breset\s+speed\b/i, speed: 1.0 },
];

export class SpeedCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'speed',
    name: 'Speed Clip',
    action: 'speed',
    category: 'timeline',
    aliases: ['speed', 'speed up', 'make faster', 'slow down', 'double speed', 'half speed', 'playback rate'],
    description: 'Adjust clip playback speed rate.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();

    for (const item of SPEED_EXPLICIT_PATTERNS) {
      const match = lower.match(item);
      if (match) {
        return {
          matched: true,
          confidence: 0.98,
          extractedParams: { speed: parseFloat(match[2]), target: context?.selectedClipId },
        };
      }
    }

    for (const item of SPEED_PRESET_PATTERNS) {
      if (item.pattern.test(lower)) {
        return {
          matched: true,
          confidence: 0.95,
          extractedParams: { speed: item.speed, target: context?.selectedClipId },
        };
      }
    }

    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    if (typeof params.speed !== 'number' || params.speed <= 0) {
      return { valid: false, error: 'Speed parameter must be a positive number.' };
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
      return { success: false, error: 'No clip selected for speed adjustment.' };
    }
    if (!editorApi?.setSpeed) {
      return { success: false, error: 'Speed handler is not connected to editor.' };
    }

    editorApi.setSpeed(targetClipId, params.speed);
    return { success: true, message: `Set playback speed to ${params.speed}x.` };
  }
}
