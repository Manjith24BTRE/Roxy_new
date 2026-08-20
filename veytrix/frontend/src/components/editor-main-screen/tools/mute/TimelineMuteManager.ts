// src/components/editor-main-screen/tools/mute/TimelineMuteManager.ts

export class TimelineMuteManager {
  /**
   * Updates timeline clip array items with explicit isMuted properties.
   */
  public static updateTimelineClipsMute(
    timelineClips: any[],
    clipId: string,
    isMuted: boolean
  ): any[] {
    return timelineClips.map((clip) => {
      if (clip.id === clipId) {
        return {
          ...clip,
          isMuted,
          muted: isMuted,
        };
      }
      return clip;
    });
  }
}
