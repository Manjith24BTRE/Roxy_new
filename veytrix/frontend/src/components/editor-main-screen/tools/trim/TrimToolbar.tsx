import React from 'react';
import { Check, X, RotateCcw, Sliders, Clock, Film } from 'lucide-react';

export interface TrimToolbarProps {
  clipName: string;
  timelineStart: number;
  duration: number;
  startOffset: number;
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
    <div className="bg-[#0b101d] border-b border-sky-500/30 px-4 py-2 flex items-center justify-between shadow-lg select-none text-slate-100 flex-shrink-0 z-40 animate-fade-in">
      {/* Left: Trim Mode Status Badge & Clip Name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[10px] font-mono font-bold tracking-wide uppercase">
          <Sliders className="h-3 w-3 stroke-[2.5]" />
          <span>TRIM MODE</span>
        </div>

        <div className="flex items-center gap-1.5 truncate">
          <Film className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-200 truncate max-w-[200px]">
            {clipName}
          </span>
        </div>
      </div>

      {/* Center: Frame-Accurate Timecode HUD */}
      <div className="flex items-center gap-4 bg-slate-950/70 border border-white/10 px-3.5 py-1 rounded-lg">
        {/* In Point (Start Time) */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-mono uppercase text-slate-400 tracking-wider">Start (In)</span>
          <span className="text-[10px] font-mono font-bold text-sky-400">
            {formatTimecode(timelineStart)}
          </span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Duration */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-mono uppercase text-slate-400 tracking-wider">Duration</span>
          <span className="text-[10px] font-mono font-bold text-emerald-400">
            {formatTimecode(duration)}
          </span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Out Point (End Time) */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-mono uppercase text-slate-400 tracking-wider">End (Out)</span>
          <span className="text-[10px] font-mono font-bold text-amber-400">
            {formatTimecode(endTime)}
          </span>
        </div>
      </div>

      {/* Right: User Controls (Apply, Cancel, Reset) */}
      <div className="flex items-center gap-2">
        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition"
          title="Reset clip to original source duration"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </button>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-red-400 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition"
          title="Discard changes (Esc)"
        >
          <X className="h-3.5 w-3.5" />
          <span>Cancel</span>
        </button>

        {/* Apply Button */}
        <button
          type="button"
          onClick={onApply}
          className="px-3 py-1 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition"
          title="Apply trim changes (Enter)"
        >
          <Check className="h-3.5 w-3.5 stroke-[3]" />
          <span>Apply</span>
        </button>
      </div>
    </div>
  );
};
