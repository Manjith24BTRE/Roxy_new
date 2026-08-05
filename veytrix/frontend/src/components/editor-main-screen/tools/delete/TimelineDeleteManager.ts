// src/components/editor-main-screen/tools/delete/TimelineDeleteManager.ts
import { DeleteManager } from './DeleteManager';
import { validateClipDelete } from './validation';
import { findNextSelectedClip } from './delete.utils';
import { DeleteOptions } from './delete.types';

export class TimelineDeleteManager {
  /**
   * Executes timeline clip deletion, updating clips array and determining next selected clip.
   */
  public static executeDelete(
    timelineClips: any[],
    clipId: string,
    playheadTime: number = 0,
    options: DeleteOptions = {}
  ) {
    const clip = timelineClips.find((c) => c.id === clipId);
    const validation = validateClipDelete(clip, options);
    if (!validation.canDelete) {
      return { success: false, reason: validation.reason };
    }

    const updatedClips = options.isRipple
      ? DeleteManager.rippleDeleteClipFromList(timelineClips, clipId)
      : DeleteManager.deleteClipFromList(timelineClips, clipId);

    const nextSelectedClip = findNextSelectedClip(updatedClips, playheadTime);

    return {
      success: true,
      deletedClipId: clipId,
      updatedTimelineClips: updatedClips,
      nextSelectedClip,
    };
  }
}
