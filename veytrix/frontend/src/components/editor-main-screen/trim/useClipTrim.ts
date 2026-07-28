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
  onTrimUpdate: (newTimelineStart: number, newSourceStart: number, newDuration: number) => void;
  onTrimEnd?: () => void;
}

/**
 * Robust pointer-based timeline trimming hook.
 * Avoids cumulative drift by snapshotting state on pointer down.
 * Supports speed-aware delta trimming.
 */
export function useClipTrim({
  pixelsPerSecond,
  minClipDuration = 0.5,
  playbackRate = 1,
  onTrimUpdate,
  onTrimEnd
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
        playbackRate
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
      const deltaTime = deltaPx / pixelsPerSecond; // timeline delta

      let newSourceStart = snap.originalSourceStart;
      let newTimelineStart = snap.originalTimelineStart;
      let newDuration = snap.originalDuration;

      const rate = snap.playbackRate;

      if (snap.activeEdge === 'start') {
        // Dragging right -> positive delta -> cuts start
        const maxDeltaTime = snap.originalDuration - snap.minDuration;
        const minDeltaTime = -snap.originalSourceStart / rate;
        
        const clampedDelta = Math.max(minDeltaTime, Math.min(deltaTime, maxDeltaTime));
        
        newSourceStart = snap.originalSourceStart + clampedDelta * rate;
        newTimelineStart = snap.originalTimelineStart + clampedDelta;
        newDuration = snap.originalDuration - clampedDelta;
      } else {
        // Dragging left -> negative delta -> cuts end
        const minDeltaTime = -(snap.originalDuration - snap.minDuration);
        const maxDeltaTime = (snap.maxSourceDuration - (snap.originalSourceStart + snap.originalDuration * rate)) / rate;
        
        const clampedDelta = Math.max(minDeltaTime, Math.min(deltaTime, maxDeltaTime));
        
        newDuration = snap.originalDuration + clampedDelta;
        // newTimelineStart and newSourceStart stay unchanged
      }

      onTrimUpdate(newTimelineStart, newSourceStart, newDuration);
    },
    [pixelsPerSecond, onTrimUpdate]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (snapshotRef.current) {
        e.stopPropagation();
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
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
    handlePointerUp
  };
}
