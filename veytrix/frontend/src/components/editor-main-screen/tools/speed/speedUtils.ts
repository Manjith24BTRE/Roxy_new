// speedUtils.ts
// Purpose: Canonical speed calculation utilities. Single source of truth.

import { MIN_SPEED, MAX_SPEED, DEFAULT_SPEED, SPEED_STEPS } from './speedConstants';

/**
 * Validate and clamp a playback rate to the supported range [0.25, 8].
 * Returns DEFAULT_SPEED (1) for invalid inputs.
 */
export function clampPlaybackRate(rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) return DEFAULT_SPEED;
  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, rate));
}

/**
 * Format playback rate as display string: "2x", "0.5x", "1.25x"
 */
export function formatSpeed(rate: number): string {
  const clamped = clampPlaybackRate(rate);
  // Use clean formatting: no trailing zeros after decimal
  if (clamped % 1 === 0) return `${clamped}x`;
  // Remove unnecessary trailing zeros
  return `${parseFloat(clamped.toFixed(2))}x`;
}

/**
 * Get the source media duration of a clip (the range of source frames used).
 * This is INDEPENDENT of playback rate — it represents the actual media span.
 * 
 * In the VEYTRIX data model:
 * - `baseDuration` is the immutable source duration (set when clip is created)
 * - `duration` is the effective timeline duration (baseDuration / playbackRate)
 * - `startOffset` is the source in-point
 * 
 * sourceDuration = baseDuration (if available) or duration * playbackRate (recovery)
 */
export function getSourceDuration(clip: {
  baseDuration?: number;
  duration: number;
  playbackRate?: number;
}): number {
  if (clip.baseDuration && clip.baseDuration > 0) return clip.baseDuration;
  // Recovery: if baseDuration wasn't stored, derive from effective duration * rate
  const rate = clampPlaybackRate(clip.playbackRate ?? 1);
  return clip.duration * rate;
}

/**
 * Calculate the effective timeline duration given a source duration and playback rate.
 * effectiveDuration = sourceDuration / playbackRate
 * 
 * Examples:
 *   5.3s source at 2x = 2.65s timeline
 *   5.3s source at 0.5x = 10.6s timeline
 *   5.3s source at 1x = 5.3s timeline
 */
export function getEffectiveDuration(sourceDuration: number, playbackRate: number): number {
  const rate = clampPlaybackRate(playbackRate);
  if (sourceDuration <= 0) return 0;
  return sourceDuration / rate;
}

/**
 * Convert a project timeline time to the corresponding source media time for a clip.
 * 
 * sourceTime = clip.startOffset + (timelineTime - clip.timelineStart) * clip.playbackRate
 * 
 * Clamped to valid source range.
 */
export function timelineTimeToSourceTime(
  clip: { startOffset: number; timelineStart: number; playbackRate?: number; baseDuration?: number; duration: number; isReversed?: boolean },
  timelineTime: number
): number {
  const rate = clampPlaybackRate(clip.playbackRate ?? 1);
  const localTimelineTime = timelineTime - clip.timelineStart;
  const sourceDuration = getSourceDuration(clip);

  if (clip.isReversed) {
    const endOffset = clip.startOffset + sourceDuration;
    const sourceTime = endOffset - localTimelineTime * rate;
    return Math.max(clip.startOffset, Math.min(sourceTime, endOffset));
  }

  const sourceTime = clip.startOffset + localTimelineTime * rate;
  return Math.max(clip.startOffset, Math.min(sourceTime, clip.startOffset + sourceDuration));
}

/**
 * Convert a source media time to the corresponding project timeline time for a clip.
 * 
 * timelineTime = clip.timelineStart + (sourceTime - clip.startOffset) / clip.playbackRate
 */
export function sourceTimeToTimelineTime(
  clip: { startOffset: number; timelineStart: number; playbackRate?: number; baseDuration?: number; duration: number; isReversed?: boolean },
  sourceTime: number
): number {
  const rate = clampPlaybackRate(clip.playbackRate ?? 1);
  const sourceDuration = getSourceDuration(clip);

  if (clip.isReversed) {
    const endOffset = clip.startOffset + sourceDuration;
    return clip.timelineStart + (endOffset - sourceTime) / rate;
  }

  return clip.timelineStart + (sourceTime - clip.startOffset) / rate;
}

/**
 * Format seconds into mm:ss.d display string.
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:00.0';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
}

/**
 * Find the closest speed step index for a given rate value.
 */
export function speedToStepIndex(rate: number): number {
  const clamped = clampPlaybackRate(rate);
  let closestIdx = 0;
  let closestDist = Infinity;
  for (let i = 0; i < SPEED_STEPS.length; i++) {
    const dist = Math.abs(SPEED_STEPS[i] - clamped);
    if (dist < closestDist) {
      closestDist = dist;
      closestIdx = i;
    }
  }
  return closestIdx;
}

/**
 * Convert a slider step index to a speed value.
 */
export function stepIndexToSpeed(index: number): number {
  const clamped = Math.max(0, Math.min(index, SPEED_STEPS.length - 1));
  return SPEED_STEPS[clamped];
}

/**
 * Build FFmpeg atempo filter chain for a given playback rate.
 * atempo supports [0.5, 100.0] per filter instance.
 * For rates outside single-filter range, chain multiple filters.
 * 
 * Examples:
 *   4x → "atempo=2,atempo=2"
 *   8x → "atempo=2,atempo=2,atempo=2"
 *   0.25x → "atempo=0.5,atempo=0.5"
 */
export function buildAtempoChain(rate: number): string {
  const clamped = clampPlaybackRate(rate);
  if (Math.abs(clamped - 1) < 0.001) return '';

  const filters: string[] = [];
  let remaining = clamped;

  if (remaining > 1) {
    while (remaining > 1.001) {
      const factor = Math.min(remaining, 2.0);
      filters.push(`atempo=${factor}`);
      remaining /= factor;
    }
  } else {
    while (remaining < 0.999) {
      const factor = Math.max(remaining, 0.5);
      filters.push(`atempo=${factor}`);
      remaining /= factor;
    }
  }

  return filters.join(',');
}
