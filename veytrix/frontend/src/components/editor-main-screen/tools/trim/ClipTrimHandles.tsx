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

  const handleKeyDown = (e: React.KeyboardEvent, edge: TrimEdge) => {
    const step = e.shiftKey ? 0.5 : 0.05;
    if (edge === 'start') {
      if (e.key === 'ArrowLeft') {
        const newStart = Math.max(0, timelineStart - step);
        const newSource = Math.max(0, sourceStart - step * playbackRate);
        const newDur = duration + step;
        onTrimUpdate(newStart, newSource, newDur, newStart);
      } else if (e.key === 'ArrowRight') {
        const newStart = timelineStart + step;
        const newSource = sourceStart + step * playbackRate;
        const newDur = Math.max(0.5, duration - step);
        onTrimUpdate(newStart, newSource, newDur, newStart);
      }
    } else {
      if (e.key === 'ArrowLeft') {
        const newDur = Math.max(0.5, duration - step);
        onTrimUpdate(timelineStart, sourceStart, newDur, timelineStart + newDur);
      } else if (e.key === 'ArrowRight') {
        const newDur = duration + step;
        onTrimUpdate(timelineStart, sourceStart, newDur, timelineStart + newDur);
      }
    }
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
        role="slider"
        aria-label="Trim Start Handle"
        aria-valuemin={0}
        aria-valuemax={timelineStart + duration - 0.5}
        aria-valuenow={timelineStart}
        tabIndex={0}
        onKeyDown={(e) => handleKeyDown(e, 'start')}
        onPointerDown={startPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute left-0 top-0 bottom-0 w-4 cursor-ew-resize z-30 flex items-center justify-center rounded-l touch-none transition-colors select-none ${
          activeEdge === 'start'
            ? 'bg-sky-400 shadow-[0_0_12px_#38bdf8]'
            : 'bg-sky-500/90 hover:bg-sky-400'
        }`}
      >
        <span className="text-[10px] text-slate-950 font-black font-mono">◀</span>

        {/* Floating Real-time HUD Tooltip over Left Handle */}
        {activeEdge === 'start' && (
          <div className="absolute -top-8 left-0 bg-slate-950/95 border border-sky-400 text-sky-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none -translate-x-2">
            IN: {formatTimecode(timelineStart)} ({duration.toFixed(2)}s)
          </div>
        )}
      </div>

      {/* Right (End Edge) Trim Handle */}
      <div
        role="slider"
        aria-label="Trim End Handle"
        aria-valuemin={timelineStart + 0.5}
        aria-valuemax={maxSourceDuration}
        aria-valuenow={timelineStart + duration}
        tabIndex={0}
        onKeyDown={(e) => handleKeyDown(e, 'end')}
        onPointerDown={endPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize z-30 flex items-center justify-center rounded-r touch-none transition-colors select-none ${
          activeEdge === 'end'
            ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b]'
            : 'bg-sky-500/90 hover:bg-sky-400'
        }`}
      >
        <span className="text-[10px] text-slate-950 font-black font-mono">▶</span>

        {/* Floating Real-time HUD Tooltip over Right Handle */}
        {activeEdge === 'end' && (
          <div className="absolute -top-8 right-0 bg-slate-950/95 border border-amber-400 text-amber-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none translate-x-2">
            OUT: {formatTimecode(timelineStart + duration)} ({duration.toFixed(2)}s)
          </div>
        )}
      </div>
    </>
  );
}
