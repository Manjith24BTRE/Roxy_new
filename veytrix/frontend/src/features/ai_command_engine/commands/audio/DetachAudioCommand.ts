import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const DETACH_AUDIO_PATTERNS = [
  /\bdetach\s+audio\b/i,
  /\bextract\s+audio\b/i,
  /\bseparate\s+audio\b/i,
  /\bsplit\s+audio(\s+from\s+video)?\b/i,
  /\bunlink\s+audio\b/i,
];

export class DetachAudioCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'detach_audio',
    name: 'Detach Audio',
    action: 'detach_audio',
    category: 'audio',
    aliases: ['detach audio', 'extract audio', 'separate audio', 'split audio', 'unlink audio'],
    description: 'Extracts audio track into a separate audio track on the timeline.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();
    const isMatch = DETACH_AUDIO_PATTERNS.some((p) => p.test(lower));
    if (isMatch) {
      return {
        matched: true,
        confidence: 0.98,
        extractedParams: { target: context?.selectedClipId },
      };
    }
    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    const targetClipId = params.target || context?.selectedClipId;
    if (!targetClipId) {
      return { valid: false, error: 'No clip selected for audio detachment.' };
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
      return { success: false, error: 'No clip selected for audio detachment.' };
    }

    if (!editorApi?.detachAudio) {
      return { success: false, error: 'Detach audio handler is not connected to editor.' };
    }

    editorApi.detachAudio(targetClipId);
    return { success: true, message: 'Extracted audio to a separate timeline track.' };
  }
}
