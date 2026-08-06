// src/components/editor-main-screen/tools/delete/DeleteService.ts
import { TimelineDeleteManager } from './TimelineDeleteManager';
import { validateClipDelete } from './validation';
import { DeleteResult, DeleteOptions } from './delete.types';

export class DeleteService {
  /**
   * High-level service facade for deleting a clip by ID on a timeline array.
   */
  public static deleteClip(
    timelineClips: any[],
    clipId: string,
    playheadTime: number = 0,
    options: DeleteOptions = {}
  ): DeleteResult {
    const clip = timelineClips.find((c) => c.id === clipId);
    const validation = validateClipDelete(clip, options);
    if (!validation.canDelete) {
      return { success: false, message: validation.reason };
    }

    const res = TimelineDeleteManager.executeDelete(timelineClips, clipId, playheadTime, options);
    if (!res.success) {
      return { success: false, message: res.reason };
    }

    return {
      success: true,
      deletedClipId: clipId,
      updatedTimelineClips: res.updatedTimelineClips,
      nextSelectedClip: res.nextSelectedClip,
      message: options.isRipple ? 'Ripple deleted clip' : 'Deleted clip',
    };
  }

  public static rippleDeleteClip(
    timelineClips: any[],
    clipId: string,
    playheadTime: number = 0,
    options: DeleteOptions = {}
  ): DeleteResult {
    return this.deleteClip(timelineClips, clipId, playheadTime, { ...options, isRipple: true });
  }

  public static canDelete(clip: any, options: DeleteOptions = {}): boolean {
    return validateClipDelete(clip, options).canDelete;
  }
}
