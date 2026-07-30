import React from 'react';
import { 
  Scissors, Copy, Trash2, Key, CornerDownRight, 
  RotateCcw, VolumeX, Link2Off, Snowflake, Replace, Lock, Unlock, 
  ChevronRight, Clipboard, Edit3, Gauge
} from 'lucide-react';

export interface ClipActionsPanelProps {
  clip: {
    id: string;
    name: string;
    trackId?: string;
  } | null;
  isLocked?: boolean;
  isMuted?: boolean;
  hasClipboardPayload?: boolean;
  onAction: (actionId: string, clipId: string) => void;
}

export function ClipActionsPanel({
  clip,
  isLocked = false,
  isMuted = false,
  hasClipboardPayload = false,
  onAction
}: ClipActionsPanelProps) {
  if (!clip) {
    // When no clip is selected, keep only minimal toolbar-height empty area
    return <div className="flex-shrink-0 h-[68px] bg-background border-t border-border" />;
  }

  const isAudioEnabled = clip.trackId === 'video' || clip.trackId === 'audio';

  // Action order: Copy, Paste, Duplicate, Split, Trim, Speed, Transition, Keyframes, Reverse, Freeze, Mute, Detach, Replace, Rename, Lock/Unlock, Delete
  const toolbarItems = [
    { id: 'copy', label: 'Copy', icon: Clipboard, disabled: false, locked: isLocked },
    { id: 'paste', label: 'Paste', icon: Clipboard, disabled: !hasClipboardPayload, locked: isLocked },
    { id: 'duplicate', label: 'Duplicate', icon: Copy, disabled: false, locked: isLocked },
    { id: 'split', label: 'Split', icon: Scissors, disabled: false, locked: isLocked },
    { id: 'trim', label: 'Trim', icon: ChevronRight, disabled: false, locked: isLocked },
    { id: 'speed', label: 'Speed', icon: Gauge, disabled: false, locked: isLocked },
    { id: 'add-transition', label: 'Transition', icon: CornerDownRight, disabled: false, locked: isLocked },
    { id: 'reverse', label: 'Reverse', icon: RotateCcw, disabled: clip.trackId !== 'video', locked: isLocked },
    { id: 'freeze-frame', label: 'Freeze', icon: Snowflake, disabled: clip.trackId !== 'video', locked: isLocked },
    { id: 'keyframes', label: 'Keyframe', icon: Key, disabled: false, locked: isLocked },
    { id: 'mute-audio', label: isMuted ? 'Unmute' : 'Mute', icon: VolumeX, disabled: !isAudioEnabled, active: isMuted, locked: isLocked },
    { id: 'detach-audio', label: 'Detach', icon: Link2Off, disabled: clip.trackId !== 'video', locked: isLocked },
    { id: 'replace-media', label: 'Replace', icon: Replace, disabled: false, locked: isLocked },
    { id: 'rename', label: 'Rename', icon: Edit3, disabled: false, locked: isLocked },
    isLocked 
      ? { id: 'unlock', label: 'Unlock', icon: Unlock, disabled: false, active: true, locked: false }
      : { id: 'lock', label: 'Lock', icon: Lock, disabled: false, locked: false },
    { id: 'delete', label: 'Delete', icon: Trash2, disabled: false, danger: true, locked: isLocked }
  ];

  return (
    <div className="flex-shrink-0 h-[68px] bg-background border-t border-border w-full flex items-center clip-actions-toolbar relative">
      <div className="flex-1 h-full overflow-x-auto overflow-y-hidden clip-actions-scroll">
        <div className="flex items-center h-full px-4 gap-2 min-w-max">
          {toolbarItems.map((item) => {
            const Icon = item.icon;
            
            // Base styles
            let btnClass = "flex flex-col items-center justify-center gap-1.5 w-[56px] h-[52px] rounded-md transition-colors duration-150 flex-shrink-0 group ";
            let iconClass = "w-[18px] h-[18px] transition-colors duration-150 ";
            let labelClass = "text-[9px] font-medium leading-none tracking-wide ";
            
            if (item.disabled) {
              btnClass += "opacity-40 cursor-not-allowed text-muted-foreground";
              iconClass += "text-muted-foreground";
            } else if (item.locked) {
              btnClass += "opacity-60 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-300";
              iconClass += "text-amber-400/80 group-hover:text-amber-400";
            } else if (item.danger) {
              btnClass += "text-red-400 hover:bg-red-500/10";
              iconClass += "text-red-400 group-hover:text-red-300";
            } else if (item.active) {
              btnClass += "bg-primary/10 text-foreground";
              iconClass += "text-primary";
            } else {
              btnClass += "text-muted-foreground hover:text-foreground hover:bg-surface-hover";
              iconClass += "text-muted-foreground group-hover:text-primary";
            }

            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                onClick={() => onAction(item.id, clip.id)}
                title={item.locked ? 'Clip is locked' : item.label}
                className={btnClass}
              >
                <Icon className={iconClass} />
                <span className={labelClass}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Subtle fade edges for horizontal scrolling hint */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent" />

      <style>{`
        .clip-actions-scroll::-webkit-scrollbar {
          height: 0px;
          display: none;
        }
        .clip-actions-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  );
}
