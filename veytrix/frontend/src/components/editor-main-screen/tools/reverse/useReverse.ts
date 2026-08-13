import { useCallback, useState } from 'react';
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
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleReverse = useCallback(
    async (clipId?: string): Promise<ReverseResult | null> => {
      if (!getClips || !onUpdateClips) return null;
      if (isProcessing) {
        if (showToast) showToast('Processing already in progress. Please wait.');
        return null;
      }

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

      setIsProcessing(true);
      try {
        const mediaSource = getMediaSource ? getMediaSource(targetClipObj) : targetClipObj.url;
        const result = await reverseManager.toggleReverse(clips, targetId, { showToast }, mediaSource);

        if (result.success) {
          onUpdateClips(result.updatedClips);
        }
        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [getSelectedClip, getClips, getMediaSource, onUpdateClips, showToast, isProcessing]
  );

  return {
    toggleReverse,
    isProcessing,
  };
}
