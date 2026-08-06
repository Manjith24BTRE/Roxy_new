// src/components/editor-main-screen/tools/mute/MuteService.ts
import { MuteManager } from './MuteManager';
import { validateMuteToggle } from './validation';
import { MuteResult, MuteState } from './mute.types';

export class MuteService {
  /**
   * High-level service facade for global audio mute toggle.
   */
  public static toggleGlobalMute(currentState: MuteState): MuteResult {
    const nextIsMuted = MuteManager.toggleGlobalMute(currentState.isGlobalMuted);
    return {
      success: true,
      isGlobalMuted: nextIsMuted,
      mutedClips: currentState.mutedClips,
      message: nextIsMuted ? 'Audio track muted' : 'Audio track unmuted',
    };
  }

  /**
   * High-level service facade for per-clip mute toggle.
   */
  public static toggleClipMute(
    currentState: MuteState,
    clipId: string,
    clip?: any,
    targetState?: boolean
  ): MuteResult {
    const validation = validateMuteToggle(clip);
    if (!validation.canToggle) {
      return {
        success: false,
        isGlobalMuted: currentState.isGlobalMuted,
        mutedClips: currentState.mutedClips,
        message: validation.reason,
      };
    }

    const res = MuteManager.toggleClipMute(currentState.mutedClips, clipId, targetState);
    const clipName = clip?.name ? ` (${clip.name})` : '';

    return {
      success: true,
      isGlobalMuted: currentState.isGlobalMuted,
      mutedClips: res.updatedMap,
      targetClipId: clipId,
      clipIsMuted: res.clipIsMuted,
      message: `${res.clipIsMuted ? 'Muted' : 'Unmuted'} audio${clipName}`,
    };
  }
}
