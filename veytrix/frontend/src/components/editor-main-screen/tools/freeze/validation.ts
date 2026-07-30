import { TimelineClipRef, FreezeValidationResult } from './freeze.types';
import {
  LOCKED_FREEZE_BLOCKED_MESSAGE,
  NON_VIDEO_FREEZE_BLOCKED_MESSAGE,
  PLAYHEAD_OUT_OF_BOUNDS_MESSAGE,
  NO_CLIP_SELECTED_MESSAGE
} from './freeze.utils';

export function validateFreeze(
  clip: TimelineClipRef | null | undefined,
  playheadTime: number
): FreezeValidationResult {
  if (!clip) {
    return {
      canFreeze: false,
      reason: NO_CLIP_SELECTED_MESSAGE
    };
  }

  if (clip.isLocked === true) {
    return {
      canFreeze: false,
      reason: LOCKED_FREEZE_BLOCKED_MESSAGE
    };
  }

  const trackId = clip.trackId || clip.type || clip.mediaType || 'video';
  if (trackId === 'audio' || trackId === 'music' || trackId === 'text' || trackId === 'effect') {
    return {
      canFreeze: false,
      reason: NON_VIDEO_FREEZE_BLOCKED_MESSAGE
    };
  }

  const clipStart = clip.timelineStart ?? clip.start ?? 0;
  const clipEnd = clipStart + clip.duration;
  const relativePlayhead = playheadTime - clipStart;

  if (playheadTime < clipStart || playheadTime > clipEnd || relativePlayhead < 0.05 || relativePlayhead > clip.duration - 0.05) {
    return {
      canFreeze: false,
      reason: PLAYHEAD_OUT_OF_BOUNDS_MESSAGE
    };
  }

  return {
    canFreeze: true
  };
}
