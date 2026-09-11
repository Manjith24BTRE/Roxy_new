import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const SELECT_PATTERNS = [
  /\bselect\s+clip\s+(#?(\w+))\b/i,
  /\bselect\s+track\s+(#?(\w+))\b/i,
  /\bhighlight\s+clip\s+(#?(\w+))\b/i,
];

export class SelectCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'select_clip',
    name: 'Select Clip / Track',
    action: 'select_clip',
    category: 'timeline',
    aliases: ['select clip', 'select track', 'highlight clip'],
    description: 'Selects specific clip or track by ID or index.',
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();

    const trackMatch = lower.match(/\bselect\s+track\s+(#?(\w+))\b/i);
    if (trackMatch) {
      return {
        matched: true,
        confidence: 0.95,
        extractedParams: { targetType: 'track', targetId: trackMatch[2] },
      };
    }

    const clipMatch = lower.match(/\bselect\s+(clip\s+)?(#?(\w+))\b/i);
    if (clipMatch) {
      return {
        matched: true,
        confidence: 0.92,
        extractedParams: { targetType: 'clip', targetId: clipMatch[2] },
      };
    }

    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    if (!params.targetId) {
      return { valid: false, error: 'Must specify clip or track identifier to select.' };
    }
    return { valid: true };
  }

  public execute(
    params: Record<string, any>,
    editorApi?: EditorActionApi,
    context?: EditorContext
  ): CommandExecutionResult {
    if (params.targetType === 'track') {
      if (!editorApi?.selectTrack) {
        return { success: false, error: 'Select track handler is not connected.' };
      }
      editorApi.selectTrack(params.targetId);
      return { success: true, message: `Selected track ${params.targetId}.` };
    }

    if (!editorApi?.selectClip) {
      return { success: false, error: 'Select clip handler is not connected.' };
    }
    editorApi.selectClip(params.targetId);
    return { success: true, message: `Selected clip ${params.targetId}.` };
  }
}
