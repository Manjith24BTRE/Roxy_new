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

    // Synchronize splitting for linked/detached audio or video clips across tracks
    const isVideo = clip.trackId !== 'audio' && clip.trackId !== 'music' && clip.type !== 'audio' && !clip.isDetachedAudio;

    const linkedClip = timelineClips.find((c) => {
      if (c.id === clipId) return false;
      const isTargetAudio = c.trackId === 'audio' || c.trackId === 'music' || c.type === 'audio' || c.isDetachedAudio;
      if (isVideo && !isTargetAudio) return false;
      if (!isVideo && isTargetAudio) return false;

      const cStart = c.timelineStart ?? c.start ?? 0;
      const cEnd = cStart + c.duration;
      const isOverlapping = playheadTime > cStart && playheadTime < cEnd;

      const isSameMedia = c.mediaId === clip.mediaId || c.sourceVideoId === clip.id || clip.sourceVideoId === c.id;
      return isOverlapping && isSameMedia;
    });

    if (linkedClip) {
      const linkedIndex = updatedClips.findIndex((c) => c.id === linkedClip.id);
      if (linkedIndex !== -1 && validateClipSplit(linkedClip, playheadTime).canSplit) {
        const { leftPart: lLeft, rightPart: lRight } = SplitManager.splitClipParts(linkedClip, playheadTime);
        if (isVideo) {
          lLeft.sourceVideoId = leftPart.id;
          lRight.sourceVideoId = rightPart.id;
        }
        updatedClips.splice(linkedIndex, 1, lLeft, lRight);
      }
    }

    return {
      success: true,
      leftClip: leftPart,
      rightClip: rightPart,
      updatedTimelineClips: updatedClips,
    };
  }
}
