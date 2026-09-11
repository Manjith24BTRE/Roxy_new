import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const EFFECT_NAMES = [
  'brightness',
  'contrast',
  'saturation',
  'hue',
  'blur',
  'sharpen',
  'vignette',
  'grain',
  'glow',
];

export class EffectCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'effect',
    name: 'Apply Visual Effect',
    action: 'effect',
    category: 'effects',
    aliases: ['brightness', 'contrast', 'saturation', 'hue', 'blur', 'sharpen', 'vignette', 'grain', 'glow', 'add effect', 'apply effect'],
    description: 'Applies visual effects (brightness, contrast, blur, etc.) to selected clip.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();

    for (const effectName of EFFECT_NAMES) {
      if (lower.includes(effectName)) {
        // Check intensity percentage or numerical value
        const intensityMatch = lower.match(/(\d+)\s*(%|percent)?/);
        const intensity = intensityMatch ? parseInt(intensityMatch[1], 10) : 50;

        return {
          matched: true,
          confidence: 0.94,
          extractedParams: {
            target: context?.selectedClipId,
            effectType: effectName,
            intensity,
          },
        };
      }
    }

    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    const targetClipId = params.target || context?.selectedClipId;
    if (!targetClipId) {
      return { valid: false, error: 'No clip selected for applying effect.' };
    }
    if (!params.effectType) {
      return { valid: false, error: 'Must specify a valid effect name.' };
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
      return { success: false, error: 'No clip selected for applying effect.' };
    }
    if (!editorApi?.applyEffect) {
      return { success: false, error: 'Apply effect handler is not connected.' };
    }

    editorApi.applyEffect(targetClipId, params.effectType, params.intensity);
    return { success: true, message: `Applied ${params.effectType} effect (${params.intensity}% intensity).` };
  }
}
