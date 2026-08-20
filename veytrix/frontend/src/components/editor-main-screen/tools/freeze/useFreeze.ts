import { useCallback } from 'react';
import { TimelineClipRef, FreezeOptions, FreezeOperationResult } from './freeze.types';
import { freezeManager } from './FreezeManager';
import { findClipAtPlayhead } from './freeze.utils';

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
      const playheadTime = options.playheadTime ?? (getPlayheadTime ? getPlayheadTime() : 0);

      // Determine target clip with fallback chain:
      // 1. Explicit clipId parameter
      // 2. Currently selected clip
      // 3. Auto-detect: video clip under the playhead
      let targetClip: TimelineClipRef | null = null;

      if (clipId) {
        targetClip = clips.find((c) => c.id === clipId) || null;
      }

      if (!targetClip) {
        targetClip = getSelectedClip ? getSelectedClip() : null;
      }

      if (!targetClip) {
        targetClip = findClipAtPlayhead(clips, playheadTime);
      }

      if (!targetClip) {
        if (showToast && !options.silent) {
          showToast('Place the playhead over a video clip to freeze a frame.');
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
      const playheadTime = getPlayheadTime ? getPlayheadTime() : 0;

      let targetClip: TimelineClipRef | null = null;

      if (clipId) {
        targetClip = clips.find((c) => c.id === clipId) || null;
      }

      if (!targetClip) {
        targetClip = getSelectedClip ? getSelectedClip() : null;
      }

      if (!targetClip) {
        targetClip = findClipAtPlayhead(clips, playheadTime);
      }

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

