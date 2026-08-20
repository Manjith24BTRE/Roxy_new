// src/components/editor-main-screen/tools/delete/DeleteManager.ts
import { performRippleShift } from './delete.utils';

export class DeleteManager {
  /**
   * Pure domain logic to filter out a clip from a list, also automatically removing linked audio/video clips.
   */
  public static deleteClipFromList(timelineClips: any[], clipId: string) {
    const deletedClip = timelineClips.find((c) => c.id === clipId);
    if (!deletedClip) return timelineClips;

    const isVideo = deletedClip.trackId !== 'audio' && deletedClip.trackId !== 'music' && deletedClip.type !== 'audio' && !deletedClip.isDetachedAudio;

    return timelineClips.filter((c) => {
      if (c.id === clipId) return false;

      if (isVideo) {
        const isAudio = c.trackId === 'audio' || c.trackId === 'music' || c.type === 'audio' || c.isDetachedAudio;
        if (isAudio) {
          const isLinked = c.sourceVideoId === clipId ||
                           c.id === `detached-audio-${clipId}` ||
                           (c.mediaId === deletedClip.mediaId && Math.abs((c.timelineStart ?? c.start ?? 0) - (deletedClip.timelineStart ?? deletedClip.start ?? 0)) < 0.5);
          if (isLinked) return false;
        }
      }

      return true;
    });
  }

  /**
   * Pure domain logic to filter out a clip and ripple shift subsequent clips on the same track.
   */
  public static rippleDeleteClipFromList(timelineClips: any[], clipId: string) {
    const deletedClip = timelineClips.find((c) => c.id === clipId);
    const remaining = this.deleteClipFromList(timelineClips, clipId);

    if (!deletedClip) {
      return remaining;
    }

    return performRippleShift(remaining, deletedClip);
  }
}
