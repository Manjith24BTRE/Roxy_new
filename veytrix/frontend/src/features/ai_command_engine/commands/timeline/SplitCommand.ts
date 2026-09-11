import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const MIDDLE_PATTERNS = [
  /\bsplit\s+(in\s+)?(half|middle|midpoint)\b/i,
  /\bsplit\s+at\s+(the\s+)?(middle|midpoint|50%)\b/i,
  /\bcut\s+(in\s+)?(half|middle|midpoint)\b/i,
  /\bdivide\s+(in\s+)?(half|two|middle)\b/i,
  /\bslice\s+(in\s+)?(half|middle)\b/i,
];
const TIMESTAMP_PATTERN = /\b(?:split|cut|slice|divide)\s+at\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\b/i;
const TIME_DURATION_PATTERN = /\b(?:split|cut|slice|divide)\s+at\s+(\d+(?:\.\d+)?)\s*(seconds?|sec|s|minutes?|min|m)\b/i;
const PLAYHEAD_PATTERNS = [
  /\bsplit\s+at\s+(the\s+)?(playhead|current\s+position|cursor)\b/i,
  /\bcut\s+at\s+(the\s+)?(playhead|current\s+position|cursor)\b/i,
  /\bcut\s+(clip\s+)?here\b/i,
  /\bsplit\s+(clip\s+)?here\b/i,
  /^\s*(split|cut|slice|chop)(\s+clip|\s+video)?\s*$/i,
];

export class SplitCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'split',
    name: 'Split Clip',
    action: 'split',
    category: 'timeline',
    aliases: ['split', 'cut clip', 'split at playhead', 'split in half', 'slice clip', 'divide clip'],
    description: 'Splits clip at current playhead position, specified timestamp, or midpoint.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();

    // 1a. Split Middle
    const isMiddleSplit = MIDDLE_PATTERNS.some((p) => p.test(lower));
    if (isMiddleSplit) {
      return {
        matched: true,
        confidence: 1.0,
        extractedParams: { mode: 'middle', target: context?.selectedClipId },
      };
    }

    // 1b. Timestamp Match
    const timestampMatch = lower.match(TIMESTAMP_PATTERN);
    if (timestampMatch) {
      let seconds = 0;
      if (timestampMatch[3]) {
        seconds = parseInt(timestampMatch[1], 10) * 3600 + parseInt(timestampMatch[2], 10) * 60 + parseInt(timestampMatch[3], 10);
      } else {
        seconds = parseInt(timestampMatch[1], 10) * 60 + parseInt(timestampMatch[2], 10);
      }
      return {
        matched: true,
        confidence: 1.0,
        extractedParams: { mode: 'time', time: seconds, target: context?.selectedClipId },
      };
    }

    // 1c. Time Duration Match
    const durationMatch = lower.match(TIME_DURATION_PATTERN);
    if (durationMatch) {
      const val = parseFloat(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      const seconds = unit.startsWith('m') ? val * 60 : val;
      return {
        matched: true,
        confidence: 1.0,
        extractedParams: { mode: 'time', time: seconds, target: context?.selectedClipId },
      };
    }

    // 1d. Playhead / General Split
    const isPlayheadSplit =
      PLAYHEAD_PATTERNS.some((p) => p.test(lower)) || /\b(split|cut|slice|chop)\b/i.test(lower);
    if (isPlayheadSplit) {
      return {
        matched: true,
        confidence: 0.95,
        extractedParams: { mode: 'playhead', target: context?.selectedClipId },
      };
    }

    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    const targetClipId = params.target || context?.selectedClipId;
    if (!targetClipId) {
      return { valid: false, error: 'No clip selected' };
    }

    const minThreshold = 0.2;
    const duration = context?.clipDuration;

    if (params.mode === 'time') {
      if (typeof params.time !== 'number') {
        return { valid: false, error: 'Time parameter is required for time-based split' };
      }
      if (params.time < 0) {
        return { valid: false, error: 'Cannot split at negative time' };
      }
      if (typeof duration === 'number' && params.time >= duration) {
        return { valid: false, error: 'Split time exceeds clip duration' };
      }
      if (
        params.time <= minThreshold ||
        (typeof duration === 'number' && params.time >= duration - minThreshold)
      ) {
        return { valid: false, error: 'Cannot split at start or end of clip' };
      }
    } else if (params.mode === 'middle') {
      if (typeof duration === 'number' && duration <= minThreshold * 2) {
        return { valid: false, error: 'Clip duration is too short to split in half' };
      }
    } else {
      if (
        typeof context?.playheadTime === 'number' &&
        typeof context?.clipStartTime === 'number' &&
        typeof context?.clipEndTime === 'number'
      ) {
        if (
          context.playheadTime <= context.clipStartTime + minThreshold ||
          context.playheadTime >= context.clipEndTime - minThreshold
        ) {
          return { valid: false, error: 'Cannot split clip at current playhead position' };
        }
      }
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
      return { success: false, error: 'No clip selected' };
    }

    if (!editorApi?.splitClip) {
      return { success: false, error: 'Split execution handler is not connected to the editor.' };
    }

    let splitTime: number | undefined = undefined;
    const clipStartTime = context?.clipStartTime ?? 0;

    if (params.mode === 'middle') {
      if (typeof context?.clipDuration === 'number') {
        splitTime = clipStartTime + context.clipDuration / 2;
      }
    } else if (params.mode === 'time') {
      if (typeof params.time === 'number') {
        splitTime = clipStartTime + params.time;
      }
    } else {
      splitTime = context?.playheadTime;
    }

    try {
      const res = editorApi.splitClip(targetClipId, splitTime);
      if (res && typeof res === 'object' && res.success === false) {
        return { success: false, error: res.error || 'Cannot split clip at current playhead position' };
      }
      return { success: true, message: 'Split clip successfully' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Cannot split clip at current playhead position' };
    }
  }
}
