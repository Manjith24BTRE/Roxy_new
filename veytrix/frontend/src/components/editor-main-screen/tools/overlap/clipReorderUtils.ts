export class ClipReorderUtils {
  /**
   * Recalculates the timing sequence for the timeline clips.
   * Snaps Main Video track clips end-to-start continuously starting at 0.
   * Skips Overlay and Audio clips, preserving custom start times for overlays
   * and aligning audio clips to their parent videos.
   */
  public static recalculateClipSequence(clips: any[]): any[] {
    let currentStart = 0;
    
    // 1. Reflow main video/image track clips
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
