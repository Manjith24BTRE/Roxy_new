import { ReversibleClip } from './reverse.types';

/**
 * Calculate the exact source media timestamp for a clip given relative local time.
 * Automatically accounts for playback speed and reverse flag.
 */
export function calculateReversedSourceTime(clip: ReversibleClip, relativeTime: number): number {
  const speed = clip.speed || 1;
  const startOffset = clip.startOffset || 0;
  const duration = clip.duration || 5;
  const totalMediaSpan = duration * speed;

  const clampedLocalTime = Math.max(0, Math.min(duration, relativeTime));

  if (clip.isReversed) {
    const endOffset = startOffset + totalMediaSpan;
    return Math.max(startOffset, endOffset - clampedLocalTime * speed);
  }

  return startOffset + clampedLocalTime * speed;
}

/**
 * Immutably toggle the isReversed flag on target clip.
 * Preserves all other clip properties (duration, trim, scale, rotation, keyframes, etc.).
 */
export function toggleClipReverseState<T extends ReversibleClip>(
  clips: T[],
  clipId: string
): { updatedClips: T[]; targetClip: T | null; nextIsReversed: boolean } {
  let targetClip: T | null = null;
  let nextIsReversed = false;

  const updatedClips = clips.map((c) => {
    if (c.id === clipId || c.mediaId === clipId) {
      nextIsReversed = !c.isReversed;
      targetClip = {
        ...c,
        isReversed: nextIsReversed,
      };
      return targetClip;
    }
    return c;
  });

  return { updatedClips, targetClip, nextIsReversed };
}
