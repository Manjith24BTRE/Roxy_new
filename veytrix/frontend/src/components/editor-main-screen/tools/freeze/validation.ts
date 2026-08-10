import { TimelineClipRef, FreezeValidationResult } from './freeze.types';
import {
  LOCKED_FREEZE_BLOCKED_MESSAGE,
  NON_VIDEO_FREEZE_BLOCKED_MESSAGE,
  PLAYHEAD_OUT_OF_BOUNDS_MESSAGE,
  NO_CLIP_SELECTED_MESSAGE
} from './freeze.utils';

/**
 * Validates whether a freeze frame operation can be performed on a clip at the given playhead time.
 *
 * Allows freeze at exact clip start (first frame), exact clip end (last frame), and any point in between.
 * Rejects: no clip, locked clips, non-video clips, playhead completely outside clip bounds,
 * zero/negative duration clips, and detached audio clips.
 */
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

  // Reject non-video track types
  const trackId = clip.trackId || clip.type || clip.mediaType || 'video';
  if (trackId === 'audio' || trackId === 'music' || trackId === 'text' || trackId === 'effect') {
    return {
      canFreeze: false,
      reason: NON_VIDEO_FREEZE_BLOCKED_MESSAGE
    };
  }

  // Reject detached audio clips that live on a video-like track
  if (clip.isDetachedAudio) {
    return {
      canFreeze: false,
      reason: NON_VIDEO_FREEZE_BLOCKED_MESSAGE
    };
  }

  // Reject clips with invalid duration
  if (!clip.duration || clip.duration <= 0) {
    return {
      canFreeze: false,
      reason: 'This clip has no valid duration.'
    };
  }

  const clipStart = clip.timelineStart ?? clip.start ?? 0;
  const clipEnd = clipStart + clip.duration;

  // Use a small epsilon (1ms) for floating-point comparison tolerance
  const EPSILON = 0.001;

  if (playheadTime < clipStart - EPSILON || playheadTime > clipEnd + EPSILON) {
    return {
      canFreeze: false,
      reason: PLAYHEAD_OUT_OF_BOUNDS_MESSAGE
    };
  }

  return {
    canFreeze: true
  };
}
