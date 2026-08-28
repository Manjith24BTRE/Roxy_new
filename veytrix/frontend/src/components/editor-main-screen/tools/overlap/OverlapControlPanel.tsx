import React from 'react';
import { 
  X, Layers, Sliders, Volume2, VolumeX, Sparkles, MoveLeft, 
  MoveRight, MoveUp, MoveDown, Eye, RefreshCw, Trash2 
} from 'lucide-react';
import { OverlapData, OverlapTransitionType, OverlapAudioMode } from './overlap.types';

export interface OverlapControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  overlap: OverlapData | null;
  clipAName?: string;
  clipBName?: string;
  onUpdateOverlap: (overlapId: string, updates: Partial<OverlapData>) => void;
  onRemoveOverlap: (overlapId: string) => void;
}

const TRANSITION_PRESETS: { type: OverlapTransitionType; label: string; icon: string }[] = [
  { type: 'crossfade', label: 'Cross Dissolve', icon: '🔀' },
  { type: 'fade', label: 'Fade', icon: '🌫️' },
  { type: 'fade-black', label: 'Fade Black', icon: '⬛' },
  { type: 'fade-white', label: 'Fade White', icon: '⬜' },
  { type: 'blur', label: 'Blur', icon: '💧' },
  { type: 'zoom', label: 'Zoom Scale', icon: '🔍' },
  { type: 'slide-left', label: 'Slide Left', icon: '⬅️' },
  { type: 'slide-right', label: 'Slide Right', icon: '➡️' },
  { type: 'slide-up', label: 'Slide Up', icon: '⬆️' },
  { type: 'slide-down', label: 'Slide Down', icon: '⬇️' },
  { type: 'none', label: 'None (Hard Cut)', icon: '✂️' },
];

const AUDIO_MODES: { mode: OverlapAudioMode; label: string; description: string }[] = [
  { mode: 'crossfade', label: 'Equal Power Crossfade', description: 'Smooth audio transition between clips' },
  { mode: 'keep-both', label: 'Keep Both Original Volumes', description: 'Play both audio tracks at 100%' },
  { mode: 'mute-outgoing', label: 'Mute Outgoing Clip', description: 'Silence the first clip during overlap' },
  { mode: 'mute-incoming', label: 'Mute Incoming Clip', description: 'Silence the second clip during overlap' },
];

export function OverlapControlPanel({
  isOpen,
  onClose,
  overlap,
  clipAName = 'Clip A',
  clipBName = 'Clip B',
  onUpdateOverlap,
  onRemoveOverlap,
}: OverlapControlPanelProps) {
  if (!isOpen || !overlap) return null;

  const currentType = overlap.transition?.type || 'crossfade';
  const currentAudioMode = overlap.audioMode || 'crossfade';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-[#0F131C] border-l border-[#1E2538] shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2538] bg-[#141A26]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Layers size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">Clip Overlap & Transition</h3>
            <p className="text-[10px] text-slate-400">Duration: {overlap.overlapDuration.toFixed(2)}s</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Clip Pair Indicator */}
        <div className="bg-[#151B29] p-3 rounded-xl border border-[#222C42] space-y-1.5">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Overlapping Clips</div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-sky-400 truncate max-w-[110px]" title={clipAName}>{clipAName}</span>
            <span className="text-slate-500 text-[10px]">➜</span>
            <span className="text-emerald-400 truncate max-w-[110px]" title={clipBName}>{clipBName}</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-white/5 flex justify-between">
            <span>Start: {overlap.overlapStart.toFixed(2)}s</span>
            <span>End: {overlap.overlapEnd.toFixed(2)}s</span>
          </div>
        </div>

        {/* Transition Presets Selector */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Sparkles size={13} className="text-sky-400" />
            Transition Effect
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TRANSITION_PRESETS.map((preset) => {
              const isSelected = currentType === preset.type;
              return (
                <button
                  key={preset.type}
                  type="button"
                  onClick={() =>
                    onUpdateOverlap(overlap.id, {
                      transition: { ...overlap.transition, type: preset.type },
                    })
                  }
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition text-left ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-500 text-white shadow-md shadow-sky-500/10'
                      : 'bg-[#151B29] border-[#222C42] text-slate-400 hover:border-slate-600 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{preset.icon}</span>
                  <span className="truncate text-[11px] font-semibold">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio Behavior Mode */}
        <div className="space-y-2.5 pt-2 border-t border-[#1E2538]">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Volume2 size={13} className="text-emerald-400" />
            Audio Crossfade Mode
          </label>
          <div className="space-y-2">
            {AUDIO_MODES.map((item) => {
              const isSelected = currentAudioMode === item.mode;
              return (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => onUpdateOverlap(overlap.id, { audioMode: item.mode })}
                  className={`w-full p-2.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-white'
                      : 'bg-[#151B29] border-[#222C42] text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-200">{item.label}</div>
                  <div className="text-[9.5px] text-slate-400 mt-0.5">{item.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Remove Overlap Action */}
      <div className="p-4 border-t border-[#1E2538] bg-[#141A26] flex items-center justify-between">
        <button
          type="button"
          onClick={() => onRemoveOverlap(overlap.id)}
          className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition"
        >
          <Trash2 size={13} />
          Remove Overlap
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}
