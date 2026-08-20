import { TimelineClipRef, ITimelineLockManager, LockOperationResult } from './lock.types';
import { clipLockService } from './ClipLockService';

export class TimelineLockManager implements ITimelineLockManager {
  applyLockState<T extends TimelineClipRef>(
    clips: T[],
    targetIds: string[],
    lockedState: boolean,
    currentLockedMap: Record<string, boolean> = {}
  ): LockOperationResult<T> {
    const targetSet = new Set(targetIds);
    const updatedLockedMap = { ...currentLockedMap };

    targetIds.forEach((id) => {
      updatedLockedMap[id] = lockedState;
    });

    const updatedClips = clips.map((clip) => {
      if (targetSet.has(clip.id)) {
        return lockedState
          ? clipLockService.lockClip(clip)
          : clipLockService.unlockClip(clip);
      }
      return clip;
    });

    return {
      updatedClips,
      updatedLockedMap,
      affectedClipIds: targetIds,
      isLockedNow: lockedState
    };
  }

  toggleLockState<T extends TimelineClipRef>(
    clips: T[],
    targetIds: string[],
    currentLockedMap: Record<string, boolean> = {}
  ): LockOperationResult<T> {
    if (targetIds.length === 0) {
      return {
        updatedClips: clips,
        updatedLockedMap: currentLockedMap,
        affectedClipIds: [],
        isLockedNow: false
      };
    }

    const firstClip = clips.find((c) => c.id === targetIds[0]);
    const isFirstLocked = firstClip
      ? !!firstClip.isLocked || !!currentLockedMap[firstClip.id]
      : !!currentLockedMap[targetIds[0]];
    const newLockState = !isFirstLocked;

    return this.applyLockState(clips, targetIds, newLockState, currentLockedMap);
  }
}

export const timelineLockManager = new TimelineLockManager();
