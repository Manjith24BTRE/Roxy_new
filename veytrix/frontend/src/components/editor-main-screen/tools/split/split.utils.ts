// src/components/editor-main-screen/tools/split/split.utils.ts

export function deepCloneArray<T>(arr?: T[]): T[] {
  return arr ? JSON.parse(JSON.stringify(arr)) : [];
}

export function deepCloneObject<T>(obj?: T): T | undefined {
  return obj ? JSON.parse(JSON.stringify(obj)) : undefined;
}

export function generateSplitClipId(baseId: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseId}-split-${timestamp}-${randomSuffix}`;
}

export function calculateSourceDurations(clip: any, relativePlayheadSec: number) {
  const playbackRate = clip.playbackRate ?? clip.speed ?? clip.playback_speed ?? 1.0;
  const leftSourceDur = relativePlayheadSec * playbackRate;

  let originalSourceDur = clip.baseDuration;
  if (!originalSourceDur || isNaN(originalSourceDur)) {
    originalSourceDur = (clip.duration ?? relativePlayheadSec) * playbackRate;
  }
  const rightSourceDur = Math.max(0, originalSourceDur - leftSourceDur);

  return { leftSourceDur, rightSourceDur, playbackRate };
}
