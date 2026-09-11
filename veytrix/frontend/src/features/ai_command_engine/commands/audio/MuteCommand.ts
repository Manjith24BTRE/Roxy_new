import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const MUTE_PATTERNS = [
  /\bmute(\s+audio|\s+clip|\s+track)?\b/i,
  /\bsilence(\s+audio|\s+clip|\s+track)?\b/i,
  /\bturn\s+off\s+sound\b/i,
  /\bturn\s+off\s+audio\b/i,
  /\bdisable\s+audio\b/i,
  /\bmake\s+silent\b/i,
  /\bquiet(\s+clip)?\b/i,
];

export class MuteCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'mute',
    name: 'Mute Clip',
    action: 'mute',
    category: 'audio',
    aliases: ['mute', 'mute audio', 'silence', 'turn off sound', 'disable audio', 'make silent'],
    description: 'Mute or unmute clip audio track.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();
    const isMute = MUTE_PATTERNS.some((p) => p.test(lower));
    if (isMute) {
      return {
        matched: true,
        confidence: 0.98,
        extractedParams: { muted: true, target: context?.selectedClipId },
      };
    }
    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    return { valid: true };
  }

  public execute(
    params: Record<string, any>,
    editorApi?: EditorActionApi,
    context?: EditorContext
  ): CommandExecutionResult {
    const targetClipId = params.target || context?.selectedClipId;
    if (!targetClipId) {
      return { success: false, error: 'No clip selected for muting.' };
    }
    if (!editorApi?.setMute) {
      return { success: false, error: 'Mute handler is not connected to editor.' };
    }

    editorApi.setMute(targetClipId, params.muted !== false);
    return { success: true, message: 'Audio muted successfully.' };
  }
}
