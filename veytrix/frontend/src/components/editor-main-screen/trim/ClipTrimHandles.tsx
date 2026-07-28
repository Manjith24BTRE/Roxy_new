import React from 'react';
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
  onTrimStart?: (edge: TrimEdge) => void;
  onTrimUpdate: (newTimelineStart: number, newSourceStart: number, newDuration: number) => void;
  onTrimEnd?: () => void;
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
  onTrimStart,
  onTrimUpdate,
  onTrimEnd
}: ClipTrimHandlesProps) {
  const { handlePointerDown, handlePointerMove, handlePointerUp } = useClipTrim({
    pixelsPerSecond,
    playbackRate,
    onTrimUpdate,
    onTrimEnd
  });

  if (isLocked) {
    return null;
  }

  const startPointerDown = (e: React.PointerEvent) => {
    if (onTrimStart) onTrimStart('start');
    handlePointerDown(e, 'start', timelineStart, sourceStart, duration, maxSourceDuration);
  };

  const endPointerDown = (e: React.PointerEvent) => {
    if (onTrimStart) onTrimStart('end');
    handlePointerDown(e, 'end', timelineStart, sourceStart, duration, maxSourceDuration);
  };

  return (
    <>
      {/* Left Trim Handle */}
      <div
        onPointerDown={startPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute left-0 top-0 bottom-0 w-2.5 bg-sky-400 hover:bg-sky-300 cursor-ew-resize z-30 flex items-center justify-center rounded-l touch-none"
      >
        <span className="text-[7px] text-black font-bold">|</span>
      </div>

      {/* Right Trim Handle */}
      <div
        onPointerDown={endPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute right-0 top-0 bottom-0 w-2.5 bg-sky-400 hover:bg-sky-300 cursor-ew-resize z-30 flex items-center justify-center rounded-r touch-none"
      >
        <span className="text-[7px] text-black font-bold">|</span>
      </div>
    </>
  );
}
