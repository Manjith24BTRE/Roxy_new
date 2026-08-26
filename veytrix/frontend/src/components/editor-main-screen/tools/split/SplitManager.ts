// src/components/editor-main-screen/tools/split/SplitManager.ts
import { deepCloneArray, deepCloneObject, generateSplitClipId, calculateSourceDurations } from './split.utils';
import { KeyframeManager } from '../keyframes/KeyframeManager';

export class SplitManager {
  /**
   * Pure domain logic to construct the left clip part and right clip part from a clip and playhead time.
   */
  public static splitClipParts(clip: any, playheadTime: number) {
    const startSec = Math.round((clip.timelineStart ?? clip.start ?? 0) * 10000) / 10000;
    const originalEndSec = Math.round((startSec + (clip.duration ?? 0)) * 10000) / 10000;
    const canonicalSplitTime = Math.round(playheadTime * 10000) / 10000;

    // One canonical split point shared between both clips
    const splitPoint = Math.min(originalEndSec, Math.max(startSec, canonicalSplitTime));

    const leftDuration = Math.round((splitPoint - startSec) * 10000) / 10000;
    const rightDuration = Math.round((originalEndSec - splitPoint) * 10000) / 10000;

    const playbackRate = clip.playbackRate ?? clip.speed ?? clip.playback_speed ?? 1.0;
    const leftSourceDur = Math.round(leftDuration * playbackRate * 10000) / 10000;
    const rightSourceDur = Math.round(rightDuration * playbackRate * 10000) / 10000;

    const { leftKeyframes, rightKeyframes } = KeyframeManager.splitClipKeyframes(clip.keyframes, leftDuration);

    const leftPart = {
      ...clip,
      id: clip.id,
      timelineStart: startSec,
      start: startSec,
      appliedEffects: deepCloneArray(clip.appliedEffects),
      filters: deepCloneArray(clip.filters),
      keyframes: leftKeyframes,
      transitions: deepCloneArray(clip.transitions),
      transforms: deepCloneObject(clip.transforms),
      baseDuration: leftSourceDur,
      duration: leftDuration,
    };

    const rightPartId = generateSplitClipId(clip.id);
    const rightStartOffset = Math.round(((clip.startOffset || 0) + leftSourceDur) * 10000) / 10000;

    const rightPart = {
      ...clip,
      id: rightPartId,
      isLocked: false,
      timelineStart: splitPoint, // Canonical split point shared by both clips
      start: splitPoint,
      appliedEffects: deepCloneArray(clip.appliedEffects),
      filters: deepCloneArray(clip.filters),
      keyframes: rightKeyframes,
      transitions: deepCloneArray(clip.transitions),
      transforms: deepCloneObject(clip.transforms),
      startOffset: rightStartOffset,
      baseDuration: rightSourceDur,
      duration: rightDuration,
    };

    return { leftPart, rightPart };
  }
}
