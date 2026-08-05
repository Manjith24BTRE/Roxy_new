// src/components/editor-main-screen/tools/split/useSplit.ts
import { useCallback } from 'react';
import { SplitService } from './SplitService';
import { SplitOptions } from './split.types';

export function useSplit(
  timelineClips: any[],
  setTimelineClips: (clips: any[]) => void,
  currentTime: number,
  onSelectClip?: (clipId: string, mediaId?: string) => void,
  onToast?: (message: string) => void,
  recalculateSequence?: (clips: any[]) => any[]
) {
  const performSplit = useCallback(
    (clipId: string, options: SplitOptions = {}) => {
      const res = SplitService.splitClip(timelineClips, clipId, currentTime, options);

      if (!res.success) {
        if (res.message && onToast) {
          onToast(res.message);
        }
        return false;
      }

      let updated = res.updatedTimelineClips || [];
      if (recalculateSequence) {
        updated = recalculateSequence(updated);
      }

      setTimelineClips(updated);

      if (res.rightClip && onSelectClip) {
        onSelectClip(res.rightClip.id, res.rightClip.mediaId);
      }

      if (onToast) {
        onToast(res.message || 'Split clip successfully');
      }

      return true;
    },
    [timelineClips, setTimelineClips, currentTime, onSelectClip, onToast, recalculateSequence]
  );

  return { performSplit };
}
