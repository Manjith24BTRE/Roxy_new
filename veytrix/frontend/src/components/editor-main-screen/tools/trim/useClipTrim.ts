import React, { useRef, useCallback } from 'react';

export type TrimEdge = 'start' | 'end';

interface TrimSnapshot {
  activeEdge: TrimEdge;
  originalPointerX: number;
  originalSourceStart: number;
  originalTimelineStart: number;
  originalDuration: number;
  minDuration: number;
  maxSourceDuration: number;
  playbackRate: number;
}

export interface UseClipTrimOptions {
  pixelsPerSecond: number;
  minClipDuration?: number;
  playbackRate?: number;
  playheadTime?: number;
  adjacentSnapPoints?: number[];
  onTrimUpdate: (
    newTimelineStart: number,
    newSourceStart: number,
    newDuration: number,
    activeEdgeTime?: number
  ) => void;
  onTrimEnd?: () => void;
}

export function useClipTrim({
  pixelsPerSecond,
  minClipDuration = 0.5,
  playbackRate = 1,
  playheadTime,
  adjacentSnapPoints = [],
  onTrimUpdate,
  onTrimEnd,
}: UseClipTrimOptions) {
  const snapshotRef = useRef<TrimSnapshot | null>(null);

  const handlePointerDown = useCallback(
    (
      e: React.PointerEvent,
      edge: TrimEdge,
      currentTimelineStart: number,
      currentSourceStart: number,
      currentDuration: number,
      maxSourceDuration: number = Infinity
    ) => {
      e.preventDefault();
      e.stopPropagation();

      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      snapshotRef.current = {
        activeEdge: edge,
        originalPointerX: e.clientX,
        originalSourceStart: currentSourceStart,
        originalTimelineStart: currentTimelineStart,
        originalDuration: currentDuration,
        minDuration: minClipDuration,
        maxSourceDuration,
        playbackRate,
      };
    },
    [minClipDuration, playbackRate]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!snapshotRef.current) return;
      e.stopPropagation();

      const snap = snapshotRef.current;
      const deltaPx = e.clientX - snap.originalPointerX;
      const deltaTime = deltaPx / Math.max(1, pixelsPerSecond);

      let newSourceStart = snap.originalSourceStart;
      let newTimelineStart = snap.originalTimelineStart;
      let newDuration = snap.originalDuration;

      const rate = snap.playbackRate;
      let activeEdgeTime = newTimelineStart;

      if (snap.activeEdge === 'start') {
        // Left Handle: Trim clip start
        const maxDeltaTime = snap.originalDuration - snap.minDuration;
        const minDeltaTime = -snap.originalSourceStart / rate;

        let clampedDelta = Math.max(minDeltaTime, Math.min(deltaTime, maxDeltaTime));
        let candidateTimelineStart = snap.originalTimelineStart + clampedDelta;

        // Snap check
        const snapThreshold = 0.12;
        const allSnapTargets = [
          ...(playheadTime !== undefined ? [playheadTime] : []),
          ...adjacentSnapPoints,
        ];

        for (const snapTarget of allSnapTargets) {
          if (Math.abs(candidateTimelineStart - snapTarget) <= snapThreshold) {
            candidateTimelineStart = snapTarget;
            clampedDelta = candidateTimelineStart - snap.originalTimelineStart;
            clampedDelta = Math.max(minDeltaTime, Math.min(clampedDelta, maxDeltaTime));
            break;
          }
        }

        newSourceStart = Math.max(0, snap.originalSourceStart + clampedDelta * rate);
        newTimelineStart = snap.originalTimelineStart + clampedDelta;
        newDuration = Math.max(snap.minDuration, snap.originalDuration - clampedDelta);
        activeEdgeTime = newTimelineStart;
      } else {
        // Right Handle: Trim clip end
        const minDeltaTime = -(snap.originalDuration - snap.minDuration);
        const maxDeltaTime =
          (snap.maxSourceDuration - (snap.originalSourceStart + snap.originalDuration * rate)) /
          rate;

        let clampedDelta = Math.max(minDeltaTime, Math.min(deltaTime, maxDeltaTime));
        let candidateEndTime = snap.originalTimelineStart + snap.originalDuration + clampedDelta;

        // Snap check
        const snapThreshold = 0.12;
        const allSnapTargets = [
          ...(playheadTime !== undefined ? [playheadTime] : []),
          ...adjacentSnapPoints,
        ];

        for (const snapTarget of allSnapTargets) {
          if (Math.abs(candidateEndTime - snapTarget) <= snapThreshold) {
            candidateEndTime = snapTarget;
            clampedDelta = candidateEndTime - (snap.originalTimelineStart + snap.originalDuration);
            clampedDelta = Math.max(minDeltaTime, Math.min(clampedDelta, maxDeltaTime));
            break;
          }
        }

        newDuration = Math.max(snap.minDuration, snap.originalDuration + clampedDelta);
        activeEdgeTime = snap.originalTimelineStart + newDuration;
      }

      onTrimUpdate(newTimelineStart, newSourceStart, newDuration, activeEdgeTime);
    },
    [pixelsPerSecond, playheadTime, adjacentSnapPoints, onTrimUpdate]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (snapshotRef.current) {
        e.stopPropagation();
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {}
        snapshotRef.current = null;
        if (onTrimEnd) {
          onTrimEnd();
        }
      }
    },
    [onTrimEnd]
  );

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
