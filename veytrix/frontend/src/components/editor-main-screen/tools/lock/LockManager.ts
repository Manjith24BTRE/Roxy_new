import {
  TimelineClipRef,
  ILockManager,
  LockValidationResult,
  EditValidationResult,
  LockOptions,
  LockOperationResult
} from './lock.types';
import { validateLockState, validateCanEdit } from './validation';
import { timelineLockManager } from './TimelineLockManager';
import { LOCKED_EDIT_BLOCKED_MESSAGE } from './lock.utils';

export class LockManager implements ILockManager {
  validateLockState(
    clip: TimelineClipRef | null | undefined,
    lockedMap?: Record<string, boolean>
  ): LockValidationResult {
    return validateLockState(clip, lockedMap);
  }

  validateCanEdit(
    clip: TimelineClipRef | null | undefined,
    actionName: string = 'edit',
    lockedMap?: Record<string, boolean>
  ): EditValidationResult {
    return validateCanEdit(clip, actionName, lockedMap);
  }

  toggleLock<T extends TimelineClipRef>(
    clips: T[],
    targetIdOrIds: string | string[],
    options: LockOptions = {},
    currentLockedMap: Record<string, boolean> = {}
  ): LockOperationResult<T> {
    const targetIds = Array.isArray(targetIdOrIds) ? targetIdOrIds : [targetIdOrIds];
    const validTargetIds = targetIds.filter(Boolean);

    if (validTargetIds.length === 0) {
      if (options.showToast && !options.silent) {
        options.showToast('Select a clip to lock or unlock.');
      }
      return {
        updatedClips: clips,
        updatedLockedMap: currentLockedMap,
        affectedClipIds: [],
        isLockedNow: false
      };
    }

    const result = timelineLockManager.toggleLockState(clips, validTargetIds, currentLockedMap);

    if (options.showToast && !options.silent) {
      const count = validTargetIds.length;
      if (count === 1) {
        const clip = clips.find((c) => c.id === validTargetIds[0]);
        const clipName = clip?.name || 'Clip';
        options.showToast(
          result.isLockedNow ? `Locked clip: ${clipName}` : `Unlocked clip: ${clipName}`
        );
      } else {
        options.showToast(
          result.isLockedNow ? `Locked ${count} clips` : `Unlocked ${count} clips`
        );
      }
    }

    return result;
  }

  lockClips<T extends TimelineClipRef>(
    clips: T[],
    targetIdOrIds: string | string[],
    options: LockOptions = {},
    currentLockedMap: Record<string, boolean> = {}
  ): LockOperationResult<T> {
    const targetIds = Array.isArray(targetIdOrIds) ? targetIdOrIds : [targetIdOrIds];
    const validTargetIds = targetIds.filter(Boolean);
    const result = timelineLockManager.applyLockState(clips, validTargetIds, true, currentLockedMap);

    if (options.showToast && !options.silent && validTargetIds.length > 0) {
      if (validTargetIds.length === 1) {
        const clip = clips.find((c) => c.id === validTargetIds[0]);
        options.showToast(`Locked clip: ${clip?.name || 'Clip'}`);
      } else {
        options.showToast(`Locked ${validTargetIds.length} clips`);
      }
    }

    return result;
  }

  unlockClips<T extends TimelineClipRef>(
    clips: T[],
    targetIdOrIds: string | string[],
    options: LockOptions = {},
    currentLockedMap: Record<string, boolean> = {}
  ): LockOperationResult<T> {
    const targetIds = Array.isArray(targetIdOrIds) ? targetIdOrIds : [targetIdOrIds];
    const validTargetIds = targetIds.filter(Boolean);
    const result = timelineLockManager.applyLockState(clips, validTargetIds, false, currentLockedMap);

    if (options.showToast && !options.silent && validTargetIds.length > 0) {
      if (validTargetIds.length === 1) {
        const clip = clips.find((c) => c.id === validTargetIds[0]);
        options.showToast(`Unlocked clip: ${clip?.name || 'Clip'}`);
      } else {
        options.showToast(`Unlocked ${validTargetIds.length} clips`);
      }
    }

    return result;
  }

  notifyBlockedEdit(showToast?: (msg: string) => void): void {
    if (showToast) {
      showToast(LOCKED_EDIT_BLOCKED_MESSAGE);
    }
  }
}

export const lockManager = new LockManager();
