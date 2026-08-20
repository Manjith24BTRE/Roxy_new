// src/components/editor-main-screen/tools/split/validation.ts
import { SplitValidationResult, SplitOptions } from './split.types';

export function validateClipSplit(
  clip: any,
  playheadTime: number,
  options: SplitOptions = {}
): SplitValidationResult {
  if (!clip) {
    return { canSplit: false, reason: 'No target clip specified for split.' };
  }

  if (clip.isLocked) {
    return { canSplit: false, reason: 'This clip is locked. Unlock it to split.' };
  }

  const start = clip.timelineStart ?? clip.start ?? 0;
  const duration = clip.duration ?? 0;
  const end = start + duration;
  const minThreshold = options.minEdgeThreshold ?? 0.2;

  if (playheadTime <= start + minThreshold || playheadTime >= end - minThreshold) {
    return {
      canSplit: false,
      reason: `Playhead must be at least ${minThreshold}s away from clip edges to split.`,
    };
  }

  return { canSplit: true };
}
