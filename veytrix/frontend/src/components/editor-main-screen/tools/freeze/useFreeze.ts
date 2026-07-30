import { useCallback } from 'react';
import { TimelineClipRef, FreezeOptions, FreezeOperationResult } from './freeze.types';
import { freezeManager } from './FreezeManager';

export interface UseFreezeParams {
  getClips?: () => TimelineClipRef[];
  getSelectedClip?: () => TimelineClipRef | null;
  getPlayheadTime?: () => number;
  getVideoElement?: (clipId?: string) => HTMLVideoElement | null;
  onUpdateClips?: (updatedClips: any[], createdFreezeId?: string) => void;
  showToast?: (message: string) => void;
}

export function useFreeze(params: UseFreezeParams = {}) {
  const {
    getClips,
    getSelectedClip,
    getPlayheadTime,
    getVideoElement,
    onUpdateClips,
    showToast
  } = params;

  const freezeFrame = useCallback(
    (clipId?: string, options: FreezeOptions = {}): FreezeOperationResult | null => {
      const clips = getClips ? getClips() : [];
      let targetClip = getSelectedClip ? getSelectedClip() : null;

      if (clipId) {
        targetClip = clips.find((c) => c.id === clipId) || null;
      }

      const playheadTime = options.playheadTime ?? (getPlayheadTime ? getPlayheadTime() : 0);

      if (!targetClip) {
        if (showToast && !options.silent) {
          showToast('Select a video clip to freeze frame.');
        }
        return null;
      }

      const validation = freezeManager.validate(targetClip, playheadTime);
      if (!validation.canFreeze) {
        if (showToast && !options.silent && validation.reason) {
          showToast(validation.reason);
        }
        return null;
      }

      const activeVideo = getVideoElement ? getVideoElement(targetClip.id) : null;

      const result = freezeManager.freezeFrame(clips, targetClip.id, playheadTime, {
        showToast,
        videoElement: activeVideo,
        ...options
      });

      if (result && onUpdateClips) {
        onUpdateClips(result.updatedClips, result.createdFreezeClipId);
      }

      return result;
    },
    [getClips, getSelectedClip, getPlayheadTime, getVideoElement, onUpdateClips, showToast]
  );

  const canFreezeFrame = useCallback(
    (clipId?: string): boolean => {
      const clips = getClips ? getClips() : [];
      let targetClip = getSelectedClip ? getSelectedClip() : null;

      if (clipId) {
        targetClip = clips.find((c) => c.id === clipId) || null;
      }

      const playheadTime = getPlayheadTime ? getPlayheadTime() : 0;
      if (!targetClip) return false;

      return freezeManager.validate(targetClip, playheadTime).canFreeze;
    },
    [getClips, getSelectedClip, getPlayheadTime]
  );

  return {
    freezeFrame,
    canFreezeFrame,
    freezeManager
  };
}
