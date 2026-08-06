// src/components/editor-main-screen/tools/mute/mute.types.ts

export interface MuteState {
  isGlobalMuted: boolean;
  mutedClips: Record<string, boolean>;
}

export interface MuteToggleOptions {
  clipId?: string;
  isGlobal?: boolean;
}

export interface MuteResult {
  success: boolean;
  isGlobalMuted: boolean;
  mutedClips: Record<string, boolean>;
  targetClipId?: string;
  clipIsMuted?: boolean;
  message?: string;
}
