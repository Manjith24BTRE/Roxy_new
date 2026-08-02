import { TimelineClipRef, DetachValidationResult } from './detach.types';

/**
 * Validates whether a given timeline clip is eligible for audio detachment or re-attachment toggle.
 * Enforces production safety checks without causing UI or runtime crashes.
 */
export function validateDetach(
  clip: TimelineClipRef | null | undefined,
  _allClips: TimelineClipRef[] = []
): DetachValidationResult {
  if (!clip) {
    return {
      canDetach: false,
      reason: 'Select a clip to extract audio.',
    };
  }

  if (clip.isLocked) {
    return {
      canDetach: false,
      reason: 'This clip is locked. Unlock it to make changes.',
    };
  }

  // Check if clip is an image (images do not contain audio)
  const isImage = clip.type === 'image' || clip.mediaType === 'image';
  if (isImage) {
    return {
      canDetach: false,
      isNoAudioTrack: true,
      reason: "This video doesn't contain an audio track.",
    };
  }

  // Check if audio was explicitly flagged as missing
  if (clip.hasAudio === false) {
    return {
      canDetach: false,
      isNoAudioTrack: true,
      reason: "This video doesn't contain an audio track.",
    };
  }

  return {
    canDetach: true,
  };
}
