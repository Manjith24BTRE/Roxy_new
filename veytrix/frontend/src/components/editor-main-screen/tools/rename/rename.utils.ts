import { validateClipName } from './validation';

/**
 * Sanitize input clip name string.
 */
export function sanitizeClipName(name: string): string {
  const result = validateClipName(name);
  return result.sanitizedName;
}

/**
 * Immutably update the target clip's display name inside a clip list.
 * Preserves all other clip properties (id, mediaId, timelineStart, duration, keyframes, effects, etc.).
 */
export function applyClipRename<T extends { id: string; name: string }>(
  clips: T[],
  clipId: string,
  newName: string
): { updatedClips: T[]; targetClip: T | null } {
  const sanitized = sanitizeClipName(newName);
  let targetClip: T | null = null;

  const updatedClips = clips.map((c) => {
    if (c.id === clipId || (c as any).mediaId === clipId) {
      targetClip = { ...c, name: sanitized };
      return targetClip;
    }
    return c;
  });

  return { updatedClips, targetClip };
}
