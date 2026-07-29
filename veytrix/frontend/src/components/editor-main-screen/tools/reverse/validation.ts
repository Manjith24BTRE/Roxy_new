import { ReversibleClip, ReverseValidationResult } from './reverse.types';

export function isClipReversible(clip: ReversibleClip | null | undefined): ReverseValidationResult {
  if (!clip) {
    return { isValid: false, error: 'Please select a clip to reverse' };
  }

  if (typeof clip.duration !== 'number' || clip.duration <= 0) {
    return { isValid: false, error: 'Invalid clip duration for reverse playback' };
  }

  return { isValid: true };
}
