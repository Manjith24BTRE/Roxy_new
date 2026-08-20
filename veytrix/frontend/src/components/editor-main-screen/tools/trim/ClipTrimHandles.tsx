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
        <div className="absolute inset-0 border-2 border-sky-400 pointer-events-none rounded-sm z-20 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
      )}

      {/* Left (Start Edge) Trim Handle */}
      <div
        role="slider"
        aria-label="Trim Start Handle"
        aria-valuemin={0}
        aria-valuemax={timelineStart + duration - 0.1}
        aria-valuenow={timelineStart}
        tabIndex={0}
        onKeyDown={(e) => handleKeyDown(e, 'start')}
        onPointerDown={startPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute left-0 top-0 bottom-0 w-2.5 cursor-ew-resize z-30 flex items-center justify-center rounded-l-sm touch-none transition-colors select-none ${
          activeEdge === 'start'
            ? 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]'
            : 'bg-sky-500/90 hover:bg-sky-400 border-r border-sky-600/50'
        }`}
      >
        {/* Subtle Vertical Grip Indicator Line */}
        <div className="w-[2px] h-3.5 bg-slate-950/80 rounded-full" />

        {/* Floating Real-time HUD Tooltip over Left Handle */}
        {activeEdge === 'start' && (
          <div className="absolute -top-7 left-0 bg-slate-950/95 border border-sky-400 text-sky-300 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none -translate-x-1">
            IN: {formatTimecode(timelineStart)} ({duration.toFixed(2)}s)
          </div>
        )}
      </div>

      {/* Right (End Edge) Trim Handle */}
      <div
        role="slider"
        aria-label="Trim End Handle"
        aria-valuemin={timelineStart + 0.1}
        aria-valuemax={maxSourceDuration}
        aria-valuenow={timelineStart + duration}
        tabIndex={0}
        onKeyDown={(e) => handleKeyDown(e, 'end')}
        onPointerDown={endPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize z-30 flex items-center justify-center rounded-r-sm touch-none transition-colors select-none ${
          activeEdge === 'end'
            ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
            : 'bg-sky-500/90 hover:bg-sky-400 border-l border-sky-600/50'
        }`}
      >
        {/* Subtle Vertical Grip Indicator Line */}
        <div className="w-[2px] h-3.5 bg-slate-950/80 rounded-full" />

        {/* Floating Real-time HUD Tooltip over Right Handle */}
        {activeEdge === 'end' && (
          <div className="absolute -top-7 right-0 bg-slate-950/95 border border-amber-400 text-amber-300 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none translate-x-1">
            OUT: {formatTimecode(timelineStart + duration)} ({duration.toFixed(2)}s)
          </div>
        )}
      </div>
    </>
  );
}
