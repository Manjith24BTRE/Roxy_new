// src/components/editor-main-screen/tools/mute/MuteManager.ts

export class MuteManager {
  /**
   * Toggles global audio mute boolean state.
   */
  public static toggleGlobalMute(currentIsMuted: boolean): boolean {
    return !currentIsMuted;
  }

  /**
   * Toggles clip-level mute state inside mutedClips map.
   */
  public static toggleClipMute(
    mutedClipsMap: Record<string, boolean>,
    clipId: string,
    targetState?: boolean
  ): { updatedMap: Record<string, boolean>; clipIsMuted: boolean } {
    const currentMuted = !!mutedClipsMap[clipId];
    const newMutedState = targetState !== undefined ? targetState : !currentMuted;

    return {
      updatedMap: {
        ...mutedClipsMap,
        [clipId]: newMutedState,
      },
      clipIsMuted: newMutedState,
    };
  }
}
