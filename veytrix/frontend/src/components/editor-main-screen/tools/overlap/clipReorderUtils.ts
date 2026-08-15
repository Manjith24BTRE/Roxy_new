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
      currentStart += c.duration;
      return updated;
    });

    // 2. Align audio clips to their corresponding parent videos
    return updatedClips.map((c) => {
      const isAudio = c.trackId === 'audio' || c.trackId === 'music' || c.type === 'audio' || c.isDetachedAudio;
      if (!isAudio) return c;

      const parentVideo = updatedClips.find(
        (v: any) => (v.trackId !== 'audio' && v.trackId !== 'music' && v.type !== 'audio' && !v.isDetachedAudio && v.trackId !== 'overlay') &&
               (v.id === c.sourceVideoId || c.id === `detached-audio-${v.id}` || v.mediaId === c.mediaId)
      );

      if (parentVideo) {
        return {
          ...c,
          timelineStart: parentVideo.timelineStart,
          start: parentVideo.timelineStart,
          startOffset: parentVideo.startOffset ?? 0,
          duration: parentVideo.duration
        };
      }
      return c;
    });
  }
}
