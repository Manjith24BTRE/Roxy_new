// src/components/editor-main-screen/tools/delete/DeleteManager.ts
import { performRippleShift } from './delete.utils';

export class DeleteManager {
  /**
   * Pure domain logic to filter out a clip from a list.
   */
  public static deleteClipFromList(timelineClips: any[], clipId: string) {
    return timelineClips.filter((c) => c.id !== clipId);
  }

  /**
   * Pure domain logic to filter out a clip and ripple shift subsequent clips on the same track.
   */
  public static rippleDeleteClipFromList(timelineClips: any[], clipId: string) {
    const deletedClip = timelineClips.find((c) => c.id === clipId);
    const remaining = timelineClips.filter((c) => c.id !== clipId);

    if (!deletedClip) {
      return remaining;
    }

    return performRippleShift(remaining, deletedClip);
  }
}
