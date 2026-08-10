import { TimelineClipRef, FreezeOptions, FreezeOperationResult, ITimelineFreezeManager } from './freeze.types';
import { DEFAULT_FREEZE_DURATION, deepCloneArray, generatePostFreezeClipId } from './freeze.utils';
import { freezeFrameGenerator } from './FreezeFrameGenerator';
import { validateFreeze } from './validation';

/**
 * Minimum duration threshold (in seconds) below which a split segment is considered
 * zero-duration and should be omitted rather than inserted into the timeline.
 */
const MIN_SEGMENT_DURATION = 0.001;

export class TimelineFreezeManager implements ITimelineFreezeManager {
  /**
   * Splits the video clip at playhead position and inserts a 2s Freeze Frame clip.
   *
   * Handles four cases:
   *  - Playhead at clip START → insert freeze before the clip (no split)
   *  - Playhead in MIDDLE    → split clip into A + freeze + B
   *  - Playhead near END     → split clip into A + freeze + B (B can be very short)
   *  - Playhead at clip END  → insert freeze after the clip (no split)
   *
   * Returns the updated clips array. Caller is responsible for reflowing positions
   * via recalculateSequence.
   */
  applyFreezeFrame<T extends TimelineClipRef>(
    clips: T[],
    sourceClipId: string,
    playheadTime: number,
    options: FreezeOptions = {}
  ): FreezeOperationResult<T> | null {
    const clipIndex = clips.findIndex((c) => c.id === sourceClipId);
    if (clipIndex === -1) {
      if (options.showToast && !options.silent) {
        options.showToast('Select a valid video clip to freeze frame.');
      }
      return null;
    }

    const sourceClip = clips[clipIndex];
    const validation = validateFreeze(sourceClip, playheadTime);

    if (!validation.canFreeze) {
      if (options.showToast && !options.silent && validation.reason) {
        options.showToast(validation.reason);
      }
      return null;
    }

    const clipStart = sourceClip.timelineStart ?? sourceClip.start ?? 0;
    const clipDuration = sourceClip.duration;
    const relativePlayhead = Math.max(0, Math.min(playheadTime - clipStart, clipDuration));
    const rate = sourceClip.playbackRate || sourceClip.speed || 1;
    const startOffset = sourceClip.startOffset || 0;
    const sourceFrameTime = startOffset + relativePlayhead * rate;

    const freezeDuration = options.duration || DEFAULT_FREEZE_DURATION;

    // Capture exact frame as PNG Data URL from active HTML5 Video Element or fallback thumbnail
    const capturedFrameDataUrl =
      freezeFrameGenerator.captureFrameFromActiveVideo(options.videoElement) ||
      sourceClip.thumbnails?.[0] ||
      sourceClip.url;

    // Determine split mode
    const isAtStart = relativePlayhead < MIN_SEGMENT_DURATION;
    const isAtEnd = relativePlayhead > clipDuration - MIN_SEGMENT_DURATION;

    // Build the three segments (videoAPart may be null, videoBPart may be null)
    let videoAPart: T | null = null;
    let videoBPart: T | null = null;

    if (!isAtStart) {
      // Video A: from clip start to playhead
      videoAPart = {
        ...sourceClip,
        id: sourceClip.id,
        timelineStart: clipStart,
        start: clipStart,
        duration: relativePlayhead,
        baseDuration: relativePlayhead * rate,
        startOffset: startOffset,
        appliedEffects: deepCloneArray(sourceClip.appliedEffects),
        filters: deepCloneArray(sourceClip.filters),
        keyframes: deepCloneArray(sourceClip.keyframes),
        transitions: deepCloneArray(sourceClip.transitions),
        transforms: sourceClip.transforms ? JSON.parse(JSON.stringify(sourceClip.transforms)) : undefined
      };
    }

    // Create Freeze Frame Clip
    const freezeClip = freezeFrameGenerator.createFreezeClip(
      sourceClip,
      sourceFrameTime,
      freezeDuration,
      capturedFrameDataUrl
    ) as T;

    // Timeline position for freeze depends on whether we split or not
    const freezeTimelineStart = isAtStart ? clipStart : clipStart + relativePlayhead;
    freezeClip.timelineStart = freezeTimelineStart;
    freezeClip.start = freezeTimelineStart;

    if (!isAtEnd) {
      // Video B: from playhead to clip end
      const postFreezeId = isAtStart ? sourceClip.id : generatePostFreezeClipId(sourceClip.id);
      const videoBPartDuration = clipDuration - relativePlayhead;

      videoBPart = {
        ...sourceClip,
        id: postFreezeId,
        name: isAtStart ? sourceClip.name : `${sourceClip.name} (Part 2)`,
        timelineStart: freezeTimelineStart + freezeDuration,
        start: freezeTimelineStart + freezeDuration,
        duration: videoBPartDuration,
        baseDuration: videoBPartDuration * rate,
        startOffset: isAtStart ? startOffset : sourceFrameTime,
        isLocked: false,
        appliedEffects: deepCloneArray(sourceClip.appliedEffects),
        filters: deepCloneArray(sourceClip.filters),
        keyframes: deepCloneArray(sourceClip.keyframes),
        transitions: deepCloneArray(sourceClip.transitions),
        transforms: sourceClip.transforms ? JSON.parse(JSON.stringify(sourceClip.transforms)) : undefined
      };
    }

    // Build updated clips array, replacing source clip with the new segments
    const trackId = sourceClip.trackId || sourceClip.type || 'video';
    const updatedClips: T[] = [];

    clips.forEach((clip, idx) => {
      if (idx === clipIndex) {
        // Insert the new segments in place of the original clip
        if (videoAPart) updatedClips.push(videoAPart);
        updatedClips.push(freezeClip);
        if (videoBPart) updatedClips.push(videoBPart);
      } else {
        // Shift subsequent clips on the same track by freezeDuration
        const currentClipTrack = clip.trackId || clip.type || 'video';
        const currentClipStart = clip.timelineStart ?? clip.start ?? 0;

        if (currentClipTrack === trackId && currentClipStart >= clipStart + relativePlayhead) {
          const shiftedClip: T = {
            ...clip,
            timelineStart: currentClipStart + freezeDuration,
            start: currentClipStart + freezeDuration
          };
          updatedClips.push(shiftedClip);
        } else {
          updatedClips.push(clip);
        }
      }
    });

    if (options.showToast && !options.silent) {
      options.showToast(`Freeze frame created (${freezeDuration.toFixed(1)}s)`);
    }

    // For the result, provide videoAPart/videoBPart as required by the interface.
    // When a segment was omitted (start/end case), use the original clip data as a stand-in.
    const resultAPart = videoAPart || ({ ...sourceClip, duration: 0 } as T);
    const resultBPart = videoBPart || ({ ...sourceClip, duration: 0 } as T);

    return {
      updatedClips,
      videoAPart: resultAPart,
      freezeClip,
      videoBPart: resultBPart,
      createdFreezeClipId: freezeClip.id
    };
  }
}

export const timelineFreezeManager = new TimelineFreezeManager();

