// src/components/editor-main-screen/tools/mute/mute.utils.ts

export function isClipAudioMuted(
  clip?: any,
  isGlobalMuted: boolean = false,
  mutedClipsMap: Record<string, boolean> = {}
): boolean {
  if (isGlobalMuted) return true;
  if (!clip) return false;

  const isClipMapMuted = !!mutedClipsMap[clip.id];
  const isDirectMuted = !!clip.isMuted || !!clip.muted;
  const isDetachedMuted = !!clip.isAudioDetached || !!clip.audioDetached || clip.embeddedAudioEnabled === false;

  return isClipMapMuted || isDirectMuted || isDetachedMuted;
}

export function calculateEffectiveVolume(
  clip: any,
  globalVolume: number,
  isGlobalMuted: boolean,
  mutedClipsMap: Record<string, boolean>
): number {
  if (isClipAudioMuted(clip, isGlobalMuted, mutedClipsMap)) {
    return 0;
  }
  return globalVolume;
}
