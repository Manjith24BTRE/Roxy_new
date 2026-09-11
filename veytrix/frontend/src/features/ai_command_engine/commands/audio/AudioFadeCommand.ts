import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

export class AudioFadeCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'fade_in',
    name: 'Audio Fade & Normalize',
    action: 'fade_in',
    category: 'audio',
    aliases: ['fade in', 'fade out', 'audio fade', 'normalize volume', 'normalize audio'],
    description: 'Applies audio fade in/out durations or normalizes clip volume.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();

    // Normalize volume check
    if (lower.includes('normalize')) {
      return {
        matched: true,
        confidence: 0.95,
        extractedParams: { target: context?.selectedClipId, subAction: 'normalize' },
      };
    }

    const fadeInMatch = lower.match(/\bfade\s+in\s*(by\s*)?(\d+(\.\d+)?)\s*s(ec|econds?)?\b/i);
    const fadeOutMatch = lower.match(/\bfade\s+out\s*(by\s*)?(\d+(\.\d+)?)\s*s(ec|econds?)?\b/i);

    if (fadeInMatch || fadeOutMatch) {
      const fadeInSec = fadeInMatch ? parseFloat(fadeInMatch[2]) : 1.0;
      const fadeOutSec = fadeOutMatch ? parseFloat(fadeOutMatch[2]) : 1.0;

      return {
        matched: true,
        confidence: 0.95,
        extractedParams: {
          target: context?.selectedClipId,
          subAction: 'fade',
          fadeIn: fadeInSec,
          fadeOut: fadeOutSec,
        },
      };
    }

    if (lower.includes('fade')) {
      return {
        matched: true,
        confidence: 0.88,
        extractedParams: {
          target: context?.selectedClipId,
          subAction: 'fade',
          fadeIn: 1.0,
          fadeOut: 1.0,
        },
      };
    }

    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    const targetClipId = params.target || context?.selectedClipId;
    if (!targetClipId) {
      return { valid: false, error: 'No clip selected for audio operation.' };
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
      return { success: false, error: 'No clip selected for audio operation.' };
    }

    if (params.subAction === 'normalize') {
      if (!editorApi?.normalizeVolume) {
        return { success: false, error: 'Normalize volume handler is not connected.' };
      }
      editorApi.normalizeVolume(targetClipId);
      return { success: true, message: 'Normalized clip volume.' };
    }

    if (!editorApi?.setAudioFade) {
      return { success: false, error: 'Set audio fade handler is not connected.' };
    }

    editorApi.setAudioFade(targetClipId, params.fadeIn || 1.0, params.fadeOut || 1.0);
    return {
      success: true,
      message: `Set audio fade in (${params.fadeIn || 1.0}s) and fade out (${params.fadeOut || 1.0}s).`,
    };
  }
}
