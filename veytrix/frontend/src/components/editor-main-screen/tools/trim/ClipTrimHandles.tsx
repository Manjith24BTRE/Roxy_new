import React, { useState } from 'react';
import { useClipTrim, TrimEdge } from './useClipTrim';

export interface ClipTrimHandlesProps {
  clipId: string;
  timelineStart: number;
  sourceStart: number;
  duration: number;
  maxSourceDuration?: number;
  pixelsPerSecond: number;
  playbackRate?: number;
  isLocked?: boolean;
  playheadTime?: number;
  adjacentSnapPoints?: number[];
  onTrimStart?: (edge: TrimEdge) => void;
  onTrimUpdate: (
    newTimelineStart: number,
    newSourceStart: number,
    newDuration: number,
    activeEdgeTime?: number
  ) => void;
  onTrimEnd?: () => void;
}

function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export function ClipTrimHandles({
  clipId,
  timelineStart,
  sourceStart,
  duration,
  maxSourceDuration = Infinity,
  pixelsPerSecond,
  playbackRate = 1,
  isLocked = false,
  playheadTime,
  adjacentSnapPoints = [],
  onTrimStart,
  onTrimUpdate,
  onTrimEnd,
}: ClipTrimHandlesProps) {
  const [activeEdge, setActiveEdge] = useState<TrimEdge | null>(null);

  const { handlePointerDown, handlePointerMove, handlePointerUp } = useClipTrim({
    pixelsPerSecond,
    playbackRate,
    playheadTime,
    adjacentSnapPoints,
    onTrimUpdate: (newStart, newSourceStart, newDur, activeEdgeTime) => {
      onTrimUpdate(newStart, newSourceStart, newDur, activeEdgeTime);
    },
    onTrimEnd: () => {
      setActiveEdge(null);
      if (onTrimEnd) onTrimEnd();
    },
  });

  if (isLocked) {
    return null;
  }

  const startPointerDown = (e: React.PointerEvent) => {
    setActiveEdge('start');
    if (onTrimStart) onTrimStart('start');
    handlePointerDown(e, 'start', timelineStart, sourceStart, duration, maxSourceDuration);
  };

  const endPointerDown = (e: React.PointerEvent) => {
    setActiveEdge('end');
    if (onTrimStart) onTrimStart('end');
    handlePointerDown(e, 'end', timelineStart, sourceStart, duration, maxSourceDuration);
  };

  const isTrimming = activeEdge !== null;

  return (
    <>
      {/* Trimming Active Outline Glow */}
      {isTrimming && (
        <div className="absolute inset-0 border-2 border-sky-400 pointer-events-none rounded z-20 shadow-[0_0_12px_rgba(56,189,248,0.6)] animate-pulse" />
      )}

      {/* Left (Start Edge) Trim Handle */}
      <div
        onPointerDown={startPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute left-0 top-0 bottom-0 w-3.5 cursor-ew-resize z-30 flex items-center justify-center rounded-l touch-none transition-colors ${
          activeEdge === 'start'
            ? 'bg-sky-400 shadow-[0_0_12px_#38bdf8]'
            : 'bg-sky-500/90 hover:bg-sky-400'
        }`}
      >
        <span className="text-[9px] text-slate-950 font-black select-none font-mono">║</span>

        {/* Floating Real-time HUD Tooltip over Left Handle */}
        {activeEdge === 'start' && (
          <div className="absolute -top-8 left-0 bg-slate-950/95 border border-sky-400 text-sky-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none -translate-x-2">
            IN: {formatTimecode(timelineStart)}
          </div>
        )}
      </div>

      {/* Right (End Edge) Trim Handle */}
      <div
        onPointerDown={endPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute right-0 top-0 bottom-0 w-3.5 cursor-ew-resize z-30 flex items-center justify-center rounded-r touch-none transition-colors ${
          activeEdge === 'end'
            ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b]'
            : 'bg-sky-500/90 hover:bg-sky-400'
        }`}
      >
        <span className="text-[9px] text-slate-950 font-black select-none font-mono">║</span>

        {/* Floating Real-time HUD Tooltip over Right Handle */}
        {activeEdge === 'end' && (
          <div className="absolute -top-8 right-0 bg-slate-950/95 border border-amber-400 text-amber-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none translate-x-2">
            OUT: {formatTimecode(timelineStart + duration)}
          </div>
        )}
      </div>
    </>
  );
}
