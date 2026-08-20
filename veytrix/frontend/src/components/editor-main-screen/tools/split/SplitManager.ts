// src/components/editor-main-screen/tools/split/SplitManager.ts
import { deepCloneArray, deepCloneObject, generateSplitClipId, calculateSourceDurations } from './split.utils';
import { KeyframeManager } from '../keyframes/KeyframeManager';

export class SplitManager {
  /**
   * Pure domain logic to construct the left clip part and right clip part from a clip and playhead time.
   */
  public static splitClipParts(clip: any, playheadTime: number) {
    const startSec = clip.timelineStart ?? clip.start ?? 0;
    const relativePlayhead = playheadTime - startSec;
    const { leftSourceDur, rightSourceDur } = calculateSourceDurations(clip, relativePlayhead);

    const { leftKeyframes, rightKeyframes } = KeyframeManager.splitClipKeyframes(clip.keyframes, relativePlayhead);

    const leftPart = {
      ...clip,
      id: clip.id,
      appliedEffects: deepCloneArray(clip.appliedEffects),
      filters: deepCloneArray(clip.filters),
      keyframes: leftKeyframes,
      transitions: deepCloneArray(clip.transitions),
      transforms: deepCloneObject(clip.transforms),
      baseDuration: leftSourceDur,
      duration: relativePlayhead,
    };

    const rightPartId = generateSplitClipId(clip.id);
    const splitTimelineStart = startSec + relativePlayhead;

    const rightPart = {
      ...clip,
      id: rightPartId,
      isLocked: false,
      timelineStart: splitTimelineStart,
      start: splitTimelineStart,
      appliedEffects: deepCloneArray(clip.appliedEffects),
      filters: deepCloneArray(clip.filters),
      keyframes: rightKeyframes,
      transitions: deepCloneArray(clip.transitions),
      transforms: deepCloneObject(clip.transforms),
      startOffset: (clip.startOffset || 0) + leftSourceDur,
      baseDuration: rightSourceDur,
      duration: clip.duration - relativePlayhead,
    };

    return { leftPart, rightPart };
  }
}
