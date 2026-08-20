import React, { useRef, useCallback, useEffect } from 'react';

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
  minClipDuration = 0.1,
  playbackRate = 1,
  playheadTime,
  adjacentSnapPoints = [],
  onTrimUpdate,
  onTrimEnd,
}: UseClipTrimOptions) {
  const snapshotRef = useRef<TrimSnapshot | null>(null);
  const latestClientXRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  const onTrimUpdateRef = useRef(onTrimUpdate);
  const onTrimEndRef = useRef(onTrimEnd);

  useEffect(() => {
    onTrimUpdateRef.current = onTrimUpdate;
    onTrimEndRef.current = onTrimEnd;
  });

  const processTrimMove = useCallback(
    (clientX: number) => {
      if (!snapshotRef.current) return;

      const snap = snapshotRef.current;
      const deltaPx = clientX - snap.originalPointerX;
      const pps = Math.max(1, pixelsPerSecond);
      const deltaTime = deltaPx / pps;

      let newSourceStart = snap.originalSourceStart;
      let newTimelineStart = snap.originalTimelineStart;
      let newDuration = snap.originalDuration;
      const rate = snap.playbackRate || 1;
      let activeEdgeTime = newTimelineStart;

      if (snap.activeEdge === 'start') {
        // Left Handle: Trim clip start / in-point (anchored flush to timelineStart)
        const maxDeltaTime = snap.originalDuration - snap.minDuration;
        const minDeltaTimeFromSource = -snap.originalSourceStart / rate;
        const minDeltaTime = minDeltaTimeFromSource;

        let clampedDelta = Math.max(minDeltaTime, Math.min(deltaTime, maxDeltaTime));

        newSourceStart = Math.max(0, snap.originalSourceStart + clampedDelta * rate);
        newTimelineStart = snap.originalTimelineStart;
        newDuration = Math.max(snap.minDuration, snap.originalDuration - clampedDelta);
        activeEdgeTime = newTimelineStart;
      } else {
        // Right Handle: Trim clip end / out-point
        const minDeltaTime = -(snap.originalDuration - snap.minDuration);
        const maxDeltaTime =
          snap.maxSourceDuration !== Infinity
            ? Math.max(
                0,
                (snap.maxSourceDuration - (snap.originalSourceStart + snap.originalDuration * rate)) / rate
              )
            : Infinity;

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
        newTimelineStart = snap.originalTimelineStart;
        newSourceStart = snap.originalSourceStart;
        activeEdgeTime = snap.originalTimelineStart + newDuration;
      }

      onTrimUpdateRef.current(newTimelineStart, newSourceStart, newDuration, activeEdgeTime);
    },
    [pixelsPerSecond, playheadTime, adjacentSnapPoints]
  );

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

      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}

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
      latestClientXRef.current = e.clientX;
    },
    [minClipDuration, playbackRate]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!snapshotRef.current) return;
      e.stopPropagation();

      latestClientXRef.current = e.clientX;

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          processTrimMove(latestClientXRef.current);
        });
      }
    },
    [processTrimMove]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (snapshotRef.current) {
        e.stopPropagation();
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        processTrimMove(e.clientX);

        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {}
        snapshotRef.current = null;
        if (onTrimEndRef.current) {
          onTrimEndRef.current();
        }
      }
    },
    [processTrimMove]
  );

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
