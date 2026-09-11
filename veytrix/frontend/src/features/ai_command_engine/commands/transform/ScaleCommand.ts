import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const SCALE_EXPLICIT_PATTERNS = [
  /\bscale\s+(to\s+)?(\d+(?:\.\d+)?)(%|x)?\b/i,
  /\bset\s+scale\s+(to\s+)?(\d+(?:\.\d+)?)(%|x)?\b/i,
  /\bzoom\s+(to\s+)?(\d+(?:\.\d+)?)(%|x)?\b/i,
  /\bresize\s+(to\s+)?(\d+(?:\.\d+)?)(%|x)?\b/i,
];

const SCALE_PRESETS: Array<{ pattern: RegExp; scale: number }> = [
  { pattern: /\bdouble\s+size\b/i, scale: 200 },
  { pattern: /\bhalf\s+size\b/i, scale: 50 },
  { pattern: /\breset\s+scale\b/i, scale: 100 },
  { pattern: /\bfit\s+(to\s+)?screen\b/i, scale: 100 },
];

export class ScaleCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'scale',
    name: 'Scale Clip',
    action: 'scale',
    category: 'transform',
    aliases: ['scale', 'zoom', 'resize', 'double size', 'half size', 'reset scale', 'fit to screen'],
    description: 'Adjust visual scale size of clip.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();

    for (const item of SCALE_EXPLICIT_PATTERNS) {
      const match = lower.match(item);
      if (match) {
        let val = parseFloat(match[2]);
        const unit = match[3];
        if (unit === 'x' && val <= 10) {
          val = val * 100;
        }
        return {
          matched: true,
          confidence: 0.98,
          extractedParams: { scale: val, target: context?.selectedClipId },
        };
      }
    }

    for (const item of SCALE_PRESETS) {
      if (item.pattern.test(lower)) {
        return {
          matched: true,
          confidence: 0.95,
          extractedParams: { scale: item.scale, target: context?.selectedClipId },
        };
      }
    }

    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    const targetClipId = params.target || context?.selectedClipId;
    if (!targetClipId) {
      return { valid: false, error: 'No clip selected for scale adjustment.' };
    }
    if (typeof params.scale !== 'number' || params.scale <= 0 || params.scale > 500) {
      return { valid: false, error: 'Scale percentage must be between 1% and 500%.' };
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
      return { success: false, error: 'No clip selected for scale adjustment.' };
    }
    if (!editorApi?.setScale) {
      return { success: false, error: 'Scale handler is not connected to editor.' };
    }

    editorApi.setScale(targetClipId, params.scale);
    return { success: true, message: `Set clip scale to ${params.scale}%.` };
  }
}
