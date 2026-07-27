// speedUtils.ts
// Purpose: Helper mathematical and formatting utilities for speed calculations.

import { MIN_SPEED, MAX_SPEED, DEFAULT_SPEED } from './speedConstants';

/**
 * Clamp speed value between min (0.25) and max (8.0)
 */
export function clampSpeed(speed: number): number {
  if (isNaN(speed) || speed <= 0) return DEFAULT_SPEED;
  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, Math.round(speed * 100) / 100));
}

/**
 * Format speed number as display string e.g. 1.25x or 1x
 */
export function formatSpeed(speed: number): string {
  const clamped = clampSpeed(speed);
  if (clamped % 1 === 0) {
    return `${clamped}x`;
  }
  return `${clamped.toFixed(2).replace(/\.00$/, '')}x`;
}

/**
 * Calculate effective duration based on base duration and speed.
 * Example: 10s clip at 0.5x = 20s. 10s clip at 2x = 5s.
 */
export function calculateEffectiveDuration(baseDuration: number, speed: number): number {
  const safeSpeed = clampSpeed(speed);
  if (baseDuration <= 0) return 0;
  return Math.round((baseDuration / safeSpeed) * 100) / 100;
}

/**
 * Calculate base duration given effective duration and speed.
 */
export function calculateBaseDuration(effectiveDuration: number, speed: number): number {
  const safeSpeed = clampSpeed(speed);
  return effectiveDuration * safeSpeed;
}

/**
 * Calculate playback rate for HTML5 video element.
 */
export function getPlaybackRate(speed: number): number {
  return clampSpeed(speed);
}

/**
 * Format seconds into mm:ss.ms string
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00:00.0';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
}
