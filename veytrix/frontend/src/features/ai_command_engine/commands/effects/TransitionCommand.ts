import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const TRANSITION_TYPES = ['fade', 'dissolve', 'wipe', 'slide', 'zoom', 'blur'];

export class TransitionCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'transition',
    name: 'Add / Edit Transition',
    action: 'transition',
    category: 'effects',
    aliases: ['add transition', 'remove transition', 'transition duration', 'transition'],
    description: 'Adds, edits, or removes transitions between clips.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();

    if (/\bremove\s+transition\b/i.test(lower) || /\bdelete\s+transition\b/i.test(lower)) {
      return {
        matched: true,
        confidence: 0.95,
        extractedParams: { target: context?.selectedClipId, remove: true },
      };
    }

    const durationMatch = lower.match(/(\d+(\.\d+)?)\s*s(ec|econds?)?\s+(duration|transition)/i);
    const duration = durationMatch ? parseFloat(durationMatch[1]) : 1.0;

    for (const tType of TRANSITION_TYPES) {
      if (lower.includes(tType)) {
        return {
          matched: true,
          confidence: 0.95,
          extractedParams: {
            target: context?.selectedClipId,
            transitionType: tType,
            duration,
          },
        };
      }
    }

    if (/\b(add|insert|set)\s+transition\b/i.test(lower) || lower.includes('transition')) {
      return {
        matched: true,
        confidence: 0.88,
        extractedParams: {
          target: context?.selectedClipId,
          transitionType: 'fade',
          duration,
        },
      };
    }

    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    const targetClipId = params.target || context?.selectedClipId;
    if (!targetClipId) {
      return { valid: false, error: 'No clip selected for transition.' };
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
      return { success: false, error: 'No clip selected for transition.' };
    }

    if (params.remove) {
      if (!editorApi?.removeTransition) {
        return { success: false, error: 'Remove transition handler is not connected.' };
      }
      editorApi.removeTransition(targetClipId);
      return { success: true, message: 'Removed transition.' };
    }

    if (!editorApi?.addTransition) {
      return { success: false, error: 'Add transition handler is not connected.' };
    }

    editorApi.addTransition(targetClipId, params.transitionType || 'fade', params.duration || 1.0);
    return {
      success: true,
      message: `Added ${params.transitionType || 'fade'} transition (${params.duration || 1.0}s).`,
    };
  }
}
