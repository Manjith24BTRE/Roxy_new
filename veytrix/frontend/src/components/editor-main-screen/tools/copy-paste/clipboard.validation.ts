import { ClipboardClipItem, ClipboardPayload } from './clipboard.types';

/**
 * Validate clipboard payload structure and contents.
 */
export function validateClipboardPayload(data: any): { isValid: boolean; payload: ClipboardPayload | null; reason?: string } {
  if (!data) {
    return { isValid: false, payload: null, reason: 'Clipboard is empty' };
  }

  let clips: ClipboardClipItem[] = [];

  if (Array.isArray(data)) {
    clips = data;
  } else if (typeof data === 'object') {
    if (Array.isArray(data.clips)) {
      clips = data.clips;
    } else if (data.id && typeof data.duration === 'number') {
      clips = [data];
    }
  }

  if (clips.length === 0) {
    return { isValid: false, payload: null, reason: 'No valid clip objects found in clipboard' };
  }

  const validClips = clips.filter(
    (c) => c && typeof c === 'object' && typeof c.duration === 'number' && c.duration > 0
  );

  if (validClips.length === 0) {
    return { isValid: false, payload: null, reason: 'Clip data missing valid duration or properties' };
  }

  return {
    isValid: true,
    payload: {
      clips: validClips,
      copiedAt: data.copiedAt || Date.now(),
    },
  };
}

/**
 * Safely check for circular references in an object before cloning or pasting.
 */
export function detectCircularReferences(obj: any, seen = new WeakSet()): boolean {
  if (obj && typeof obj === 'object') {
    if (seen.has(obj)) return true;
    seen.add(obj);
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (detectCircularReferences(obj[key], seen)) return true;
      }
    }
  }
  return false;
}

/**
 * Check if a time interval [start, start + duration] on a specific track collides with existing clips.
 */
export function isPositionOccupied(
  clips: any[],
  start: number,
  duration: number,
  trackId: string
): boolean {
  const end = start + duration;
  return clips.some((c) => {
    if ((c.trackId || 'video') !== trackId) return false;
    const cStart = c.start || 0;
    const cEnd = cStart + (c.duration || 0);
    return Math.max(start, cStart) < Math.min(end, cEnd);
  });
}
