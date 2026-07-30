import { useCallback } from 'react';
import { TimelineClipRef, DetachOptions, DetachedAudioResult } from './detach.types';
import { detachManager } from './DetachManager';

export interface UseDetachParams {
  getClips?: () => TimelineClipRef[];
  onUpdateClips?: (updatedClips: any[], detachedClip?: any) => void;
  showToast?: (message: string) => void;
  getSelectedClip?: () => TimelineClipRef | null;
}

export function useDetach(params: UseDetachParams = {}) {
  const { getClips, onUpdateClips, showToast, getSelectedClip } = params;

  /**
   * Triggers Detach Audio for a specified clip or currently selected clip asynchronously.
   */
  const detachAudio = useCallback(
    async (clipId?: string, options: DetachOptions = {}): Promise<DetachedAudioResult | null> => {
      const clips = getClips ? getClips() : [];
      const targetId = clipId || getSelectedClip?.()?.id;

      if (!targetId) {
        if (showToast) {
          showToast('Select a video clip to detach audio.');
        }
        return null;
      }

      const result = await detachManager.detachAudioAsync(clips, targetId, {
        showToast,
        ...options,
      });

      if (result && onUpdateClips) {
        onUpdateClips(result.updatedClips, result.detachedClip);
      }

      return result;
    },
    [getClips, getSelectedClip, onUpdateClips, showToast]
  );

  /**
   * Checks whether the specified clip can have its audio detached.
   */
  const canDetachAudio = useCallback(
    (clipId?: string): boolean => {
      const clips = getClips ? getClips() : [];
      const targetId = clipId || getSelectedClip?.()?.id;
      if (!targetId) return false;
      const clip = clips.find((c) => c.id === targetId);
      return detachManager.validate(clip, clips).canDetach;
    },
    [getClips, getSelectedClip]
  );

  /**
   * Reverts audio detachment for a given audio clip ID.
   */
  const undoDetach = useCallback(
    (detachedClipId: string) => {
      const clips = getClips ? getClips() : [];
      const updatedClips = detachManager.undoDetach(clips, detachedClipId);
      if (onUpdateClips) {
        onUpdateClips(updatedClips);
      }
    },
    [getClips, onUpdateClips]
  );

  return {
    detachAudio,
    canDetachAudio,
    undoDetach,
    detachManager,
  };
}
