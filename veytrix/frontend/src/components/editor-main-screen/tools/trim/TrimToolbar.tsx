import React from 'react';
import { Check, X, RotateCcw, Sliders } from 'lucide-react';

export interface TrimToolbarProps {
  clipId?: string;
  clipName: string;
  timelineStart: number;
  duration: number;
  startOffset: number;
  maxSourceDuration?: number;
  playbackRate?: number;
  onTrimUpdate?: (
    clipId: string,
    newTimelineStart: number,
    newSourceStart: number,
    newDuration: number,
    activeEdgeTime?: number
  ) => void;
  onApply: () => void;
  onCancel: () => void;
  onReset: () => void;
}

function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export const TrimToolbar: React.FC<TrimToolbarProps> = ({
  clipName,
  timelineStart,
  duration,
  startOffset,
  onApply,
  onCancel,
  onReset,
}) => {
  const endTime = timelineStart + duration;

  return (
    <div className="h-10 bg-slate-950 border-b border-sky-500/30 px-4 flex items-center justify-between text-xs font-sans z-40 select-none shadow-lg">
      {/* Left Title & Status Badge */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-400/30 font-bold text-[11px]">
          <Sliders className="h-3.5 w-3.5" />
          <span>TRIM MODE</span>
        </div>
        <span className="font-mono text-slate-200 font-semibold truncate max-w-[240px]">
          {clipName}
        </span>
      </div>

      {/* Timecode Indicators */}
      <div className="flex items-center gap-4 font-mono text-[11px]">
        <div className="flex items-center gap-1 text-slate-300">
          <span className="text-muted-foreground text-[10px]">IN:</span>
          <span className="text-sky-300 font-bold">{formatTimecode(timelineStart)}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-300">
          <span className="text-muted-foreground text-[10px]">OUT:</span>
          <span className="text-amber-300 font-bold">{formatTimecode(endTime)}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-300">
          <span className="text-muted-foreground text-[10px]">DUR:</span>
          <span className="text-emerald-300 font-bold">{duration.toFixed(2)}s</span>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px] font-semibold cursor-pointer"
          title="Reset trim to full original clip length"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px] font-semibold cursor-pointer"
          title="Cancel trim changes (Esc)"
        >
          <X className="h-3.5 w-3.5" />
          <span>Cancel</span>
        </button>

        <button
          type="button"
          onClick={onApply}
          className="flex items-center gap-1 px-3 py-1 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition text-[11px] cursor-pointer shadow-md"
          title="Apply trim to clip (Enter)"
        >
          <Check className="h-3.5 w-3.5 stroke-[3]" />
          <span>Done Trim</span>
        </button>
      </div>
    </div>
  );
};
