import { TimelineClipRef } from './detach.types';

/**
 * Returns the effective start time (in seconds) of a clip.
 */
export function getClipStart(clip: TimelineClipRef): number {
  if (typeof clip.timelineStart === 'number') {
    return clip.timelineStart;
  }
  if (typeof clip.start === 'number') {
    return clip.start;
  }
  return 0;
}

/**
 * Sets the start time on a clip object across both timelineStart and start fields.
 */
export function setClipStart<T extends TimelineClipRef>(clip: T, start: number): T {
  return {
    ...clip,
    start,
    timelineStart: start,
  };
}

/**
 * Formats a clean, readable name for the detached audio clip.
 */
export function formatAudioClipName(videoName: string): string {
  const baseName = videoName.replace(/\.[^/.]+$/, ''); // Remove extension if present
  return `Audio from ${baseName || videoName}`;
}

/**
 * Generates a unique, collision-free ID for the newly detached audio clip.
 */
export function generateDetachedClipId(sourceId: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `detached-audio-${sourceId}-${timestamp}-${randomSuffix}`;
}

/**
 * Returns the default styling for detached audio clips to match existing theme.
 */
export function getAudioTrackColor(): string {
  return 'bg-emerald-500/25 border-emerald-400/50 text-emerald-300';
}

/**
 * Creates a safe shallow/deep clone of a clip to prevent state mutation side-effects.
 */
export function cloneClip<T extends TimelineClipRef>(clip: T): T {
  return JSON.parse(JSON.stringify(clip));
}

/**
 * Helper to check if a clip is an audio clip.
 */
export function isAudioClip(clip: TimelineClipRef): boolean {
  return clip.trackId === 'audio' || clip.type === 'audio' || clip.mediaType === 'audio' || clip.isDetachedAudio === true;
}
