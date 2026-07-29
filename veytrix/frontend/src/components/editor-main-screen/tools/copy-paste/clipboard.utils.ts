import { ClipboardClipItem, PasteOptions } from './clipboard.types';
import { isPositionOccupied } from './clipboard.validation';

/**
 * Generate a unique ID with random entropy and timestamp.
 */
export function generateUniqueId(prefix: string = 'obj'): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${timestamp}-${randomStr}`;
}

/**
 * Check whether the active DOM element is an editable text container.
 */
export function isTextInputFocused(): boolean {
  if (typeof document === 'undefined') return false;
  const active = document.activeElement;
  if (!active) return false;
  const tagName = active.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea') return true;
  if ((active as HTMLElement).isContentEditable) return true;
  return false;
}

/**
 * Deep clone clip while generating fresh unique IDs for clip, keyframes, effects, animations, transitions, and linked media references.
 */
export function deepCloneClipWithNewIDs(
  clip: ClipboardClipItem,
  idRemapMap: Map<string, string> = new Map()
): ClipboardClipItem {
  const oldId = clip.id;
  const newId = generateUniqueId(oldId ? oldId.split('-')[0] : 'clip');
  idRemapMap.set(oldId, newId);

  // Helper for deep cloning nested properties
  const cloneDeep = (val: any): any => {
    if (val === null || typeof val !== 'object') return val;
    if (Array.isArray(val)) return val.map(cloneDeep);
    const result: Record<string, any> = {};
    for (const key of Object.keys(val)) {
      result[key] = cloneDeep(val[key]);
    }
    return result;
  };

  const cloned = cloneDeep(clip) as ClipboardClipItem;

  // Assign new main clip ID
  cloned.id = newId;
  cloned.name = cloned.name.endsWith('(Copy)') ? cloned.name : `${cloned.name} (Copy)`;

  // Regenerate appliedEffects IDs
  if (Array.isArray(cloned.appliedEffects)) {
    cloned.appliedEffects = cloned.appliedEffects.map((eff) => ({
      ...eff,
      id: generateUniqueId('effect'),
    }));
  }

  // Regenerate filters IDs
  if (Array.isArray(cloned.filters)) {
    cloned.filters = cloned.filters.map((flt) => ({
      ...flt,
      id: generateUniqueId('filter'),
    }));
  }

  // Regenerate keyframes IDs
  if (Array.isArray(cloned.keyframes)) {
    cloned.keyframes = cloned.keyframes.map((kf) => ({
      ...kf,
      id: generateUniqueId('kf'),
    }));
  }

  // Regenerate animations IDs
  if (Array.isArray(cloned.animations)) {
    cloned.animations = cloned.animations.map((anim) => ({
      ...anim,
      id: generateUniqueId('anim'),
    }));
  }

  // Regenerate transitions IDs
  if (Array.isArray(cloned.transitions)) {
    cloned.transitions = cloned.transitions.map((tr) => ({
      ...tr,
      id: generateUniqueId('tr'),
    }));
  }

  // Remap linked clip reference if mapped
  if (cloned.linkedClipId && idRemapMap.has(cloned.linkedClipId)) {
    cloned.linkedClipId = idRemapMap.get(cloned.linkedClipId);
  }

  return cloned;
}

/**
 * Calculate optimal start placement on track based on priority:
 * 1. Playhead position (if no collision)
 * 2. Position after selected clip
 * 3. End of track
 */
export function calculatePlacementTime(
  existingClips: any[],
  duration: number,
  trackId: string,
  options: PasteOptions = {}
): number {
  const { currentTime, selectedClipId } = options;

  // Priority 1: Playhead position if available and un-occupied
  if (typeof currentTime === 'number' && currentTime >= 0) {
    if (!isPositionOccupied(existingClips, currentTime, duration, trackId)) {
      return currentTime;
    }
  }

  // Priority 2: Immediately after selected clip
  if (selectedClipId) {
    const selected = existingClips.find((c) => c.id === selectedClipId || c.mediaId === selectedClipId);
    if (selected && typeof selected.start === 'number' && typeof selected.duration === 'number') {
      const targetStart = selected.start + selected.duration;
      if (!isPositionOccupied(existingClips, targetStart, duration, trackId)) {
        return targetStart;
      }
    }
  }

  // Priority 3: End of track
  const trackClips = existingClips.filter((c) => (c.trackId || 'video') === trackId);
  if (trackClips.length > 0) {
    const maxEnd = Math.max(...trackClips.map((c) => (c.start || 0) + (c.duration || 0)));
    return maxEnd;
  }

  return 0;
}
