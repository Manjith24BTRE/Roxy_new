import { DuplicateTimelineClipOptions, DuplicateEffectCheckResult } from './duplicate.types';

/**
 * Creates a duplicate of a target clip inside a sequence array (used by EditorMainScreen).
 * Inserts the copy right after the original clip index.
 */
export function duplicateClipInSequence<T extends { id: string; name: string }>(
  clips: T[],
  clipId: string
): { updatedClips: T[]; copy: T } | null {
  const clipIndex = clips.findIndex((c) => c.id === clipId);
  if (clipIndex === -1) return null;

  const clip = clips[clipIndex];
  const copy: T = {
    ...clip,
    id: `${clip.id}-dup-${Date.now()}`,
    name: `${clip.name} (Copy)`,
  };

  const updatedClips = [...clips];
  updatedClips.splice(clipIndex + 1, 0, copy);
  return { updatedClips, copy };
}

/**
 * Creates a duplicate of a Timeline clip (used by Timeline component).
 * Checks lock status and places duplicated clip right after original start + duration.
 */
export function duplicateTimelineClip<T extends { id: string; name: string; start: number; duration: number; trackId: string }>(
  clips: T[],
  clipId: string,
  options: DuplicateTimelineClipOptions = {}
): { updatedClips: T[]; newClip: T } | null {
  const { lockedTracks = {}, lockedClips = {}, showToast } = options;
  const clip = clips.find((c) => c.id === clipId);
  if (!clip) return null;

  if (lockedTracks[clip.trackId] || lockedClips[clip.id]) {
    if (lockedClips[clip.id] && showToast) {
      showToast('Cannot edit: Clip is locked!');
    }
    return null;
  }

  const newClip: T = {
    ...clip,
    id: `${clip.id}-dup-${Date.now()}`,
    name: `${clip.name} (Copy)`,
    start: clip.start + clip.duration,
  };

  const updatedClips = [...clips, newClip];
  return { updatedClips, newClip };
}

/**
 * Checks if an applied effect can be duplicated on a clip.
 */
export function checkDuplicateAppliedEffect(
  clip: { id: string; appliedEffects?: Array<{ id: string; name: string }> } | undefined | null,
  effectId: string
): DuplicateEffectCheckResult {
  if (clip && clip.appliedEffects) {
    const target = clip.appliedEffects.find((e) => e.id === effectId);
    if (target) {
      return {
        canDuplicate: false,
        message: `Cannot duplicate: "${target.name}" is already applied to this clip`,
      };
    }
  }
  return { canDuplicate: true };
}
