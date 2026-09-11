import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const ROTATE_EXPLICIT_PATTERNS = [
  /\brotate\s+(by\s+)?(-?\d+)\s*(deg|degrees)?\b/i,
  /\bturn\s+(by\s+)?(-?\d+)\s*(deg|degrees)?\b/i,
  /\bset\s+rotation\s+(to\s+)?(-?\d+)\s*(deg|degrees)?\b/i,
];

const ROTATE_PRESET_PATTERNS: Array<{ pattern: RegExp; angle: number }> = [
  { pattern: /\brotate\s+(90\s+degrees?\s+)?right\b/i, angle: 90 },
  { pattern: /\brotate\s+clockwise\b/i, angle: 90 },
  { pattern: /\brotate\s+(90\s+degrees?\s+)?left\b/i, angle: -90 },
  { pattern: /\brotate\s+counter\s*clockwise\b/i, angle: -90 },
  { pattern: /\bturn\s+upside\s+down\b/i, angle: 180 },
  { pattern: /\bflip\s+upside\s+down\b/i, angle: 180 },
  { pattern: /\brotate\s+180\b/i, angle: 180 },
];

export class RotateCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'rotate',
    name: 'Rotate Clip',
    action: 'rotate',
    category: 'transform',
    aliases: ['rotate', 'turn', 'rotate video', 'rotate clockwise', 'rotate right', 'rotate left'],
    description: 'Rotate clip orientation by specific degrees.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();

    for (const item of ROTATE_EXPLICIT_PATTERNS) {
      const match = lower.match(item);
      if (match) {
        return {
          matched: true,
          confidence: 0.98,
          extractedParams: { angle: parseInt(match[2], 10), target: context?.selectedClipId },
        };
      }
    }

    for (const item of ROTATE_PRESET_PATTERNS) {
      if (item.pattern.test(lower)) {
        return {
          matched: true,
          confidence: 0.95,
          extractedParams: { angle: item.angle, target: context?.selectedClipId },
        };
      }
    }

    if (/\b(rotate|turn)\b/i.test(lower)) {
      return {
        matched: true,
        confidence: 0.9,
        extractedParams: { angle: 90, target: context?.selectedClipId },
      };
    }

    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    const targetClipId = params.target || context?.selectedClipId;
    if (!targetClipId) {
      return { valid: false, error: 'No clip selected for rotation.' };
    }
    if (typeof params.angle !== 'number') {
      return { valid: false, error: 'Rotation angle must be a valid number.' };
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
      return { success: false, error: 'No clip selected for rotation.' };
    }
    if (!editorApi?.rotateClip) {
      return { success: false, error: 'Rotate handler is not connected to editor.' };
    }

    editorApi.rotateClip(targetClipId, params.angle);
    return { success: true, message: `Rotated clip by ${params.angle}°.` };
  }
}
