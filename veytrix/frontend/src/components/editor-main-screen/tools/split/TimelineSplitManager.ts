// src/components/editor-main-screen/tools/split/TimelineSplitManager.ts
import { SplitManager } from './SplitManager';
import { validateClipSplit } from './validation';

export class TimelineSplitManager {
  /**
   * Splices leftPart & rightPart into a timeline clips array at the specified clip index.
   * Also synchronizes splitting for linked audio clips so video and audio stay 100% matched.
   */
  public static executeTimelineSplit(
    timelineClips: any[],
    clipId: string,
    playheadTime: number
  ) {
    const clipIndex = timelineClips.findIndex((c) => c.id === clipId);
    if (clipIndex === -1) {
      return { success: false, reason: 'Clip not found in timeline.' };
    }

    const clip = timelineClips[clipIndex];
    const validation = validateClipSplit(clip, playheadTime);
    if (!validation.canSplit) {
      return { success: false, reason: validation.reason };
    }

    const { leftPart, rightPart } = SplitManager.splitClipParts(clip, playheadTime);

    let updatedClips = [...timelineClips];
    updatedClips.splice(clipIndex, 1, leftPart, rightPart);

    // Splitting audio splits only audio; splitting video splits only video.

    return {
      success: true,
      leftClip: leftPart,
      rightClip: rightPart,
      updatedTimelineClips: updatedClips,
    };
  }
}
