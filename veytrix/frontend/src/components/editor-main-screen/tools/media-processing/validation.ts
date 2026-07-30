import { MediaSourceInput } from './processor.types';

export function validateMediaInput(input: MediaSourceInput | null | undefined): { valid: boolean; reason?: string } {
  if (!input) {
    return { valid: false, reason: 'Media input source is null or undefined.' };
  }
  if (!input.id) {
    return { valid: false, reason: 'Media input source missing unique ID.' };
  }
  if (!input.file && !input.url) {
    return { valid: false, reason: 'Media input source missing valid File blob or URL.' };
  }
  return { valid: true };
}

export function validateSpeedOptions(speed: number): { valid: boolean; clampedSpeed: number; reason?: string } {
  if (typeof speed !== 'number' || isNaN(speed) || speed <= 0) {
    return { valid: false, clampedSpeed: 1.0, reason: 'Speed multiplier must be a positive number.' };
  }
  const clampedSpeed = Math.min(4.0, Math.max(0.25, speed));
  return { valid: true, clampedSpeed };
}

export function validateTimeRange(
  startSec: number,
  endSec: number,
  totalDuration?: number
): { valid: boolean; reason?: string } {
  if (startSec < 0 || endSec <= startSec) {
    return { valid: false, reason: 'Start time must be non-negative and less than end time.' };
  }
  if (totalDuration && (startSec >= totalDuration || endSec > totalDuration + 0.1)) {
    return { valid: false, reason: 'Trim time range exceeds clip total duration.' };
  }
  return { valid: true };
}
