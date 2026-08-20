import { useCallback } from 'react';
import { TimelineClipRef, LockOptions, LockOperationResult } from './lock.types';
import { lockManager } from './LockManager';
import { isClipLocked, findClipAtPlayhead, NO_CLIP_AT_PLAYHEAD_MESSAGE } from './lock.utils';

export interface UseLockParams {
  getClips?: () => TimelineClipRef[];
  getSelectedClipId?: () => string | null;
  getSelectedClipIds?: () => string[];
  getPlayheadTime?: () => number;
  getLockedClipsMap?: () => Record<string, boolean>;
  onUpdateClips?: (updatedClips: any[], updatedLockedMap?: Record<string, boolean>) => void;
  onUpdateLockedMap?: (updatedLockedMap: Record<string, boolean>) => void;
  showToast?: (message: string) => void;
}

export function useLock(params: UseLockParams = {}) {
  const {
    getClips,
    getSelectedClipId,
    getSelectedClipIds,
    getPlayheadTime,
    getLockedClipsMap,
    onUpdateClips,
    onUpdateLockedMap,
    showToast
  } = params;

  /**
   * Resolves target clip ID(s) adhering strictly to NLE rules:
   * Explicit target ID > Clip under playhead > Multi-selection > Single selection.
   */
  const resolveTargetIds = useCallback(
    (clipIdOrIds?: string | string[], options: LockOptions = {}): string[] | null => {
      const clips = getClips ? getClips() : [];

      if (clipIdOrIds) {
        return Array.isArray(clipIdOrIds) ? clipIdOrIds : [clipIdOrIds];
      }

      const playheadTime = getPlayheadTime ? getPlayheadTime() : undefined;
      const selectedId = getSelectedClipId ? getSelectedClipId() : null;

      if (playheadTime !== undefined) {
        const targetClip = findClipAtPlayhead(clips, playheadTime, selectedId);
        if (targetClip) {
          return [targetClip.id];
        } else {
          if (showToast && !options.silent) {
            showToast(NO_CLIP_AT_PLAYHEAD_MESSAGE);
          }
          return null;
        }
      }

      if (getSelectedClipIds) {
        const ids = getSelectedClipIds();
        if (ids && ids.length > 0) return ids;
      }

      if (selectedId) {
        return [selectedId];
      }

      if (showToast && !options.silent) {
        showToast(NO_CLIP_AT_PLAYHEAD_MESSAGE);
      }
      return null;
    },
    [getClips, getPlayheadTime, getSelectedClipId, getSelectedClipIds, showToast]
  );

  const toggleLock = useCallback(
    (clipIdOrIds?: string | string[], options: LockOptions = {}): LockOperationResult | null => {
      const clips = getClips ? getClips() : [];
      const targetIds = resolveTargetIds(clipIdOrIds, options);

      if (!targetIds || targetIds.length === 0) {
        return null;
      }

      const lockedMap = getLockedClipsMap ? getLockedClipsMap() : {};
      const result = lockManager.toggleLock(clips, targetIds, { showToast, ...options }, lockedMap);

      if (onUpdateClips) {
        onUpdateClips(result.updatedClips, result.updatedLockedMap);
      } else if (onUpdateLockedMap) {
        onUpdateLockedMap(result.updatedLockedMap);
      }

      return result;
    },
    [getClips, getLockedClipsMap, onUpdateClips, onUpdateLockedMap, resolveTargetIds, showToast]
  );

  const lockClips = useCallback(
    (clipIdOrIds?: string | string[], options: LockOptions = {}): LockOperationResult | null => {
      const clips = getClips ? getClips() : [];
      const targetIds = resolveTargetIds(clipIdOrIds, options);

      if (!targetIds || targetIds.length === 0) return null;

      const lockedMap = getLockedClipsMap ? getLockedClipsMap() : {};
      const result = lockManager.lockClips(clips, targetIds, { showToast, ...options }, lockedMap);

      if (onUpdateClips) {
        onUpdateClips(result.updatedClips, result.updatedLockedMap);
      } else if (onUpdateLockedMap) {
        onUpdateLockedMap(result.updatedLockedMap);
      }

      return result;
    },
    [getClips, getLockedClipsMap, onUpdateClips, onUpdateLockedMap, resolveTargetIds, showToast]
  );

  const unlockClips = useCallback(
    (clipIdOrIds?: string | string[], options: LockOptions = {}): LockOperationResult | null => {
      const clips = getClips ? getClips() : [];
      const targetIds = resolveTargetIds(clipIdOrIds, options);

      if (!targetIds || targetIds.length === 0) return null;

      const lockedMap = getLockedClipsMap ? getLockedClipsMap() : {};
      const result = lockManager.unlockClips(clips, targetIds, { showToast, ...options }, lockedMap);

      if (onUpdateClips) {
        onUpdateClips(result.updatedClips, result.updatedLockedMap);
      } else if (onUpdateLockedMap) {
        onUpdateLockedMap(result.updatedLockedMap);
      }

      return result;
    },
    [getClips, getLockedClipsMap, onUpdateClips, onUpdateLockedMap, resolveTargetIds, showToast]
  );

  const checkIsLocked = useCallback(
    (clipId?: string): boolean => {
      const clips = getClips ? getClips() : [];
      let targetId = clipId;
      if (!targetId && getPlayheadTime) {
        const playheadTime = getPlayheadTime();
        const selectedId = getSelectedClipId ? getSelectedClipId() : null;
        const clipAtPlayhead = findClipAtPlayhead(clips, playheadTime, selectedId);
        if (clipAtPlayhead) targetId = clipAtPlayhead.id;
      }
      if (!targetId && getSelectedClipId) {
        targetId = getSelectedClipId() || undefined;
      }
      if (!targetId) return false;
      const clip = clips.find((c) => c.id === targetId);
      const lockedMap = getLockedClipsMap ? getLockedClipsMap() : {};
      return isClipLocked(clip, lockedMap);
    },
    [getClips, getPlayheadTime, getSelectedClipId, getLockedClipsMap]
  );

  const validateCanEdit = useCallback(
    (clipId?: string, actionName?: string): boolean => {
      if (!clipId) return true;
      const clips = getClips ? getClips() : [];
      const clip = clips.find((c) => c.id === clipId);
      if (!clip) return true;
      const lockedMap = getLockedClipsMap ? getLockedClipsMap() : {};
      const validation = lockManager.validateCanEdit(clip, actionName, lockedMap);
      if (!validation.allowed && showToast) {
        lockManager.notifyBlockedEdit(showToast);
      }
      return validation.allowed;
    },
    [getClips, getLockedClipsMap, showToast]
  );

  return {
    toggleLock,
    lockClips,
    unlockClips,
    checkIsLocked,
    validateCanEdit,
    lockManager
  };
}
