import { TimelineClipRef, LockValidationResult, EditValidationResult } from './lock.types';
import { isClipLocked, LOCKED_EDIT_BLOCKED_MESSAGE } from './lock.utils';

/**
 * Validates the lock status of a clip.
 */
export function validateLockState(
  clip: TimelineClipRef | null | undefined,
  lockedMap?: Record<string, boolean>
): LockValidationResult {
  if (!clip) {
    return {
      canLock: false,
      canUnlock: false,
      isLocked: false,
      reason: 'No clip selected'
    };
  }

  const locked = isClipLocked(clip, lockedMap);

  return {
    canLock: true,
    canUnlock: true,
    isLocked: locked
  };
}

/**
 * Validates whether an edit operation is permitted on the specified clip.
 * If locked, returns allowed: false with the standard non-blocking prompt message.
 */
export function validateCanEdit(
  clip: TimelineClipRef | null | undefined,
  _actionName: string = 'edit',
  lockedMap?: Record<string, boolean>
): EditValidationResult {
  if (!clip) {
    return { allowed: true };
  }

  if (isClipLocked(clip, lockedMap)) {
    return {
      allowed: false,
      message: LOCKED_EDIT_BLOCKED_MESSAGE
    };
  }

  return { allowed: true };
}
