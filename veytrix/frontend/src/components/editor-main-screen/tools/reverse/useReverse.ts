import { useCallback } from 'react';
import { reverseManager } from './ReverseManager';
import { ReversibleClip, ReverseResult } from './reverse.types';

export interface UseReverseParams<T extends ReversibleClip = any> {
  getSelectedClip?: () => T | null;
  getClips?: () => T[];
  getMediaSource?: (clip: T) => File | Blob | string;
  onUpdateClips?: (updatedClips: T[]) => void;
  showToast?: (message: string) => void;
}

export function useReverse<T extends ReversibleClip = any>(params: UseReverseParams<T> = {}) {
  const { getSelectedClip, getClips, getMediaSource, onUpdateClips, showToast } = params;

  const toggleReverse = useCallback(
    (clipId?: string): ReverseResult | null => {
      if (!getClips || !onUpdateClips) return null;

      const clips = getClips();
      let targetId = clipId;
      let targetClipObj: T | null = null;

      if (targetId) {
        targetClipObj = clips.find((c) => c.id === targetId) || null;
      } else if (getSelectedClip) {
        targetClipObj = getSelectedClip();
        if (targetClipObj) targetId = targetClipObj.id;
      }

      if (!targetId || !targetClipObj) {
        if (showToast) showToast('Please select a clip to reverse');
        return null;
      }

      const mediaSource = getMediaSource ? getMediaSource(targetClipObj) : targetClipObj.url;
      const result = reverseManager.toggleReverse(clips, targetId, { showToast }, mediaSource);

      if (result.success) {
        onUpdateClips(result.updatedClips);
      }

      return result;
    },
    [getSelectedClip, getClips, getMediaSource, onUpdateClips, showToast]
  );

  return {
    toggleReverse,
  };
}
