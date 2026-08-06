// src/components/editor-main-screen/tools/delete/validation.ts
import { DeleteValidationResult, DeleteOptions } from './delete.types';

export function validateClipDelete(
  clip: any,
  options: DeleteOptions = {}
): DeleteValidationResult {
  if (!clip) {
    return { canDelete: false, reason: 'No target clip specified for deletion.' };
  }

  const isTrackLocked = options.lockedTracks && options.lockedTracks[clip.trackId];
  const isClipLocked = (options.lockedClips && options.lockedClips[clip.id]) || clip.isLocked;

  if (isTrackLocked || isClipLocked) {
    return { canDelete: false, reason: 'This clip is locked. Unlock it to make changes.' };
  }

  return { canDelete: true };
}
