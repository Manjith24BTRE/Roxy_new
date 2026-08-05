// src/components/editor-main-screen/tools/delete/useDelete.ts
import { useCallback } from 'react';
import { DeleteService } from './DeleteService';
import { DeleteOptions } from './delete.types';

export function useDelete(
  timelineClips: any[],
  setTimelineClips: (clips: any[]) => void,
  currentTime: number,
  onSelectClip?: (clipId: string | null, mediaId?: string | null) => void,
  onToast?: (message: string) => void,
  recalculateSequence?: (clips: any[]) => any[],
  options: DeleteOptions = {}
) {
  const performDelete = useCallback(
    (clipId: string, customOptions: DeleteOptions = {}) => {
      const mergedOpts = { ...options, ...customOptions };
      const res = DeleteService.deleteClip(timelineClips, clipId, currentTime, mergedOpts);

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

      if (onSelectClip) {
        const nextClip = res.nextSelectedClip;
        onSelectClip(nextClip?.id || null, nextClip?.mediaId || nextClip?.id || null);
      }

      if (onToast) {
        onToast(res.message || 'Deleted clip');
      }

      return true;
    },
    [timelineClips, setTimelineClips, currentTime, onSelectClip, onToast, recalculateSequence, options]
  );

  const performRippleDelete = useCallback(
    (clipId: string, customOptions: DeleteOptions = {}) => {
      return performDelete(clipId, { ...customOptions, isRipple: true });
    },
    [performDelete]
  );

  return { performDelete, performRippleDelete };
}
