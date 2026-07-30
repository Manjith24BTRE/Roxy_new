import { TimelineClipRef, FreezeOptions, FreezeOperationResult, ITimelineFreezeManager } from './freeze.types';
import { DEFAULT_FREEZE_DURATION, deepCloneArray, generatePostFreezeClipId } from './freeze.utils';
import { freezeFrameGenerator } from './FreezeFrameGenerator';
import { validateFreeze } from './validation';

export class TimelineFreezeManager implements ITimelineFreezeManager {
  /**
   * Splits the video clip at playhead position and inserts a 2s Freeze Frame clip.
   * Video B continues seamlessly from the exact captured frame.
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
    const relativePlayhead = playheadTime - clipStart;
    const rate = sourceClip.playbackRate || sourceClip.speed || 1;
    const startOffset = sourceClip.startOffset || 0;
    const sourceFrameTime = startOffset + relativePlayhead * rate;

    const freezeDuration = options.duration || DEFAULT_FREEZE_DURATION;

    // Capture exact frame as PNG Data URL from active HTML5 Video Element or fallback thumbnail
    const capturedFrameDataUrl =
      freezeFrameGenerator.captureFrameFromActiveVideo(options.videoElement) ||
      sourceClip.thumbnails?.[0] ||
      sourceClip.url;

    // 1. Video A (Part 1)
    const videoAPart: T = {
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

    // 2. Freeze Frame Clip
    const freezeClip = freezeFrameGenerator.createFreezeClip(
      sourceClip,
      sourceFrameTime,
      freezeDuration,
      capturedFrameDataUrl
    ) as T;

    freezeClip.timelineStart = clipStart + relativePlayhead;
    freezeClip.start = clipStart + relativePlayhead;

    // 3. Video B (Part 2 - continues from exact source frame offset)
    const postFreezeId = generatePostFreezeClipId(sourceClip.id);
    const videoBPartDuration = sourceClip.duration - relativePlayhead;

    const videoBPart: T = {
      ...sourceClip,
      id: postFreezeId,
      name: `${sourceClip.name} (Part 2)`,
      timelineStart: clipStart + relativePlayhead + freezeDuration,
      start: clipStart + relativePlayhead + freezeDuration,
      duration: videoBPartDuration,
      baseDuration: videoBPartDuration * rate,
      startOffset: sourceFrameTime,
      isLocked: false,
      appliedEffects: deepCloneArray(sourceClip.appliedEffects),
      filters: deepCloneArray(sourceClip.filters),
      keyframes: deepCloneArray(sourceClip.keyframes),
      transitions: deepCloneArray(sourceClip.transitions),
      transforms: sourceClip.transforms ? JSON.parse(JSON.stringify(sourceClip.transforms)) : undefined
    };

    // 4. Update timeline clip list & shift subsequent clips on the same track by freezeDuration
    const trackId = sourceClip.trackId || sourceClip.type || 'video';
    const updatedClips: T[] = [];

    clips.forEach((clip, idx) => {
      if (idx === clipIndex) {
        updatedClips.push(videoAPart, freezeClip, videoBPart);
      } else {
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

    return {
      updatedClips,
      videoAPart,
      freezeClip,
      videoBPart,
      createdFreezeClipId: freezeClip.id
    };
  }
}

export const timelineFreezeManager = new TimelineFreezeManager();
