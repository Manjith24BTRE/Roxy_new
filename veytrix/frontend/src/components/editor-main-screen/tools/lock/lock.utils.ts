import { TimelineClipRef } from './lock.types';

export const LOCKED_EDIT_BLOCKED_MESSAGE = 'This clip is locked. Unlock it to make changes.';
export const NO_CLIP_AT_PLAYHEAD_MESSAGE = 'No clip found under the playhead.';

/**
 * Checks whether a given clip is locked, inspecting both clip properties and the lockedClips state dictionary.
 * Locks are strictly indexed by clip.id, never by mediaId or array index.
 */
export function isClipLocked(
  clip: TimelineClipRef | null | undefined,
  lockedMap?: Record<string, boolean>
): boolean {
  if (!clip || !clip.id) return false;
  if (clip.isLocked === true) return true;
  if (lockedMap && lockedMap[clip.id] === true) return true;
  return false;
}

/**
 * Resolves the clip under the playhead time based on professional NLE logic:
 * 1. Reads current playhead time.
 * 2. Finds all clips whose range [startTime, endTime] contains playhead position.
 * 3. Prefers currently selected clip if it is under the playhead.
 * 4. Otherwise locks the topmost visible clip at that timeline position.
 * 5. Returns null if the playhead is not inside any clip.
 */
export function findClipAtPlayhead<T extends TimelineClipRef>(
  clips: T[],
  playheadTime: number,
  selectedClipId?: string | null
): T | null {
  if (typeof playheadTime !== 'number' || isNaN(playheadTime)) return null;

  const clipsAtPlayhead = clips.filter((clip) => {
    const startTime = clip.timelineStart ?? clip.start ?? 0;
    const endTime = startTime + clip.duration;
    return playheadTime >= startTime && playheadTime <= endTime;
  });

  if (clipsAtPlayhead.length === 0) {
    return null;
  }

  // Rule 6: Prefer currently selected clip if it is under the playhead
  if (selectedClipId) {
    const selectedMatch = clipsAtPlayhead.find((c) => c.id === selectedClipId);
    if (selectedMatch) {
      return selectedMatch;
    }
  }

  // Topmost track priority: video > image > text > effect > audio
  const trackPriority: Record<string, number> = {
    video: 5,
    image: 5,
    text: 4,
    effect: 3,
    audio: 2,
    music: 1
  };

  clipsAtPlayhead.sort((a, b) => {
    const prioA = trackPriority[a.trackId || a.type || 'video'] || 0;
    const prioB = trackPriority[b.trackId || b.type || 'video'] || 0;
    return prioB - prioA;
  });

  return clipsAtPlayhead[0];
}

/**
 * Returns an array of clip IDs for all locked clips in the provided collection.
 */
export function getLockedClipIds<T extends TimelineClipRef>(
  clips: T[],
  lockedMap?: Record<string, boolean>
): string[] {
  return clips
    .filter((clip) => isClipLocked(clip, lockedMap))
    .map((clip) => clip.id);
}

/**
 * Filters and returns only editable (unlocked) clips from a list.
 */
export function filterEditableClips<T extends TimelineClipRef>(
  clips: T[],
  lockedMap?: Record<string, boolean>
): T[] {
  return clips.filter((clip) => !isClipLocked(clip, lockedMap));
}

/**
 * Synchronizes the locked state map from clip objects.
 */
export function syncLockedClipsMap<T extends TimelineClipRef>(
  clips: T[],
  currentMap: Record<string, boolean> = {}
): Record<string, boolean> {
  const nextMap: Record<string, boolean> = { ...currentMap };
  clips.forEach((clip) => {
    if (clip.isLocked !== undefined) {
      nextMap[clip.id] = clip.isLocked;
    }
  });
  return nextMap;
}
