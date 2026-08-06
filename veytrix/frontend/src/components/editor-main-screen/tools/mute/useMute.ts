// src/components/editor-main-screen/tools/mute/useMute.ts
import { useCallback } from 'react';
import { MuteService } from './MuteService';
import { isClipAudioMuted, calculateEffectiveVolume } from './mute.utils';

export function useMute(
  isGlobalMuted: boolean,
  setIsGlobalMuted: (val: boolean | ((prev: boolean) => boolean)) => void,
  mutedClips: Record<string, boolean>,
  setMutedClips: (val: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void,
  showToast?: (message: string) => void
) {
  const toggleGlobalMute = useCallback(() => {
    const res = MuteService.toggleGlobalMute({ isGlobalMuted, mutedClips });
    setIsGlobalMuted(res.isGlobalMuted);
    if (showToast && res.message) {
      showToast(res.message);
    }
    return res.isGlobalMuted;
  }, [isGlobalMuted, mutedClips, setIsGlobalMuted, showToast]);

  const toggleClipMute = useCallback(
    (clipId: string, clip?: any, targetState?: boolean) => {
      const res = MuteService.toggleClipMute({ isGlobalMuted, mutedClips }, clipId, clip, targetState);
      if (!res.success) {
        if (showToast && res.message) {
          showToast(res.message);
        }
        return false;
      }

      setMutedClips(res.mutedClips);
      if (showToast && res.message) {
        showToast(res.message);
      }
      return res.clipIsMuted;
    },
    [isGlobalMuted, mutedClips, setMutedClips, showToast]
  );

  const checkClipIsMuted = useCallback(
    (clip?: any) => {
      return isClipAudioMuted(clip, isGlobalMuted, mutedClips);
    },
    [isGlobalMuted, mutedClips]
  );

  const getClipVolume = useCallback(
    (clip: any, globalVolume: number) => {
      return calculateEffectiveVolume(clip, globalVolume, isGlobalMuted, mutedClips);
    },
    [isGlobalMuted, mutedClips]
  );

  return {
    toggleGlobalMute,
    toggleClipMute,
    checkClipIsMuted,
    getClipVolume,
  };
}
