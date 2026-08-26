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

    // Synchronize splitting ONLY for explicitly linked/detached audio clips on separate audio tracks
    const isVideo = clip.trackId !== 'audio' && clip.trackId !== 'music' && clip.type !== 'audio' && !clip.isDetachedAudio;

    if (isVideo) {
      const linkedAudioClip = timelineClips.find((c) => {
        if (c.id === clipId) return false;
        const isAudioTrack = c.trackId === 'audio' || c.trackId === 'music' || c.type === 'audio' || c.isDetachedAudio;
        if (!isAudioTrack) return false;

        const isExplicitlyLinked = c.sourceVideoId === clip.id || c.id === `detached-audio-${clip.id}`;
        if (!isExplicitlyLinked) return false;

        const cStart = c.timelineStart ?? c.start ?? 0;
        const cEnd = cStart + c.duration;
        return playheadTime > cStart && playheadTime < cEnd;
      });

      if (linkedAudioClip) {
        const linkedIndex = updatedClips.findIndex((c) => c.id === linkedAudioClip.id);
        if (linkedIndex !== -1 && validateClipSplit(linkedAudioClip, playheadTime).canSplit) {
          const { leftPart: lLeft, rightPart: lRight } = SplitManager.splitClipParts(linkedAudioClip, playheadTime);
          lLeft.sourceVideoId = leftPart.id;
          lRight.sourceVideoId = rightPart.id;
          updatedClips.splice(linkedIndex, 1, lLeft, lRight);
        }
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
