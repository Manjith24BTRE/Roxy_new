import { TimelineClipRef } from './freeze.types';

export const DEFAULT_FREEZE_DURATION = 2.0;
export const LOCKED_FREEZE_BLOCKED_MESSAGE = 'This clip is locked. Unlock it to make changes.';
export const NON_VIDEO_FREEZE_BLOCKED_MESSAGE = 'Freeze frame can only be applied to video clips.';
export const PLAYHEAD_OUT_OF_BOUNDS_MESSAGE = 'Position playhead inside the video clip to freeze frame.';
export const NO_CLIP_SELECTED_MESSAGE = 'Select a video clip to create a freeze frame.';

/**
 * Checks whether a given clip is a freeze frame clip.
 */
export function isFreezeClip(clip: TimelineClipRef | null | undefined): boolean {
  if (!clip) return false;
  return clip.isFreezeFrame === true || clip.type === 'freeze' || clip.mediaType === 'freeze';
}

/**
 * Calculates the exact source frame time in seconds within the underlying video asset.
 */
export function calculateSourceFrameTime(clip: TimelineClipRef, playheadTime: number): number {
  const clipStart = clip.timelineStart ?? clip.start ?? 0;
  const relativePlayhead = Math.max(0, playheadTime - clipStart);
  const rate = clip.playbackRate || clip.speed || 1;
  const startOffset = clip.startOffset || 0;
  return startOffset + relativePlayhead * rate;
}

/**
 * Deep clones array properties to ensure independent object references.
 */
export function deepCloneArray<T>(arr?: T[]): T[] {
  if (!arr || !Array.isArray(arr)) return [];
  try {
    return JSON.parse(JSON.stringify(arr));
  } catch {
    return [...arr];
  }
}

/**
 * Generates a unique clip ID for freeze frame clips.
 */
export function generateFreezeClipId(sourceClipId: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `${sourceClipId}-freeze-${timestamp}-${randomStr}`;
}

/**
 * Generates a unique clip ID for post-freeze video continuation segments.
 */
export function generatePostFreezeClipId(sourceClipId: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `${sourceClipId}-postfreeze-${timestamp}-${randomStr}`;
}
