import React, { useEffect, useRef } from 'react';
import { 
  Scissors, Copy, Trash2, Key, CornerDownRight, 
  RotateCcw, VolumeX, Link2Off, Snowflake, Replace, Lock, Unlock, 
  ChevronRight, Clipboard, Edit3, Gauge
} from 'lucide-react';
import { TimelineClip } from './Timeline';

interface TimelineContextMenuProps {
  x: number;
  y: number;
  clip: TimelineClip;
  isLocked: boolean;
  isMuted: boolean;
  onClose: () => void;
  onAction: (actionId: string, clipId: string) => void;
}

export function TimelineContextMenu({
  x,
  y,
  clip,
  isLocked,
  isMuted,
  onClose,
  onAction
}: TimelineContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const menuWidth = 220;
  const menuHeight = 440;

  const adjustedX = x + menuWidth > viewportWidth ? viewportWidth - menuWidth - 10 : x;
  const adjustedY = y + menuHeight > viewportHeight ? viewportHeight - menuHeight - 10 : y;

  const isAudioEnabled = clip.trackId === 'video' || clip.trackId === 'audio';

  const menuGroups = [
    {
      label: 'Edit Actions',
      items: [
        { id: 'copy', label: 'Copy Clip', icon: Clipboard, disabled: isLocked },
        { id: 'paste', label: 'Paste Attributes', icon: Clipboard, disabled: isLocked },
        { id: 'duplicate', label: 'Duplicate Clip', icon: Copy, disabled: isLocked },
        { id: 'rename', label: 'Rename Clip', icon: Edit3, disabled: isLocked },
        { id: 'replace-media', label: 'Replace Media', icon: Replace, disabled: isLocked },
        { id: 'delete', label: 'Delete Clip', icon: Trash2, disabled: isLocked, danger: true }
      ]
    },
    {
      label: 'Timeline & Overlay',
      items: [
        { id: 'split', label: 'Split Clip', icon: Scissors, disabled: isLocked },
        { id: 'trim', label: 'Trim Playback', icon: ChevronRight, disabled: isLocked },
        { id: 'add-transition', label: 'Add Transition', icon: CornerDownRight, disabled: isLocked },
        { id: 'keyframes', label: 'Keyframes Manager', icon: Key, disabled: isLocked || clip.trackId === 'audio' }
      ]
    },
    {
      label: 'Timing & Motion',
      items: [
        { id: 'speed', label: 'Clip Speed (0.25x-4x)', icon: Gauge, disabled: isLocked },
        { id: 'reverse', label: 'Reverse Video Playback', icon: RotateCcw, disabled: isLocked || clip.trackId !== 'video' },
        { id: 'freeze-frame', label: 'Freeze Frame Hold', icon: Snowflake, disabled: isLocked || clip.trackId !== 'video' }
      ]
    },
    {
      label: 'Audio Options',
      items: [
        { id: 'mute-audio', label: isMuted ? 'Unmute Audio' : 'Mute Audio Track', icon: VolumeX, disabled: isLocked || !isAudioEnabled },
        { id: 'detach-audio', label: 'Detach Audio Stream', icon: Link2Off, disabled: isLocked || clip.trackId !== 'video' }
      ]
    },
    {
      label: 'State Control',
      items: [
        { id: 'lock', label: 'Lock Clip Layout', icon: Lock, disabled: isLocked },
        { id: 'unlock', label: 'Unlock Clip Layout', icon: Unlock, disabled: !isLocked }
      ]
    }
  ];

  return (
    <div
      ref={menuRef}
      className="absolute w-56 rounded-xl border border-white/10 bg-[#0d111d]/95 backdrop-blur-xl shadow-2xl p-1.5 z-[100] text-slate-200 select-none animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col max-h-[380px] overflow-y-auto"
      style={{
        left: `${adjustedX}px`,
        top: `${adjustedY}px`
      }}
    >
      <div className="px-2.5 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
        Clip: {clip.name}
      </div>

      <div className="flex-1 space-y-1.5 py-1">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-0.5">
            {groupIdx > 0 && <div className="h-px bg-white/5 my-1" />}
            <span className="px-2.5 py-0.5 text-[8px] font-mono uppercase tracking-wider text-slate-600 block">
              {group.label}
            </span>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    onAction(item.id, clip.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left rounded-md transition text-xs cursor-pointer ${
                    item.disabled
                      ? 'opacity-30 cursor-not-allowed text-slate-500'
                      : item.danger
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${item.disabled ? 'text-slate-600' : item.danger ? 'text-red-400' : 'text-slate-400 group-hover:text-white'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'lock' && isLocked && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 rounded">Locked</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
