import React, { useState } from 'react';
import { 
  Play, Pause, Scissors, Copy, Trash2, Plus, RotateCcw, ZoomIn, 
  ZoomOut, Lock, Unlock, Eye, EyeOff, Volume2, VolumeX, Bookmark 
} from 'lucide-react';
import { ClipActionsPanel } from '../../clip-actions/ClipActionsPanel';
import { ClipTrimHandles } from '../../trim/ClipTrimHandles';
import { useDuplicate } from '../../tools/duplicate';
import { useRename, RenameDialog } from '../../tools/rename';
import { useReverse } from '../../tools/reverse';
import { useDetach } from '../../tools/detach';
import { useLock } from '../../tools/lock';
import { useFreeze } from '../../tools/freeze';

export interface TimelineClip {
  id: string;
  name: string;
  start: number; // in seconds
  duration: number; // in seconds
  trackId: 'video' | 'audio' | 'text' | 'effect';
  color: string;
  isLocked?: boolean;
  [key: string]: any;
}

export interface Marker {
  id: string;
  time: number;
  label: string;
}

interface TimelineProps {
  currentTime: number;
  onTimeChange: (time: number) => void;
}

export function Timeline({ currentTime, onTimeChange }: TimelineProps) {
  const [zoom, setZoom] = useState(100);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  
  // Track status states
  const [lockedTracks, setLockedTracks] = useState<Record<string, boolean>>({ video: false, audio: false, text: false, effect: false });
  const [hiddenTracks, setHiddenTracks] = useState<Record<string, boolean>>({ video: false, audio: false, text: false, effect: false });
  const [mutedTracks, setMutedTracks] = useState<Record<string, boolean>>({ video: false, audio: false, text: false, effect: false });

  // Individual Clip states (Context Menu targets)
  const [lockedClips, setLockedClips] = useState<Record<string, boolean>>({});
  const [mutedClips, setMutedClips] = useState<Record<string, boolean>>({});

  const [toast, setToast] = useState<string | null>(null);

  // Timeline Clips
  const [clips, setClips] = useState<TimelineClip[]>([
    { id: 'v1', name: 'Intro Clip.mp4', start: 0, duration: 8, trackId: 'video', color: 'bg-primary/25 border-sky-400/50 text-sky-300' },
    { id: 'v2', name: 'A-Roll Interview.mp4', start: 8, duration: 15, trackId: 'video', color: 'bg-primary/25 border-sky-400/50 text-sky-300' },
    { id: 'v3', name: 'Outro B-Roll.mp4', start: 23, duration: 7, trackId: 'video', color: 'bg-primary/25 border-sky-400/50 text-sky-300' },
    
    { id: 'a1', name: 'Background Beat.mp3', start: 0, duration: 30, trackId: 'audio', color: 'bg-emerald-500/25 border-emerald-400/50 text-emerald-300' },
    
    { id: 't1', name: 'Welcome Title Overlay', start: 1, duration: 4, trackId: 'text', color: 'bg-amber-500/25 border-amber-400/50 text-amber-300' },
    { id: 't2', name: 'Dialogue Subtitle Cue', start: 9, duration: 6, trackId: 'text', color: 'bg-amber-500/25 border-amber-400/50 text-amber-300' },
    
    { id: 'e1', name: 'Teal & Orange Grade', start: 0, duration: 23, trackId: 'effect', color: 'bg-fuchsia-500/25 border-fuchsia-400/50 text-fuchsia-300' }
  ]);

  // History stack for Undo/Redo
  const [history, setHistory] = useState<TimelineClip[][]>([clips]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Custom Markers
  const [markers, setMarkers] = useState<Marker[]>([
    { id: 'm1', time: 5, label: 'Transition Cue' },
    { id: 'm2', time: 18, label: 'L-Cut Dialogue' }
  ]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const { duplicateClipTimeline } = useDuplicate({ showToast });

  const {
    isOpen: isRenameOpen,
    currentName: renameCurrentName,
    openRename,
    closeRename,
    confirmRename,
  } = useRename({
    getClips: () => clips,
    onRenameSuccess: (updatedClips) => {
      updateHistory(updatedClips);
    },
    showToast,
  });

  const { toggleReverse: toggleTimelineReverse } = useReverse({
    getSelectedClip: () => {
      if (!selectedClipId) return null;
      return clips.find((c) => c.id === selectedClipId) || null;
    },
    getClips: () => clips,
    onUpdateClips: (updatedClips) => {
      updateHistory(updatedClips);
    },
    showToast,
  });

  const { detachAudio: detachTimelineAudio } = useDetach({
    getClips: () => clips,
    getSelectedClip: () => clips.find((c) => c.id === selectedClipId) || null,
    onUpdateClips: (updatedClips) => {
      updateHistory(updatedClips);
    },
    showToast,
  });

  const { toggleLock: toggleTimelineLock, validateCanEdit: validateTimelineEdit } = useLock({
    getClips: () => clips,
    getSelectedClipId: () => selectedClipId,
    getPlayheadTime: () => currentTime,
    getLockedClipsMap: () => lockedClips,
    onUpdateClips: (updatedClips, updatedLockedMap) => {
      if (updatedLockedMap) setLockedClips(updatedLockedMap);
      updateHistory(updatedClips);
    },
    onUpdateLockedMap: (updatedLockedMap) => {
      setLockedClips(updatedLockedMap);
    },
    showToast,
  });

  const { freezeFrame: freezeTimelineFrame } = useFreeze({
    getClips: () => clips,
    getSelectedClip: () => clips.find((c) => c.id === selectedClipId) || null,
    getPlayheadTime: () => currentTime,
    onUpdateClips: (updatedClips, createdFreezeId) => {
      if (createdFreezeId) setSelectedClipId(createdFreezeId);
      updateHistory(updatedClips);
    },
    showToast,
  });

  const updateHistory = (newClips: TimelineClip[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, newClips]);
    setHistoryIndex(updatedHistory.length);
    setClips(newClips);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setClips(history[historyIndex - 1]);
      showToast('Undo Action');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setClips(history[historyIndex + 1]);
      showToast('Redo Action');
    }
  };

  // Timeline operations
  const handleSplit = () => {
    if (!selectedClipId) return;
    const clip = clips.find((c) => c.id === selectedClipId);
    if (!clip || lockedTracks[clip.trackId] || lockedClips[clip.id] || clip.isLocked) {
      if (clip && (lockedClips[clip.id] || clip.isLocked)) showToast('This clip is locked. Unlock it to make changes.');
      return;
    }

    // Check if playhead cuts the clip
    if (currentTime > clip.start && currentTime < clip.start + clip.duration) {
      const firstPartDuration = currentTime - clip.start;
      const secondPartDuration = clip.start + clip.duration - currentTime;
      const deepCloneArr = <T,>(arr?: T[]): T[] => arr ? JSON.parse(JSON.stringify(arr)) : [];

      const firstPart: TimelineClip = {
        ...clip,
        id: clip.id,
        duration: firstPartDuration,
        appliedEffects: deepCloneArr((clip as any).appliedEffects),
        filters: deepCloneArr((clip as any).filters),
        keyframes: deepCloneArr((clip as any).keyframes),
        transitions: deepCloneArr((clip as any).transitions)
      };
      const secondPartId = `${clip.id}-split-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const secondPart: TimelineClip = {
        ...clip,
        id: secondPartId,
        name: `${clip.name} (Split)`,
        start: currentTime,
        duration: secondPartDuration,
        isLocked: false,
        appliedEffects: deepCloneArr((clip as any).appliedEffects),
        filters: deepCloneArr((clip as any).filters),
        keyframes: deepCloneArr((clip as any).keyframes),
        transitions: deepCloneArr((clip as any).transitions)
      };

      const updatedClips = clips.filter((c) => c.id !== clip.id).concat(firstPart, secondPart);
      updateHistory(updatedClips);
      setSelectedClipId(secondPart.id);
      showToast('Split clip at playhead');
    } else {
      showToast('Seek playhead inside clip to split');
    }
  };

  const handleDuplicate = () => {
    if (!selectedClipId) return;
    const res = duplicateClipTimeline(clips, selectedClipId, { lockedTracks, lockedClips });
    if (res) {
      updateHistory(res.updatedClips);
      setSelectedClipId(res.newClip.id);
    }
  };

  const handleDelete = () => {
    if (!selectedClipId) return;
    const clip = clips.find((c) => c.id === selectedClipId);
    if (!clip || lockedTracks[clip.trackId] || lockedClips[clip.id] || clip.isLocked) {
      if (clip && (lockedClips[clip.id] || clip.isLocked)) showToast('This clip is locked. Unlock it to make changes.');
      return;
    }

    updateHistory(clips.filter((c) => c.id !== selectedClipId));
    setSelectedClipId(null);
    showToast('Deleted clip');
  };

  const handleRippleDelete = () => {
    if (!selectedClipId) return;
    const clip = clips.find((c) => c.id === selectedClipId);
    if (!clip || lockedTracks[clip.trackId] || lockedClips[clip.id] || clip.isLocked) {
      if (clip && (lockedClips[clip.id] || clip.isLocked)) showToast('This clip is locked. Unlock it to make changes.');
      return;
    }

    const deletedStart = clip.start;
    const deletedDuration = clip.duration;
    const track = clip.trackId;

    const updatedClips = clips
      .filter((c) => c.id !== selectedClipId)
      .map((c) => {
        if (c.trackId === track && c.start > deletedStart) {
          return { ...c, start: Math.max(0, c.start - deletedDuration) };
        }
        return c;
      });

    updateHistory(updatedClips);
    setSelectedClipId(null);
    showToast('Ripple deleted clip');
  };

  const handleTrimUpdate = (clipId: string, newTimelineStart: number, newSourceStart: number, newDuration: number) => {
    setClips(prev => prev.map(c => c.id === clipId ? { ...c, start: newTimelineStart, duration: newDuration } : c));
  };

  const handleTrimEnd = () => {
    setClips(currentClips => {
      setHistory(prevHistory => {
        const updatedHistory = prevHistory.slice(0, historyIndex + 1);
        setHistoryIndex(updatedHistory.length);
        return [...updatedHistory, currentClips];
      });
      return currentClips;
    });
    showToast('Trimmed clip');
  };

  const handleTrim = (direction: 'left' | 'right', amount: number) => {
    if (!selectedClipId) return;
    const clip = clips.find((c) => c.id === selectedClipId);
    if (!clip || lockedTracks[clip.trackId] || lockedClips[clip.id]) return;

    let updatedClip = { ...clip };
    if (direction === 'left') {
      const actualAmount = Math.min(amount, clip.duration - 0.5);
      updatedClip.start += actualAmount;
      updatedClip.duration -= actualAmount;
    } else {
      updatedClip.duration = Math.max(0.5, clip.duration + amount);
    }

    updateHistory(clips.map((c) => (c.id === selectedClipId ? updatedClip : c)));
  };

  const handleAddMarker = () => {
    const label = prompt('Marker Label:', `Marker @ ${currentTime.toFixed(1)}s`);
    if (label) {
      setMarkers([...markers, { id: `m-${Date.now()}`, time: currentTime, label }]);
      showToast('Created Timeline marker');
    }
  };

  const toggleTrackLock = (track: string) => {
    setLockedTracks({ ...lockedTracks, [track]: !lockedTracks[track] });
  };

  const toggleTrackVisibility = (track: string) => {
    setHiddenTracks({ ...hiddenTracks, [track]: !hiddenTracks[track] });
  };

  const toggleTrackMute = (track: string) => {
    setMutedTracks({ ...mutedTracks, [track]: !mutedTracks[track] });
  };

  const handleClipContextMenu = (e: React.MouseEvent, clip: TimelineClip) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedClipId(clip.id); // Also select it visually
  };

  // Handle Context Menu item triggers
  const handleMenuAction = (actionId: string, clipId: string) => {
    const clip = clips.find((c) => c.id === clipId);
    if (!clip) return;

    switch (actionId) {
      case 'delete':
        updateHistory(clips.filter((c) => c.id !== clipId));
        setSelectedClipId(null);
        showToast(`Deleted: ${clip.name}`);
        break;
      case 'duplicate': {
        const res = duplicateClipTimeline(clips, clipId, { lockedTracks, lockedClips }, `Duplicated: ${clip.name}`);
        if (res) {
          updateHistory(res.updatedClips);
          setSelectedClipId(res.newClip.id);
        }
        break;
      }
      case 'split':
        if (currentTime > clip.start && currentTime < clip.start + clip.duration) {
          const firstPartDuration = currentTime - clip.start;
          const secondPartDuration = clip.start + clip.duration - currentTime;
          const firstPart: TimelineClip = { ...clip, duration: firstPartDuration };
          const secondPart: TimelineClip = {
            ...clip,
            id: `${clip.id}-split-${Date.now()}`,
            name: `${clip.name} (Split)`,
            start: currentTime,
            duration: secondPartDuration
          };
          const updatedClips = clips.filter((c) => c.id !== clip.id).concat(firstPart, secondPart);
          updateHistory(updatedClips);
          setSelectedClipId(secondPart.id);
          showToast(`Split: ${clip.name} at ${currentTime.toFixed(1)}s`);
        } else {
          showToast('Seek playhead inside clip to split');
        }
        break;
      case 'lock':
      case 'unlock':
        toggleTimelineLock(clipId);
        break;
      case 'mute-audio':
        const isCurrentlyMuted = !!mutedClips[clipId];
        setMutedClips({ ...mutedClips, [clipId]: !isCurrentlyMuted });
        showToast(`${isCurrentlyMuted ? 'Unmuted' : 'Muted'} audio track of: ${clip.name}`);
        break;
      case 'reverse':
        toggleTimelineReverse(clipId);
        break;
      case 'keyframes':
        showToast(`Opened Keyframes frame interpolation for ${clip.name}`);
        break;
      case 'trim':
        showToast(`Opened manual crop trimmers for ${clip.name}`);
        break;
      case 'add-transition':
        showToast(`Mock Action: Add transition before ${clip.name}`);
        break;
      case 'rename':
        openRename(clipId || clip?.id, clip?.name);
        break;
      case 'speed':
        showToast(`Opened speed adjustment for ${clip.name}`);
        break;
      case 'detach-audio':
        detachTimelineAudio(clipId || clip?.id);
        break;
      case 'freeze-frame':
        freezeTimelineFrame(clipId || clip?.id);
        break;
      case 'replace-media':
        showToast(`Mock Action: Replacing assets for ${clip.name}...`);
        break;
      default:
        showToast(`Triggered timeline action: ${actionId}`);
    }
  };

  const scaleFactor = (zoom / 100) * 15;
  const totalTimelineWidth = 35 * scaleFactor;

  return (
    <div className="flex flex-col h-full bg-surface border-t border-border text-foreground relative">
      
      {/* Timeline Control Bar */}
      <div className="h-10 border-b border-border px-4 flex items-center justify-between bg-surface text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className="p-1.5 rounded hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
            title="Undo"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
            className="p-1.5 rounded hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
            title="Redo"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-4 bg-white/10" />
          {selectedClipId && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleMenuAction('split', selectedClipId)}
                className="px-2 py-1 rounded bg-[#E6F2F8] text-[#3B6CE7] border border-[#3B6CE7]/20 hover:bg-[#3B6CE7] hover:text-white transition text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Split
              </button>
              <button
                type="button"
                onClick={() => handleMenuAction('duplicate', selectedClipId)}
                className="px-2 py-1 rounded bg-[#E6F2F8] text-[#3B6CE7] border border-[#3B6CE7]/20 hover:bg-[#3B6CE7] hover:text-white transition text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Duplicate
              </button>
              <button
                type="button"
                onClick={() => handleMenuAction('delete', selectedClipId)}
                className="px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500 hover:text-white transition text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {selectedClipId && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleTrim('left', -0.5)}
                className="px-1.5 py-0.5 rounded text-[10px] hover:bg-surface-hover cursor-pointer"
              >
                ◀ Trim
              </button>
              <button
                type="button"
                onClick={() => handleTrim('left', 0.5)}
                className="px-1.5 py-0.5 rounded text-[10px] hover:bg-surface-hover cursor-pointer"
              >
                Trim ▶
              </button>
              <div className="w-px h-3 bg-white/10" />
              <button
                type="button"
                onClick={() => handleTrim('right', -0.5)}
                className="px-1.5 py-0.5 rounded text-[10px] hover:bg-surface-hover cursor-pointer"
              >
                ◀ Trim
              </button>
              <button
                type="button"
                onClick={() => handleTrim('right', 0.5)}
                className="px-1.5 py-0.5 rounded text-[10px] hover:bg-surface-hover cursor-pointer"
              >
                Trim ▶
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddMarker}
            className="flex items-center gap-1 px-2 py-1 rounded bg-surface border border-border hover:bg-surface-hover text-foreground transition cursor-pointer"
          >
            <Bookmark className="h-3.5 w-3.5 text-amber-400" />
            <span>Add Marker</span>
          </button>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ZoomOut className="h-3.5 w-3.5" />
            <input
              type="range"
              min="50"
              max="250"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-20 accent-primary h-1 bg-surface-hover rounded-lg cursor-pointer"
            />
            <ZoomIn className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Main Track Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT Track Header panel */}
        <div className="w-48 border-r border-border bg-background flex flex-col divide-y divide-white/5 flex-shrink-0">
          <div className="h-6 bg-background px-3 flex items-center text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
            Track Details
          </div>

          {(['video', 'audio', 'text', 'effect'] as const).map((trackId) => (
            <div key={trackId} className="h-[44px] px-3 flex items-center justify-between bg-background">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold capitalize text-foreground">{trackId}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleTrackLock(trackId)}
                  className={`p-1 rounded hover:bg-surface-hover transition cursor-pointer ${
                    lockedTracks[trackId] ? 'text-amber-500' : 'text-muted-foreground'
                  }`}
                >
                  {lockedTracks[trackId] ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => toggleTrackVisibility(trackId)}
                  className={`p-1 rounded hover:bg-surface-hover transition cursor-pointer ${
                    hiddenTracks[trackId] ? 'text-red-400' : 'text-muted-foreground'
                  }`}
                >
                  {hiddenTracks[trackId] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
                {trackId === 'audio' && (
                  <button
                    type="button"
                    onClick={() => toggleTrackMute(trackId)}
                    className={`p-1 rounded hover:bg-surface-hover transition cursor-pointer ${
                      mutedTracks[trackId] ? 'text-red-400' : 'text-muted-foreground'
                    }`}
                  >
                    {mutedTracks[trackId] ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT scrollable Track list panel */}
        <div className="flex-1 overflow-auto relative select-none bg-background" style={{ cursor: 'crosshair' }}>
          <div className="relative h-full flex flex-col justify-between" style={{ width: `${totalTimelineWidth}px` }}>
            
            {/* Time Ruler and Markers */}
            <div className="h-6 border-b border-border bg-background relative flex items-center text-[9px] font-mono text-muted-foreground">
              {Array.from({ length: 8 }).map((_, i) => {
                const sec = i * 5;
                const leftPx = sec * scaleFactor;
                return (
                  <div
                    key={sec}
                    className="absolute border-l border-border-strong pl-1.5 h-full flex items-center"
                    style={{ left: `${leftPx}px` }}
                  >
                    <span>00:{sec.toString().padStart(2, '0')}</span>
                  </div>
                );
              })}

              {markers.map((marker) => (
                <div
                  key={marker.id}
                  className="absolute bottom-0 h-4 flex flex-col items-center group cursor-pointer"
                  style={{ left: `${marker.time * scaleFactor}px` }}
                  onClick={() => onTimeChange(marker.time)}
                >
                  <Bookmark className="h-3 w-3 text-amber-500 fill-current" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background border border-amber-500/30 text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-25 text-amber-400">
                    {marker.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Playhead line representation */}
            <div
              className="absolute inset-y-0 w-0.5 bg-sky-400 z-30 pointer-events-none shadow-glow transition-all duration-75"
              style={{ left: `${currentTime * scaleFactor}px` }}
            >
              <div className="h-3 w-3 -translate-x-[5.5px] bg-sky-400 rotate-45 rounded-sm" />
            </div>

            {/* Tracks Container */}
            <div className="flex-1 flex flex-col divide-y divide-white/5">
              {(['video', 'audio', 'text', 'effect'] as const).map((trackId) => {
                const isHidden = hiddenTracks[trackId];
                const isLocked = lockedTracks[trackId];

                return (
                  <div
                    key={trackId}
                    className={`h-[44px] relative flex items-center border-y border-transparent ${
                      isHidden ? 'opacity-20 pointer-events-none' : ''
                    } ${isLocked ? 'bg-surface/10' : 'bg-transparent'}`}
                  >
                    {clips
                      .filter((c) => c.trackId === trackId)
                      .map((clip) => {
                        const clipWidth = clip.duration * scaleFactor;
                        const clipLeft = clip.start * scaleFactor;
                        const isSelected = selectedClipId === clip.id;
                        const clipIsLocked = lockedClips[clip.id] || isLocked;
                        const clipIsMuted = mutedClips[clip.id] || (trackId === 'audio' && mutedTracks.audio);

                        return (
                          <div
                            key={clip.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClipId(isSelected ? null : clip.id);
                            }}
                            onContextMenu={(e) => handleClipContextMenu(e, clip)}
                            className={`absolute h-9 rounded-md border flex items-center justify-between px-2 cursor-pointer transition shadow-md ${clip.color} ${
                              isSelected ? 'ring-2 ring-sky-400/80 border-sky-400 scale-[1.01]' : 'hover:opacity-90'
                            } ${clipIsLocked ? 'opacity-70 border-dashed border-amber-500/30' : ''}`}
                            style={{
                              width: `${clipWidth}px`,
                              left: `${clipLeft}px`
                            }}
                          >
                            <span className="text-[10px] font-semibold truncate leading-tight w-full pointer-events-none flex items-center gap-1">
                              {clipIsLocked && <Lock className="h-2.5 w-2.5 text-amber-400 flex-shrink-0" />}
                              {clipIsMuted && <VolumeX className="h-2.5 w-2.5 text-red-400 flex-shrink-0" />}
                              {(clip as any).isReversed && <RotateCcw className="h-2.5 w-2.5 text-sky-400 flex-shrink-0" />}
                              {clip.name} {(clip as any).isReversed && <span className="text-[8px] font-mono text-sky-400 font-bold uppercase">(REV)</span>}
                            </span>
                            {isSelected && !clipIsLocked && (
                              <ClipTrimHandles
                                clipId={clip.id}
                                timelineStart={clip.start}
                                sourceStart={0}
                                duration={clip.duration}
                                pixelsPerSecond={scaleFactor}
                                isLocked={clipIsLocked}
                                onTrimUpdate={(newTimelineStart, newSourceStart, newDuration) => {
                                  handleTrimUpdate(clip.id, newTimelineStart, newSourceStart, newDuration);
                                }}
                                onTrimEnd={handleTrimEnd}
                              />
                            )}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM ACTION PANEL */}
      <ClipActionsPanel 
        clip={selectedClipId ? clips.find(c => c.id === selectedClipId) || null : null}
        isLocked={!!(selectedClipId && lockedClips[selectedClipId])}
        isMuted={!!(selectedClipId && mutedClips[selectedClipId])}
        hasClipboardPayload={false}
        onAction={(actionId) => handleMenuAction(actionId, selectedClipId!)}
      />

      {/* RENDER TOAST ALERT NOTIFICATION */}
      {toast && (
        <div className="absolute bottom-12 right-4 bg-surface border border-sky-400/30 text-primary text-xs px-3.5 py-2 rounded-xl shadow-glow z-50 flex items-center gap-1.5">
          <span>⚡</span>
          <span>{toast}</span>
        </div>
      )}

      {/* RENAME DIALOG */}
      <RenameDialog
        isOpen={isRenameOpen}
        currentName={renameCurrentName}
        onRename={confirmRename}
        onCancel={closeRename}
      />
    </div>
  );
}
