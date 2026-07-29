import { useCallback } from 'react';
import {
  duplicateClipInSequence,
  duplicateTimelineClip,
  checkDuplicateAppliedEffect,
} from './duplicate.utils';
import { DuplicateTimelineClipOptions } from './duplicate.types';

export interface UseDuplicateParams {
  showToast?: (message: string) => void;
}

export function useDuplicate(params: UseDuplicateParams = {}) {
  const { showToast } = params;

  const duplicateClipSequence = useCallback(
    <T extends { id: string; name: string }>(
      clips: T[],
      clipId: string,
      recalculateSequence?: (clips: T[]) => T[]
    ): T[] | null => {
      const result = duplicateClipInSequence(clips, clipId);
      if (!result) return null;

      const finalClips = recalculateSequence
        ? recalculateSequence(result.updatedClips)
        : result.updatedClips;

      if (showToast) {
        showToast('Duplicated clip');
      }

      return finalClips;
    },
    [showToast]
  );

  const duplicateClipTimeline = useCallback(
    <T extends { id: string; name: string; start: number; duration: number; trackId: string }>(
      clips: T[],
      clipId: string,
      options: DuplicateTimelineClipOptions = {},
      customToastMessage?: string
    ): { updatedClips: T[]; newClip: T } | null => {
      const result = duplicateTimelineClip(clips, clipId, {
        showToast,
        ...options,
      });

      if (!result) return null;

      if (showToast) {
        showToast(customToastMessage ?? 'Duplicated clip');
      }

      return result;
    },
    [showToast]
  );

  const handleDuplicateEffect = useCallback(
    (
      clip: { id: string; appliedEffects?: Array<{ id: string; name: string }> } | undefined | null,
      effectId: string
    ): boolean => {
      const check = checkDuplicateAppliedEffect(clip, effectId);
      if (!check.canDuplicate && check.message && showToast) {
        showToast(check.message);
      }
      return check.canDuplicate;
    },
    [showToast]
  );

  return {
    duplicateClipSequence,
    duplicateClipTimeline,
    handleDuplicateEffect,
  };
}
