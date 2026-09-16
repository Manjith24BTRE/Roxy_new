export class ClipReorderUtils {
  /**
   * Recalculates the timing sequence for the timeline clips.
   * Main video track clips start at 0 and snap continuously end-to-end (ripple sequence),
   * filling all gaps from the start of the timeline.
   * Overlay and Audio clips preserve their custom positions or align to parent clips.
   */
  public static recalculateClipSequence(clips: any[]): any[] {
    let currentStart = 0;

    // 1. Reflow main video/image track clips continuously from 0s
    const updatedClips = clips.map((c) => {
      const isAudio = c.trackId === 'audio' || c.trackId === 'music' || c.type === 'audio' || c.isDetachedAudio;
      const isOverlay = c.trackId === 'overlay';

      if (isAudio || isOverlay) {
        return c;
      }

      const updated = { ...c, timelineStart: currentStart, start: currentStart };
      currentStart = Math.round((currentStart + c.duration) * 10000) / 10000;
      return updated;
    });

    // Audio and Overlay clips preserve their own independent timeline positions and durations
    return updatedClips;
  }
}
