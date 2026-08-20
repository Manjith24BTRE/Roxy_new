// src/components/editor-main-screen/tools/split/SplitService.ts
import { TimelineSplitManager } from './TimelineSplitManager';
import { validateClipSplit } from './validation';
import { SplitResult, SplitOptions } from './split.types';

export class SplitService {
  /**
   * High-level service facade for splitting a clip by ID on a timeline array.
   */
  public static splitClip(
    timelineClips: any[],
    clipId: string,
    playheadTime: number,
    options: SplitOptions = {}
  ): SplitResult {
    const clip = timelineClips.find((c) => c.id === clipId);
    if (!clip) {
      return { success: false, message: 'Target clip not found.' };
    }

    const validation = validateClipSplit(clip, playheadTime, options);
    if (!validation.canSplit) {
      return { success: false, message: validation.reason };
    }

    const res = TimelineSplitManager.executeTimelineSplit(timelineClips, clipId, playheadTime);
    if (!res.success) {
      return { success: false, message: res.reason };
    }

    return {
      success: true,
      leftClip: res.leftClip,
      rightClip: res.rightClip,
      updatedTimelineClips: res.updatedTimelineClips,
      message: 'Split clip successfully',
    };
  }

  public static canSplit(clip: any, playheadTime: number, options: SplitOptions = {}): boolean {
    return validateClipSplit(clip, playheadTime, options).canSplit;
  }
}
