// src/components/editor-main-screen/tools/mute/validation.ts

export function validateMuteToggle(clip?: any): { canToggle: boolean; reason?: string } {
  if (clip && clip.isLocked) {
    return { canToggle: false, reason: 'This clip is locked. Unlock it to toggle mute state.' };
  }
  return { canToggle: true };
}
