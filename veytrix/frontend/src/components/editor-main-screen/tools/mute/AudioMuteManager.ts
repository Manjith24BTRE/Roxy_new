// src/components/editor-main-screen/tools/mute/AudioMuteManager.ts
import { isClipAudioMuted } from './mute.utils';

export class AudioMuteManager {
  /**
   * Applies mute and volume updates directly to active HTML Media Elements (audio & video tags).
   */
  public static syncMediaElementsMute(
    mediaElements: (HTMLMediaElement | null)[],
    clips: any[],
    isGlobalMuted: boolean,
    mutedClipsMap: Record<string, boolean>,
    globalVolume: number
  ) {
    mediaElements.forEach((element) => {
      if (!element) return;
      const elementClipId = element.getAttribute('data-clip-id');
      const clip = clips.find((c) => c.id === elementClipId);

      const isMuted = isClipAudioMuted(clip, isGlobalMuted, mutedClipsMap);
      element.muted = isMuted;
      if (!isMuted) {
        element.volume = globalVolume;
      }
    });
  }
}
