import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const VOLUME_PATTERNS = [
  /\bset\s+volume\s+(to\s+)?(\d+)(?:%|\b)/i,
  /\bvolume\s+(to\s+)?(\d+)(?:%|\b)/i,
  /\bchange\s+volume\s+(to\s+)?(\d+)(?:%|\b)/i,
  /\badjust\s+volume\s+(to\s+)?(\d+)(?:%|\b)/i,
  /\bturn\s+volume\s+(to\s+)?(\d+)(?:%|\b)/i,
  /\baudio\s+level\s+(to\s+)?(\d+)(?:%|\b)/i,
];

const VOLUME_PRESETS: Array<{ pattern: RegExp; volume: number }> = [
  { pattern: /\bmax\s+volume\b/i, volume: 100 },
  { pattern: /\bfull\s+volume\b/i, volume: 100 },
  { pattern: /\bhalf\s+volume\b/i, volume: 50 },
  { pattern: /\bzero\s+volume\b/i, volume: 0 },
];

export class VolumeCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'volume',
    name: 'Volume Command',
    action: 'volume',
    category: 'audio',
    aliases: ['volume', 'set volume', 'change volume', 'audio level', 'adjust volume', 'full volume', 'half volume'],
    description: 'Set volume level of selected clip.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();

    for (const pattern of VOLUME_PATTERNS) {
      const match = lower.match(pattern);
      if (match) {
        return {
          matched: true,
          confidence: 0.98,
          extractedParams: { volume: parseFloat(match[2]), target: context?.selectedClipId },
        };
      }
    }

    for (const preset of VOLUME_PRESETS) {
      if (preset.pattern.test(lower)) {
        return {
          matched: true,
          confidence: 0.95,
          extractedParams: { volume: preset.volume, target: context?.selectedClipId },
        };
      }
    }

    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    const targetClipId = params.target || context?.selectedClipId;
    if (!targetClipId) {
      return { valid: false, error: 'No clip selected for volume adjustment.' };
    }
    if (typeof params.volume !== 'number' || params.volume < 0 || params.volume > 200) {
      return { valid: false, error: 'Volume level must be between 0% and 200%.' };
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
      return { success: false, error: 'No clip selected for volume adjustment.' };
    }
    if (!editorApi?.setVolume) {
      return { success: false, error: 'Volume handler is not connected to editor.' };
    }

    editorApi.setVolume(targetClipId, params.volume);
    return { success: true, message: `Set volume to ${params.volume}%.` };
  }
}
