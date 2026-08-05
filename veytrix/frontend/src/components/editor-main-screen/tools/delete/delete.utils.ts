// src/components/editor-main-screen/tools/delete/delete.utils.ts

export function findNextSelectedClip(remainingClips: any[], playheadTime: number) {
  if (!remainingClips || remainingClips.length === 0) return null;

  const clipAtPlayhead = remainingClips.find((c) => {
    const start = c.timelineStart ?? c.start ?? 0;
    return playheadTime >= start && playheadTime <= start + c.duration;
  });

  return clipAtPlayhead || remainingClips[0] || null;
}

export function performRippleShift(remainingClips: any[], deletedClip: any) {
  const deletedStart = deletedClip.timelineStart ?? deletedClip.start ?? 0;
  const deletedDuration = deletedClip.duration ?? 0;
  const trackId = deletedClip.trackId;

  return remainingClips.map((c) => {
    const cStart = c.timelineStart ?? c.start ?? 0;
    if (c.trackId === trackId && cStart > deletedStart) {
      const newStart = Math.max(0, cStart - deletedDuration);
      return {
        ...c,
        start: newStart,
        timelineStart: newStart,
      };
    }
    return c;
  });
}
