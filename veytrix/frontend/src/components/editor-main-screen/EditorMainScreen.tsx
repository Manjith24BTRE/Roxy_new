import './theme/editorTheme.css';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Download, Film, Type, AudioWaveform,
  Wand2, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  ZoomIn, ZoomOut, Scissors, Split, Plus, Search,
  FolderPlus, Maximize2, RotateCcw, Image as ImageIcon,
  Languages, Crop, Lock, Unlock, Gauge, Replace, ArrowRightLeft, Sliders, Activity, Edit3, Layers
} from 'lucide-react';
import { VeytrixLogo } from '../VeytrixLogo';
import { useProjectMedia } from '../../contexts/ProjectMediaContext';
import { ExportCenter } from './components/ExportCenter/ExportCenter';

// Quick AI Edit Imports
import { AspectRatio } from './tools/aspect-ratio/AspectRatio';
import { Audio } from './tools/audio/Audio';
import { TextPanel, TextOverlay } from './tools/text/TextPanel';
import { Captions, CaptionItem } from './tools/captions/Captions';
import { Effects } from './tools/effects/Effects';
import { Filters } from './tools/filters/Filters';
import { Transitions } from './tools/transitions/Transitions';
import { SpeedTool, clampPlaybackRate, getSourceDuration, getEffectiveDuration, timelineTimeToSourceTime, sourceTimeToTimelineTime } from './tools/speed';
import { ReplaceTool, ReplaceMediaPayload } from './tools/replace';
// Force IDE cache refresh for folder casing
import { SAMPLE_FILTERS, getInterpolatedFilter } from './tools/filters/samples';
import { SAMPLE_TRANSITIONS_NEW } from './tools/transitions/Transitions.data';
import { EFFECT_PRESETS, EffectPreset, AppliedEffect, EffectKeyframe, getInterpolatedEffectProps } from './tools/effects/effectsPreset';
import { applyEffectPipeline, renderStateToCSS, createDefaultRenderState } from './tools/effects/renderers';
import { useDuplicate } from './tools/duplicate';
import { useRename, RenameDialog } from './tools/rename';
import { useReverse, reversedAudioEngine } from './tools/reverse';
import { SplitService } from './tools/split';
import { DeleteService } from './tools/delete';
import { ProjectDB, useProjectSave, SaveModal } from './tools/project-save';
import { useDetach } from './tools/Extract';
import { useLock } from './tools/lock';
import { useFreeze } from './tools/freeze';
import { useAudio } from './tools/audio';
import {
  KeyframeInspector,
  KeyframeTimelineOverlay,
  KeyframeButton,
  KeyframeManager,
  interpolateAllProperties,
  interpolatePropertyValue,
  hasKeyframeForProperty,
  KeyframePoint,
  KeyframeProperty,
  InterpolationType
} from './tools/keyframes';
import { ClipTrimHandles, TrimToolbar, useTrimMode } from './tools/trim';
import { ClipActionsPanel } from './clip-actions/ClipActionsPanel';
import { EditorHistoryProvider, useEditorHistory, ProjectState } from './history';
import { OverlapUtils } from './tools/overlap/overlapUtils';
import { ClipReorderUtils } from './tools/overlap/clipReorderUtils';

const getProjectTotalDuration = (clips: any[]): number => {
  if (!clips || clips.length === 0) return 0;
  const videoClips = clips.filter(
    (c) => c.trackId !== 'audio' && c.trackId !== 'music' && c.type !== 'audio' && !c.isDetachedAudio
  );
  const targetClips = videoClips.length > 0 ? videoClips : clips;
  const maxEnd = targetClips.reduce((max, clip) => {
    const startSec = clip.timelineStart ?? clip.start ?? 0;
    return Math.max(max, startSec + (clip.duration || 0));
  }, 0);
  return maxEnd;
};

export function EditorMainScreen() {
  return (
    <EditorHistoryProvider>
      <EditorMainScreenContent />
    </EditorHistoryProvider>
  );
}

function EditorMainScreenContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('project');
  const { projectId, projectTitle, setProjectTitle, mediaFiles, activeMediaId, setActiveMediaId, addMediaFiles, updateMediaName, clearMedia } = useProjectMedia();
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const handleImportButtonClick = () => {
    importFileInputRef.current?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      await addMediaFiles(filesArray);
      showToast(`Imported ${filesArray.length} media file(s)`);
      e.target.value = '';
    }
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'media' | 'ratio' | 'audio' | 'text' | 'captions' | 'effects' | 'transitions' | 'filters' | 'speed' | 'replace' | 'keyframes'>('media');
  const [autoKeyframeEnabled, setAutoKeyframeEnabled] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(120);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMutedState] = useState(false);
  const [effectsSubTab, setEffectsSubTab] = useState<'transitions' | 'filters' | 'effects'>('effects');

  // Context Menu and overrides states

  const [lockedClips, setLockedClipsState] = useState<Record<string, boolean>>({});
  const [mutedClips, setMutedClipsState] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Timeline Clips sequence tracking
  const [timelineClips, setTimelineClipsState] = useState<any[]>([]);

  // Duplicate hook initialization
  const { duplicateClipSequence, handleDuplicateEffect } = useDuplicate({ showToast });

  // Rename hook initialization
  const {
    isOpen: isRenameOpen,
    currentName: renameCurrentName,
    openRename,
    closeRename,
    confirmRename,
  } = useRename({
    getClips: () => timelineClips,
    onRenameSuccess: (updatedClips, targetClipId, newName) => {
      beginTransaction('Rename clip', getProjectState());
      
      const targetClip = timelineClips.find(c => c.id === targetClipId || c.mediaId === targetClipId);
      const mediaId = targetClip?.mediaId || targetClip?.id || targetClipId;

      if (mediaId) {
        updateMediaName(mediaId, newName);
      }

      const syncedClips = (updatedClips || timelineClips).map(c => {
        if (c.id === targetClipId || (mediaId && (c.mediaId === mediaId || c.id === mediaId))) {
          return { ...c, name: newName };
        }
        return c;
      });

      setTimelineClips(syncedClips);
      commitTransaction(getProjectState());
    },
    showToast,
  });

  const [activeSelectedClipId, setActiveSelectedClipId] = useState<string | null>(null);

  const activeSelectedClip = activeSelectedClipId
    ? (timelineClips.find(c => c.id === activeSelectedClipId) || null)
    : (activeMediaId
      ? (timelineClips.find(c => c.id === activeMediaId || c.mediaId === activeMediaId) || null)
      : (timelineClips.find(c => currentTime >= c.timelineStart && currentTime <= c.timelineStart + c.duration) || timelineClips[0] || null));
  const activeClipLocalTime = activeSelectedClip ? Math.max(0, currentTime - activeSelectedClip.timelineStart) : 0;

  // Reverse hook initialization
  const { toggleReverse } = useReverse({
    getSelectedClip: () => activeSelectedClip,
    getClips: () => timelineClips,
    getMediaSource: (clip) => getClipMediaSource(clip),
    onUpdateClips: (updatedClips) => {
      beginTransaction('Reverse clip', getProjectState());
      setTimelineClips(updatedClips);
      commitTransaction(getProjectState());

      const targetClip = (activeSelectedClipId ? updatedClips.find(c => c.id === activeSelectedClipId) : null) ||
        updatedClips.find(c => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration) ||
        updatedClips[0];

      if (targetClip) {
        setActiveSelectedClipId(targetClip.id);
        setActiveMediaId(targetClip.mediaId);

        const mediaSource = getClipMediaSource(targetClip);
        if (targetClip.isReversed && mediaSource) {
          reversedAudioEngine.loadAndReverseAudio(targetClip.id, mediaSource).catch(() => { });
        } else {
          reversedAudioEngine.stopReversedAudio();
        }

        const vEl = videoRefs.current[targetClip.id];
        if (vEl) {
          try {
            vEl.load();
            vEl.currentTime = timelineTimeToSourceTime(targetClip, currentTime);
          } catch { }
        }
      }

      if (isPlaying && targetClip && targetClip.isReversed) {
        const relTime = Math.max(0, currentTime - targetClip.timelineStart);
        const clipVol = isMuted || !!mutedClips[targetClip.id] ? 0 : volume;
        const mediaSource = getClipMediaSource(targetClip);
        reversedAudioEngine.playReversedAudio(
          targetClip.id,
          mediaSource,
          relTime,
          targetClip.duration,
          clipVol,
          targetClip.playbackRate || targetClip.speed || 1
        );
      }
    },
    showToast,
  });



  // Detach Audio hook initialization
  const { detachAudio } = useDetach({
    getClips: () => timelineClips,
    getSelectedClip: () => activeSelectedClip,
    onUpdateClips: (updatedClips) => {
      beginTransaction('Detach Audio', getProjectState());
      setTimelineClips(updatedClips);
      commitTransaction(getProjectState());
    },
    showToast,
  });

  // Lock hook initialization
  const { toggleLock, validateCanEdit, checkIsLocked } = useLock({
    getClips: () => timelineClips,
    getSelectedClipId: () => activeSelectedClip?.id || null,
    getPlayheadTime: () => currentTime,
    getLockedClipsMap: () => lockedClips,
    onUpdateClips: (updatedClips, updatedLockedMap) => {
      beginTransaction('Lock/Unlock clip', getProjectState());
      if (updatedLockedMap) setLockedClips(updatedLockedMap);
      setTimelineClips(updatedClips);
      commitTransaction(getProjectState());
    },
    onUpdateLockedMap: (updatedLockedMap) => {
      beginTransaction('Lock/Unlock clip', getProjectState());
      setLockedClips(updatedLockedMap);
      commitTransaction(getProjectState());
    },
    showToast,
  });

  // Freeze hook initialization
  const { freezeFrame } = useFreeze({
    getClips: () => timelineClips,
    getSelectedClip: () => activeSelectedClip,
    getPlayheadTime: () => currentTime,
    getVideoElement: (clipId) => {
      // Try direct lookup first, then fall back to activeSelectedClip's video element
      return videoRefs.current[clipId || ''] || videoRefs.current[activeSelectedClip?.id || ''] || null;
    },
    onUpdateClips: (updatedClips, createdFreezeId) => {
      beginTransaction('Create Freeze Frame', getProjectState());
      setTimelineClips(recalculateSequence(updatedClips));
      if (createdFreezeId) {
        setActiveSelectedClipId(createdFreezeId);
      }
      commitTransaction(getProjectState());
    },
    showToast,
  });

  // Audio hook initialization
  const { libraryAssets, importAudioFile, addAudioToTimeline, removeLibraryAsset } = useAudio({
    getClips: () => timelineClips,
    getPlayheadTime: () => currentTime,
    getSelectedClipId: () => activeSelectedClipId || activeSelectedClip?.id,
    onUpdateClips: (updatedClips, createdAudioId) => {
      beginTransaction('Add Audio to Timeline', getProjectState());
      setTimelineClips(updatedClips);
      if (createdAudioId) {
        setActiveSelectedClipId(createdAudioId);
      }
      commitTransaction(getProjectState());
    },
    showToast,
  });

  // Drag and drop index tracking
  const [draggedClipId, setDraggedClipId] = useState<string | null>(null);
  const [selectedTransitionIndex, setSelectedTransitionIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, clipId: string) => {
    if (!validateCanEdit(clipId, 'move')) {
      e.preventDefault();
      return;
    }
    beginTransaction('Move clip', getProjectState());
    setDraggedClipId(clipId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, overClipId: string) => {
    e.preventDefault();
    if (draggedClipId === null || draggedClipId === overClipId) return;

    setTimelineClips((prev: any[]) => {
      const draggedIdx = prev.findIndex(c => c.id === draggedClipId);
      const overIdx = prev.findIndex(c => c.id === overClipId);
      if (draggedIdx === -1 || overIdx === -1) return prev;

      const updated = [...prev];
      const [draggedClip] = updated.splice(draggedIdx, 1);
      updated.splice(overIdx, 0, draggedClip);
      return recalculateSequence(updated);
    });
  };

  const handleDragEnd = () => {
    setDraggedClipId(null);
    commitTransaction(getProjectState());
  };

  const handleTrackDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleTrackDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    if (!draggedClipId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const localPxPerSec = (zoomLevel / 100) * 35;
    const dropTime = Math.max(0, offsetX / localPxPerSec);

    setTimelineClips((prev: any[]) => {
      const draggedClip = prev.find(c => c.id === draggedClipId);
      if (!draggedClip) return prev;

      let updated = prev.map(c => {
        if (c.id === draggedClipId) {
          if (trackId === 'overlay') {
            return {
              ...OverlapUtils.convertToOverlay(c),
              timelineStart: dropTime,
              start: dropTime
            };
          } else if (trackId === 'video') {
            return OverlapUtils.convertToMain(c);
          }
        }
        return c;
      });

      if (trackId === 'video') {
        const mainClipsWithoutDragged = updated.filter(
          c => c.id !== draggedClipId && c.trackId !== 'overlay' && c.trackId !== 'audio' && c.trackId !== 'music' && c.type !== 'audio' && !c.isDetachedAudio
        );
        
        let insertIdx = mainClipsWithoutDragged.findIndex(c => dropTime < c.timelineStart + c.duration / 2);
        if (insertIdx === -1) {
          insertIdx = mainClipsWithoutDragged.length;
        }

        const others = updated.filter(
          c => c.id === draggedClipId || c.trackId === 'overlay' || c.trackId === 'audio' || c.trackId === 'music' || c.type === 'audio' || c.isDetachedAudio
        );
        const canonicalMain = [...mainClipsWithoutDragged];
        const canonicalDragged = updated.find(c => c.id === draggedClipId)!;
        canonicalMain.splice(insertIdx, 0, canonicalDragged);

        const overlaysAndAudios = others.filter(c => c.id !== draggedClipId);
        updated = [...canonicalMain, ...overlaysAndAudios];
      }

      return recalculateSequence(updated);
    });

    setDraggedClipId(null);
    commitTransaction(getProjectState());
    showToast(trackId === 'overlay' ? 'Clip moved to Overlay Track' : 'Clip moved to Main Video Track');
  };

  const handleSelectTransition = (transitionId: string | null) => {
    setActiveTransitionId(transitionId);
    let targetIndex = selectedTransitionIndex;

    if (targetIndex === null && timelineClips.length > 1) {
      let minDistance = Infinity;
      timelineClips.forEach((clip, idx) => {
        if (idx < timelineClips.length - 1) {
          const boundary = clip.timelineStart + clip.duration;
          const dist = Math.abs(currentTime - boundary);
          if (dist < minDistance) {
            minDistance = dist;
            targetIndex = idx;
          }
        }
      });
      if (targetIndex === null) {
        targetIndex = 0;
      }
    }

    if (targetIndex !== null && targetIndex >= 0 && targetIndex < timelineClips.length - 1) {
      setTimelineClips((prev: any[]) =>
        prev.map((clip: any, idx: number) => {
          if (idx === targetIndex) {
            return {
              ...clip,
              appliedTransition: transitionId
            };
          }
          return clip;
        })
      );
      showToast(transitionId ? `Applied ${transitionId} transition at clip gap` : 'Transition removed');
    }
  };

  const recalculateSequence = (clips: any[]) => {
    return ClipReorderUtils.recalculateClipSequence(clips);
  };

  const handleUpdateClipSpeed = (clipId: string, newSpeed: number) => {
    const validatedSpeed = clampPlaybackRate(newSpeed);

    let newCurrentTime = currentTime;
    let playheadUpdated = false;

    setTimelineClips((prevClips: any[]) => {
      const clip = prevClips.find((c: any) => c.id === clipId);
      if (!clip) return prevClips;

      const isPlayheadInside = currentTime >= clip.timelineStart && currentTime <= clip.timelineStart + clip.duration;
      let targetSourceTime = 0;
      if (isPlayheadInside) {
        targetSourceTime = timelineTimeToSourceTime(clip, currentTime);
      }

      const updated = prevClips.map((c: any) => {
        if (c.id === clipId) {
          const sourceDur = getSourceDuration(c);
          const newDur = sourceDur / validatedSpeed;
          return {
            ...c,
            playbackRate: validatedSpeed,
            baseDuration: sourceDur,
            duration: newDur
          };
        }
        return c;
      });

      const reflowed = recalculateSequence(updated);

      if (isPlayheadInside) {
        const updatedClip = reflowed.find((c) => c.id === clipId);
        if (updatedClip) {
          newCurrentTime = sourceTimeToTimelineTime(updatedClip as any, targetSourceTime);
          playheadUpdated = true;
        }
      }

      return reflowed;
    });

    if (playheadUpdated) {
      setCurrentTime(newCurrentTime);
    }

    const video = videoRefs.current[clipId];
    if (video) {
      video.playbackRate = validatedSpeed;
      video.defaultPlaybackRate = validatedSpeed;
    }

    showToast(`Clip speed set to ${validatedSpeed}x`);
  };

  const handleSplitClip = (clipId: string) => {
    const targetClipId = clipId || activeSelectedClip?.id;
    if (!targetClipId) return;

    const res = SplitService.splitClip(timelineClips, targetClipId, currentTime);
    if (res.success && res.updatedTimelineClips) {
      setTimelineClips(recalculateSequence(res.updatedTimelineClips));
      if (res.rightClip) {
        setActiveSelectedClipId(res.rightClip.id);
        setActiveMediaId(res.rightClip.mediaId);
      }
      showToast(res.message || 'Split clip successfully');
    } else {
      showToast(res.message || 'Seek playhead inside clip to split');
    }
  };

  const handleTrimToPlayhead = (clipId: string, side: 'start' | 'end') => {
    const clipIndex = timelineClips.findIndex(c => c.id === clipId);
    if (clipIndex === -1) return;
    const clip = timelineClips[clipIndex];
    const relativePlayhead = currentTime - clip.timelineStart;

    if (relativePlayhead > 0.2 && relativePlayhead < clip.duration - 0.2) {
      setTimelineClips((prev) => {
        const updated = prev.map((c) => {
          if (c.id === clipId) {
            const currentPlaybackRate = c.playbackRate || 1;
            if (side === 'start') {
              const trimmedSource = relativePlayhead * currentPlaybackRate;
              const newSourceStart = (c.startOffset || 0) + trimmedSource;
              const newSourceDur = getSourceDuration(c) - trimmedSource;
              return {
                ...c,
                startOffset: newSourceStart,
                baseDuration: newSourceDur,
                duration: Math.max(0.5, c.duration - relativePlayhead)
              };
            } else {
              const newSourceDur = relativePlayhead * currentPlaybackRate;
              return {
                ...c,
                baseDuration: newSourceDur,
                duration: Math.max(0.5, relativePlayhead)
              };
            }
          }
          return c;
        });
        const recalculated = recalculateSequence(updated);
        const newTotalDur = getProjectTotalDuration(recalculated);
        setDuration(newTotalDur);
        if (currentTime > newTotalDur) {
          handleSeek(Math.max(0, newTotalDur));
        }
        return recalculated;
      });
      showToast(`Trimmed ${side} to playhead`);
    } else {
      showToast('Seek playhead inside clip to trim');
    }
  };

  const handleAddKeyframeAtPlayhead = (clipId: string) => {
    const clip = timelineClips.find(c => c.id === clipId);
    if (!clip) return;
    showToast(`Keyframe icon clicked for ${clip.name}`);
  };

  const handleAddAppliedEffect = (presetId: string) => {
    const preset = EFFECT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
    const activeClip = timelineClips.find(c => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration) ||
      (currentTime >= totalDur ? timelineClips[timelineClips.length - 1] : timelineClips[0]);

    if (activeClip) {
      const existingEffect = activeClip.appliedEffects?.find(
        (e: AppliedEffect) => e.presetId === presetId || e.presetId === preset.id || e.name === preset.name
      );

      if (existingEffect) {
        setTimelineClips((prev) =>
          prev.map((c) => {
            if (c.id === activeClip.id) {
              const appliedEffects = c.appliedEffects ? c.appliedEffects.filter((e: any) => e.id !== existingEffect.id) : [];
              return { ...c, appliedEffects };
            }
            return c;
          })
        );
        if (activeAppliedEffectId === existingEffect.id) {
          setActiveAppliedEffectId(null);
        }
        showToast(`Effect "${preset.name}" removed from clip`);
        return;
      }

      const newEffect: AppliedEffect = {
        id: `effect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        presetId: preset.id,
        name: preset.name,
        category: preset.category,
        enabled: true,
        intensity: preset.defaultIntensity,
        opacity: preset.defaultOpacity,
        speed: preset.defaultSpeed,
        angle: preset.defaultAngle,
        direction: preset.defaultDirection,
        blendMode: preset.defaultBlendMode,
        keyframes: []
      };

      // Enforce single effect per single clip
      setTimelineClips((prev) =>
        prev.map((c) => {
          if (c.id === activeClip.id) {
            return { ...c, appliedEffects: [newEffect] };
          }
          return c;
        })
      );
      setActiveAppliedEffectId(newEffect.id);
      showToast(`Effect "${preset.name}" applied to active clip`);
    } else {
      showToast('No active clip found to apply effect');
    }
  };

  const handleDeleteAppliedEffect = (clipId: string, effectId: string) => {
    setTimelineClips((prev) =>
      prev.map((c) => {
        if (c.id === clipId) {
          const appliedEffects = c.appliedEffects ? c.appliedEffects.filter((e: any) => e.id !== effectId) : [];
          return { ...c, appliedEffects };
        }
        return c;
      })
    );
    if (activeAppliedEffectId === effectId) {
      setActiveAppliedEffectId(null);
    }
    showToast('Effect removed');
  };

  const handleToggleAppliedEffect = (clipId: string, effectId: string) => {
    setTimelineClips((prev) =>
      prev.map((c) => {
        if (c.id === clipId) {
          const appliedEffects = c.appliedEffects ? c.appliedEffects.map((e: any) =>
            e.id === effectId ? { ...e, enabled: !e.enabled } : e
          ) : [];
          return { ...c, appliedEffects };
        }
        return c;
      })
    );
  };

  const handleUpdateAppliedEffect = (clipId: string, effectId: string, updates: Partial<AppliedEffect>) => {
    setTimelineClips((prev) =>
      prev.map((c) => {
        if (c.id === clipId) {
          const appliedEffects = c.appliedEffects ? c.appliedEffects.map((e: any) =>
            e.id === effectId ? { ...e, ...updates } : e
          ) : [];
          return { ...c, appliedEffects };
        }
        return c;
      })
    );
  };

  const handleDuplicateAppliedEffect = (clipId: string, effectId: string) => {
    const clip = timelineClips.find(c => c.id === clipId);
    handleDuplicateEffect(clip, effectId);
  };

  const handleReorderAppliedEffects = (clipId: string, startIndex: number, endIndex: number) => {
    setTimelineClips((prev) =>
      prev.map((c) => {
        if (c.id === clipId && c.appliedEffects) {
          const result = Array.from(c.appliedEffects);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return { ...c, appliedEffects: result };
        }
        return c;
      })
    );
  };

  const handleAddEffectKeyframe = (clipId: string, effectId: string, time: number, properties: any) => {
    setTimelineClips((prev) =>
      prev.map((c) => {
        if (c.id === clipId && c.appliedEffects) {
          const appliedEffects = c.appliedEffects.map((e: any) => {
            if (e.id === effectId) {
              const keyframe = {
                id: `kf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                time,
                properties
              };
              const keyframes = e.keyframes ? [...e.keyframes, keyframe] : [keyframe];
              return { ...e, keyframes };
            }
            return e;
          });
          return { ...c, appliedEffects };
        }
        return c;
      })
    );
  };

  const handleDeleteEffectKeyframe = (clipId: string, effectId: string, keyframeId: string) => {
    setTimelineClips((prev) =>
      prev.map((c) => {
        if (c.id === clipId && c.appliedEffects) {
          const appliedEffects = c.appliedEffects.map((e: any) => {
            if (e.id === effectId) {
              const keyframes = e.keyframes ? e.keyframes.filter((k: any) => k.id !== keyframeId) : [];
              return { ...e, keyframes };
            }
            return e;
          });
          return { ...c, appliedEffects };
        }
        return c;
      })
    );
  };

  const handleAddFilterAtPlayhead = (filterId: string | null) => {
    setActiveFilterId(filterId);
    if (filterId) {
      setTimelineClips((prev) =>
        prev.map((c) => {
          if (currentTime >= c.timelineStart && currentTime <= c.timelineStart + c.duration) {
            const relativePlayhead = currentTime - c.timelineStart;
            const filters = c.filters ? [...c.filters, { id: filterId, time: relativePlayhead }] : [{ id: filterId, time: relativePlayhead }];
            return { ...c, filters };
          }
          return c;
        })
      );
      showToast(`Filter "${filterId}" applied at playhead position ${currentTime.toFixed(2)}s`);
    }
  };

  const handleDuplicateClip = (clipId: string) => {
    if (!validateCanEdit(clipId, 'duplicate')) return;
    const updated = duplicateClipSequence(timelineClips, clipId, recalculateSequence);
    if (updated) {
      setTimelineClips(updated);
    }
  };

  const handleDeleteClip = (clipId: string) => {
    if (!validateCanEdit(clipId, 'delete')) return;
    const res = DeleteService.deleteClip(timelineClips, clipId, currentTime, {
      lockedClips,
    });
    if (res.success && res.updatedTimelineClips) {
      const recalculated = recalculateSequence(res.updatedTimelineClips);
      setTimelineClips(recalculated);

      const newTotalDur = getProjectTotalDuration(recalculated);
      setDuration(newTotalDur);
      if (currentTime > newTotalDur) {
        handleSeek(Math.max(0, newTotalDur));
      }

      const nextClip = res.nextSelectedClip;
      if (activeSelectedClipId === clipId) {
        setActiveSelectedClipId(nextClip?.id || null);
      }
      if (activeMediaId === clipId) {
        setActiveMediaId(nextClip?.mediaId || nextClip?.id || null);
      }
      showToast(res.message || 'Deleted clip');
    }
  };

  const handleSplitActiveClip = () => {
    const activeClip = timelineClips.find(c => currentTime >= c.timelineStart && currentTime <= c.timelineStart + c.duration) || timelineClips.find(c => c.mediaId === activeMediaId);
    if (activeClip) {
      handleSplitClip(activeClip.id);
    } else {
      showToast('Seek playhead inside a clip to split');
    }
  };

  const handleTrimActiveClip = () => {
    const activeClip = timelineClips.find(c => currentTime >= c.timelineStart && currentTime <= c.timelineStart + c.duration) || timelineClips.find(c => c.mediaId === activeMediaId);
    if (activeClip) {
      handleTrimToPlayhead(activeClip.id, 'start');
    } else {
      showToast('Seek playhead inside active clip to trim');
    }
  };

  const handleTrimUpdate = (
    clipId: string,
    newTimelineStart: number,
    newSourceStart: number,
    newDuration: number,
    activeEdgeTime?: number
  ) => {
    // During drag: update sourceStart and duration for target clip and any linked audio/video clips.
    setTimelineClips((prev) => {
      const targetClip = prev.find(c => c.id === clipId);
      if (!targetClip) return prev;

      const isTargetVideo = targetClip.trackId !== 'audio' && targetClip.trackId !== 'music' && targetClip.type !== 'audio' && !targetClip.isDetachedAudio;
      const validDuration = Math.max(0.5, newDuration);

      const updated = prev.map((c) => {
        if (c.id === clipId) {
          const delta = newTimelineStart - c.timelineStart;
          let kfs = c.keyframes || [];
          if (delta !== 0) {
            kfs = kfs.map((k: any) => ({ ...k, time: k.time - delta }));
          }
          kfs = KeyframeManager.trimClipKeyframes(kfs, validDuration);
          return {
            ...c,
            timelineStart: newTimelineStart,
            start: newTimelineStart,
            startOffset: newSourceStart,
            duration: validDuration,
            keyframes: kfs
          };
        }

        // If target is video, synchronize any linked/detached audio clips
        if (isTargetVideo) {
          const isAudio = c.trackId === 'audio' || c.trackId === 'music' || c.type === 'audio' || c.isDetachedAudio;
          if (isAudio) {
            const isLinked = c.sourceVideoId === clipId ||
                             c.id === `detached-audio-${clipId}` ||
                             (c.mediaId === targetClip.mediaId && Math.abs((c.timelineStart ?? c.start ?? 0) - (targetClip.timelineStart ?? targetClip.start ?? 0)) < 0.5);
            if (isLinked) {
              const delta = newTimelineStart - c.timelineStart;
              let kfs = c.keyframes || [];
              if (delta !== 0) {
                kfs = kfs.map((k: any) => ({ ...k, time: k.time - delta }));
              }
              kfs = KeyframeManager.trimClipKeyframes(kfs, validDuration);
              return {
                ...c,
                timelineStart: newTimelineStart,
                start: newTimelineStart,
                startOffset: newSourceStart,
                duration: validDuration,
                keyframes: kfs
              };
            }
          }
        }

        // If target is audio, synchronize any linked video clip
        if (!isTargetVideo) {
          const isVideo = c.trackId !== 'audio' && c.trackId !== 'music' && c.type !== 'audio' && !c.isDetachedAudio;
          if (isVideo) {
            const isLinked = c.id === targetClip.sourceVideoId ||
                             (c.mediaId === targetClip.mediaId && Math.abs((c.timelineStart ?? c.start ?? 0) - (targetClip.timelineStart ?? targetClip.start ?? 0)) < 0.5);
            if (isLinked) {
              const delta = newTimelineStart - c.timelineStart;
              let kfs = c.keyframes || [];
              if (delta !== 0) {
                kfs = kfs.map((k: any) => ({ ...k, time: k.time - delta }));
              }
              kfs = KeyframeManager.trimClipKeyframes(kfs, validDuration);
              return {
                ...c,
                timelineStart: newTimelineStart,
                start: newTimelineStart,
                startOffset: newSourceStart,
                duration: validDuration,
                keyframes: kfs
              };
            }
          }
        }

        return c;
      });

      const recalculated = recalculateSequence(updated);
      const newTotalDur = getProjectTotalDuration(recalculated);
      setDuration(newTotalDur);
      return recalculated;
    });

    if (activeEdgeTime !== undefined) {
      handleSeek(activeEdgeTime);
    }
  };

  const handleTrimCommit = () => {
    // On pointer up: ensure sequential reflow is committed and show toast.
    setTimelineClipsState((prev) => {
      const recalculated = recalculateSequence(prev);
      const newTotalDur = getProjectTotalDuration(recalculated);
      setDuration(newTotalDur);
      if (currentTime > newTotalDur) {
        handleSeek(Math.max(0, newTotalDur));
      }
      return recalculated;
    });
    const endState = getProjectState();
    commitTransaction(endState);
    showToast('Trimmed clip');
  };

  const isLoadedRef = useRef(false);

  // Synchronize mediaFiles with timelineClips End-to-End
  useEffect(() => {
    if (mediaFiles.length > 0) {
      const beforeState = getProjectState();
      setTimelineClipsState((prev) => {
        const existingIds = new Set(prev.map(c => c.mediaId));
        const newClips = mediaFiles
          .filter(m => !existingIds.has(m.id))
          .map(m => ({
            id: m.id,
            mediaId: m.id,
            name: m.name,
            duration: m.duration || 5,
            baseDuration: m.duration || 5,
            playbackRate: 1,
            durationFormatted: m.durationFormatted,
            thumbnails: m.thumbnails,
            url: m.url,
            startOffset: 0,
            timelineStart: 0
          }));

        const reflowed = recalculateSequence([...prev, ...newClips]);

        if (isLoadedRef.current && newClips.length > 0) {
          commitStateChange('Import clip', beforeState, { ...beforeState, timelineClips: reflowed });
        }

        return reflowed;
      });
      isLoadedRef.current = true;
    } else {
      setTimelineClipsState([]);
    }
  }, [mediaFiles]);

  // Quick AI Edit Modules State
  const [aspectRatio, setAspectRatioState] = useState('16/9');
  const [textOverlays, setTextOverlaysState] = useState<TextOverlay[]>([]);
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null);
  const [captions, setCaptionsState] = useState<CaptionItem[]>([]);
  const [activeFilterId, setActiveFilterIdState] = useState<string | null>(null);
  const [previewFilterId, setPreviewFilterId] = useState<string | null>(null);
  const [filterIntensity, setFilterIntensityState] = useState(80);
  const [filterOpacity, setFilterOpacityState] = useState(100);
  const [filterBlendMode, setFilterBlendModeState] = useState('normal');
  const [filterEnabled, setFilterEnabledState] = useState(true);
  const [showBeforeOnly, setShowBeforeOnly] = useState(false);
  const [activeEffectId, setActiveEffectIdState] = useState<string | null>(null);
  const [activeAppliedEffectId, setActiveAppliedEffectId] = useState<string | null>(null);
  const [effectStrength, setEffectStrengthState] = useState(60);
  const [effectSpeed, setEffectSpeedState] = useState(50);
  const [activeTransitionId, setActiveTransitionId] = useState<string | null>(null);
  const [captionStyle, setCaptionStyle] = useState({
    font: 'Outfit',
    size: 24,
    color: '#ffffff',
    bgOpacity: 60,
    bgColor: '#000000',
    position: 'bottom'
  });

  // Canvas Video Interactive Object Transform State
  const [isSelectedOnCanvas, setIsSelectedOnCanvas] = useState(true);
  const [canvasPos, setCanvasPosState] = useState({ x: 0, y: 0 });
  const [canvasScale, setCanvasScaleState] = useState(1);
  const [canvasRotation, setCanvasRotationState] = useState(0);
  const [selectedKeyframeProperty, setSelectedKeyframeProperty] = useState<KeyframeProperty>('scale');
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Wait, let's define dragStart type properly as { x: number, y: number }
  const [isResizingCanvas, setIsResizingCanvas] = useState<string | null>(null);
  const [isRotatingCanvas, setIsRotatingCanvas] = useState(false);
  const [isCropModeActive, setIsCropModeActive] = useState(false);

  const {
    canUndo,
    canRedo,
    undo,
    redo,
    commit,
    beginTransaction,
    commitTransaction,
    isInTransaction
  } = useEditorHistory();

  const activeSelectedClipIdRef = useRef(activeSelectedClipId);
  useEffect(() => {
    activeSelectedClipIdRef.current = activeSelectedClipId;
  }, [activeSelectedClipId]);

  // Helper refs to avoid state capture issues
  const isInTransactionRef = useRef(isInTransaction);
  useEffect(() => {
    isInTransactionRef.current = isInTransaction;
  }, [isInTransaction]);

  const getProjectState = useCallback((): ProjectState => {
    return {
      timelineClips,
      aspectRatio,
      textOverlays,
      captions,
      activeFilterId,
      filterIntensity,
      filterOpacity,
      filterBlendMode,
      filterEnabled,
      activeEffectId,
      effectStrength,
      effectSpeed,
      volume,
      isMuted,
      canvasPos,
      canvasScale,
      canvasRotation,
      lockedClips,
      mutedClips
    };
  }, [
    timelineClips,
    aspectRatio,
    textOverlays,
    captions,
    activeFilterId,
    filterIntensity,
    filterOpacity,
    filterBlendMode,
    filterEnabled,
    activeEffectId,
    effectStrength,
    effectSpeed,
    volume,
    isMuted,
    canvasPos,
    canvasScale,
    canvasRotation,
    lockedClips,
    mutedClips
  ]);

  const getProjectStateRef = useRef(getProjectState);
  useEffect(() => {
    getProjectStateRef.current = getProjectState;
  }, [getProjectState]);

  const applyProjectState = useCallback((state: ProjectState) => {
    setTimelineClipsState(state.timelineClips);
    setAspectRatioState(state.aspectRatio);
    setTextOverlaysState(state.textOverlays);
    setCaptionsState(state.captions);
    setActiveFilterIdState(state.activeFilterId);
    setFilterIntensityState(state.filterIntensity);
    setFilterOpacityState(state.filterOpacity);
    setFilterBlendModeState(state.filterBlendMode);
    setFilterEnabledState(state.filterEnabled);
    setActiveEffectIdState(state.activeEffectId);
    setEffectStrengthState(state.effectStrength);
    setEffectSpeedState(state.effectSpeed);
    setVolumeState(state.volume);
    setIsMutedState(state.isMuted);
    setCanvasPosState(state.canvasPos);
    setCanvasScaleState(state.canvasScale);
    setCanvasRotationState(state.canvasRotation);
    setLockedClipsState(state.lockedClips);
    setMutedClipsState(state.mutedClips);
  }, []);

  const applyProjectStateRef = useRef(applyProjectState);
  useEffect(() => {
    applyProjectStateRef.current = applyProjectState;
  }, [applyProjectState]);

  const commitStateChange = (label: string, before: ProjectState, after: ProjectState) => {
    setTimeout(() => {
      commit(label, before, after);
    }, 0);
  };

  // State wrappers for history tracking
  const setTimelineClips = useCallback((val: any[] | ((prev: any[]) => any[])) => {
    const before = getProjectStateRef.current();
    setTimelineClipsState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      if (!isInTransactionRef.current) {
        commitStateChange('Update clips', before, { ...before, timelineClips: resolved });
      }
      return resolved;
    });
  }, []);

  const setAspectRatio = useCallback((val: string | ((prev: string) => string)) => {
    const before = getProjectStateRef.current();
    setAspectRatioState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      if (!isInTransactionRef.current) {
        commitStateChange('Change aspect ratio', before, { ...before, aspectRatio: resolved });
      }
      return resolved;
    });
  }, []);

  const setTextOverlays = useCallback((val: TextOverlay[] | ((prev: TextOverlay[]) => TextOverlay[])) => {
    const before = getProjectStateRef.current();
    setTextOverlaysState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      if (!isInTransactionRef.current) {
        commitStateChange('Edit text overlays', before, { ...before, textOverlays: resolved });
      }
      return resolved;
    });
  }, []);

  const setCaptions = useCallback((val: CaptionItem[] | ((prev: CaptionItem[]) => CaptionItem[])) => {
    const before = getProjectStateRef.current();
    setCaptionsState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      if (!isInTransactionRef.current) {
        commitStateChange('Edit captions', before, { ...before, captions: resolved });
      }
      return resolved;
    });
  }, []);

  const setVolume = useCallback((val: number | ((prev: number) => number)) => {
    const before = getProjectStateRef.current();
    setVolumeState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      if (!isInTransactionRef.current) {
        commitStateChange('Adjust volume', before, { ...before, volume: resolved });
      }
      return resolved;
    });
  }, []);

  const setIsMuted = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    const before = getProjectStateRef.current();
    setIsMutedState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      if (!isInTransactionRef.current) {
        commitStateChange(resolved ? 'Mute audio' : 'Unmute audio', before, { ...before, isMuted: resolved });
      }
      return resolved;
    });
  }, []);

  const setLockedClips = useCallback((val: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => {
    const before = getProjectStateRef.current();
    setLockedClipsState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      if (!isInTransactionRef.current) {
        commitStateChange('Lock/Unlock clip', before, { ...before, lockedClips: resolved });
      }
      return resolved;
    });
  }, []);

  const setMutedClips = useCallback((val: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => {
    const before = getProjectStateRef.current();
    setMutedClipsState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      if (!isInTransactionRef.current) {
        commitStateChange('Mute/Unmute clip', before, { ...before, mutedClips: resolved });
      }
      return resolved;
    });
  }, []);

  const setCanvasPos = useCallback((val: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => {
    const before = getProjectStateRef.current();
    setCanvasPosState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      
      setTimelineClips((prevClips) => prevClips.map(c => {
        if (c.id === activeSelectedClipIdRef.current) {
          return {
            ...c,
            posX: resolved.x,
            posY: resolved.y,
            position: resolved
          };
        }
        return c;
      }));

      if (!isInTransactionRef.current) {
        commitStateChange('Move clip', before, { ...before, canvasPos: resolved });
      }
      return resolved;
    });
  }, []);

  const setCanvasScale = useCallback((val: number | ((prev: number) => number)) => {
    const before = getProjectStateRef.current();
    setCanvasScaleState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;

      setTimelineClips((prevClips) => prevClips.map(c => {
        if (c.id === activeSelectedClipIdRef.current) {
          return { ...c, scale: resolved };
        }
        return c;
      }));

      if (!isInTransactionRef.current) {
        commitStateChange('Scale clip', before, { ...before, canvasScale: resolved });
      }
      return resolved;
    });
  }, []);

  const setCanvasRotation = useCallback((val: number | ((prev: number) => number)) => {
    const before = getProjectStateRef.current();
    setCanvasRotationState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;

      setTimelineClips((prevClips) => prevClips.map(c => {
        if (c.id === activeSelectedClipIdRef.current) {
          return { ...c, rotation: resolved };
        }
        return c;
      }));

      if (!isInTransactionRef.current) {
        commitStateChange('Rotate clip', before, { ...before, canvasRotation: resolved });
      }
      return resolved;
    });
  }, []);

  const setActiveFilterId = useCallback((val: string | null | ((prev: string | null) => string | null)) => {
    const before = getProjectStateRef.current();
    setActiveFilterIdState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      if (!isInTransactionRef.current) {
        commitStateChange('Apply filter', before, { ...before, activeFilterId: resolved });
      }
      return resolved;
    });
  }, []);

  const setFilterIntensity = useCallback((val: number | ((prev: number) => number)) => {
    const before = getProjectStateRef.current();
    setFilterIntensityState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      if (!isInTransactionRef.current) {
        commitStateChange('Adjust filter intensity', before, { ...before, filterIntensity: resolved });
      }
      return resolved;
    });
  }, []);

  const setFilterOpacity = useCallback((val: number | ((prev: number) => number)) => {
    const before = getProjectStateRef.current();
    setFilterOpacityState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      if (!isInTransactionRef.current) {
        commitStateChange('Adjust filter opacity', before, { ...before, filterOpacity: resolved });
      }
      return resolved;
    });
  }, []);

  const setFilterBlendMode = useCallback((val: string | ((prev: string) => string)) => {
    const before = getProjectStateRef.current();
    setFilterBlendModeState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      if (!isInTransactionRef.current) {
        commitStateChange('Change filter blend mode', before, { ...before, filterBlendMode: resolved });
      }
      return resolved;
    });
  }, []);

  const setFilterEnabled = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    const before = getProjectStateRef.current();
    setFilterEnabledState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      if (!isInTransactionRef.current) {
        commitStateChange(resolved ? 'Enable filter' : 'Disable filter', before, { ...before, filterEnabled: resolved });
      }
      return resolved;
    });
  }, []);

  const setActiveEffectId = useCallback((val: string | null | ((prev: string | null) => string | null)) => {
    const before = getProjectStateRef.current();
    setActiveEffectIdState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      if (!isInTransactionRef.current) {
        commitStateChange('Apply effect', before, { ...before, activeEffectId: resolved });
      }
      return resolved;
    });
  }, []);

  const setEffectStrength = useCallback((val: number | ((prev: number) => number)) => {
    const before = getProjectStateRef.current();
    setEffectStrengthState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      if (!isInTransactionRef.current) {
        commitStateChange('Adjust effect strength', before, { ...before, effectStrength: resolved });
      }
      return resolved;
    });
  }, []);

  const setEffectSpeed = useCallback((val: number | ((prev: number) => number)) => {
    const before = getProjectStateRef.current();
    setEffectSpeedState((prev) => {
      const resolved = typeof val === 'function' ? val(prev) : val;
      if (!isInTransactionRef.current) {
        commitStateChange('Adjust effect speed', before, { ...before, effectSpeed: resolved });
      }
      return resolved;
    });
  }, []);

  const handleUndoAction = () => {
    const currentState = getProjectStateRef.current();
    const restored = undo(currentState);
    if (restored) {
      applyProjectStateRef.current(restored);
      showToast('Undo action');
    }
  };

  const handleRedoAction = () => {
    const currentState = getProjectStateRef.current();
    const restored = redo(currentState);
    if (restored) {
      applyProjectStateRef.current(restored);
      showToast('Redo action');
    }
  };

  // Global Keyboard Listener for Undo/Redo Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return; // Allow native field undo
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        const currentState = getProjectStateRef.current();
        if (e.shiftKey) {
          const restored = redo(currentState);
          if (restored) {
            applyProjectStateRef.current(restored);
            showToast('Redo action');
          }
        } else {
          const restored = undo(currentState);
          if (restored) {
            applyProjectStateRef.current(restored);
            showToast('Undo action');
          }
        }
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        const currentState = getProjectStateRef.current();
        const restored = redo(currentState);
        if (restored) {
          applyProjectStateRef.current(restored);
          showToast('Redo action');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);

  const handleAsideFocusIn = (e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      beginTransaction(`Edit ${target.getAttribute('placeholder') || 'properties'}`, getProjectState());
    }
  };

  const handleAsideFocusOut = (e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      commitTransaction(getProjectState());
    }
  };

  const handleAsideMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && target.getAttribute('type') === 'range') {
      beginTransaction('Adjust slider', getProjectState());
    }
  };

  const handleAsideMouseUp = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && target.getAttribute('type') === 'range') {
      commitTransaction(getProjectState());
    }
  };

  // Timeline Mouse Drag Scroll State
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const [timelineStartX, setTimelineStartX] = useState(0);
  const [timelineScrollLeft, setTimelineScrollLeft] = useState(0);

  // Helper callbacks for state modifiers
  const handleAddTextOverlay = (overlay: Omit<TextOverlay, 'id'>) => {
    const id = `txt-${Date.now()}`;
    const newOverlay = {
      id,
      ...overlay,
      time: currentTime,
      startTime: currentTime
    };
    setTextOverlays([...textOverlays, newOverlay]);
    setActiveOverlayId(id);
    showToast(`Added text at playhead position ${currentTime.toFixed(2)}s`);
  };
  const handleRemoveTextOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter((o) => o.id !== id));
  };
  const handleUpdateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays(textOverlays.map((o) => o.id === id ? { ...o, ...updates } : o));
  };

  const handleAddCaption = (caption: Omit<CaptionItem, 'id'>) => {
    const id = `cap-${Date.now()}`;
    setCaptions([...captions, { id, ...caption }]);
  };
  const handleRemoveCaption = (id: string) => {
    setCaptions(captions.filter((c) => c.id !== id));
  };
  const handleUpdateCaption = (id: string, updates: Partial<CaptionItem>) => {
    setCaptions(captions.map((c) => c.id === id ? { ...c, ...updates } : c));
  };

  const handleClipContextMenu = (e: React.MouseEvent, clip: any) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMediaId(clip.id);
  };

  const handleMenuAction = (actionId: string, clipId: string) => {
    const clip = timelineClips.find((c) => c.id === clipId);
    if (!clip) return;

    if (actionId !== 'lock' && actionId !== 'unlock') {
      if (!validateCanEdit(clipId, actionId)) {
        return;
      }
    }

    switch (actionId) {
      case 'delete':
        handleDeleteClip(clipId);
        break;
      case 'duplicate':
        handleDuplicateClip(clipId);
        break;
      case 'split':
        handleSplitClip(clipId);
        break;
      case 'lock':
      case 'unlock':
        toggleLock(clipId);
        break;
      case 'mute-audio': {
        const targetClipId = clipId || activeSelectedClip?.id;
        if (!targetClipId) break;
        const targetClip = timelineClips.find(c => c.id === targetClipId);
        const isCurrentlyMuted = !!mutedClips[targetClipId] || !!targetClip?.isMuted || !!targetClip?.muted;
        const targetMuteState = !isCurrentlyMuted;

        setMutedClips({ ...mutedClips, [targetClipId]: targetMuteState });
        setTimelineClips((prev) =>
          prev.map((c) =>
            c.id === targetClipId ? { ...c, isMuted: targetMuteState, muted: targetMuteState } : c
          )
        );
        showToast(`${targetMuteState ? 'Muted' : 'Unmuted'} audio${targetClip ? ` (${targetClip.name})` : ''}`);
        break;
      }
      case 'reverse':
        toggleReverse(clipId);
        break;
      case 'trim':
        handleTrimToPlayhead(clipId, 'start');
        break;
      case 'add-transition':
        setEffectsSubTab('transitions');
        setActiveTab('transitions');
        showToast(`Select a transition to apply to ${clip.name}`);
        break;
      case 'rename':
        openRename(clipId || clip?.id, clip?.name);
        break;
      case 'speed': {
        const targetClip = timelineClips.find((c) => c.id === clipId || c.mediaId === activeMediaId) || clip || timelineClips[0];
        if (targetClip) {
          setActiveSelectedClipId(targetClip.id);
          setActiveMediaId(targetClip.mediaId || targetClip.id);
        }
        setActiveTab('speed');
        showToast(`Opened speed adjustment for ${targetClip ? targetClip.name : 'clip'}`);
        break;
      }
      case 'extract-audio':
      case 'detach-audio':
        detachAudio(clipId || clip?.id);
        break;
      case 'freeze-frame':
        freezeFrame(clipId || clip?.id);
        break;
      case 'keyframes': {
        const targetClip = timelineClips.find((c) => c.id === clipId || c.mediaId === activeMediaId) || clip || timelineClips[0];
        if (targetClip) {
          setActiveSelectedClipId(targetClip.id);
          setActiveMediaId(targetClip.mediaId || targetClip.id);
        }
        setActiveTab('keyframes');
        showToast(`Keyframe inspector opened for ${targetClip ? targetClip.name : 'clip'}`);
        break;
      }
      case 'overlap': {
        const targetClip = timelineClips.find((c) => c.id === clipId) || clip;
        if (!targetClip) return;
        beginTransaction('Toggle overlap track', getProjectState());
        
        const nextTrackId = targetClip.trackId === 'overlay' ? 'video' : 'overlay';
        let updatedClips = timelineClips.map((c) => {
          if (c.id === targetClip.id) {
            return nextTrackId === 'overlay'
              ? OverlapUtils.convertToOverlay(c)
              : OverlapUtils.convertToMain(c);
          }
          return c;
        });

        updatedClips = recalculateSequence(updatedClips);
        setTimelineClips(updatedClips);
        commitTransaction(getProjectState());
        
        showToast(nextTrackId === 'overlay' ? `Moved ${targetClip.name} to Overlay` : `Moved ${targetClip.name} to Main Track`);
        setActiveSelectedClipId(targetClip.id);
        break;
      }
      case 'replace-media':
        const clipToReplace = timelineClips.find(c => c.id === clipId || c.mediaId === activeMediaId) || timelineClips[0];
        if (!clipToReplace) {
          showToast('Select a clip to replace.');
          return;
        }
        setActiveMediaId(clipToReplace.mediaId);
        setActiveTab('replace');
        showToast(`Replace media source for ${clipToReplace.name}`);
        break;
      default:
        showToast(`Action trigger: ${actionId}`);
    }
  };

  const handleReplaceMedia = (
    clipId: string,
    newMedia: ReplaceMediaPayload
  ) => {
    const targetClip = timelineClips.find(c => c.id === clipId || c.mediaId === clipId);
    if (!targetClip) {
      showToast('Select a clip to replace.');
      return;
    }

    const beforeState = getProjectState();

    try {
      setTimelineClipsState((prevClips) => {
        const newBaseDuration = newMedia.duration || targetClip.baseDuration || targetClip.duration || 5;
        const updatedClips = prevClips.map((clip) => {
          if (clip.id === targetClip.id) {
            return {
              ...clip,
              mediaId: newMedia.mediaId,
              url: newMedia.url,
              name: newMedia.name,
              thumbnails: newMedia.thumbnails && newMedia.thumbnails.length > 0 ? newMedia.thumbnails : clip.thumbnails,
              baseDuration: newBaseDuration,
              duration: Math.min(clip.duration, newBaseDuration)
            };
          }
          // Synchronize linked audio clip if media is replaced
          const isLinkedAudio = clip.sourceVideoId === targetClip.id || clip.id === `detached-audio-${targetClip.id}` || (clip.mediaId === targetClip.mediaId && clip.isDetachedAudio);
          if (isLinkedAudio) {
            return {
              ...clip,
              mediaId: newMedia.mediaId,
              url: newMedia.url,
              name: `Audio - ${newMedia.name}`,
              baseDuration: newBaseDuration,
              duration: Math.min(clip.duration, newBaseDuration)
            };
          }
          return clip;
        });
        return updatedClips;
      });

      setActiveMediaId(newMedia.mediaId);

      const afterState = {
        ...beforeState,
        timelineClips: timelineClips.map(c => c.id === targetClip.id ? { ...c, mediaId: newMedia.mediaId, url: newMedia.url, name: newMedia.name } : c)
      };

      commitStateChange(`Replace media source for ${targetClip.name}`, beforeState, afterState);
      showToast(`Replaced media source for "${targetClip.name}"`);
    } catch (err) {
      console.error('Failed to replace media:', err);
      setTimelineClipsState(beforeState.timelineClips);
      showToast('Failed to replace media. Original clip restored.');
    }
  };

  const activeMedia = mediaFiles.find((m) => m.id === activeMediaId) || mediaFiles[0];

  // Auto-load first clip on mount and ensure playhead is at 00:00:00
  useEffect(() => {
    if (mediaFiles.length > 0 && !activeMediaId) {
      setActiveMediaId(mediaFiles[0].id);
    }
  }, [mediaFiles, activeMediaId, setActiveMediaId]);

  // Declarative sync of volume, muted, and speed states across all video elements
  useEffect(() => {
    timelineClips.forEach((clip) => {
      const video = videoRefs.current[clip.id];
      if (video) {
        const isVideoMuted = isMuted || !!mutedClips[clip.id] || !!clip.isMuted || !!clip.isAudioDetached || !!clip.audioDetached || clip.embeddedAudioEnabled === false;
        video.muted = isVideoMuted;
        video.volume = isVideoMuted ? 0 : Math.min(1, Math.max(0, volume * (clip.volume ?? 1)));
      }
    });
  }, [volume, isMuted, mutedClips, timelineClips]);

  useEffect(() => {
    timelineClips.forEach((clip) => {
      const video = videoRefs.current[clip.id];
      if (video) {
        const rate = clampPlaybackRate(clip.playbackRate ?? 1);
        video.playbackRate = rate;
        video.defaultPlaybackRate = rate;
        video.preservesPitch = true;
      }
    });
  }, [timelineClips]);

  // Pre-seek video elements to their clip startOffset so they are immediately ready for playback
  useEffect(() => {
    if (!isPlaying) {
      timelineClips.forEach((clip) => {
        const video = videoRefs.current[clip.id];
        const isActiveOrSelected = clip.id === activeSelectedClipId || (currentTime >= clip.timelineStart && currentTime < clip.timelineStart + clip.duration);
        if (video && !video.seeking && !isActiveOrSelected) {
          const targetTime = timelineTimeToSourceTime(clip, clip.timelineStart);
          if (Math.abs(video.currentTime - targetTime) > 0.08) {
            try {
              video.currentTime = targetTime;
            } catch {}
          }
        }
      });
    }
  }, [timelineClips, isPlaying, activeSelectedClipId, currentTime]);

  // Clean up videoRefs
  useEffect(() => {
    const activeIds = new Set(timelineClips.map((c) => c.id));
    Object.keys(videoRefs.current).forEach((id) => {
      if (!activeIds.has(id)) {
        delete videoRefs.current[id];
      }
    });
  }, [timelineClips]);

  // Keyframe interpolation and transform synchronization handler
  useEffect(() => {
    const targetClip = activeSelectedClip || timelineClips.find(c => c.id === activeSelectedClipId) || null;
    if (targetClip) {
      const kfs = targetClip.keyframes || [];
      if (kfs.length > 0) {
        const localTime = Math.max(0, currentTime - targetClip.timelineStart);
        const kfProps = interpolateAllProperties(kfs, localTime);

        if (hasKeyframeForProperty(kfs, 'scale')) {
          setCanvasScaleState(kfProps.scale);
        }
        if (hasKeyframeForProperty(kfs, 'rotation')) {
          setCanvasRotationState(kfProps.rotation);
        }
        setCanvasPosState(prev => ({
          x: hasKeyframeForProperty(kfs, 'positionX') ? kfProps.positionX : prev.x,
          y: hasKeyframeForProperty(kfs, 'positionY') ? kfProps.positionY : prev.y
        }));
      }
    }
  }, [currentTime, timelineClips, activeSelectedClipId]);

  // Selection change reset handler
  const prevSelectedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (activeSelectedClipId !== prevSelectedIdRef.current) {
      prevSelectedIdRef.current = activeSelectedClipId;
      const targetClip = timelineClips.find(c => c.id === activeSelectedClipId);
      if (targetClip) {
        const kfs = targetClip.keyframes || [];
        const baseScale = targetClip.scale ?? (targetClip.trackId === 'overlay' ? 0.75 : 1.0);
        const baseRotation = targetClip.rotation ?? 0.0;
        const basePosX = targetClip.posX ?? (targetClip.position?.x ?? 0.0);
        const basePosY = targetClip.posY ?? (targetClip.position?.y ?? 0.0);

        if (kfs.length > 0) {
          const localTime = Math.max(0, currentTime - targetClip.timelineStart);
          const kfProps = interpolateAllProperties(kfs, localTime);
          setCanvasScaleState(kfProps.scale);
          setCanvasRotationState(kfProps.rotation);
          setCanvasPosState({ x: kfProps.positionX, y: kfProps.positionY });
        } else {
          setCanvasScaleState(baseScale);
          setCanvasRotationState(baseRotation);
          setCanvasPosState({ x: basePosX, y: basePosY });
        }
      }
    }
  }, [activeSelectedClipId, timelineClips]);

  // Video playback time update handler
  const handleTimeUpdate = (clipId: string) => {
    if (isPlaying) return; // Let updateLoop handle playhead updates at 60fps when playing
    const clip = timelineClips.find((c) => c.id === clipId);
    const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
    const activeClip = timelineClips.find(
      (c) => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration
    ) || (currentTime >= totalDur ? timelineClips[timelineClips.length - 1] : timelineClips[0]);

    if (clip && activeClip?.id === clip.id) {
      const video = videoRefs.current[clipId];
      if (video && !video.seeking) {
        const absoluteTime = sourceTimeToTimelineTime(clip, video.currentTime);
        setCurrentTime(absoluteTime);

        // Keep timeline scroll in sync during manual seeks / pauses
        if (timelineScrollRef.current) {
          const pxPerSec = (zoomLevel / 100) * 35;
          timelineScrollRef.current.scrollLeft = absoluteTime * pxPerSec;
        }
      }
    }
  };

  const handleClipEnded = (clipId: string) => {
    const videoClipsOnly = timelineClips.filter(
      (c) => c.trackId !== 'audio' && c.trackId !== 'music' && c.type !== 'audio' && !c.isDetachedAudio
    );
    const clip = videoClipsOnly.find((c) => c.id === clipId);
    const totalDur = timelineClips.reduce((acc, c) => Math.max(acc, (c.timelineStart ?? c.start ?? 0) + c.duration), 0) || 5;
    const activeClip = videoClipsOnly.find(
      (c) => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration
    ) || videoClipsOnly[0];

    if (clip && activeClip?.id === clip.id) {
      const currentClipIndex = videoClipsOnly.findIndex((c) => c.id === clip.id);
      if (currentClipIndex !== -1 && currentClipIndex < videoClipsOnly.length - 1) {
        const nextClip = videoClipsOnly[currentClipIndex + 1];
        const nextVideo = videoRefs.current[nextClip.id];
        if (nextVideo) {
          nextVideo.currentTime = nextClip.startOffset;
          if (isPlaying) {
            nextVideo.play().catch(() => { });
          }
        }
        setActiveMediaId(nextClip.mediaId);
        setCurrentTime(nextClip.timelineStart);
      } else {
        // Last clip ended
        setIsPlaying(false);
        currentTimeRef.current = totalDur;
        setCurrentTime(totalDur);
        syncAudioClips(totalDur, false);
        showToast('Video playback completed');
      }
    }
  };

  const currentTimeRef = useRef(currentTime);
  const preWarmingClipIdRef = useRef<string | null>(null);
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    if (!isPlaying) {
      reversedAudioEngine.stopReversedAudio();
    }
  }, [isPlaying]);

  const syncAudioClips = useCallback((targetTime: number, isPlayingNow: boolean) => {
    timelineClips.forEach((clip) => {
      if (clip.trackId === 'audio' || clip.trackId === 'music' || clip.type === 'audio' || clip.isDetachedAudio) {
        const audioEl = audioRefs.current[clip.id];
        if (!audioEl) return;

        const clipStart = clip.timelineStart ?? clip.start ?? 0;
        const clipRelTime = Math.max(0, targetTime - clipStart);
        let kfVolume = 1;
        if (hasKeyframeForProperty(clip.keyframes, 'volume')) {
          kfVolume = interpolatePropertyValue(clip.keyframes, 'volume', clipRelTime, 1);
        }

        const isClipMuted = isMuted || !!mutedClips[clip.id] || !!clip.isMuted;
        audioEl.muted = isClipMuted;
        audioEl.volume = isClipMuted ? 0 : Math.min(1, Math.max(0, volume * (clip.volume ?? 1) * kfVolume));
        audioEl.playbackRate = clip.playbackRate || clip.speed || 1;

        const clipEnd = clipStart + clip.duration;
        const isInside = targetTime >= clipStart && targetTime < clipEnd;

        if (isInside && isPlayingNow) {
          const expectedLocalTime = (targetTime - clipStart) * (clip.playbackRate || 1) + (clip.startOffset || 0);
          if (audioEl.paused) {
            audioEl.currentTime = expectedLocalTime;
            audioEl.play().catch(() => { });
          } else if (Math.abs(audioEl.currentTime - expectedLocalTime) > 0.25) {
            audioEl.currentTime = expectedLocalTime;
          }
        } else {
          if (!audioEl.paused) {
            audioEl.pause();
          }
          if (isInside) {
            const expectedLocalTime = (targetTime - clipStart) * (clip.playbackRate || 1) + (clip.startOffset || 0);
            if (Math.abs(audioEl.currentTime - expectedLocalTime) > 0.05) {
              audioEl.currentTime = expectedLocalTime;
            }
          }
        }
      }
    });
  }, [timelineClips, isMuted, mutedClips, volume]);

  useEffect(() => {
    syncAudioClips(currentTime, isPlaying);
  }, [volume, isMuted, mutedClips, syncAudioClips, currentTime, isPlaying]);

  // Smooth 60 FPS playhead tracking and auto-follow scrolling loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const updateLoop = (now: number) => {
      const deltaSec = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      if (isPlaying) {
        const totalDur = timelineClips.reduce((acc, c) => Math.max(acc, (c.timelineStart ?? c.start ?? 0) + c.duration), 0) || 5;
        const curTime = currentTimeRef.current;

        const videoClipsOnly = timelineClips.filter(
          (c) => c.trackId !== 'audio' && c.trackId !== 'music' && c.type !== 'audio' && !c.isDetachedAudio
        );

        const activeClip = videoClipsOnly.find(
          (c) => curTime >= c.timelineStart && curTime < c.timelineStart + c.duration
        ) || (curTime >= totalDur ? videoClipsOnly[videoClipsOnly.length - 1] : videoClipsOnly[0]);

        if (activeClip) {
          const video = videoRefs.current[activeClip.id];

          if (activeClip.isReversed) {
            // REVERSED CLIP PLAYBACK ENGINE - Hardware throttled to prevent decoder thrashing
            if (video && !video.paused) {
              video.pause();
            }

            const relativeTime = Math.max(0, curTime - activeClip.timelineStart);
            const clipVol = isMuted || !!mutedClips[activeClip.id] ? 0 : volume;
            const mediaSource = getClipMediaSource(activeClip);

            reversedAudioEngine.playReversedAudio(
              activeClip.id,
              mediaSource,
              relativeTime,
              activeClip.duration,
              clipVol,
              activeClip.playbackRate || activeClip.speed || 1
            );

            const speed = activeClip.playbackRate || activeClip.speed || 1;
            const nextTime = curTime + deltaSec * speed;

            if (nextTime >= totalDur) {
              setIsPlaying(false);
              currentTimeRef.current = totalDur;
              setCurrentTime(totalDur);
              syncAudioClips(totalDur, false);
              if (video) video.pause();
              reversedAudioEngine.stopReversedAudio();
              showToast('Video playback completed');
              return;
            }

            currentTimeRef.current = nextTime;
            setCurrentTime(nextTime);
            syncAudioClips(nextTime, true);

            if (video && !video.seeking) {
              const targetSourceTime = timelineTimeToSourceTime(activeClip, nextTime);
              if (Math.abs(video.currentTime - targetSourceTime) >= 0.033) {
                if ('fastSeek' in video && typeof (video as any).fastSeek === 'function') {
                  try {
                    (video as any).fastSeek(targetSourceTime);
                  } catch {
                    video.currentTime = targetSourceTime;
                  }
                } else {
                  video.currentTime = targetSourceTime;
                }
              }
            }

            if (timelineScrollRef.current) {
              const pxPerSec = (zoomLevel / 100) * 35;
              timelineScrollRef.current.scrollLeft = nextTime * pxPerSec;
            }
          } else {
            // FORWARD CLIP PLAYBACK ENGINE
            const isFreezeOrImage = activeClip.isFreezeFrame || activeClip.type === 'image' || activeClip.type === 'freeze' || (activeClip.url && (activeClip.url.startsWith('data:image/') || activeClip.url.endsWith('.png') || activeClip.url.endsWith('.jpg') || activeClip.url.endsWith('.jpeg') || activeClip.url.endsWith('.webp')));

            if (isFreezeOrImage || !video) {
              // STILL IMAGE / FREEZE CLIP PLAYBACK ENGINE - Advance time using deltaSec
              timelineClips.forEach((c) => {
                const v = videoRefs.current[c.id];
                if (v && !v.paused) {
                  v.pause();
                }
              });

              const speed = activeClip.playbackRate || activeClip.speed || 1;
              const nextTime = curTime + deltaSec * speed;

              if (nextTime >= totalDur) {
                setIsPlaying(false);
                currentTimeRef.current = totalDur;
                setCurrentTime(totalDur);
                syncAudioClips(totalDur, false);
                showToast('Video playback completed');
                return;
              }

              currentTimeRef.current = nextTime;
              setCurrentTime(nextTime);
              syncAudioClips(nextTime, true);

              if (timelineScrollRef.current) {
                const pxPerSec = (zoomLevel / 100) * 35;
                timelineScrollRef.current.scrollLeft = nextTime * pxPerSec;
              }

              if (nextTime >= activeClip.timelineStart + activeClip.duration) {
                const currentClipIndex = videoClipsOnly.findIndex((c) => c.id === activeClip.id);
                if (currentClipIndex !== -1 && currentClipIndex < videoClipsOnly.length - 1) {
                  const nextClip = videoClipsOnly[currentClipIndex + 1];
                  const nextVideo = videoRefs.current[nextClip.id];
                  if (nextVideo) {
                    const nextTarget = timelineTimeToSourceTime(nextClip, nextClip.timelineStart);
                    nextVideo.currentTime = nextTarget;
                    if (!nextClip.isReversed && !nextClip.isFreezeFrame && nextClip.type !== 'image' && nextClip.type !== 'freeze') {
                      nextVideo.play().catch(() => { });
                    }
                  }
                  setActiveSelectedClipId(nextClip.id);
                  setActiveMediaId(nextClip.mediaId);
                  currentTimeRef.current = nextClip.timelineStart;
                  setCurrentTime(nextClip.timelineStart);
                } else {
                  setIsPlaying(false);
                  currentTimeRef.current = totalDur;
                  setCurrentTime(totalDur);
                  syncAudioClips(totalDur, false);
                  showToast('Video playback completed');
                }
              }
            } else if (video) {
              if (video.paused && !video.seeking) {
                const activeOverlayClips = timelineClips.filter((c) => 
                  c.trackId === 'overlay' && curTime >= c.timelineStart && curTime < c.timelineStart + c.duration
                );
                const activeIds = new Set([activeClip.id, ...activeOverlayClips.map(c => c.id)]);

                timelineClips.forEach((c) => {
                  const v = videoRefs.current[c.id];
                  if (v) {
                    if (activeIds.has(c.id)) {
                      if (v.paused && !v.seeking && !c.isReversed && !c.isFreezeFrame && c.type !== 'image' && c.type !== 'freeze') {
                        v.currentTime = timelineTimeToSourceTime(c, curTime);
                        v.play().catch(() => {});
                      }
                    } else {
                      v.pause();
                    }
                  }
                });
                const targetLocalTime = timelineTimeToSourceTime(activeClip, curTime);
                video.currentTime = targetLocalTime;
                video.play().catch(() => { });
              } else if (!video.seeking) {
                const absoluteTime = sourceTimeToTimelineTime(activeClip, video.currentTime);
                currentTimeRef.current = absoluteTime;
                setCurrentTime(absoluteTime);
                syncAudioClips(absoluteTime, true);

                // Drift check and synchronization for overlays
                timelineClips.forEach((c) => {
                  if (c.trackId === 'overlay' && c.id !== activeClip.id) {
                    const v = videoRefs.current[c.id];
                    if (v && c.type !== 'image' && c.type !== 'freeze' && !c.isFreezeFrame) {
                      const isActive = absoluteTime >= c.timelineStart && absoluteTime < c.timelineStart + c.duration;
                      if (isActive) {
                        if (v.paused && !v.seeking && !c.isReversed) {
                          v.currentTime = timelineTimeToSourceTime(c, absoluteTime);
                          v.play().catch(() => {});
                        } else if (!v.seeking && !v.paused) {
                          const expectedLocalTime = timelineTimeToSourceTime(c, absoluteTime);
                          if (Math.abs(v.currentTime - expectedLocalTime) > 0.15) {
                            v.currentTime = expectedLocalTime;
                          }
                        }
                      } else if (!v.paused) {
                        v.pause();
                      }
                    }
                  }
                });

                if (timelineScrollRef.current) {
                  const pxPerSec = (zoomLevel / 100) * 35;
                  timelineScrollRef.current.scrollLeft = absoluteTime * pxPerSec;
                }

                if (absoluteTime >= totalDur) {
                  video.pause();
                  setIsPlaying(false);
                  currentTimeRef.current = totalDur;
                  setCurrentTime(totalDur);
                  syncAudioClips(totalDur, false);
                  showToast('Video playback completed');
                  return;
                }

                const currentClipIndex = videoClipsOnly.findIndex((c) => c.id === activeClip.id);
                if (currentClipIndex !== -1 && currentClipIndex < videoClipsOnly.length - 1) {
                  const nextClip = videoClipsOnly[currentClipIndex + 1];
                  const nextVideo = videoRefs.current[nextClip.id];
                  const timeUntilEnd = (activeClip.timelineStart + activeClip.duration) - absoluteTime;

                  if (nextVideo) {
                    const nextTarget = timelineTimeToSourceTime(nextClip, nextClip.timelineStart);

                    // Pre-seek next clip if within 1.5s of split boundary
                    if (timeUntilEnd <= 1.5 && !nextVideo.seeking && Math.abs(nextVideo.currentTime - nextTarget) > 0.05) {
                      nextVideo.currentTime = nextTarget;
                    }

                    // Pre-warm next video element 0.4s (400ms) in advance
                    if (timeUntilEnd <= 0.4 && !nextClip.isReversed && !nextClip.isFreezeFrame && nextClip.type !== 'image' && nextClip.type !== 'freeze') {
                      preWarmingClipIdRef.current = nextClip.id;
                      if (nextVideo.paused) {
                        nextVideo.muted = true; // Mute audio during pre-warm so sound doesn't overlap early
                        nextVideo.play().catch(() => {});
                      }
                    }
                  }

                  if (absoluteTime >= activeClip.timelineStart + activeClip.duration) {
                    if (nextVideo) {
                      const nextTarget = timelineTimeToSourceTime(nextClip, nextClip.timelineStart);
                      if (Math.abs(nextVideo.currentTime - nextTarget) > 0.05 && !nextVideo.seeking) {
                        nextVideo.currentTime = nextTarget;
                      }
                      const isNextVideoMuted = isMuted || !!mutedClips[nextClip.id] || !!nextClip.isMuted || !!nextClip.isAudioDetached || !!nextClip.audioDetached || nextClip.embeddedAudioEnabled === false;
                      nextVideo.muted = isNextVideoMuted;
                      nextVideo.volume = isNextVideoMuted ? 0 : Math.min(1, Math.max(0, volume * (nextClip.volume ?? 1)));
                      if (nextVideo.paused && !nextClip.isReversed && !nextClip.isFreezeFrame && nextClip.type !== 'image' && nextClip.type !== 'freeze') {
                        nextVideo.play().catch(() => {});
                      }
                    }
                    preWarmingClipIdRef.current = null;
                    const prevVideo = video;
                    setTimeout(() => {
                      if (prevVideo && prevVideo !== videoRefs.current[nextClip.id]) {
                        prevVideo.pause();
                      }
                    }, 50);

                    setActiveSelectedClipId(nextClip.id);
                    setActiveMediaId(nextClip.mediaId);
                    currentTimeRef.current = nextClip.timelineStart;
                    setCurrentTime(nextClip.timelineStart);
                  }
                } else if (absoluteTime >= activeClip.timelineStart + activeClip.duration) {
                  video.pause();
                  setIsPlaying(false);
                  currentTimeRef.current = totalDur;
                  setCurrentTime(totalDur);
                  syncAudioClips(totalDur, false);
                  showToast('Video playback completed');
                }
              }
            }
          }
        }

        animationFrameId = requestAnimationFrame(updateLoop);
      }
    };

    if (isPlaying) {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(updateLoop);
    } else {
      reversedAudioEngine.stopReversedAudio();
      syncAudioClips(currentTimeRef.current, false);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      reversedAudioEngine.stopReversedAudio();
    };
  }, [isPlaying, timelineClips, zoomLevel, setActiveMediaId, syncAudioClips]);

  const getClipMediaSource = (clip: any): File | Blob | string => {
    if (!clip) return '';
    const media = mediaFiles.find((m) => m.id === clip.mediaId || m.id === clip.id);
    if (media && media.file) return media.file;
    if (clip.url) return clip.url;
    if (media && media.url) return media.url;
    const vid = videoRefs.current[clip.id];
    if (vid) {
      if (vid.currentSrc) return vid.currentSrc;
      if (vid.src) return vid.src;
    }
    return '';
  };

  const togglePlay = () => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);
    syncAudioClips(currentTime, nextPlaying);

    const activeVideoClips = timelineClips.filter((c) => 
      c.trackId !== 'audio' && c.trackId !== 'music' && c.type !== 'audio' && !c.isDetachedAudio &&
      currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration
    );
    const activeIds = new Set(activeVideoClips.map(c => c.id));

    if (nextPlaying) {
      timelineClips.forEach((c) => {
        const v = videoRefs.current[c.id];
        if (v) {
          if (activeIds.has(c.id)) {
            const targetLocalTime = timelineTimeToSourceTime(c, currentTime);
            v.currentTime = targetLocalTime;
            if (c.isReversed) {
              v.pause();
              const relTime = Math.max(0, currentTime - c.timelineStart);
              const clipVol = isMuted || mutedClips[c.id] ? 0 : volume;
              const mediaSource = getClipMediaSource(c);
              reversedAudioEngine.playReversedAudio(
                c.id,
                mediaSource,
                relTime,
                c.duration,
                clipVol,
                c.playbackRate || c.speed || 1
              );
            } else {
              reversedAudioEngine.stopReversedAudio();
              v.play().catch(() => { });
            }
          } else {
            v.pause();
          }
        }
      });
    } else {
      timelineClips.forEach((c) => {
        const v = videoRefs.current[c.id];
        if (v) v.pause();
      });
      reversedAudioEngine.stopReversedAudio();
    }
  };

  const handleSeek = (time: number, scrollViewport = false) => {
    if (timelineClips.length === 0) {
      setCurrentTime(time);
      return;
    }

    const totalDur = timelineClips.reduce((acc, c) => Math.max(acc, (c.timelineStart ?? c.start ?? 0) + c.duration), 0) || 5;
    const clampedTime = Math.min(totalDur, Math.max(0, time));

    setCurrentTime(clampedTime);
    syncAudioClips(clampedTime, isPlaying);
    if (scrollViewport && timelineScrollRef.current) {
      const pxPerSec = (zoomLevel / 100) * 35;
      timelineScrollRef.current.scrollLeft = clampedTime * pxPerSec;
    }

    const activeVideoClips = timelineClips.filter((c) => 
      c.trackId !== 'audio' && c.trackId !== 'music' && c.type !== 'audio' && !c.isDetachedAudio &&
      clampedTime >= c.timelineStart && clampedTime < c.timelineStart + c.duration
    );
    const activeIds = new Set(activeVideoClips.map(c => c.id));

    timelineClips.forEach((c) => {
      const v = videoRefs.current[c.id];
      if (v) {
        if (activeIds.has(c.id)) {
          const localTime = Math.max(
            c.startOffset,
            Math.min(
              c.startOffset + getSourceDuration(c) - 0.05,
              timelineTimeToSourceTime(c, clampedTime)
            )
          );
          if (!v.seeking) {
            if ('fastSeek' in v && typeof (v as any).fastSeek === 'function') {
              try {
                (v as any).fastSeek(localTime);
              } catch {
                v.currentTime = localTime;
              }
            } else {
              v.currentTime = localTime;
            }
          }
          if (isPlaying) {
            if (c.isReversed) {
              v.pause();
              const relTime = Math.max(0, clampedTime - c.timelineStart);
              const clipVol = isMuted || mutedClips[c.id] ? 0 : volume;
              const mediaSource = getClipMediaSource(c);
              reversedAudioEngine.playReversedAudio(
                c.id,
                mediaSource,
                relTime,
                c.duration,
                clipVol,
                c.playbackRate || c.speed || 1
              );
            } else {
              reversedAudioEngine.stopReversedAudio();
              v.play().catch(() => { });
            }
          } else {
            v.pause();
          }
        } else {
          v.pause();
        }
      }
    });

    const primaryActiveClip = activeVideoClips.find(c => c.trackId !== 'overlay') || activeVideoClips[0];
    if (primaryActiveClip && activeMediaId !== primaryActiveClip.mediaId) {
      setActiveMediaId(primaryActiveClip.mediaId);
    }
  };

  // Keyboard navigation shortcuts: Space (Play/Pause), Left Arrow (Rewind 1s), Right Arrow (Forward 1s)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(Math.max(0, currentTime - 1));
      } else if (e.code === 'ArrowRight') {
        const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
        e.preventDefault();
        handleSeek(Math.min(totalDur, currentTime + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, timelineClips, isPlaying]);

  // Compute CSS filter/transform/opacity for rendering transitions live in preview window
  const getTransitionStatesForClips = () => {
    const states: Record<string, { display: boolean; opacity: number; filter: string; transform: string; zIndex: number }> = {};
    let overlayColor: string | null = null;

    const videoClipsOnly = timelineClips.filter(
      (c) => c.trackId !== 'audio' && c.trackId !== 'music' && c.type !== 'audio' && !c.isDetachedAudio
    );
    const totalDur = getProjectTotalDuration(videoClipsOnly);
    const activeClip = videoClipsOnly.find(c => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration) ||
      (currentTime >= totalDur ? videoClipsOnly[videoClipsOnly.length - 1] : videoClipsOnly[0]);

    const currentClipIndex = videoClipsOnly.findIndex(c => c.id === activeClip?.id);
    const prevClip = currentClipIndex > 0 ? videoClipsOnly[currentClipIndex - 1] : null;
    const isNearBoundaryStart = activeClip && prevClip && (currentTime - activeClip.timelineStart < 0.1);

    timelineClips.forEach(c => {
      const isMainActive = activeClip?.id === c.id;
      const isPrevOverlap = isNearBoundaryStart && prevClip?.id === c.id;
      states[c.id] = {
        display: isMainActive || isPrevOverlap,
        opacity: 1,
        filter: '',
        transform: '',
        zIndex: isMainActive ? 2 : (isPrevOverlap ? 1 : 0)
      };
    });

    for (let i = 0; i < videoClipsOnly.length - 1; i++) {
      const clipA = videoClipsOnly[i];
      const clipB = videoClipsOnly[i + 1];
      const t_boundary = clipA.timelineStart + clipA.duration;
      const halfDur = 0.5;

      if (clipA.appliedTransition && Math.abs(currentTime - t_boundary) <= halfDur) {
        const progress = Math.max(0, Math.min(1, (currentTime - (t_boundary - halfDur)) / (halfDur * 2)));

        const tItem = SAMPLE_TRANSITIONS_NEW.find(t => t.id === clipA.appliedTransition);
        const keywordsStr = (tItem?.keywords || []).join(' ');
        const typeStr = (clipA.appliedTransition + ' ' + (tItem?.name || '') + ' ' + (tItem?.category || '') + ' ' + keywordsStr + ' ' + (tItem?.direction || '')).toLowerCase();

        states[clipA.id] = { ...states[clipA.id], display: true, zIndex: 10 };
        states[clipB.id] = { ...states[clipB.id], display: true, zIndex: 11 };

        // 1. Dip to Black / Dark
        if (typeStr.includes('black') || typeStr.includes('dark')) {
          if (progress <= 0.5) {
            states[clipA.id].opacity = 1 - progress * 2;
            states[clipB.id].opacity = 0;
          } else {
            states[clipA.id].opacity = 0;
            states[clipB.id].opacity = (progress - 0.5) * 2;
          }
          overlayColor = `rgba(0, 0, 0, ${Math.sin(progress * Math.PI)})`;
        }
        // 2. White Flash / Bright Cut
        else if (typeStr.includes('white') || typeStr.includes('flash') || typeStr.includes('bright')) {
          states[clipA.id].opacity = 1 - progress;
          states[clipB.id].opacity = progress;
          overlayColor = `rgba(255, 255, 255, ${Math.sin(progress * Math.PI) * 0.9})`;
        }
        // 3. Zoom Out / Pull Out / Shrink
        else if (typeStr.includes('out') || typeStr.includes('pull') || typeStr.includes('shrink') || typeStr.includes('back')) {
          states[clipA.id].transform = `scale(${1 - progress * 0.4})`;
          states[clipB.id].transform = `scale(${1.4 - progress * 0.4})`;
          states[clipA.id].opacity = 1 - progress;
          states[clipB.id].opacity = progress;
        }
        // 4. Zoom In / Crash Zoom / Push In / Punch / Snap Zoom
        else if (typeStr.includes('zoom') || typeStr.includes('push') || typeStr.includes('crash') || typeStr.includes('snap') || typeStr.includes('punch') || typeStr.includes('dolly') || typeStr.includes('perspective') || typeStr.includes('tunnel')) {
          states[clipA.id].transform = `scale(${1 + progress * 0.5})`;
          states[clipB.id].transform = `scale(${0.5 + progress * 0.5})`;
          states[clipA.id].opacity = 1 - progress;
          states[clipB.id].opacity = progress;
        }
        // 5. Slide / Push / Wipe / Swipe / Cover
        else if (typeStr.includes('slide') || typeStr.includes('swipe') || typeStr.includes('wipe') || typeStr.includes('card') || typeStr.includes('gallery') || typeStr.includes('move')) {
          const isVert = typeStr.includes('up') || typeStr.includes('down');
          const isReverse = typeStr.includes('right') || typeStr.includes('down');
          const factor = isReverse ? 1 : -1;

          if (isVert) {
            states[clipA.id].transform = `translateY(${progress * 100 * factor}%)`;
            states[clipB.id].transform = `translateY(${(1 - progress) * -100 * factor}%)`;
          } else {
            states[clipA.id].transform = `translateX(${progress * 100 * factor}%)`;
            states[clipB.id].transform = `translateX(${(1 - progress) * -100 * factor}%)`;
          }
          states[clipA.id].opacity = 1;
          states[clipB.id].opacity = 1;
        }
        // 6. Spin / Rotate / Roll / Orbit
        else if (typeStr.includes('spin') || typeStr.includes('rotate') || typeStr.includes('roll') || typeStr.includes('barrel') || typeStr.includes('orbit') || typeStr.includes('helix')) {
          const isCCW = typeStr.includes('ccw') || typeStr.includes('counter');
          const dir = isCCW ? -1 : 1;
          states[clipA.id].transform = `rotate(${progress * 180 * dir}deg) scale(${1 - progress * 0.3})`;
          states[clipB.id].transform = `rotate(${(progress - 1) * 180 * dir}deg) scale(${0.7 + progress * 0.3})`;
          states[clipA.id].opacity = 1 - progress;
          states[clipB.id].opacity = progress;
        }
        // 7. Flip / Page Curl / Cube / 3D
        else if (typeStr.includes('flip') || typeStr.includes('page') || typeStr.includes('cube')) {
          states[clipA.id].transform = `perspective(800px) rotateY(${progress * 90}deg)`;
          states[clipB.id].transform = `perspective(800px) rotateY(${(1 - progress) * -90}deg)`;
          states[clipA.id].opacity = 1 - progress;
          states[clipB.id].opacity = progress;
        }
        // 8. Whip Pan / Fast Pan
        else if (typeStr.includes('whip') || typeStr.includes('pan')) {
          const blurPx = Math.sin(progress * Math.PI) * 20;
          const translateVal = (progress - 0.5) * 240;
          states[clipA.id].filter = `blur(${blurPx}px)`;
          states[clipB.id].filter = `blur(${blurPx}px)`;
          states[clipA.id].transform = `translateX(${-translateVal}px)`;
          states[clipB.id].transform = `translateX(${240 - translateVal}px)`;
          states[clipA.id].opacity = 1 - progress;
          states[clipB.id].opacity = progress;
        }
        // 9. Camera Shake / Jitter / Rumble
        else if (typeStr.includes('shake') || typeStr.includes('jitter') || typeStr.includes('rumble') || typeStr.includes('handheld')) {
          const shakeX = Math.sin(progress * 80) * 20 * Math.sin(progress * Math.PI);
          const shakeY = Math.cos(progress * 60) * 15 * Math.sin(progress * Math.PI);
          states[clipA.id].transform = `translate(${shakeX}px, ${shakeY}px)`;
          states[clipB.id].transform = `translate(${-shakeX}px, ${-shakeY}px)`;
          states[clipA.id].opacity = 1 - progress;
          states[clipB.id].opacity = progress;
        }
        // 10. Blur / Defocus
        else if (typeStr.includes('blur') || typeStr.includes('defocus') || typeStr.includes('soft')) {
          const blurPx = Math.sin(progress * Math.PI) * 24;
          states[clipA.id].filter = `blur(${blurPx}px)`;
          states[clipB.id].filter = `blur(${blurPx}px)`;
          states[clipA.id].opacity = 1 - progress;
          states[clipB.id].opacity = progress;
        }
        // 11. Glitch / Signal Loss / CRT / VHS / Distortion
        else if (typeStr.includes('glitch') || typeStr.includes('static') || typeStr.includes('loss') || typeStr.includes('error') || typeStr.includes('crash') || typeStr.includes('storm') || typeStr.includes('vhs') || typeStr.includes('crt') || typeStr.includes('distortion')) {
          const glitchShift = (Math.sin(progress * 50) > 0.2 ? (Math.random() - 0.5) * 35 : 0);
          const hue = Math.sin(progress * Math.PI) * 120;
          states[clipA.id].filter = `hue-rotate(${hue}deg) contrast(1.5)`;
          states[clipB.id].filter = `hue-rotate(${-hue}deg) contrast(1.5)`;
          states[clipA.id].transform = `translateX(${glitchShift}px)`;
          states[clipB.id].transform = `translateX(${-glitchShift}px)`;
          states[clipA.id].opacity = 1 - progress;
          states[clipB.id].opacity = progress;
          overlayColor = `rgba(255, 255, 255, ${Math.sin(progress * Math.PI) * 0.4})`;
        }
        // 12. Light Leak / Glow / Burn / Bloom / Rays / Flare
        else if (typeStr.includes('light') || typeStr.includes('flare') || typeStr.includes('leak') || typeStr.includes('burn') || typeStr.includes('glow') || typeStr.includes('bloom') || typeStr.includes('rays') || typeStr.includes('burst')) {
          states[clipA.id].opacity = 1 - progress;
          states[clipB.id].opacity = progress;
          overlayColor = `rgba(255, 200, 100, ${Math.sin(progress * Math.PI) * 0.8})`;
        }
        // 13. Split / Slice / Shatter
        else if (typeStr.includes('split') || typeStr.includes('slice') || typeStr.includes('shatter')) {
          states[clipA.id].transform = `scale(${1 + progress * 0.2}) rotate(${progress * 6}deg)`;
          states[clipB.id].transform = `scale(${1.2 - progress * 0.2}) rotate(${(1 - progress) * -6}deg)`;
          states[clipA.id].opacity = 1 - progress;
          states[clipB.id].opacity = progress;
        }
        // 14. Default Cross Dissolve
        else {
          states[clipA.id].opacity = 1 - progress;
          states[clipB.id].opacity = progress;
        }
        break;
      }
    }
    return { states, overlayColor };
  };


  // Keep the duration state updated and clamp playhead if clips list changes
  useEffect(() => {
    const totalDur = getProjectTotalDuration(timelineClips);
    setDuration(totalDur);
    if (currentTime > totalDur) {
      handleSeek(totalDur);
    }
  }, [timelineClips]);

  const toggleMute = () => {
    setIsMutedState((prev) => {
      const next = !prev;
      showToast(next ? 'Audio track muted' : 'Audio track unmuted');
      return next;
    });
  };

  // handleSpeedChange removed because per-clip speed is used

  const toggleFullscreen = () => {
    const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
    const activeClip = timelineClips.find(
      (c) => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration
    ) || (currentTime >= totalDur ? timelineClips[timelineClips.length - 1] : timelineClips[0]);

    if (activeClip) {
      const activeVid = videoRefs.current[activeClip.id];
      if (activeVid) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          activeVid.requestFullscreen();
        }
      }
    }
  };

  // Canvas Mouse Move & Mouse Up Handlers for Drag / Resize / Rotate
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    beginTransaction('Transform clip', getProjectState());
    setIsSelectedOnCanvas(true);
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - canvasPos.x, y: e.clientY - canvasPos.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      const hasKfX = hasKeyframeForProperty(activeSelectedClip?.keyframes, 'positionX');
      const hasKfY = hasKeyframeForProperty(activeSelectedClip?.keyframes, 'positionY');

      if (activeSelectedClip && (hasKfX || hasKfY || autoKeyframeEnabled)) {
        setTimelineClips(prev => prev.map(c => {
          if (c.id === activeSelectedClip.id) {
            let kfs = c.keyframes || [];
            const relTime = Math.max(0, currentTime - c.timelineStart);
            kfs = KeyframeManager.addOrUpdateKeyframe(kfs, 'positionX', relTime, newX);
            kfs = KeyframeManager.addOrUpdateKeyframe(kfs, 'positionY', relTime, newY);
            return { ...c, keyframes: kfs, posX: newX, posY: newY, position: { x: newX, y: newY } };
          }
          return c;
        }));
      } else {
        setCanvasPos({ x: newX, y: newY });
      }
    } else if (isResizingCanvas) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      if (activeSelectedClip && isCropModeActive) {
        setTimelineClips(prev => prev.map(c => {
          if (c.id === activeSelectedClip.id) {
            const currentCrop = c.crop || { left: 0, right: 0, top: 0, bottom: 0 };
            let newCrop = { ...currentCrop };
            const factor = 0.25;
            
            if (isResizingCanvas === 'se') {
              newCrop.right = Math.max(0, Math.min(99 - newCrop.left, newCrop.right - deltaX * factor));
              newCrop.bottom = Math.max(0, Math.min(99 - newCrop.top, newCrop.bottom - deltaY * factor));
            } else if (isResizingCanvas === 'nw') {
              newCrop.left = Math.max(0, Math.min(99 - newCrop.right, newCrop.left + deltaX * factor));
              newCrop.top = Math.max(0, Math.min(99 - newCrop.bottom, newCrop.top + deltaY * factor));
            } else if (isResizingCanvas === 'ne') {
              newCrop.right = Math.max(0, Math.min(99 - newCrop.left, newCrop.right - deltaX * factor));
              newCrop.top = Math.max(0, Math.min(99 - newCrop.bottom, newCrop.top + deltaY * factor));
            } else if (isResizingCanvas === 'sw') {
              newCrop.left = Math.max(0, Math.min(99 - newCrop.right, newCrop.left + deltaX * factor));
              newCrop.bottom = Math.max(0, Math.min(99 - newCrop.top, newCrop.bottom - deltaY * factor));
            }
            return { ...c, crop: newCrop };
          }
          return c;
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
      } else {
        const direction = (isResizingCanvas === 'nw' || isResizingCanvas === 'sw') ? -1 : 1;
        const newScale = Math.max(0.1, Math.min(3.0, canvasScale + direction * deltaX * 0.005));

        const hasKfScale = hasKeyframeForProperty(activeSelectedClip?.keyframes, 'scale');
        if (activeSelectedClip && (hasKfScale || autoKeyframeEnabled)) {
          setTimelineClips(prev => prev.map(c => {
            if (c.id === activeSelectedClip.id) {
              const relTime = Math.max(0, currentTime - c.timelineStart);
              const kfs = KeyframeManager.addOrUpdateKeyframe(c.keyframes, 'scale', relTime, newScale);
              return { ...c, keyframes: kfs, scale: newScale };
            }
            return c;
          }));
        } else {
          setCanvasScale(newScale);
        }
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    } else if (isRotatingCanvas) {
      const deltaX = e.clientX - dragStart.x;
      const newRotation = (canvasRotation + deltaX * 0.8) % 360;

      const hasKfRot = hasKeyframeForProperty(activeSelectedClip?.keyframes, 'rotation');
      if (activeSelectedClip && (hasKfRot || autoKeyframeEnabled)) {
        setTimelineClips(prev => prev.map(c => {
          if (c.id === activeSelectedClip.id) {
            const relTime = Math.max(0, currentTime - c.timelineStart);
            const kfs = KeyframeManager.addOrUpdateKeyframe(c.keyframes, 'rotation', relTime, newRotation);
            return { ...c, keyframes: kfs, rotation: newRotation };
          }
          return c;
        }));
      } else {
        setCanvasRotation(newRotation);
      }
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
    setIsResizingCanvas(null);
    setIsRotatingCanvas(false);
    commitTransaction(getProjectState());
  };

  // Timeline Mouse Drag Scroll Handlers
  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    if (!timelineScrollRef.current) return;
    setIsDraggingTimeline(true);
    setTimelineStartX(e.pageX - timelineScrollRef.current.offsetLeft);
    setTimelineScrollLeft(timelineScrollRef.current.scrollLeft);
  };

  const handleTimelineMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTimeline || !timelineScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - timelineScrollRef.current.offsetLeft;
    const walk = (x - timelineStartX) * 1.5;
    timelineScrollRef.current.scrollLeft = timelineScrollLeft - walk;
  };

  const handleTimelineMouseUp = () => {
    setIsDraggingTimeline(false);
  };

  // Timeline Shift + Wheel Scroll (Horizontal scroll & Trackpad swipe only)
  const handleTimelineWheel = (e: React.WheelEvent) => {
    if (timelineScrollRef.current) {
      if (e.shiftKey) {
        timelineScrollRef.current.scrollLeft += (e.deltaY || e.deltaX);
      } else if (Math.abs(e.deltaX) > 0) {
        timelineScrollRef.current.scrollLeft += e.deltaX;
      }
      // Vertical mouse wheel with no Shift is disabled for horizontal scrolling per spec
    }
  };

  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!timelineScrollRef.current) return;

    const scrollContainer = timelineScrollRef.current;
    const pxPerSec = (zoomLevel / 100) * 35;

    const seekFromEvent = (clientX: number) => {
      const rect = scrollContainer.getBoundingClientRect();
      const clickX = clientX - rect.left + scrollContainer.scrollLeft;
      const targetSec = clickX / pxPerSec;
      handleSeek(targetSec);
    };

    seekFromEvent(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      seekFromEvent(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineScrollRef.current) return;

    // Allow seeking unless user clicked specifically on a clip card, drag handle, or button
    const target = e.target as HTMLElement;
    const isClip = target.closest('.rounded-md.border');
    const isTransitionBtn = target.closest('button') || target.tagName === 'BUTTON';
    const isTrimHandle = target.classList.contains('cursor-ew-resize') || target.closest('.bg-sky-400');

    if (!isClip && !isTransitionBtn && !isTrimHandle) {
      const pxPerSec = (zoomLevel / 100) * 35;
      const rect = timelineScrollRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left + timelineScrollRef.current.scrollLeft;
      const targetSec = clickX / pxPerSec;
      handleSeek(targetSec);
    }
  };

  const handleTimelineScroll = () => {
    if (!timelineScrollRef.current || isPlaying) return;

    const scrollContainer = timelineScrollRef.current;
    const pxPerSec = (zoomLevel / 100) * 35;

    const targetSec = scrollContainer.scrollLeft / pxPerSec;

    if (timelineClips.length === 0) {
      setCurrentTime(targetSec);
      return;
    }

    const totalDur = getProjectTotalDuration(timelineClips);
    const clampedTime = Math.min(totalDur, Math.max(0, targetSec));
    setCurrentTime(clampedTime);

    const activeClip = timelineClips.find(c => clampedTime >= c.timelineStart && clampedTime < c.timelineStart + c.duration) ||
      (clampedTime >= totalDur ? timelineClips[timelineClips.length - 1] : timelineClips[0]);
    if (activeClip) {
      if (activeMediaId !== activeClip.mediaId) {
        setActiveMediaId(activeClip.mediaId);
      }
      const localTime = Math.max(
        activeClip.startOffset,
        Math.min(
          activeClip.startOffset + getSourceDuration(activeClip) - 0.05,
          timelineTimeToSourceTime(activeClip, clampedTime)
        )
      );

      // Pause other video elements just to be sure
      timelineClips.forEach(c => {
        const v = videoRefs.current[c.id];
        if (v && c.id !== activeClip.id) {
          v.pause();
        }
      });

      const activeVid = videoRefs.current[activeClip.id];
      if (activeVid && Math.abs(activeVid.currentTime - localTime) > 0.08) {
        activeVid.currentTime = localTime;
      }
    }
  };

  const formatTimecode = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const f = Math.floor((secs % 1) * 24);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}`;
  };

  const videoClipsOnlyAtPlayhead = timelineClips.filter(
    (c) => c.trackId !== 'audio' && c.trackId !== 'music' && c.type !== 'audio' && !c.isDetachedAudio
  );

  const activeClipAtPlayhead = videoClipsOnlyAtPlayhead.find(
    (c) => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration
  ) || videoClipsOnlyAtPlayhead.find((c) => c.mediaId === activeMediaId || c.id === activeMediaId) || videoClipsOnlyAtPlayhead[0] || null;

  const displayVideoName = activeClipAtPlayhead
    ? activeClipAtPlayhead.name
    : (mediaFiles.find((m) => m.id === activeMediaId)?.name || 'untitled-project.vxp');

  // Project Save & Restore initialization
  const getProjectPayload = useCallback(() => {
    const currentSaveId = urlProjectId || projectId || (displayVideoName !== 'untitled-project.vxp' ? displayVideoName : 'default_project');
    const currentSaveName = (projectTitle && projectTitle !== 'My Project' ? projectTitle : null) || (displayVideoName !== 'untitled-project.vxp' ? displayVideoName : 'Untitled Project');

    return {
      id: currentSaveId,
      name: currentSaveName,
      updatedAt: Date.now(),
      timelineClips,
      textOverlays,
      captions,
      aspectRatio,
      currentTime,
      activeSelectedClipId,
      activeMediaId,
      volume,
      isMuted,
      mutedClips,
      lockedClips,
      zoomLevel,
      mediaFiles,
    };
  }, [
    urlProjectId,
    projectId,
    projectTitle,
    displayVideoName,
    timelineClips,
    textOverlays,
    captions,
    aspectRatio,
    currentTime,
    activeSelectedClipId,
    activeMediaId,
    volume,
    isMuted,
    mutedClips,
    lockedClips,
    zoomLevel,
    mediaFiles,
  ]);

  const { performSave, isSaving } = useProjectSave(getProjectPayload, showToast);

  // Restore saved project state from ProjectDB if project query param is present
  useEffect(() => {
    if (!urlProjectId) return;
    let isMounted = true;

    ProjectDB.loadProject(urlProjectId).then((payload) => {
      if (!isMounted || !payload) return;

      if (payload.name) {
        setProjectTitle(payload.name);
      }
      if (Array.isArray(payload.timelineClips) && payload.timelineClips.length > 0) {
        setTimelineClipsState(payload.timelineClips);
      }
      if (Array.isArray(payload.textOverlays)) {
        setTextOverlays(payload.textOverlays);
      }
      if (Array.isArray(payload.captions)) {
        setCaptions(payload.captions);
      }
      if (typeof payload.volume === 'number') {
        setVolumeState(payload.volume);
      }
      if (typeof payload.isMuted === 'boolean') {
        setIsMutedState(payload.isMuted);
      }
      if (payload.mutedClips) {
        setMutedClipsState(payload.mutedClips);
      }
      if (payload.lockedClips) {
        setLockedClipsState(payload.lockedClips);
      }
      if (payload.aspectRatio) {
        setAspectRatio(payload.aspectRatio);
      }
      showToast(`Restored project: ${payload.name || 'Untitled'}`);
    });

    return () => {
      isMounted = false;
    };
  }, [urlProjectId, setProjectTitle]);

  // Production Trim Mode hook initialization
  const {
    isTrimModeActive,
    trimmingClipId,
    enterTrimMode,
    applyTrim,
    cancelTrim,
    resetTrim,
  } = useTrimMode({
    timelineClips,
    mediaFiles,
    setTimelineClips: setTimelineClipsState,
    recalculateSequence,
    getProjectTotalDuration,
    setDuration,
    handleSeek: (time, force) => handleSeek(time, force),
    setZoomLevel,
    beginTransaction,
    commitTransaction,
    getProjectState,
    showToast,
  });

  const trimmingClip = isTrimModeActive ? timelineClips.find(c => c.id === trimmingClipId) : null;



  return (
    <div className="veytrix-editor h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-sans select-none">
      {/* ---------------- TOP BAR ---------------- */}
      <header className="h-12 border-b border-border bg-surface px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              clearMedia();
              navigate('/home');
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md hover:bg-surface-hover transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Home</span>
          </button>
          <div className="h-4 w-px bg-surface/10" />
          <div className="flex items-center gap-2">
            <VeytrixLogo className="h-5 w-5" />
            <span className="font-mono text-xs font-semibold text-foreground truncate max-w-[400px]">
              veytrix / {displayVideoName}
            </span>
            <span className="rounded bg-primary/10 border border-sky-500/20 text-primary text-[10px] font-mono px-2 py-0.5">
              Draft
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              const ok = await performSave(false);
              if (ok) setLastSavedTime(Date.now());
              setIsSaveModalOpen(true);
            }}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-surface-hover hover:bg-surface-hover text-foreground transition cursor-pointer disabled:opacity-50"
            title="Save Project Options"
          >
            <Save className={`h-3.5 w-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-md bg-gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-95 transition"
            onClick={() => setIsExportOpen(true)}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Production Trim Mode HUD Banner */}
      {isTrimModeActive && trimmingClip && (
        <TrimToolbar
          clipName={trimmingClip.name}
          timelineStart={trimmingClip.timelineStart ?? 0}
          duration={trimmingClip.duration}
          startOffset={trimmingClip.startOffset ?? 0}
          onApply={applyTrim}
          onCancel={cancelTrim}
          onReset={resetTrim}
        />
      )}

      {/* ---------------- MAIN WORKSPACE GRID ---------------- */}
      <div className="flex-1 grid grid-cols-[280px_1fr_300px] overflow-hidden">

        {/* LEFT PANEL: Media Library & Quick AI Edit Modules */}
        <aside
          onFocus={handleAsideFocusIn}
          onBlur={handleAsideFocusOut}
          onMouseDown={handleAsideMouseDown}
          onMouseUp={handleAsideMouseUp}
          className="border-r border-border bg-surface flex flex-col overflow-hidden"
        >
          <div className="flex border-b border-border bg-surface p-1 gap-1 overflow-x-auto flex-shrink-0 scrollbar-none select-none">
            {[
              { id: 'media', label: 'Media', icon: Film },
              { id: 'ratio', label: 'Ratio', icon: Crop },
              { id: 'audio', label: 'Audio', icon: AudioWaveform },
              { id: 'text', label: 'Text', icon: Type },
              { id: 'captions', label: 'Captions', icon: Languages },
              { id: 'effects', label: 'Effects', icon: Wand2 },
              { id: 'transitions', label: 'Transitions', icon: ArrowRightLeft },
              { id: 'filters', label: 'Filters', icon: Sliders },
              { id: 'speed', label: 'Speed', icon: Gauge },
              { id: 'keyframes', label: 'Keyframes', icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'effects') {
                    setEffectsSubTab('effects');
                    setActiveTab('effects');
                  } else if (tab.id === 'transitions') {
                    setEffectsSubTab('transitions');
                    setActiveTab('transitions');
                  } else if (tab.id === 'filters') {
                    setEffectsSubTab('filters');
                    setActiveTab('filters');
                  } else {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={`flex-shrink-0 flex flex-col items-center justify-center gap-0.5 py-1 px-2 min-w-[56px] text-[9px] font-semibold rounded-md transition cursor-pointer ${activeTab === tab.id
                    ? 'bg-primary/15 text-primary border border-sky-500/25 font-bold shadow-sm'
                    : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                  }`}
              >
                <tab.icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
            {activeTab === 'media' && (
              <>
                <div className="p-3 border-b border-border space-y-2 flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      className="w-full rounded-md bg-surface border border-border pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                  <input
                    ref={importFileInputRef}
                    type="file"
                    accept="video/*,image/*,audio/*"
                    multiple
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                  <button
                    type="button"
                    onClick={handleImportButtonClick}
                    className="w-full flex items-center justify-center gap-1.5 rounded-md bg-primary/10 border border-sky-500/20 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Import More Media</span>
                  </button>
                </div>

                {/* Media Asset List */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Uploaded Clips ({mediaFiles.length})
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {mediaFiles.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setActiveMediaId(item.id);
                          setIsSelectedOnCanvas(true);
                          handleSeek(0);
                        }}
                        className={`group relative aspect-video rounded-md border overflow-hidden bg-surface cursor-pointer transition ${item.id === activeMedia?.id
                            ? 'border-sky-400 ring-1 ring-sky-400 shadow-glow'
                            : 'border-border hover:border-sky-400/50'
                          }`}
                      >
                        {item.thumbnails[0] ? (
                          <img src={item.thumbnails[0]} alt="" className="h-full w-full object-cover animate-fade-in" />
                        ) : (
                          <div className="h-full w-full bg-surface-hover flex items-center justify-center">
                            <Film className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-mono text-foreground">
                          {item.durationFormatted}
                        </div>
                        <div className="absolute top-1 left-1 rounded bg-black/70 px-1 py-0.5 text-[8px] font-mono text-foreground truncate max-w-[80px]">
                          {item.name}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openRename(item.id, item.name);
                          }}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded bg-black/80 hover:bg-black text-white transition z-10"
                          title="Rename Asset"
                        >
                          <Edit3 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'ratio' && (
              <AspectRatio currentRatio={aspectRatio} onRatioChange={setAspectRatio} />
            )}

            {activeTab === 'audio' && (
              <Audio
                volume={volume}
                onVolumeChange={setVolume}
                isMuted={isMuted}
                onToggleMute={toggleMute}
                onImportAudio={(file) => importAudioFile(file)}
                onAddAudioToTimeline={(assetId) => addAudioToTimeline(assetId)}
                uploadedAssets={libraryAssets}
                onDeleteAsset={(id) => removeLibraryAsset(id)}
              />
            )}

            {activeTab === 'text' && (
              <TextPanel
                overlays={textOverlays}
                onAddOverlay={handleAddTextOverlay}
                onRemoveOverlay={handleRemoveTextOverlay}
                onUpdateOverlay={handleUpdateTextOverlay}
                activeOverlayId={activeOverlayId}
                setActiveOverlayId={setActiveOverlayId}
              />
            )}

            {activeTab === 'captions' && (
              <Captions
                captions={captions}
                onAddCaption={handleAddCaption}
                onRemoveCaption={handleRemoveCaption}
                onUpdateCaption={handleUpdateCaption}
                onSeek={handleSeek}
                onBatchCaptions={(caps) => setCaptions(caps)}
                captionStyle={captionStyle}
                setCaptionStyle={setCaptionStyle}
              />
            )}

            {activeTab === 'transitions' && (
              <Transitions
                activeTransitionId={activeTransitionId}
                onSelectTransition={handleSelectTransition}
                showBeforeOnly={showBeforeOnly}
                onShowBeforeOnlyChange={setShowBeforeOnly}
              />
            )}

            {activeTab === 'filters' && (
              <Filters
                activeFilterId={activeFilterId}
                onSelectFilter={(id) => {
                  setActiveFilterId(id);
                  if (id) {
                    setFilterEnabled(true);
                    showToast('Filter applied');
                  } else {
                    showToast('Filter cleared');
                  }
                }}
                filterIntensity={filterIntensity}
                onFilterIntensityChange={setFilterIntensity}
                filterOpacity={filterOpacity}
                onFilterOpacityChange={setFilterOpacity}
                filterBlendMode={filterBlendMode}
                onFilterBlendModeChange={setFilterBlendMode}
                filterEnabled={filterEnabled}
                onFilterEnabledChange={setFilterEnabled}
                showBeforeOnly={showBeforeOnly}
                onShowBeforeOnlyChange={setShowBeforeOnly}
                onHoverFilter={setPreviewFilterId}
              />
            )}

            {activeTab === 'effects' && (
              <Effects
                timelineClips={timelineClips}
                currentTime={currentTime}
                activeTransitionId={activeTransitionId}
                onSelectTransition={handleSelectTransition}
                activeFilterId={activeFilterId}
                onSelectFilter={(id) => {
                  setActiveFilterId(id);
                  if (id) {
                    setFilterEnabled(true);
                    showToast('Filter applied');
                  } else {
                    showToast('Filter cleared');
                  }
                }}
                filterIntensity={filterIntensity}
                onFilterIntensityChange={setFilterIntensity}
                filterOpacity={filterOpacity}
                onFilterOpacityChange={setFilterOpacity}
                filterBlendMode={filterBlendMode}
                onFilterBlendModeChange={setFilterBlendMode}
                filterEnabled={filterEnabled}
                onFilterEnabledChange={setFilterEnabled}
                showBeforeOnly={showBeforeOnly}
                onShowBeforeOnlyChange={setShowBeforeOnly}
                onHoverFilter={setPreviewFilterId}
                activeAppliedEffectId={activeAppliedEffectId}
                onSetActiveAppliedEffectId={setActiveAppliedEffectId}
                onAddAppliedEffect={handleAddAppliedEffect}
                onDeleteAppliedEffect={handleDeleteAppliedEffect}
                onToggleAppliedEffect={handleToggleAppliedEffect}
                onUpdateAppliedEffect={handleUpdateAppliedEffect}
                onDuplicateAppliedEffect={handleDuplicateAppliedEffect}
                onReorderAppliedEffects={handleReorderAppliedEffects}
                onAddEffectKeyframe={handleAddEffectKeyframe}
                onDeleteEffectKeyframe={handleDeleteEffectKeyframe}
              />
            )}

            {activeTab === 'speed' && (
              <SpeedTool
                activeClip={activeSelectedClip || timelineClips.find(c => c.id === activeSelectedClipId || c.mediaId === activeMediaId) || timelineClips[0] || null}
                onUpdateClipSpeed={handleUpdateClipSpeed}
                onStartSpeedChange={(label) => beginTransaction(label, getProjectState())}
                onEndSpeedChange={() => commitTransaction(getProjectState())}
              />
            )}

            {activeTab === 'replace' && (
              <ReplaceTool
                activeClip={timelineClips.find(c => c.mediaId === activeMediaId) || timelineClips[0] || null}
                mediaFiles={mediaFiles}
                onReplaceMedia={handleReplaceMedia}
                showToast={showToast}
              />
            )}

            {activeTab === 'keyframes' && (() => {
              const targetClip = activeSelectedClip || timelineClips.find(c => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration) || timelineClips[0] || null;

              return (
                <KeyframeInspector
                  clipId={targetClip?.id || ''}
                  clipName={targetClip?.name || 'No clip selected'}
                  clipRelativeTime={Math.max(0, currentTime - (targetClip?.timelineStart || 0))}
                  keyframes={targetClip?.keyframes || []}
                  autoKeyframeEnabled={autoKeyframeEnabled}
                  onToggleAutoKeyframe={() => setAutoKeyframeEnabled(!autoKeyframeEnabled)}
                  selectedProperty={selectedKeyframeProperty}
                  onSelectedPropertyChange={setSelectedKeyframeProperty}
                  onAddOrUpdateKeyframe={(property, value, interpolation, isExplicit) => {
                    if (!targetClip) return;
                    const relTime = Math.max(0, currentTime - targetClip.timelineStart);
                    const hasKfAtPlayhead = targetClip.keyframes?.some((k: any) => k.property === property && Math.abs(k.time - relTime) < 0.04);

                    if (isExplicit || autoKeyframeEnabled || hasKfAtPlayhead) {
                      beginTransaction(`Add keyframe ${property}`, getProjectState());
                      setTimelineClips(prev => prev.map(c => {
                        if (c.id === targetClip.id) {
                          const updated = KeyframeManager.addOrUpdateKeyframe(
                            c.keyframes,
                            property,
                            relTime,
                            value,
                            interpolation
                          );
                          return { ...c, keyframes: updated };
                        }
                        return c;
                      }));
                      commitTransaction(getProjectState());
                      showToast(`Keyframe added for ${property}`);
                    } else {
                      if (property === 'scale') setCanvasScaleState(value);
                      else if (property === 'rotation') setCanvasRotationState(value);
                      else if (property === 'positionX') setCanvasPosState(prev => ({ ...prev, x: value }));
                      else if (property === 'positionY') setCanvasPosState(prev => ({ ...prev, y: value }));
                    }
                  }}
                  onDeleteKeyframe={(kfId) => {
                    if (!targetClip) return;
                    beginTransaction('Delete keyframe', getProjectState());
                    setTimelineClips(prev => prev.map(c => {
                      if (c.id === targetClip.id) {
                        const updated = KeyframeManager.deleteKeyframe(c.keyframes, kfId);
                        return { ...c, keyframes: updated };
                      }
                      return c;
                    }));
                    commitTransaction(getProjectState());
                    showToast('Keyframe deleted');
                  }}
                  onUpdateInterpolation={(kfId, interpolation, controlPoints) => {
                    if (!targetClip) return;
                    beginTransaction('Update interpolation', getProjectState());
                    setTimelineClips(prev => prev.map(c => {
                      if (c.id === targetClip.id) {
                        const updated = KeyframeManager.updateInterpolation(c.keyframes, kfId, interpolation, controlPoints);
                        return { ...c, keyframes: updated };
                      }
                      return c;
                    }));
                    commitTransaction(getProjectState());
                  }}
                  onUpdateKeyframeValue={(kfId, value) => {
                    if (!targetClip) return;
                    setTimelineClips(prev => prev.map(c => {
                      if (c.id === targetClip.id) {
                        const kf = c.keyframes?.find((k: any) => k.id === kfId);
                        if (!kf) return c;
                        const updated = KeyframeManager.addOrUpdateKeyframe(
                          c.keyframes,
                          kf.property,
                          kf.time,
                          value,
                          kf.interpolation,
                          kf.controlPoints
                        );
                        return { ...c, keyframes: updated };
                      }
                      return c;
                    }));
                  }}
                  onNavigateKeyframe={(property, direction) => {
                    if (!targetClip) return;
                    const propKeyframes = (targetClip.keyframes || [])
                      .filter((k: any) => k.property === property)
                      .sort((a: any, b: any) => a.time - b.time);
                    const relTime = Math.max(0, currentTime - targetClip.timelineStart);
                    let targetTime: number | null = null;
                    if (direction === 'prev') {
                      const prev = propKeyframes.slice().reverse().find((k: any) => k.time < relTime - 0.04);
                      if (prev) targetTime = prev.time;
                    } else {
                      const next = propKeyframes.find((k: any) => k.time > relTime + 0.04);
                      if (next) targetTime = next.time;
                    }
                    if (targetTime !== null) {
                      handleSeek(targetClip.timelineStart + targetTime);
                    }
                  }}
                  onCopyKeyframes={() => {
                    if (!targetClip) return;
                    KeyframeManager.copyKeyframesToClipboard(targetClip.id, targetClip.keyframes || []);
                    showToast('Keyframes copied to clipboard');
                  }}
                  onPasteKeyframes={() => {
                    if (!targetClip) return;
                    const pasted = KeyframeManager.pasteKeyframesFromClipboard(targetClip.id);
                    if (pasted) {
                      beginTransaction('Paste keyframes', getProjectState());
                      setTimelineClips(prev => prev.map(c => {
                        if (c.id === targetClip.id) {
                          return { ...c, keyframes: [...(c.keyframes || []), ...pasted] };
                        }
                        return c;
                      }));
                      commitTransaction(getProjectState());
                      showToast('Keyframes pasted successfully');
                    }
                  }}
                  onClearAllKeyframes={() => {
                    if (!targetClip) return;
                    beginTransaction('Clear keyframes', getProjectState());
                    setTimelineClips(prev => prev.map(c => {
                      if (c.id === targetClip.id) {
                        return { ...c, keyframes: [] };
                      }
                      return c;
                    }));
                    commitTransaction(getProjectState());
                    showToast('All keyframes cleared');
                  }}
                />
              );
            })()}
          </div>
        </aside>


        {/* CENTER: Live Video Preview Monitor with Interactive Bounding Box */}
        <main
          className="flex flex-col border-r border-border bg-background overflow-hidden"
          onDoubleClick={() => setIsSelectedOnCanvas(false)}
        >
          <div
            className="flex-1 p-4 flex flex-col items-center justify-center relative overflow-hidden"
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
          >
            <div
              className="relative w-full rounded-xl border border-border-strong bg-black overflow-hidden shadow-2xl flex flex-col justify-between p-2 group transition-all duration-300 mx-auto"
              style={{
                aspectRatio: aspectRatio === 'fit'
                  ? (() => {
                      const firstMedia = mediaFiles.find(m => m.id === timelineClips[0]?.mediaId || m.id === timelineClips[0]?.id) as any;
                      return firstMedia?.width && firstMedia?.height ? `${firstMedia.width}/${firstMedia.height}` : '16/9';
                    })()
                  : aspectRatio,
                maxWidth: aspectRatio === '16/9' ? '896px' :
                  aspectRatio === '9/16' ? '320px' :
                    aspectRatio === '1/1' ? '460px' :
                      aspectRatio === '4/5' ? '400px' :
                        aspectRatio === '4/3' ? '640px' :
                          aspectRatio === '21/9' ? '1024px' :
                            '896px',
                maxHeight: '100%',
              }}
            >

              {/* Preview Window Video Title Badge */}
              {displayVideoName && (
                <div className="absolute top-3 left-3 z-30 bg-black/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono px-3 py-1 rounded-md shadow-lg pointer-events-none flex items-center gap-1.5 transition-all">
                  <span className="truncate max-w-[280px]">{displayVideoName}</span>
                </div>
              )}

              {/* HTML5 Native Video Tag wrapped in transform container */}
              <div
                className={`h-full w-full relative flex items-center justify-center cursor-move ${(activeEffectId?.includes('shake') || activeEffectId?.includes('jitter') || activeEffectId?.includes('spin') || activeEffectId?.includes('roll')) ? 'animate-shake' :
                    (activeEffectId?.includes('handheld') || activeEffectId?.includes('follow') || activeEffectId?.includes('orbit') || activeEffectId?.includes('pan') || activeEffectId?.includes('tilt')) ? 'animate-handheld' : ''
                  }`}
                style={{
                  transform: `translate(${canvasPos.x}px, ${canvasPos.y}px) scale(${canvasScale}) rotate(${canvasRotation}deg)`,
                  transition: isDraggingCanvas ? 'none' : 'transform 0.05s ease-out',
                }}
                onMouseDown={handleCanvasMouseDown}
              >
                {(() => {
                  const { states: transitionStates, overlayColor: transitionOverlayColor } = getTransitionStatesForClips();
                  const videoClipsOnly = timelineClips.filter(
                    (c) => c.trackId !== 'audio' && c.trackId !== 'music' && c.type !== 'audio' && !c.isDetachedAudio
                  );
                  const totalDur = getProjectTotalDuration(videoClipsOnly);
                  const mainVideoClips = videoClipsOnly.filter(c => c.trackId !== 'overlay');
                  const activeMainClip = mainVideoClips.find(c => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration) ||
                    (currentTime >= totalDur ? mainVideoClips[mainVideoClips.length - 1] : mainVideoClips[0]);

                  return videoClipsOnly.length > 0 ? (
                    <>
                      {videoClipsOnly.map((clip) => {
                        const isClipActive = clip.trackId === 'overlay'
                          ? (currentTime >= clip.timelineStart && currentTime < clip.timelineStart + clip.duration)
                          : (activeMainClip?.id === clip.id);
                        const tState = transitionStates[clip.id] || { display: isClipActive, opacity: 1, filter: '', transform: '', zIndex: 1 };
                        const localTime = (currentTime - clip.timelineStart) + clip.startOffset;

                        // Dynamic transform interpolation from applied effects keyframes
                        const isSelected = activeSelectedClipId === clip.id;
                        const isClipVisible = isClipActive || tState.display;

                        const baseScale = clip.scale ?? (clip.trackId === 'overlay' ? 0.75 : 1.0);
                        const baseRotation = clip.rotation ?? 0.0;
                        const basePosX = clip.posX ?? (clip.position?.x ?? 0.0);
                        const basePosY = clip.posY ?? (clip.position?.y ?? 0.0);

                        const clipRelTime = Math.max(0, currentTime - clip.timelineStart);
                        const kfProps = interpolateAllProperties(clip.keyframes, clipRelTime);

                        const hasKfScale = hasKeyframeForProperty(clip.keyframes, 'scale');
                        const hasKfRot = hasKeyframeForProperty(clip.keyframes, 'rotation');
                        const hasKfX = hasKeyframeForProperty(clip.keyframes, 'positionX');
                        const hasKfY = hasKeyframeForProperty(clip.keyframes, 'positionY');

                        let clipScale = hasKfScale 
                          ? kfProps.scale 
                          : (isSelected ? canvasScale : baseScale);
                        let clipRotation = hasKfRot 
                          ? kfProps.rotation 
                          : (isSelected ? canvasRotation : baseRotation);
                        let clipScaleX = 1;
                        let clipScaleY = 1;
                        let posX = hasKfX 
                          ? kfProps.positionX 
                          : (isSelected ? canvasPos.x : basePosX);
                        let posY = hasKfY 
                          ? kfProps.positionY 
                          : (isSelected ? canvasPos.y : basePosY);
                        let kfFilterStr = '';
                        let kfOpacityMultiplier = 1;
                        let kfClipPathStr = 'none';

                        const hasKf = (p: KeyframeProperty) => hasKeyframeForProperty(clip.keyframes, p);

                        if (hasKf('opacity')) kfOpacityMultiplier = kfProps.opacity;

                        if (hasKf('blur')) kfFilterStr += ` blur(${kfProps.blur}px)`;
                        if (hasKf('brightness')) kfFilterStr += ` brightness(${kfProps.brightness}%)`;
                        if (hasKf('contrast')) kfFilterStr += ` contrast(${kfProps.contrast}%)`;
                        if (hasKf('saturation')) kfFilterStr += ` saturate(${kfProps.saturation}%)`;
                        if (hasKf('hue')) kfFilterStr += ` hue-rotate(${kfProps.hue}deg)`;
                        if (hasKf('glow')) kfFilterStr += ` drop-shadow(0 0 ${kfProps.glow}px rgba(56, 189, 248, 0.8))`;
                        if (hasKf('shadow')) kfFilterStr += ` drop-shadow(0 ${kfProps.shadow / 2}px ${kfProps.shadow}px rgba(0, 0, 0, 0.5))`;
                        if (hasKf('crop')) kfClipPathStr = `inset(${kfProps.crop}%)`;
                        if (clip.appliedEffects && tState.display) {
                          clip.appliedEffects.forEach((eff: AppliedEffect) => {
                            if (!eff.enabled || showBeforeOnly) return;
                            const props = getInterpolatedEffectProps(eff, localTime) || {};
                            if (props.scale !== undefined && props.scale !== 1) {
                              clipScale = clipScale * props.scale;
                            }
                            if (props.rotation !== undefined && props.rotation !== 0) {
                              clipRotation = clipRotation + props.rotation;
                            }
                            if (props.positionX !== undefined) posX += props.positionX;
                            if (props.positionY !== undefined) posY += props.positionY;

                            // Dynamic Camera Shake
                            if (props.shakeAmount && props.shakeAmount > 0) {
                              const freq = props.frequency || 10;
                              const shakeTime = currentTime * freq;
                              posX += Math.sin(shakeTime) * props.shakeAmount * 1.5;
                              posY += Math.cos(shakeTime * 1.2) * props.shakeAmount * 1.5;
                            }

                            // Dynamic Basic Effects Animations
                            const presetId = eff.presetId;
                            const speedFactor = eff.speed / 50;
                            const intFactor = eff.intensity / 100;
                            const duration = clip.duration || 5;

                            if (presetId === 'basic-zoom-in') {
                              const p = Math.min(1, localTime / 2);
                              clipScale = clipScale * (1 + p * 0.3 * intFactor);
                            } else if (presetId === 'basic-zoom-out') {
                              const p = Math.min(1, localTime / 2);
                              clipScale = clipScale * (1.3 - p * 0.3 * intFactor);
                            } else if (presetId === 'basic-move-left') {
                              posX -= Math.min(1, localTime / 1.5) * 150 * intFactor;
                            } else if (presetId === 'basic-move-right') {
                              posX += Math.min(1, localTime / 1.5) * 150 * intFactor;
                            } else if (presetId === 'basic-move-up') {
                              posY -= Math.min(1, localTime / 1.5) * 150 * intFactor;
                            } else if (presetId === 'basic-move-down') {
                              posY += Math.min(1, localTime / 1.5) * 150 * intFactor;
                            } else if (presetId === 'basic-spin-cw') {
                              clipRotation += localTime * 90 * speedFactor * intFactor;
                            } else if (presetId === 'basic-spin-ccw') {
                              clipRotation -= localTime * 90 * speedFactor * intFactor;
                            } else if (presetId === 'basic-flip-h') {
                              clipScaleX = -1;
                            } else if (presetId === 'basic-flip-v') {
                              clipScaleY = -1;
                            } else if (presetId === 'basic-scale-up') {
                              clipScale = clipScale * (1 + 0.35 * intFactor);
                            } else if (presetId === 'basic-scale-down') {
                              clipScale = clipScale * (1 - 0.35 * intFactor);
                            } else if (presetId === 'basic-bounce') {
                              const wave = localTime * Math.PI * 2 * speedFactor * 1.5;
                              posY -= Math.abs(Math.sin(wave)) * 50 * intFactor;
                            } else if (presetId === 'basic-pulse') {
                              const wave = localTime * Math.PI * 2 * speedFactor;
                              clipScale = clipScale * (1 + Math.sin(wave) * 0.1 * intFactor);
                            } else if (presetId === 'basic-shake') {
                              const sT = localTime * 35 * speedFactor;
                              posX += Math.sin(sT) * 12 * intFactor;
                              posY += Math.cos(sT * 1.2) * 12 * intFactor;
                            } else if (presetId === 'basic-swing') {
                              const wave = localTime * Math.PI * 2 * speedFactor;
                              clipRotation += Math.sin(wave) * 15 * intFactor;
                            } else if (presetId === 'basic-elastic') {
                              const t = localTime * speedFactor;
                              const spring = Math.exp(-3 * t) * Math.cos(10 * t);
                              clipScale = clipScale * (1 + (1 - spring) * 0.25 * intFactor);
                            } else if (presetId === 'basic-stretch') {
                              clipScaleX = 1.35 * intFactor;
                            } else if (presetId === 'basic-compress') {
                              clipScaleX = 0.65 * intFactor;
                            } else if (presetId === 'basic-grow') {
                              const p = localTime / duration;
                              clipScale = clipScale * (1 + p * 0.4 * intFactor);
                            } else if (presetId === 'basic-shrink') {
                              const p = localTime / duration;
                              clipScale = clipScale * (1 - p * 0.3 * intFactor);
                            } else if (presetId === 'basic-rotate-l') {
                              clipRotation -= 45 * intFactor;
                            } else if (presetId === 'basic-rotate-r') {
                              clipRotation += 45 * intFactor;
                            } else if (presetId === 'basic-float-up') {
                              posY -= Math.sin(localTime * 2.5 * speedFactor) * 30 * intFactor;
                            } else if (presetId === 'basic-float-down') {
                              posY += Math.sin(localTime * 2.5 * speedFactor) * 30 * intFactor;
                            } else if (presetId === 'basic-pop-in') {
                              const p = Math.min(1, localTime / 0.5);
                              clipScale = clipScale * p * intFactor;
                            } else if (presetId === 'basic-pop-out') {
                              const p = Math.max(0, (duration - localTime) / 0.5);
                              clipScale = clipScale * p * intFactor;
                            } else if (presetId === 'basic-jelly') {
                              const wave = localTime * Math.PI * 2 * speedFactor;
                              clipScaleX = clipScaleX * (1 + Math.sin(wave) * 0.15 * intFactor);
                              clipScaleY = clipScaleY * (1 - Math.sin(wave) * 0.15 * intFactor);
                            } else if (presetId === 'basic-rubber') {
                              const wave = localTime * Math.PI * 2 * speedFactor;
                              clipScaleX = clipScaleX * (1 + Math.abs(Math.sin(wave)) * 0.2 * intFactor);
                              clipScaleY = clipScaleY * (1 + Math.abs(Math.cos(wave)) * 0.2 * intFactor);
                            } else if (presetId === 'basic-swing-l') {
                              const wave = localTime * Math.PI * 2 * speedFactor;
                              clipRotation += Math.sin(wave) * 12 * intFactor;
                              posX -= Math.abs(Math.sin(wave)) * 25 * intFactor;
                            } else if (presetId === 'basic-swing-r') {
                              const wave = localTime * Math.PI * 2 * speedFactor;
                              clipRotation += Math.sin(wave) * 12 * intFactor;
                              posX += Math.abs(Math.sin(wave)) * 25 * intFactor;
                            } else if (presetId === 'basic-heartbeat') {
                              const pulse = (localTime * speedFactor) % 1;
                              const h = pulse < 0.15 ? Math.sin(pulse * Math.PI / 0.15) * 0.12 : pulse < 0.3 ? Math.sin((pulse - 0.15) * Math.PI / 0.15) * 0.08 : 0;
                              clipScale = clipScale * (1 + h * intFactor);
                            } else if (presetId === 'basic-quick-zoom') {
                              const p = Math.min(1, localTime / 0.6);
                              clipScale = clipScale * (1 + (1 - p) * 0.6 * intFactor);
                            } else if (presetId === 'basic-slow-zoom') {
                              const p = localTime / duration;
                              clipScale = clipScale * (1 + p * 0.25 * intFactor);
                            } else if (presetId === 'basic-micro-shake') {
                              const s = localTime * 60 * speedFactor;
                              posX += Math.sin(s) * 3 * intFactor;
                              posY += Math.cos(s * 1.3) * 3 * intFactor;
                            } else if (presetId === 'basic-macro-shake') {
                              const s = localTime * 12 * speedFactor;
                              posX += Math.sin(s) * 25 * intFactor;
                              posY += Math.cos(s * 1.3) * 25 * intFactor;
                            } else if (presetId === 'basic-drift-l') {
                              posX -= (localTime / duration) * 100 * intFactor;
                            } else if (presetId === 'basic-drift-r') {
                              posX += (localTime / duration) * 100 * intFactor;
                            } else if (presetId === 'basic-drift-up') {
                              posY -= (localTime / duration) * 100 * intFactor;
                            } else if (presetId === 'basic-drift-down') {
                              posY += (localTime / duration) * 100 * intFactor;
                            } else if (presetId === 'basic-rotate-zoom') {
                              const p = localTime / duration;
                              clipRotation += p * 36 * intFactor;
                              clipScale = clipScale * (1 + p * 0.15 * intFactor);
                            } else if (presetId === 'basic-scale-rotate') {
                              const p = localTime / duration;
                              clipScale = clipScale * (1 + Math.sin(localTime * 3) * 0.08 * intFactor);
                              clipRotation += p * 45 * intFactor;
                            } else if (presetId === 'basic-expand') {
                              const p = Math.min(1, localTime / 1.2);
                              clipScale = clipScale * (0.7 + p * 0.3 * intFactor);
                            } else if (presetId === 'basic-collapse') {
                              const p = Math.min(1, localTime / 1.2);
                              clipScale = clipScale * (1.0 - p * 0.3 * intFactor);
                            } else if (presetId === 'basic-ease-in') {
                              const p = Math.pow(Math.min(1, localTime / duration), 2);
                              posX += p * 120 * intFactor;
                            } else if (presetId === 'basic-ease-out') {
                              const p = 1 - Math.pow(1 - Math.min(1, localTime / duration), 2);
                              posX += p * 120 * intFactor;
                            } else if (presetId === 'camera-handheld') {
                              posX += Math.sin(localTime * 1.5 * speedFactor) * 15 * intFactor;
                              posY += Math.cos(localTime * 1.1 * speedFactor) * 12 * intFactor;
                              clipRotation += Math.sin(localTime * 0.8 * speedFactor) * 1.5 * intFactor;
                            } else if (presetId === 'camera-shake') {
                              const s = localTime * 35 * speedFactor;
                              posX += Math.sin(s) * 12 * intFactor;
                              posY += Math.cos(s * 1.2) * 12 * intFactor;
                            } else if (presetId === 'camera-earthquake') {
                              const s = localTime * 60 * speedFactor;
                              posX += Math.sin(s) * 35 * intFactor;
                              posY += Math.cos(s * 1.4) * 30 * intFactor;
                            } else if (presetId === 'camera-crash-zoom') {
                              const p = Math.min(1, localTime / 0.6);
                              const ease = Math.pow(p, 3);
                              clipScale = clipScale * (1 + ease * 0.7 * intFactor);
                            } else if (presetId === 'camera-whip-l') {
                              const p = Math.min(1, localTime / 0.5);
                              posX -= (1 - p) * 350 * intFactor;
                            } else if (presetId === 'camera-whip-r') {
                              const p = Math.min(1, localTime / 0.5);
                              posX += (1 - p) * 350 * intFactor;
                            } else if (presetId === 'camera-whip-up') {
                              const p = Math.min(1, localTime / 0.5);
                              posY -= (1 - p) * 350 * intFactor;
                            } else if (presetId === 'camera-whip-down') {
                              const p = Math.min(1, localTime / 0.5);
                              posY += (1 - p) * 350 * intFactor;
                            } else if (presetId === 'camera-dolly-in') {
                              clipScale = clipScale * (1 + (localTime / duration) * 0.3 * intFactor);
                            } else if (presetId === 'camera-dolly-out') {
                              clipScale = clipScale * (1 - (localTime / duration) * 0.25 * intFactor);
                            } else if (presetId === 'camera-truck-l') {
                              posX -= (localTime / duration) * 120 * intFactor;
                            } else if (presetId === 'camera-truck-r') {
                              posX += (localTime / duration) * 120 * intFactor;
                            } else if (presetId === 'camera-pedestal-up') {
                              posY -= (localTime / duration) * 120 * intFactor;
                            } else if (presetId === 'camera-pedestal-down') {
                              posY += (localTime / duration) * 120 * intFactor;
                            } else if (presetId === 'camera-orbit-l') {
                              const angle = (localTime / duration) * Math.PI * intFactor;
                              posX -= Math.sin(angle) * 80 * speedFactor;
                              clipScale = clipScale * (1 + (1 - Math.cos(angle)) * 0.08);
                            } else if (presetId === 'camera-orbit-r') {
                              const angle = (localTime / duration) * Math.PI * intFactor;
                              posX += Math.sin(angle) * 80 * speedFactor;
                              clipScale = clipScale * (1 + (1 - Math.cos(angle)) * 0.08);
                            } else if (presetId === 'camera-roll-l') {
                              clipRotation -= (localTime / duration) * 30 * speedFactor * intFactor;
                            } else if (presetId === 'camera-roll-r') {
                              clipRotation += (localTime / duration) * 30 * speedFactor * intFactor;
                            } else if (presetId === 'camera-dutch-angle') {
                              clipRotation += 12 * intFactor;
                            } else if (presetId === 'camera-snap-zoom') {
                              const p = (localTime * speedFactor) % 2;
                              const snap = p < 0.4 ? Math.sin((p / 0.4) * Math.PI / 2) * 0.5 : p < 1.0 ? 0.5 - ((p - 0.4) / 0.6) * 0.5 : 0;
                              clipScale = clipScale * (1 + snap * intFactor);
                            } else if (presetId === 'camera-slow-push') {
                              clipScale = clipScale * (1 + (localTime / duration) * 0.15 * intFactor);
                            } else if (presetId === 'camera-slow-pull') {
                              clipScale = clipScale * (1 - (localTime / duration) * 0.12 * intFactor);
                            } else if (presetId === 'camera-action-cam') {
                              posX += Math.sin(localTime * 25 * speedFactor) * 8 * intFactor;
                              posY += Math.cos(localTime * 22 * speedFactor) * 8 * intFactor;
                              clipRotation += Math.sin(localTime * 15 * speedFactor) * 2 * intFactor;
                            } else if (presetId === 'camera-drone-rise') {
                              posY -= (localTime / duration) * 90 * intFactor;
                              clipScale = clipScale * (1 - (localTime / duration) * 0.08 * intFactor);
                            } else if (presetId === 'camera-drone-drop') {
                              posY += (localTime / duration) * 90 * intFactor;
                              clipScale = clipScale * (1 + (localTime / duration) * 0.08 * intFactor);
                            } else if (presetId === 'camera-fpv-dive') {
                              clipRotation += (localTime / duration) * 90 * speedFactor * intFactor;
                              posY += (localTime / duration) * 180 * speedFactor * intFactor;
                              clipScale = clipScale * (1 + (localTime / duration) * 0.3 * intFactor);
                            } else if (presetId === 'camera-fpv-fly') {
                              posX += Math.sin(localTime * 2 * speedFactor) * 60 * intFactor;
                              posY -= Math.sin(localTime * 1.5 * speedFactor) * 20 * intFactor;
                            } else if (presetId === 'camera-steadicam') {
                              posX += Math.sin(localTime * 0.8 * speedFactor) * 4 * intFactor;
                              posY += Math.cos(localTime * 0.6 * speedFactor) * 3 * intFactor;
                            } else if (presetId === 'camera-walking-cam') {
                              const walkCycle = localTime * Math.PI * 2 * 1.5 * speedFactor;
                              posY -= Math.abs(Math.sin(walkCycle)) * 12 * intFactor;
                              posX += Math.cos(walkCycle / 2) * 5 * intFactor;
                            } else if (presetId === 'camera-running-cam') {
                              const runCycle = localTime * Math.PI * 2 * 3.0 * speedFactor;
                              posY -= Math.abs(Math.sin(runCycle)) * 30 * intFactor;
                              posX += Math.cos(runCycle / 2) * 12 * intFactor;
                              clipRotation += Math.sin(runCycle) * 2.5 * intFactor;
                            } else if (presetId === 'camera-pov-motion') {
                              posX += Math.sin(localTime * 2 * speedFactor) * 15 * intFactor;
                              posY += Math.cos(localTime * 1.6 * speedFactor) * 8 * intFactor;
                            } else if (presetId === 'camera-lens-breathing') {
                              const breathe = Math.sin(localTime * Math.PI * speedFactor);
                              clipScale = clipScale * (1 + breathe * 0.025 * intFactor);
                            } else if (presetId === 'camera-parallax') {
                              clipScale = clipScale * (1 + (localTime / duration) * 0.12 * intFactor);
                              posX -= (localTime / duration) * 50 * intFactor;
                            } else if (presetId === 'camera-360-orbit') {
                              clipRotation += (localTime / duration) * 360 * speedFactor * intFactor;
                            } else if (presetId === 'camera-arc-shot') {
                              const arc = (localTime / duration) * Math.PI * intFactor;
                              posX += Math.sin(arc) * 100 * speedFactor;
                              clipRotation -= (localTime / duration) * 30 * intFactor;
                            } else if (presetId === 'camera-drift') {
                              posX += Math.sin(localTime * 0.5 * speedFactor) * 25 * intFactor;
                              posY += Math.cos(localTime * 0.7 * speedFactor) * 25 * intFactor;
                            } else if (presetId === 'camera-tilt-up') {
                              posY -= (localTime / duration) * 70 * intFactor;
                            } else if (presetId === 'camera-tilt-down') {
                              posY += (localTime / duration) * 70 * intFactor;
                            } else if (presetId === 'camera-pan-l') {
                              posX -= (localTime / duration) * 70 * intFactor;
                            } else if (presetId === 'camera-pan-r') {
                              posX += (localTime / duration) * 70 * intFactor;
                            } else if (presetId === 'camera-jitter-cam') {
                              const j = localTime * 80 * speedFactor;
                              posX += Math.sin(j) * 2.5 * intFactor;
                              posY += Math.cos(j * 1.2) * 2.5 * intFactor;
                            } else if (presetId === 'camera-doc-cam') {
                              posX += Math.sin(localTime * 1.2 * speedFactor) * 10 * intFactor;
                              const zoomStep = Math.floor(localTime * speedFactor) % 3 === 0 ? 0.08 : 0;
                              clipScale = clipScale * (1 + zoomStep * intFactor);
                            } else if (presetId === 'camera-cinema-cam') {
                              posX += Math.sin(localTime * 0.6) * 5 * intFactor;
                            } else if (presetId === 'camera-movie-push') {
                              clipScale = clipScale * (1 + (localTime / duration) * 0.18 * intFactor);
                            } else if (presetId === 'camera-epic-zoom') {
                              clipScale = clipScale * (1 - (localTime / duration) * 0.22 * intFactor);
                            } else if (presetId.startsWith('glitch-')) {
                              const glitchFreq = 30 * speedFactor;
                              const isGlitchFrame = Math.sin(localTime * glitchFreq) > (0.85 - intFactor * 0.25);
                              if (isGlitchFrame) {
                                const noiseX = Math.sin(localTime * 100) * 20 * intFactor;
                                const noiseY = Math.cos(localTime * 120) * 12 * intFactor;
                                posX += noiseX;
                                posY += noiseY;
                                if (presetId === 'glitch-screen-tear' || presetId === 'glitch-slice' || presetId === 'glitch-block-shift' || presetId === 'glitch-mirror') {
                                  clipScaleX = clipScaleX * (1 + (Math.sin(localTime * 200) * 0.08 * intFactor));
                                  posX += Math.sin(localTime * 150) * 35 * intFactor;
                                }
                                if (presetId === 'glitch-digital' || presetId === 'glitch-corruption' || presetId === 'glitch-cyber' || presetId === 'glitch-quantum' || presetId === 'glitch-master') {
                                  clipRotation += Math.sin(localTime * 90) * 4 * intFactor;
                                }
                              }
                            } else if (presetId.startsWith('lens-')) {
                              if (presetId === 'lens-fisheye' || presetId === 'lens-barrel' || presetId === 'lens-wide-angle' || presetId === 'lens-ultra-wide' || presetId === 'lens-telephoto' || presetId === 'lens-zoom' || presetId === 'lens-compression' || presetId === 'lens-cinema' || presetId === 'lens-vintage' || presetId === 'lens-prime' || presetId === 'lens-master') {
                                clipScale = clipScale * (1 + 0.15 * intFactor);
                              } else if (presetId === 'lens-twist' || presetId === 'lens-warp') {
                                clipRotation += Math.sin(localTime * 4 * speedFactor) * 8 * intFactor;
                                clipScale = clipScale * (1 + Math.sin(localTime * 2 * speedFactor) * 0.05 * intFactor);
                              } else if (presetId === 'lens-breathing' || presetId === 'lens-focus-ring') {
                                const breathe = Math.sin(localTime * 3 * speedFactor) * 0.04 * intFactor;
                                clipScale = clipScale * (1 + breathe);
                              } else if (presetId === 'lens-drift' || presetId === 'lens-optical-drift') {
                                posX += Math.sin(localTime * 1.5 * speedFactor) * 10 * intFactor;
                                posY += Math.cos(localTime * 1.2 * speedFactor) * 8 * intFactor;
                                clipRotation += Math.sin(localTime * 0.8 * speedFactor) * 1.5 * intFactor;
                              } else if (presetId === 'lens-pulse') {
                                const pulse = Math.abs(Math.sin(localTime * Math.PI * speedFactor)) * 0.08 * intFactor;
                                clipScale = clipScale * (1 + pulse);
                              } else if (presetId === 'lens-stretch') {
                                clipScaleX = clipScaleX * (1 + 0.2 * intFactor);
                              } else if (presetId === 'lens-pincushion') {
                                clipScale = clipScale * (1 - 0.12 * intFactor);
                              }
                            } else if (presetId.startsWith('dist-')) {
                              if (presetId === 'dist-wave' || presetId === 'dist-water' || presetId === 'dist-heat' || presetId === 'dist-wobble' || presetId === 'dist-organic' || presetId === 'dist-fluid' || presetId === 'dist-morph' || presetId === 'dist-chaos') {
                                posX += Math.sin(localTime * 8 * speedFactor) * 15 * intFactor;
                                posY += Math.cos(localTime * 6 * speedFactor) * 10 * intFactor;
                              } else if (presetId === 'dist-jelly' || presetId === 'dist-rubber' || presetId === 'dist-elastic' || presetId === 'dist-elastic-bounce') {
                                const jellyScaleX = 1 + Math.sin(localTime * 10 * speedFactor) * 0.08 * intFactor;
                                const jellyScaleY = 1 + Math.cos(localTime * 10 * speedFactor) * 0.08 * intFactor;
                                clipScaleX = clipScaleX * jellyScaleX;
                                clipScaleY = clipScaleY * jellyScaleY;
                              } else if (presetId === 'dist-swirl' || presetId === 'dist-twist' || presetId === 'dist-spiral' || presetId === 'dist-vortex' || presetId === 'dist-tornado') {
                                clipRotation += Math.sin(localTime * 3 * speedFactor) * 12 * intFactor;
                                clipScale = clipScale * (1 + 0.05 * intFactor);
                              } else if (presetId === 'dist-stretch' || presetId === 'dist-pinch' || presetId === 'dist-bulge' || presetId === 'dist-warp' || presetId === 'dist-extreme' || presetId === 'dist-master') {
                                clipScaleX = clipScaleX * (1 + 0.15 * intFactor);
                                clipScaleY = clipScaleY * (1 + 0.15 * intFactor);
                              } else if (presetId === 'dist-kaleidoscope') {
                                clipRotation += Math.sin(localTime * speedFactor) * 5;
                                clipScale = clipScale * 1.15;
                              } else if (presetId.startsWith('vhs-')) {
                                if (presetId === 'vhs-tracking' || presetId === 'vhs-distortion' || presetId === 'vhs-head-switching' || presetId === 'vhs-dropout' || presetId === 'vhs-signal-loss' || presetId === 'vhs-mag-distortion' || presetId === 'vhs-wave' || presetId === 'vhs-analog-signal' || presetId === 'vhs-master') {
                                  posX += Math.sin(localTime * 15 * speedFactor) * 8 * intFactor;
                                  posY += Math.cos(localTime * 8 * speedFactor) * 5 * intFactor;
                                } else if (presetId === 'vhs-vert-hold') {
                                  posY = (posY + localTime * 120 * speedFactor * intFactor) % 360 - 180;
                                } else if (presetId === 'vhs-horiz-roll') {
                                  posX = (posX + localTime * 150 * speedFactor * intFactor) % 480 - 240;
                                } else if (presetId === 'vhs-tape-stretch' || presetId === 'vhs-tape-fold' || presetId === 'vhs-tape-wrinkle') {
                                  clipScaleY = clipScaleY * (1 + 0.1 * intFactor);
                                }
                              } else if (presetId.startsWith('crt-')) {
                                if (presetId === 'crt-sync-error' || presetId === 'crt-analog-signal' || presetId === 'crt-tv-dist' || presetId === 'crt-broken-signal' || presetId === 'crt-mag-distortion' || presetId === 'crt-electron-beam' || presetId === 'crt-master') {
                                  posX += Math.sin(localTime * 18 * speedFactor) * 4 * intFactor;
                                  posY += Math.cos(localTime * 10 * speedFactor) * 3 * intFactor;
                                } else if (presetId === 'crt-barrel-dist' || presetId === 'crt-screen-warp' || presetId === 'crt-curved-screen') {
                                  clipScale = clipScale * (1 + 0.12 * intFactor);
                                } else if (presetId === 'crt-vert-roll') {
                                  posY = (posY + localTime * 130 * speedFactor * intFactor) % 360 - 180;
                                } else if (presetId === 'crt-horiz-roll') {
                                  posX = (posX + localTime * 140 * speedFactor * intFactor) % 480 - 240;
                                } else if (presetId === 'crt-screen-jitter' || presetId === 'crt-monitor-shake') {
                                  posX += (Math.random() - 0.5) * 15 * intFactor;
                                  posY += (Math.random() - 0.5) * 10 * intFactor;
                                } else if (presetId === 'crt-power-on') {
                                  const beam = Math.min(1, localTime * 2 * speedFactor);
                                  clipScaleX = clipScaleX * beam;
                                  clipScaleY = clipScaleY * Math.max(0.01, beam);
                                } else if (presetId === 'crt-power-off') {
                                  const beam = Math.max(0.01, 1 - localTime * 2 * speedFactor);
                                  clipScaleX = clipScaleX * beam;
                                  clipScaleY = clipScaleY * beam;
                                }
                              }
                            }
                          });
                        }

                        const pipelineState = (!showBeforeOnly && clip.appliedEffects)
                          ? applyEffectPipeline(clip.appliedEffects, localTime, clip.duration || 5, EFFECT_PRESETS)
                          : createDefaultRenderState();

                        const renderedCSS = renderStateToCSS(pipelineState);

                        const targetFilterId = previewFilterId !== null ? previewFilterId : activeFilterId;
                        const filterObj = SAMPLE_FILTERS.find((f: any) => f.id === targetFilterId);
                        const globalFilterStr = (filterObj && filterEnabled && !showBeforeOnly) ? getInterpolatedFilter(filterObj.cssFilter, filterIntensity) : 'none';

                        const rawFilterStr = globalFilterStr === 'none'
                          ? renderedCSS.filterStr
                          : (renderedCSS.filterStr === 'none' ? globalFilterStr : `${globalFilterStr} ${renderedCSS.filterStr}`);

                        const combinedFilter = [rawFilterStr !== 'none' ? rawFilterStr : null, kfFilterStr || null, tState.filter || null].filter(Boolean).join(' ') || 'none';
                        const finalFilterStr = combinedFilter;

                        const finalOpacity = tState.opacity * renderedCSS.opacityVal * kfOpacityMultiplier * (filterEnabled && !showBeforeOnly ? filterOpacity / 100 : 1);
                        const finalBlendMode = (filterEnabled && !showBeforeOnly) ? (filterBlendMode as any) : renderedCSS.mixBlendModeVal;
                        let canvasAspect = 16 / 9;
                        if (aspectRatio === '9/16') canvasAspect = 9 / 16;
                        else if (aspectRatio === '1/1') canvasAspect = 1.0;
                        else if (aspectRatio === '4/5') canvasAspect = 4 / 5;
                        else if (aspectRatio === '4/3') canvasAspect = 4 / 3;
                        else if (aspectRatio === '21/9') canvasAspect = 21 / 9;
                        else if (aspectRatio === 'fit') {
                          const clipMedia = mediaFiles.find(m => m.id === clip.mediaId || m.id === clip.id) as any;
                          if (clipMedia && clipMedia.width && clipMedia.height) {
                            canvasAspect = clipMedia.width / clipMedia.height;
                          }
                        }

                        const clipMedia = mediaFiles.find(m => m.id === clip.mediaId || m.id === clip.id) as any;
                        const mediaWidth = clipMedia?.width || 1920;
                        const mediaHeight = clipMedia?.height || 1080;
                        const mediaAspect = mediaWidth / mediaHeight;

                        const wrapperWidth = mediaAspect > canvasAspect ? '100%' : 'auto';
                        const wrapperHeight = mediaAspect > canvasAspect ? 'auto' : '100%';

                        const finalTransform = `translate(-50%, -50%) translate(${posX}px, ${posY}px) scale(${clipScale * clipScaleX}, ${clipScale * clipScaleY}) rotate(${clipRotation}deg) ${renderedCSS.transformStr} ${tState.transform}`;

                        const isImageOrFreeze = clip.isFreezeFrame || clip.type === 'image' || clip.type === 'freeze' || (clip.url && (clip.url.startsWith('data:image/') || clip.url.endsWith('.png') || clip.url.endsWith('.jpg') || clip.url.endsWith('.jpeg') || clip.url.endsWith('.webp')));

                        return (
                          <div
                            key={clip.id}
                            className="absolute select-none cursor-move"
                            style={{
                              display: isClipVisible ? 'block' : 'none',
                              opacity: isClipVisible ? finalOpacity : 0,
                              zIndex: clip.trackId === 'overlay' ? 20 : (tState.zIndex || 1),
                              visibility: isClipVisible ? 'visible' : 'hidden',
                              position: 'absolute',
                              left: '50%',
                              top: '50%',
                              width: wrapperWidth,
                              height: wrapperHeight,
                              aspectRatio: `${mediaWidth}/${mediaHeight}`,
                              transform: finalTransform,
                              pointerEvents: isClipVisible ? 'auto' : 'none'
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setActiveSelectedClipId(clip.id);
                              setActiveMediaId(clip.mediaId || clip.id);
                              setIsSelectedOnCanvas(true);
                              beginTransaction('Transform clip', getProjectState());
                              setIsDraggingCanvas(true);
                              setDragStart({ x: e.clientX - posX, y: e.clientY - posY });
                            }}
                          >
                            {isImageOrFreeze ? (
                              <img
                                src={clip.url || clip.media_url || clip.src || clip.thumbnails?.[0] || (mediaFiles.find(m => m.id === clip.mediaId || m.id === clip.id)?.url) || (mediaFiles.find(m => m.id === clip.mediaId || m.id === clip.id)?.thumbnails?.[0]) || ''}
                                alt={clip.name}
                                className="h-full w-full object-cover pointer-events-none transition-all duration-150 absolute inset-0"
                                style={{
                                  filter: finalFilterStr,
                                  opacity: finalOpacity,
                                  mixBlendMode: finalBlendMode,
                                  clipPath: clip.crop ? `inset(${clip.crop.top}% ${clip.crop.right}% ${clip.crop.bottom}% ${clip.crop.left}%)` : (kfClipPathStr !== 'none' ? kfClipPathStr : undefined)
                                }}
                              />
                            ) : (
                              <video
                                ref={(el) => {
                                  videoRefs.current[clip.id] = el;
                                  if (el) {
                                    const isVideoMuted = isMuted || !!mutedClips[clip.id] || !!clip.isMuted || !!clip.isAudioDetached || !!clip.audioDetached || clip.embeddedAudioEnabled === false;
                                    el.muted = isVideoMuted;
                                    el.volume = isVideoMuted ? 0 : Math.min(1, Math.max(0, volume * (clip.volume ?? 1) * (hasKeyframeForProperty(clip.keyframes, 'volume') ? interpolatePropertyValue(clip.keyframes, 'volume', clipRelTime, 1) : 1)));
                                  }
                                }}
                                src={clip.url || clip.media_url || clip.src || (mediaFiles.find(m => m.id === clip.mediaId || m.id === clip.id)?.url) || ''}
                                preload="auto"
                                className="h-full w-full object-cover pointer-events-none transition-all duration-150 absolute inset-0"
                                style={{
                                  filter: finalFilterStr,
                                  opacity: finalOpacity,
                                  mixBlendMode: finalBlendMode,
                                  clipPath: clip.crop ? `inset(${clip.crop.top}% ${clip.crop.right}% ${clip.crop.bottom}% ${clip.crop.left}%)` : (kfClipPathStr !== 'none' ? kfClipPathStr : undefined)
                                }}
                                onTimeUpdate={() => handleTimeUpdate(clip.id)}
                                onEnded={() => handleClipEnded(clip.id)}
                              />
                            )}
                            {isSelected && (
                              <div className="absolute inset-0 border-2 border-sky-400 pointer-events-none select-none z-30">
                                {/* Floating toolbar */}
                                <div className="absolute top-[-35px] left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/95 border border-white/10 rounded-md p-1 pointer-events-auto shadow-xl z-50">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsCropModeActive(!isCropModeActive);
                                    }}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                                      isCropModeActive 
                                        ? 'bg-sky-500 text-white' 
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                                    }`}
                                  >
                                    ✂️ {isCropModeActive ? 'Done Crop' : 'Crop'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClip(clip.id);
                                    }}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/25 hover:bg-red-500 text-red-200 hover:text-white transition cursor-pointer"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>

                                {/* Corner resize handles */}
                                <div
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    beginTransaction('Transform/Crop clip', getProjectState());
                                    setIsResizingCanvas('se');
                                    setDragStart({ x: e.clientX, y: e.clientY });
                                  }}
                                  className={`absolute bottom-[-5px] right-[-5px] w-3 h-3 border border-white rounded-full pointer-events-auto shadow-sm cursor-se-resize ${
                                    isCropModeActive ? 'bg-amber-500' : 'bg-sky-400'
                                  }`}
                                />
                                <div
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    beginTransaction('Transform/Crop clip', getProjectState());
                                    setIsResizingCanvas('sw');
                                    setDragStart({ x: e.clientX, y: e.clientY });
                                  }}
                                  className={`absolute bottom-[-5px] left-[-5px] w-3 h-3 border border-white rounded-full pointer-events-auto shadow-sm cursor-sw-resize ${
                                    isCropModeActive ? 'bg-amber-500' : 'bg-sky-400'
                                  }`}
                                />
                                <div
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    beginTransaction('Transform/Crop clip', getProjectState());
                                    setIsResizingCanvas('ne');
                                    setDragStart({ x: e.clientX, y: e.clientY });
                                  }}
                                  className={`absolute top-[-5px] right-[-5px] w-3 h-3 border border-white rounded-full pointer-events-auto shadow-sm cursor-ne-resize ${
                                    isCropModeActive ? 'bg-amber-500' : 'bg-sky-400'
                                  }`}
                                />
                                <div
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    beginTransaction('Transform/Crop clip', getProjectState());
                                    setIsResizingCanvas('nw');
                                    setDragStart({ x: e.clientX, y: e.clientY });
                                  }}
                                  className={`absolute top-[-5px] left-[-5px] w-3 h-3 border border-white rounded-full pointer-events-auto shadow-sm cursor-nw-resize ${
                                    isCropModeActive ? 'bg-amber-500' : 'bg-sky-400'
                                  }`}
                                />

                                {/* Top rotation handle */}
                                {!isCropModeActive && (
                                  <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                                    <div
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        beginTransaction('Rotate clip', getProjectState());
                                        setIsRotatingCanvas(true);
                                        setDragStart({ x: e.clientX, y: e.clientY });
                                      }}
                                      className="w-3.5 h-3.5 bg-sky-400 border border-white rounded-full cursor-alias pointer-events-auto hover:bg-sky-300 transition-colors shadow-md"
                                      title="Rotate"
                                    />
                                    <div className="w-0.5 h-5 bg-sky-400" />
                                  </div>
                                )}
                              </div>
                            )}
                            {pipelineState.overlays.map((ov, idx) => (
                              <div
                                key={ov.id || idx}
                                style={ov.style}
                                className={ov.className || 'absolute inset-0 pointer-events-none'}
                              >
                                {ov.content}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                      {transitionOverlayColor && (
                        <div
                          className="absolute inset-0 pointer-events-none z-30 transition-all duration-75"
                          style={{ backgroundColor: transitionOverlayColor }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                      No video selected
                    </div>
                  );
                })()}

                {/* Dynamic Effect Overlay Simulation */}
                {(activeEffectId === 'vhs-retro' || activeEffectId?.includes('glitch') || activeEffectId?.includes('vhs') || activeEffectId?.includes('tv')) && (
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none z-10 opacity-70 animate-pulse" />
                )}
                {(activeEffectId === 'glitch-core' || activeEffectId?.includes('pixel') || activeEffectId?.includes('corruption') || activeEffectId?.includes('signal')) && (
                  <div className="absolute inset-0 bg-primary/5 mix-blend-color-dodge pointer-events-none z-10 animate-[pulse_0.1s_infinite]" />
                )}
                {(activeEffectId === 'cinema-flare' || activeEffectId?.includes('flare') || activeEffectId?.includes('leak') || activeEffectId?.includes('prism') || activeEffectId?.includes('sun')) && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/10 to-blue-500/20 pointer-events-none z-10 opacity-60" />
                )}
                {(activeEffectId === 'sparkle-glow' || activeEffectId?.includes('glow') || activeEffectId?.includes('bloom') || activeEffectId?.includes('aurora') || activeEffectId?.includes('light')) && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(253,224,71,0.1)_0%,transparent_70%)] pointer-events-none z-10 animate-pulse" />
                )}
                {(activeEffectId === 'neon-edge' || activeEffectId?.includes('spotlight') || activeEffectId?.includes('reflection')) && (
                  <div className="absolute inset-0 border-4 border-sky-400/30 rounded-lg pointer-events-none z-10 filter blur-[2px] shadow-[inset_0_0_15px_rgba(56,189,248,0.5)] animate-pulse" />
                )}

                {/* Text Overlays Layer */}
                {textOverlays
                  .filter((overlay) => currentTime >= (overlay.startTime ?? 0) && currentTime <= (overlay.startTime ?? 0) + (overlay.duration ?? 5))
                  .map((overlay) => {
                    const isSelected = activeOverlayId === overlay.id;
                    const scaleVal = overlay.scale ?? 1;
                    const rotVal = overlay.rotation ?? 0;
                    const posXVal = overlay.posX ?? 0;
                    const posYVal = overlay.posY ?? 0;
                    const flipHVal = overlay.flipH ? -1 : 1;
                    const flipVVal = overlay.flipV ? -1 : 1;

                    // Glow & Neon shadows
                    let shadows: string[] = [];
                    if (overlay.shadow) {
                      shadows.push(`${overlay.shadowOffsetX ?? 2}px ${overlay.shadowOffsetY ?? 2}px ${overlay.shadowBlur ?? 6}px ${overlay.shadowColor || 'rgba(0,0,0,0.6)'}`);
                    }
                    if (overlay.glow) {
                      shadows.push(`0 0 12px ${overlay.glowColor || '#38bdf8'}`);
                    }
                    if (overlay.neon) {
                      shadows.push(`0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ec4899, 0 0 30px #ec4899`);
                    }

                    const bgHex = overlay.bgColor || '#000000';

                    return (
                      <div
                        key={overlay.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveOverlayId(overlay.id);
                          setActiveTab('text');
                        }}
                        className={`absolute cursor-pointer select-none transition-all ${
                          isSelected ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/50 rounded-lg p-1 z-30' : 'z-20'
                        }`}
                        style={{
                          color: overlay.color,
                          fontFamily: overlay.font,
                          fontSize: `${overlay.size * canvasScale * 0.45}px`,
                          fontWeight: overlay.weight || (overlay.bold ? 'bold' : 'normal'),
                          fontStyle: overlay.italic ? 'italic' : 'normal',
                          textAlign: overlay.align || 'center',
                          textDecoration: [
                            overlay.underline ? 'underline' : '',
                            overlay.strikethrough ? 'line-through' : ''
                          ].filter(Boolean).join(' ') || 'none',
                          letterSpacing: overlay.letterSpacing ? `${overlay.letterSpacing * canvasScale * 0.45}px` : 'normal',
                          lineHeight: overlay.lineHeight || 1.2,
                          textTransform: overlay.textTransform || 'none',
                          backgroundColor: overlay.bgOpacity ? `${bgHex}${Math.round((overlay.bgOpacity / 100) * 255).toString(16).padStart(2, '0')}` : 'transparent',
                          opacity: (overlay.opacity ?? 100) / 100,
                          textShadow: shadows.length > 0 ? shadows.join(', ') : 'none',
                          WebkitTextStroke: overlay.stroke ? `${(overlay.strokeWidth || 2) * canvasScale * 0.45}px ${overlay.strokeColor || '#000000'}` : 'none',
                          background: overlay.gradientText || undefined,
                          WebkitBackgroundClip: overlay.gradientText ? 'text' : undefined,
                          WebkitTextFillColor: overlay.gradientText ? 'transparent' : undefined,
                          top: `calc(45% + ${posYVal}px)`,
                          left: `calc(50% + ${posXVal}px)`,
                          transform: `translate(-50%, -50%) rotate(${rotVal}deg) scale(${scaleVal * flipHVal}, ${scaleVal * flipVVal})`,
                          filter: overlay.blur ? `blur(${overlay.blur}px)` : undefined,
                          padding: overlay.bgOpacity ? '4px 10px' : undefined,
                          borderRadius: overlay.bgOpacity ? '6px' : undefined,
                        }}
                      >
                        {overlay.text}
                      </div>
                    );
                  })}

                {/* Captions / Subtitles Overlay */}
                {(() => {
                  const activeCaption = captions.find(
                    (cap) => currentTime >= cap.start && currentTime <= cap.end
                  );
                  if (!activeCaption) return null;

                  const textStyle = {
                    color: captionStyle.color,
                    fontFamily: captionStyle.font,
                    fontSize: `${captionStyle.size * canvasScale * 0.55}px`,
                    backgroundColor: `${captionStyle.bgColor}${Math.round((captionStyle.bgOpacity / 100) * 255).toString(16).padStart(2, '0')}`,
                    bottom: captionStyle.position === 'bottom' ? '12%' : captionStyle.position === 'top' ? '82%' : '48%',
                    zIndex: 25,
                    maxWidth: '85%'
                  };

                  return (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 px-3 py-1 rounded text-center pointer-events-none transition-all duration-150 leading-relaxed font-semibold"
                      style={textStyle}
                    >
                      {activeCaption.text}
                    </div>
                  );
                })()}


              </div>


              {/* Overlay Top Badges */}
              <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between text-xs font-mono pointer-events-none">
                <span className="rounded bg-black/70 border border-border px-2 py-0.5 text-foreground">
                  {activeMedia ? activeMedia.name : '4K · 24fps'}
                </span>
                <span className="rounded bg-primary text-primary-foreground font-bold px-2 py-0.5">
                  LIVE PREVIEW
                </span>
              </div>
            </div>
          </div>

          {/* Full Professional Video Player Controls Bar */}
          <div className="border-t border-border bg-surface px-4 py-2 flex flex-col gap-2 flex-shrink-0">
            {/* Seek Bar Slider */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max={duration || activeMedia?.duration || 1}
                step="0.05"
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-hover rounded-lg cursor-pointer"
              />
            </div>

            {/* Controls Info Bar */}
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-1 text-foreground">
                <span className="text-primary font-semibold">{formatTimecode(currentTime)}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">{formatTimecode(duration || activeMedia?.duration || 0)}</span>
              </div>

              <div className="flex items-center gap-4">
                {/* Volume & Mute */}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <button type="button" onClick={toggleMute} className="hover:text-foreground transition" title={isMuted ? 'Unmute' : 'Mute'}>
                    {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setVolume(v);
                      setIsMuted(false);
                    }}
                    className="w-16 accent-primary h-1 bg-surface-hover rounded-lg cursor-pointer"
                  />
                </div>

                {/* Fullscreen */}
                <button type="button" onClick={toggleFullscreen} className="p-1 text-muted-foreground hover:text-foreground transition">
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: Clip Inspector */}
        <aside className="border-l border-border bg-surface flex flex-col overflow-y-auto p-4 space-y-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Active Clip Properties
            </div>
            <div className="rounded-lg border border-border bg-surface/60 p-3 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Asset Name</span>
                <span className="font-mono text-foreground truncate max-w-[140px]">{activeMedia?.name || 'None'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">File Size</span>
                <span className="font-mono text-foreground">{activeMedia?.size || '0 MB'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-mono text-foreground">{activeMedia?.durationFormatted || '00:00'}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Transform & Blend
            </div>
            <div className="space-y-4">
              {/* Opacity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Opacity</span>
                  <span className="font-mono text-foreground">{Math.round((activeSelectedClip?.opacity ?? 1.0) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round((activeSelectedClip?.opacity ?? 1.0) * 100)}
                  onChange={(e) => {
                    const nextVal = Number(e.target.value) / 100;
                    setTimelineClips((prev) => prev.map((c) => {
                      if (c.id === activeSelectedClip?.id) {
                        return { ...c, opacity: nextVal };
                      }
                      return c;
                    }));
                  }}
                  className="w-full accent-primary h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Scale */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Scale</span>
                  <span className="font-mono text-foreground">{canvasScale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="250"
                  value={Math.round(canvasScale * 100)}
                  onChange={(e) => {
                    const nextVal = Number(e.target.value) / 100;
                    setCanvasScale(nextVal);
                  }}
                  className="w-full accent-primary h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Rotation */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Rotation</span>
                  <span className="font-mono text-foreground">{Math.round(canvasRotation)}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={Math.round(canvasRotation)}
                  onChange={(e) => {
                    const nextVal = Number(e.target.value);
                    setCanvasRotation(nextVal);
                  }}
                  className="w-full accent-primary h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Crop Controls */}
              <div className="space-y-2 pt-2 border-t border-border-strong">
                <span className="text-xs font-semibold text-muted-foreground">Crop Visuals (%)</span>
                <div className="grid grid-cols-2 gap-2">
                  {['left', 'right', 'top', 'bottom'].map((side) => {
                    const currentCropVal = activeSelectedClip?.crop?.[side as any] ?? 0;
                    return (
                      <div key={side} className="space-y-1">
                        <span className="text-[10px] text-muted-foreground capitalize">{side}</span>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={currentCropVal}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(99, Number(e.target.value) || 0));
                            setTimelineClips((prev) => prev.map((c) => {
                              if (c.id === activeSelectedClip?.id) {
                                const nextCrop = { ...(c.crop || { left: 0, right: 0, top: 0, bottom: 0 }), [side]: val };
                                return { ...c, crop: nextCrop };
                              }
                              return c;
                            }));
                          }}
                          className="w-full text-xs font-mono bg-background border border-border rounded px-1.5 py-0.5 text-foreground focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ---------------- BOTTOM TIMELINE SECTION ---------------- */}
      <footer className="h-[340px] border-t border-border bg-surface flex flex-col flex-shrink-0">
        {/* Toolbar */}
        <div className="h-9 border-b border-border px-4 flex items-center justify-between bg-surface text-muted-foreground select-none flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndoAction}
              disabled={!canUndo}
              className="p-1 hover:text-foreground transition disabled:opacity-40 disabled:cursor-not-allowed"
              title="Undo"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedoAction}
              disabled={!canRedo}
              className="p-1 hover:text-foreground transition disabled:opacity-40 disabled:cursor-not-allowed"
              title="Redo"
            >
              <RotateCcw className="h-3.5 w-3.5 transform -scale-x-100" />
            </button>
            <div className="h-3.5 w-px bg-surface/10 mx-1" />

            {/* Production Trim Mode Toggle Button */}
            <button
              type="button"
              onClick={() => {
                const targetId = activeSelectedClipId || activeMediaId || (activeSelectedClip?.id);
                if (targetId) {
                  enterTrimMode(targetId, zoomLevel);
                } else {
                  showToast('Select a clip to enter Trim Mode');
                }
              }}
              className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
                isTrimModeActive
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'bg-surface-hover hover:bg-surface-hover/80 text-foreground'
              }`}
              title="Enter Frame-Accurate Trim Mode (Ctrl+T)"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Trim</span>
            </button>
            <div className="h-3.5 w-px bg-surface/10 mx-1" />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setActiveMediaId(mediaFiles[0]?.id || null);
                handleSeek(0, true);
              }}
              className="p-1 hover:text-foreground transition text-muted-foreground"
              title="Skip to Start"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleSeek(Math.max(0, currentTime - 1))}
              className="p-1 hover:text-foreground transition text-muted-foreground font-mono text-[10px] font-bold"
              title="Backward 1 second (Left Arrow)"
            >
              -1s
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="h-6 w-6 rounded-md bg-surface/10 hover:bg-surface/20 text-foreground flex items-center justify-center transition"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current translate-x-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                const totalDur = getProjectTotalDuration(timelineClips);
                handleSeek(Math.min(totalDur, currentTime + 1));
              }}
              className="p-1 hover:text-foreground transition text-muted-foreground font-mono text-[10px] font-bold"
              title="Forward 1 second (Right Arrow)"
            >
              +1s
            </button>

            <button
              type="button"
              onClick={() => {
                const totalDur = getProjectTotalDuration(timelineClips);
                const lastClip = timelineClips[timelineClips.length - 1];
                if (lastClip) {
                  setActiveMediaId(lastClip.mediaId);
                }
                handleSeek(totalDur, true);
              }}
              className="p-1 hover:text-foreground transition text-muted-foreground"
              title="Skip to End"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ZoomOut className="h-3.5 w-3.5" />
            <input
              type="range"
              min="50"
              max="200"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-20 accent-primary h-1 bg-surface-hover rounded-lg cursor-pointer"
            />
            <ZoomIn className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Timeline Tracks Grid */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* FIXED CENTER PLAYHEAD LINE (WHITE PLAYHEAD) */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-white z-40 pointer-events-none shadow-[0_0_8px_rgba(255,255,255,0.8)] flex flex-col items-center"
            style={{ left: '50%' }}
          >
            <div className="w-4 h-5 bg-white rounded-t-sm rounded-b-md border border-white shadow-[0_0_10px_rgba(255,255,255,0.9)] flex items-center justify-center -translate-y-1">
              <div className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
            </div>
          </div>
          {/* Timeline Fully Draggable Horizontal Container */}
          <div
            ref={timelineScrollRef}
            className="flex-1 min-w-0 relative bg-background overflow-x-scroll overflow-y-hidden p-0 flex flex-col cursor-grab active:cursor-grabbing timeline-scroll-container"
            onMouseDown={handleTimelineMouseDown}
            onMouseMove={handleTimelineMouseMove}
            onMouseUp={handleTimelineMouseUp}
            onMouseLeave={handleTimelineMouseUp}
            onWheel={handleTimelineWheel}
            onClick={handleTimelineClick}
            onScroll={handleTimelineScroll}
          >
            {(() => {
              const pxPerSec = (zoomLevel / 100) * 35;
              const totalTimelineSecs = getProjectTotalDuration(timelineClips);
              const totalTimelineWidth = totalTimelineSecs * pxPerSec;
              const playheadPx = currentTime * pxPerSec;

              return (
                <div
                  className="relative min-h-full flex flex-col justify-start pb-3"
                  style={{
                    width: `${160 + totalTimelineWidth}px`,
                    paddingLeft: 'calc(50vw - 10rem)',
                    paddingRight: '50vw',
                    boxSizing: 'content-box'
                  }}
                >
                  {/* Row 0: Time Ruler */}
                  <div className="flex flex-row h-6 border-b border-border bg-surface select-none flex-shrink-0">
                    <div className="w-40 flex-shrink-0 border-r border-border bg-background flex items-center justify-center text-[9px] font-mono text-muted-foreground tracking-wider">
                      TRACKS
                    </div>
                    <div
                      onMouseDown={handleRulerMouseDown}
                      className="relative flex-1 h-full cursor-ew-resize flex items-center text-[9px] font-mono text-muted-foreground"
                    >
                      {Array.from({ length: Math.ceil(totalTimelineSecs / 5) + 1 }).map((_, i) => {
                        const sec = i * 5;
                        if (sec > totalTimelineSecs) return null;
                        const leftPx = sec * pxPerSec;
                        const m = Math.floor(sec / 60);
                        const s = Math.floor(sec % 60);
                        const label = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                        return (
                          <div
                            key={sec}
                            className="absolute border-l border-border-strong pl-1 h-full flex items-center"
                            style={{ left: `${leftPx}px` }}
                          >
                            <span>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tracks Row Grid Container */}
                  <div className="flex flex-col divide-y divide-white/5">
                    {/* Row 1: Audio Track */}
                    {(() => {
                      const allAudioClips = timelineClips.filter(
                        (c) => c.trackId === 'audio' || c.trackId === 'music' || c.type === 'audio' || c.isDetachedAudio
                      );

                      const audioLanes: (typeof allAudioClips)[] = [];
                      const audioClipLaneMap = new Map<string, number>();

                      allAudioClips.forEach((clip) => {
                        const start = clip.timelineStart ?? clip.start ?? 0;
                        const end = start + clip.duration;
                        let assignedLane = -1;

                        for (let l = 0; l < audioLanes.length; l++) {
                          const laneClips = audioLanes[l];
                          const hasOverlap = laneClips.some((existing) => {
                            const eStart = existing.timelineStart ?? existing.start ?? 0;
                            const eEnd = eStart + existing.duration;
                            return Math.max(start, eStart) < Math.min(end, eEnd);
                          });

                          if (!hasOverlap) {
                            laneClips.push(clip);
                            assignedLane = l;
                            break;
                          }
                        }

                        if (assignedLane === -1) {
                          audioLanes.push([clip]);
                          assignedLane = audioLanes.length - 1;
                        }

                        audioClipLaneMap.set(clip.id, assignedLane);
                      });

                      const totalLanes = Math.max(1, audioLanes.length);
                      const audioRowHeightPx = totalLanes === 1 ? 32 : totalLanes * 22 + 6;

                      return (
                        <div className="flex flex-row items-center bg-surface transition-all duration-200" style={{ height: `${audioRowHeightPx}px` }}>
                          <div
                            className="w-40 h-full flex-shrink-0 flex items-center justify-center bg-background border-r border-border border-b border-border select-none hover:bg-surface-hover/50 cursor-pointer text-xs font-semibold gap-1.5"
                            onClick={(e) => { e.stopPropagation(); setActiveTab('audio'); }}
                          >
                            <span className="text-sm">🎵</span>
                            <span className="text-[10px] font-medium tracking-wide">Audio Track</span>
                          </div>
                          <div className="relative flex-1 h-full border-b border-border px-0 flex items-center">
                            {allAudioClips.map((clip) => {
                              const startSec = clip.timelineStart ?? clip.start ?? 0;
                              const clipLeftPx = startSec * pxPerSec;
                              const clipWidthPx = Math.max(24, clip.duration * pxPerSec);
                              const isSelected = clip.id === activeSelectedClipId;
                              const isMuted = !!mutedClips[clip.id] || !!clip.isMuted;
                              const isLocked = !!lockedClips[clip.id] || !!clip.isLocked;
                              const laneIndex = audioClipLaneMap.get(clip.id) ?? 0;
                              const topPx = totalLanes === 1 ? 4 : laneIndex * 22 + 3;
                              const isExtracted = !!clip.isDetachedAudio;

                              return (
                                <div
                                  key={clip.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveSelectedClipId(clip.id);
                                    setActiveMediaId(clip.mediaId || clip.id);
                                    setIsSelectedOnCanvas(true);
                                    handleSeek(startSec);
                                  }}
                                  className={`h-5 rounded border flex items-center overflow-hidden cursor-pointer absolute transition px-1.5 font-mono text-[8.5px] font-semibold gap-1 select-none ${isSelected
                                      ? 'border-emerald-400 ring-2 ring-emerald-400/50 bg-emerald-500/40 text-emerald-100 z-20 shadow-glow'
                                      : isExtracted
                                        ? 'border-purple-500/50 bg-purple-500/30 text-purple-200 hover:border-purple-400/70 z-10'
                                        : 'border-indigo-500/50 bg-indigo-500/30 text-indigo-200 hover:border-indigo-400/70 z-10'
                                    } ${isMuted ? 'opacity-50 line-through border-dashed' : ''} ${isLocked ? 'opacity-70 border-dashed border-amber-500/40' : ''
                                    }`}
                                  style={{ left: `${clipLeftPx}px`, width: `${clipWidthPx}px`, top: `${topPx}px` }}
                                  title={`${clip.name} (${formatTimecode(clip.duration)})`}
                                >
                                  {(isTrimModeActive ? trimmingClipId === clip.id : isSelected) && !isLocked && (
                                    <ClipTrimHandles
                                      clipId={clip.id}
                                      timelineStart={startSec}
                                      sourceStart={clip.startOffset || 0}
                                      duration={clip.duration}
                                      maxSourceDuration={clip.isDetachedAudio ? clip.duration : (mediaFiles.find(m => m.id === clip.mediaId)?.duration || clip.duration || Infinity)}
                                      pixelsPerSecond={pxPerSec}
                                      playbackRate={clip.playbackRate || 1}
                                      isLocked={isLocked}
                                      playheadTime={currentTime}
                                      onTrimStart={(edge) => beginTransaction(`Trim audio clip ${edge}`, getProjectState())}
                                      onTrimUpdate={(newTimelineStart, newSourceStart, newDuration, activeEdgeTime) => {
                                        handleTrimUpdate(clip.id, newTimelineStart, newSourceStart, newDuration, activeEdgeTime);
                                      }}
                                      onTrimEnd={handleTrimCommit}
                                    />
                                  )}
                                  {clip.keyframes && clip.keyframes.length > 0 && (
                                    <KeyframeTimelineOverlay
                                      clipId={clip.id}
                                      clipTimelineStart={startSec}
                                      clipDuration={clip.duration}
                                      keyframes={clip.keyframes}
                                      pixelsPerSecond={pxPerSec}
                                      playheadTimelineTime={currentTime}
                                      isSelectedClip={isSelected}
                                      onMoveKeyframe={(kfId, newTime) => {
                                        beginTransaction('Move keyframe', getProjectState());
                                        setTimelineClips(prev => prev.map(c => {
                                          if (c.id === clip.id) {
                                            const updatedKeyframes = KeyframeManager.moveKeyframe(c.keyframes, kfId, newTime);
                                            return { ...c, keyframes: updatedKeyframes };
                                          }
                                          return c;
                                        }));
                                        commitTransaction(getProjectState());
                                      }}
                                      onMoveMultipleKeyframes={(moves) => {
                                        beginTransaction('Move keyframes', getProjectState());
                                        setTimelineClips(prev => prev.map(c => {
                                          if (c.id === clip.id) {
                                            const updatedKeyframes = KeyframeManager.moveMultipleKeyframes(c.keyframes, moves);
                                            return { ...c, keyframes: updatedKeyframes };
                                          }
                                          return c;
                                        }));
                                        commitTransaction(getProjectState());
                                      }}
                                      onDeleteKeyframe={(kfId) => {
                                        beginTransaction('Delete keyframe', getProjectState());
                                        setTimelineClips(prev => prev.map(c => {
                                          if (c.id === clip.id) {
                                            const updatedKeyframes = KeyframeManager.deleteKeyframe(c.keyframes, kfId);
                                            return { ...c, keyframes: updatedKeyframes };
                                          }
                                          return c;
                                        }));
                                        commitTransaction(getProjectState());
                                      }}
                                      onKeyframeMarkerClick={(kf) => {
                                        handleSeek(clip.timelineStart + kf.time);
                                        setSelectedKeyframeProperty(kf.property);
                                        setActiveTab('keyframes');
                                      }}
                                    />
                                  )}
                                  <span className="text-[9px] flex-shrink-0">{isExtracted ? '🎧' : '🎵'}</span>
                                  <span className="truncate flex-1">{clip.name}</span>
                                  <span className="text-[7.5px] opacity-80 flex-shrink-0">({formatTimecode(clip.duration)})</span>
                                  {isMuted && <VolumeX className="h-2.5 w-2.5 text-red-400 flex-shrink-0" />}
                                </div>
                              );
                            })}
                            {allAudioClips.length === 0 && (
                              <div className="h-5 rounded bg-surface/40 border border-border w-full absolute top-1.5" />
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Row 2: Text Track */}
                    <div className="flex flex-row h-8 items-center bg-surface">
                      <div
                        className="w-40 h-full flex-shrink-0 flex items-center justify-center bg-background border-r border-border border-b border-border select-none hover:bg-surface-hover/50 cursor-pointer text-xs font-semibold gap-1.5"
                        onClick={(e) => { e.stopPropagation(); setActiveTab('text'); }}
                      >
                        <span className="text-sm">T</span>
                        <span className="text-[10px] font-medium tracking-wide">Text</span>
                      </div>
                      <div className="relative flex-1 h-full border-b border-border px-0 flex items-center">
                        {textOverlays.map((overlay) => {
                          const leftPx = (overlay.startTime ?? 0) * pxPerSec;
                          const durSec = overlay.duration ?? 5;
                          const widthPx = Math.max(24, durSec * pxPerSec);
                          const isSelected = activeOverlayId === overlay.id;

                          return (
                            <div
                              key={overlay.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveOverlayId(overlay.id);
                                setActiveTab('text');
                                handleSeek(overlay.startTime ?? 0);
                              }}
                              className={`absolute h-6 rounded bg-amber-500/25 border text-[9px] px-1.5 truncate flex items-center justify-between font-mono cursor-pointer transition top-1 select-none ${
                                isSelected ? 'border-amber-400 ring-2 ring-amber-400/50 bg-amber-500/40 text-amber-100 z-20 shadow-glow' : 'border-amber-500/35 text-amber-200 hover:border-amber-400/60 z-10'
                              }`}
                              style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                              title={`Text: ${overlay.text} (${durSec.toFixed(1)}s)`}
                            >
                              {/* Left Trim Handle (Start Time & Duration adjustment) */}
                              <div
                                className="absolute left-0 top-0 bottom-0 w-2.5 bg-amber-400/60 hover:bg-amber-300 cursor-ew-resize flex items-center justify-center rounded-l"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  const startX = e.clientX;
                                  const initialStart = overlay.startTime ?? 0;
                                  const initialDur = overlay.duration ?? 5;

                                  const onMouseMove = (moveEv: MouseEvent) => {
                                    const deltaX = moveEv.clientX - startX;
                                    const deltaSec = deltaX / pxPerSec;
                                    const newStart = Math.max(0, initialStart + deltaSec);
                                    const newDur = Math.max(0.5, initialDur - (newStart - initialStart));
                                    handleUpdateTextOverlay(overlay.id, { startTime: newStart, duration: newDur });
                                  };

                                  const onMouseUp = () => {
                                    window.removeEventListener('mousemove', onMouseMove);
                                    window.removeEventListener('mouseup', onMouseUp);
                                  };

                                  window.addEventListener('mousemove', onMouseMove);
                                  window.addEventListener('mouseup', onMouseUp);
                                }}
                              >
                                <div className="w-0.5 h-3 bg-slate-950 rounded-full" />
                              </div>

                              {/* Center Text Label */}
                              <div className="px-3 truncate flex items-center gap-1 min-w-0 flex-1">
                                <span>✍️</span>
                                <span className="truncate font-semibold">{overlay.text}</span>
                                <span className="text-[7.5px] opacity-75">({durSec.toFixed(1)}s)</span>
                              </div>

                              {/* Right Trim Handle (Extend / Shorten duration) */}
                              <div
                                className="absolute right-0 top-0 bottom-0 w-2.5 bg-amber-400/60 hover:bg-amber-300 cursor-ew-resize flex items-center justify-center rounded-r"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  const startX = e.clientX;
                                  const initialDur = overlay.duration ?? 5;

                                  const onMouseMove = (moveEv: MouseEvent) => {
                                    const deltaX = moveEv.clientX - startX;
                                    const deltaSec = deltaX / pxPerSec;
                                    const newDur = Math.max(0.5, initialDur + deltaSec);
                                    handleUpdateTextOverlay(overlay.id, { duration: newDur });
                                  };

                                  const onMouseUp = () => {
                                    window.removeEventListener('mousemove', onMouseMove);
                                    window.removeEventListener('mouseup', onMouseUp);
                                  };

                                  window.addEventListener('mousemove', onMouseMove);
                                  window.addEventListener('mouseup', onMouseUp);
                                }}
                              >
                                <div className="w-0.5 h-3 bg-slate-950 rounded-full" />
                              </div>
                            </div>
                          );
                        })}
                        {captions.map((cap) => {
                          const leftPx = cap.start * pxPerSec;
                          const widthPx = (cap.end - cap.start) * pxPerSec;
                          return (
                            <div
                              key={cap.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab('captions');
                                handleSeek(cap.start);
                              }}
                              className="absolute h-5 rounded bg-primary/25 border border-sky-500/35 text-[8px] px-1.5 truncate flex items-center font-mono cursor-pointer top-1.5 z-10"
                              style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                            >
                              💬 {cap.text}
                            </div>
                          );
                        })}
                        {textOverlays.length === 0 && captions.length === 0 && (
                          <div className="h-5 rounded bg-surface/40 border border-border w-full absolute top-1.5" />
                        )}
                      </div>
                    </div>

                    {/* Row 3: Overlay Track */}
                    <div className="flex flex-row h-8 items-center bg-surface">
                      <div
                        className="w-40 h-full flex-shrink-0 flex items-center justify-center bg-background border-r border-border border-b border-border select-none hover:bg-surface-hover/50 cursor-pointer text-xs font-semibold gap-1.5"
                        onClick={(e) => { e.stopPropagation(); setActiveTab('effects'); }}
                      >
                        <Layers className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-medium tracking-wide">Overlay</span>
                      </div>
                      <div
                        className="relative flex-1 h-full border-b border-border px-0 flex items-center"
                        onDragOver={handleTrackDragOver}
                        onDrop={(e) => handleTrackDrop(e, 'overlay')}
                      >
                        {(() => {
                          const overlayClips = timelineClips.filter((c) => c.trackId === 'overlay');
                          return (
                            <>
                              {overlayClips.map((clip) => {
                                const startSec = clip.timelineStart ?? clip.start ?? 0;
                                const clipLeftPx = startSec * pxPerSec;
                                const clipWidthPx = Math.max(24, clip.duration * pxPerSec);
                                const isSelected = activeSelectedClipId === clip.id;
                                const isLocked = !!lockedClips[clip.id] || !!clip.isLocked;

                                return (
                                  <div
                                    key={clip.id}
                                    draggable={!isLocked}
                                    onDragStart={(e) => handleDragStart(e, clip.id)}
                                    onDragEnd={handleDragEnd}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveSelectedClipId(clip.id);
                                      setActiveMediaId(clip.mediaId || clip.id);
                                      setIsSelectedOnCanvas(true);
                                    }}
                                    className={`h-6 rounded border flex items-center overflow-hidden cursor-pointer absolute transition px-1.5 font-mono text-[8.5px] font-semibold gap-1 select-none ${isSelected
                                        ? 'border-sky-400 ring-2 ring-sky-400/50 bg-primary/25 text-white z-20 shadow-glow'
                                        : 'border-sky-500/30 bg-sky-500/20 text-sky-200 hover:border-sky-400/50 z-10'
                                      } ${isLocked ? 'opacity-70 border-dashed border-amber-500/40' : ''}`}
                                    style={{ left: `${clipLeftPx}px`, width: `${clipWidthPx}px`, top: '4px' }}
                                    title={`${clip.name} (${formatTimecode(clip.duration)})`}
                                  >
                                    {(isTrimModeActive ? trimmingClipId === clip.id : isSelected) && !isLocked && (
                                      <ClipTrimHandles
                                        clipId={clip.id}
                                        timelineStart={startSec}
                                        sourceStart={clip.startOffset || 0}
                                        duration={clip.duration}
                                        maxSourceDuration={mediaFiles.find(m => m.id === clip.mediaId)?.duration || clip.duration || Infinity}
                                        pixelsPerSecond={pxPerSec}
                                        playbackRate={clip.playbackRate || 1}
                                        isLocked={isLocked}
                                        playheadTime={currentTime}
                                        onTrimStart={(edge) => beginTransaction(`Trim overlay clip ${edge}`, getProjectState())}
                                        onTrimUpdate={(newTimelineStart, newSourceStart, newDuration, activeEdgeTime) => {
                                          handleTrimUpdate(clip.id, newTimelineStart, newSourceStart, newDuration, activeEdgeTime);
                                        }}
                                        onTrimEnd={handleTrimCommit}
                                      />
                                    )}
                                    <span className="text-[9px] flex-shrink-0">🎞️</span>
                                    <span className="truncate flex-1">{clip.name}</span>
                                    <span className="text-[7.5px] opacity-80 flex-shrink-0">({formatTimecode(clip.duration)})</span>
                                  </div>
                                );
                              })}
                              {overlayClips.length === 0 && (
                                <div className="h-5 rounded bg-surface/40 border border-border w-full absolute top-1.5" />
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Row 4: Video Track */}
                    <div className="flex flex-row h-14 items-center bg-background/60 border-y border-sky-500/20">
                      <div
                        className="w-40 h-full flex-shrink-0 flex items-center justify-center bg-background border-r border-border select-none hover:bg-primary/10 cursor-pointer text-xs font-semibold gap-1.5"
                        onClick={(e) => { e.stopPropagation(); setActiveTab('media'); }}
                      >
                        <span className="text-sm">🎞️</span>
                        <span className="text-[10px] font-medium tracking-wide">Video</span>
                      </div>
                      <div
                        className="relative flex-1 h-full px-0 flex items-center"
                        onDragOver={handleTrackDragOver}
                        onDrop={(e) => handleTrackDrop(e, 'video')}
                      >
                        {timelineClips
                          .filter((c) => c.trackId !== 'audio' && c.trackId !== 'music' && c.type !== 'audio' && !c.isDetachedAudio && c.trackId !== 'overlay')
                          .reduce<React.ReactNode[]>((acc, clip, idx, videoClipsArray) => {
                            const clipWidthPx = clip.duration * pxPerSec;
                            const isMulti = videoClipsArray.length > 1;
                            const isFirst = idx === 0;
                            const isLast = idx === videoClipsArray.length - 1;

                            const gapLeft = (isMulti && !isFirst) ? 8 : 0;
                            const gapRight = (isMulti && !isLast) ? 8 : 0;

                            const clipLeftPx = clip.timelineStart * pxPerSec + gapLeft;
                            const clipComputedWidth = Math.max(12, clipWidthPx - (gapLeft + gapRight));

                            const numThumbnails = Math.max(1, Math.floor(clipComputedWidth / 48));
                            const isLocked = !!lockedClips[clip.id] || !!clip.isLocked;
                            const isMuted = !!mutedClips[clip.id];
                            const isSelected = clip.id === activeSelectedClipId;

                            const clipEl = (
                              <div
                                key={clip.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSelectedClipId(clip.id);
                                  setActiveMediaId(clip.mediaId);
                                  setIsSelectedOnCanvas(true);
                                }}
                                draggable={!isLocked}
                                onDragStart={(e) => handleDragStart(e, clip.id)}
                                onDragOver={(e) => handleDragOver(e, clip.id)}
                                onDragEnd={handleDragEnd}
                                className={`h-12 rounded-md border flex items-center overflow-hidden cursor-pointer flex-shrink-0 transition absolute ${isSelected
                                    ? 'border-sky-400 ring-2 ring-sky-400/50 bg-primary/25 z-20 shadow-glow scale-[1.01]'
                                    : clip.isFreezeFrame
                                      ? 'border-cyan-500/60 bg-cyan-500/10 hover:border-cyan-400/80 z-10'
                                      : 'border-border-strong bg-surface hover:border-sky-400/60 z-10'
                                  } ${isLocked ? 'opacity-70 border-dashed border-amber-500/30' : ''}`}
                                style={{ left: `${clipLeftPx}px`, width: `${clipComputedWidth}px` }}
                              >
                                {/* Left Trim handle bar */}
                                {(isTrimModeActive ? trimmingClipId === clip.id : isSelected) && !isLocked && (
                                  <ClipTrimHandles
                                    clipId={clip.id}
                                    timelineStart={clip.timelineStart}
                                    sourceStart={clip.startOffset}
                                    duration={clip.duration}
                                    maxSourceDuration={mediaFiles.find(m => m.id === clip.mediaId)?.duration || Infinity}
                                    pixelsPerSecond={pxPerSec}
                                    playbackRate={clip.playbackRate || 1}
                                    isLocked={isLocked}
                                    playheadTime={currentTime}
                                    onTrimStart={(edge) => beginTransaction(`Trim clip ${edge}`, getProjectState())}
                                    onTrimUpdate={(newTimelineStart, newSourceStart, newDuration, activeEdgeTime) => {
                                      handleTrimUpdate(clip.id, newTimelineStart, newSourceStart, newDuration, activeEdgeTime);
                                    }}
                                    onTrimEnd={handleTrimCommit}
                                  />
                                )}
                                {clip.keyframes && clip.keyframes.length > 0 && (
                                  <KeyframeTimelineOverlay
                                    clipId={clip.id}
                                    clipTimelineStart={clip.timelineStart}
                                    clipDuration={clip.duration}
                                    keyframes={clip.keyframes}
                                    pixelsPerSecond={pxPerSec}
                                    playheadTimelineTime={currentTime}
                                    isSelectedClip={isSelected}
                                    onMoveKeyframe={(kfId, newTime) => {
                                      beginTransaction('Move keyframe', getProjectState());
                                      setTimelineClips(prev => prev.map(c => {
                                        if (c.id === clip.id) {
                                          const updatedKeyframes = KeyframeManager.moveKeyframe(c.keyframes, kfId, newTime);
                                          return { ...c, keyframes: updatedKeyframes };
                                        }
                                        return c;
                                      }));
                                      commitTransaction(getProjectState());
                                    }}
                                    onMoveMultipleKeyframes={(moves) => {
                                      beginTransaction('Move keyframes', getProjectState());
                                      setTimelineClips(prev => prev.map(c => {
                                        if (c.id === clip.id) {
                                          const updatedKeyframes = KeyframeManager.moveMultipleKeyframes(c.keyframes, moves);
                                          return { ...c, keyframes: updatedKeyframes };
                                        }
                                        return c;
                                      }));
                                      commitTransaction(getProjectState());
                                    }}
                                    onDeleteKeyframe={(kfId) => {
                                      beginTransaction('Delete keyframe', getProjectState());
                                      setTimelineClips(prev => prev.map(c => {
                                        if (c.id === clip.id) {
                                          const updatedKeyframes = KeyframeManager.deleteKeyframe(c.keyframes, kfId);
                                          return { ...c, keyframes: updatedKeyframes };
                                        }
                                        return c;
                                      }));
                                      commitTransaction(getProjectState());
                                    }}
                                    onKeyframeMarkerClick={(kf) => {
                                      handleSeek(clip.timelineStart + kf.time);
                                      setSelectedKeyframeProperty(kf.property);
                                      setActiveTab('keyframes');
                                    }}
                                  />
                                )}

                                <div className="h-full flex-1 flex overflow-hidden opacity-90 px-2 pointer-events-none">
                                  {(() => {
                                    const parentMedia = mediaFiles.find(m => m.id === clip.mediaId || m.id === clip.id);
                                    const clipThumbs = (Array.isArray(clip.thumbnails) && clip.thumbnails.length > 0)
                                      ? clip.thumbnails
                                      : (parentMedia && Array.isArray(parentMedia.thumbnails) && parentMedia.thumbnails.length > 0)
                                        ? parentMedia.thumbnails
                                        : [];
                                    const fallbackSrc = clip.url || clip.media_url || clip.src || parentMedia?.url;

                                    return Array.from({ length: numThumbnails }).map((_, idx) => {
                                      const currentSrc = clipThumbs.length > 0
                                        ? clipThumbs[idx % clipThumbs.length]
                                        : fallbackSrc;

                                      return currentSrc ? (
                                        <img
                                          key={idx}
                                          src={currentSrc}
                                          alt=""
                                          className="h-full w-12 object-cover flex-shrink-0 border-r border-black/40"
                                        />
                                      ) : (
                                        <div key={idx} className="h-full w-12 bg-sky-950/60 flex items-center justify-center flex-shrink-0 border-r border-black/40">
                                          <Film className="h-3 w-3 text-sky-400/60" />
                                        </div>
                                      );
                                    });
                                  })()}
                                </div>

                                <span className={`px-2 font-mono text-[9px] text-foreground font-semibold truncate py-0.5 rounded-l absolute right-2 bottom-1 pointer-events-none flex items-center gap-1 ${clip.isFreezeFrame ? 'bg-cyan-950/90' : 'bg-black/80'}`}>
                                  {isLocked && <Lock className="h-2.5 w-2.5 text-amber-400 flex-shrink-0" />}
                                  {isMuted && <VolumeX className="h-2.5 w-2.5 text-red-400 flex-shrink-0" />}
                                  {clip.isReversed && <span className="text-sky-400 font-bold text-[9px] flex-shrink-0">⏪ Reversed</span>}
                                  {clip.isFreezeFrame && <span className="text-cyan-400 font-bold text-[9px] flex-shrink-0">❄️ Frozen</span>}
                                  {clip.name} ({formatTimecode(clip.duration)})
                                </span>
                              </div>
                            );

                            acc.push(clipEl);

                            if (idx < videoClipsArray.length - 1) {
                              const nextClip = videoClipsArray[idx + 1];
                              const transitionId = clip.appliedTransition;

                              acc.push(
                                <button
                                  key={`trans-${clip.id}-${nextClip.id}`}
                                  type="button"
                                  onClick={() => {
                                    setSelectedTransitionIndex(idx);
                                    setActiveTransitionId(transitionId);
                                    setEffectsSubTab('transitions');
                                    setActiveTab('transitions');
                                    showToast('Select a transition to apply between clips');
                                  }}
                                  className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-200 shadow-lg z-40 absolute ${transitionId
                                      ? 'bg-primary text-primary-foreground font-bold hover:bg-sky-400 border-sky-400 ring-2 ring-sky-400/30 shadow-[0_0_10px_rgba(56,189,248,0.5)] scale-105'
                                      : 'bg-surface text-primary border-sky-500/40 hover:bg-primary hover:text-primary-foreground hover:border-sky-400 hover:scale-110'
                                    }`}
                                  style={{ left: `${(clip.timelineStart + clip.duration) * pxPerSec - 12}px` }}
                                  title={transitionId ? `Transition: ${transitionId}` : 'Add Transition'}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              );
                            }

                            return acc;
                          }, [])}
                      </div>
                    </div>

                    {/* Row 5: Audio Track */}
                    <div className="flex flex-row h-8 items-center bg-surface">
                      <div
                        className={`w-40 h-full flex-shrink-0 flex items-center justify-center border-r border-border border-t border-border select-none hover:bg-surface-hover/50 cursor-pointer text-xs font-semibold gap-1.5 transition ${isMuted ? 'text-red-400 bg-red-500/10' : 'text-foreground bg-background'
                          }`}
                        onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                      >
                        {isMuted ? <VolumeX className="h-3.5 w-3.5 text-red-400" /> : <Volume2 className="h-3.5 w-3.5" />}
                        <span className="text-[10px] font-medium tracking-wide">{isMuted ? 'Audio (Muted)' : 'Audio Track'}</span>
                      </div>
                      <div className="relative flex-1 h-full border-t border-border bg-surface/50">
                        <div className="h-5 rounded bg-surface/40 border border-border w-full absolute top-1.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* BOTTOM ACTION PANEL */}
        <ClipActionsPanel
          clip={activeSelectedClip ? {
            id: activeSelectedClip.id,
            name: activeSelectedClip.name,
            trackId: activeSelectedClip.trackId || 'video'
          } : null}
          isLocked={!!(activeSelectedClip && (lockedClips[activeSelectedClip.id] || activeSelectedClip.isLocked))}
          isMuted={isMuted || !!(activeSelectedClip && (mutedClips[activeSelectedClip.id] || activeSelectedClip.isMuted))}
          hasClipboardPayload={false}
          onAction={(actionId: string) => handleMenuAction(actionId, activeSelectedClip?.id || '')}
        />
      </footer>

      {/* Camera Movements Keyframe Animations */}
      <style>{`
        @keyframes handheld-sway {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          25% { transform: translate(3px, 2px) rotate(0.2deg); }
          50% { transform: translate(1px, -2px) rotate(-0.2deg); }
          75% { transform: translate(-3px, 1px) rotate(0.1deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes camera-shake {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1.5px, -1.5px); }
          20% { transform: translate(1.5px, 0.8px); }
          30% { transform: translate(-0.8px, 1.5px); }
          40% { transform: translate(0.8px, -0.8px); }
          50% { transform: translate(-1.5px, 0.8px); }
          60% { transform: translate(1.5px, 1.5px); }
          70% { transform: translate(-0.8px, -0.8px); }
          80% { transform: translate(0.8px, 0.8px); }
          90% { transform: translate(-1.5px, -1.5px); }
        }
        .animate-handheld {
          animation: handheld-sway 4s ease-in-out infinite;
        }
        .animate-shake {
          animation: camera-shake 0.4s ease-in-out infinite;
        }
        /* Style the timeline scrollbar explicitly to make it highly visible */
        .timeline-scroll-container::-webkit-scrollbar {
          height: 8px !important;
          display: block !important;
        }
        .timeline-scroll-container::-webkit-scrollbar-track {
          background: #05070c !important;
        }
        .timeline-scroll-container::-webkit-scrollbar-thumb {
          background: #1d2438 !important;
          border-radius: 4px !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
        }
        .timeline-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #38bdf8 !important;
        }
      `}</style>


      {/* Hidden Audio Elements for Timeline Audio Track Clips */}
      <div className="hidden" aria-hidden="true">
        {timelineClips
          .filter((c) => c.trackId === 'audio' || c.trackId === 'music' || c.type === 'audio' || c.isDetachedAudio)
          .map((clip) => {
            const isClipMuted = isMuted || !!mutedClips[clip.id] || !!clip.isMuted;
            const clipVol = isClipMuted ? 0 : Math.min(1, Math.max(0, volume * (clip.volume ?? 1)));

            return (
              <audio
                key={clip.id}
                ref={(el) => {
                  audioRefs.current[clip.id] = el;
                  if (el) {
                    el.muted = isClipMuted;
                    el.volume = clipVol;
                  }
                }}
                src={clip.url}
                preload="auto"
              />
            );
          })}
      </div>

      {/* RENDER TOAST ALERT NOTIFICATION */}
      {toast && (
        <div className="absolute bottom-24 right-4 bg-surface border border-sky-400/30 text-primary text-xs px-3.5 py-2 rounded-xl shadow-glow z-[150] flex items-center gap-1.5 animate-bounce">
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

      {/* EXPORT CENTER MODAL */}
      <ExportCenter
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        projectId={projectId}
        projectTitle={projectTitle || 'My Project'}
        timelineJson={(() => {
          const formattedClips = timelineClips.map((c) => {
            const rawOpacity = typeof c.opacity === 'number' ? c.opacity : 1;
            const opacityNorm = rawOpacity > 1 ? rawOpacity / 100 : rawOpacity;
            const clipIsMuted = isMuted || !!mutedClips[c.id] || c.isMuted || c.muted || false;
            const posXVal = c.posX ?? (c.position && typeof c.position === 'object' ? c.position.x : 0);
            const posYVal = c.posY ?? (c.position && typeof c.position === 'object' ? c.position.y : 0);

            let primaryEffect = c.effect || null;
            if (!primaryEffect && Array.isArray(c.appliedEffects) && c.appliedEffects.length > 0) {
              const eff = c.appliedEffects[0];
              if (eff) {
                primaryEffect = {
                  effect_id: eff.presetId || eff.id || eff.name || 'blur',
                  id: eff.presetId || eff.id || eff.name || 'blur',
                  engine_key: eff.category || eff.engineKey || eff.presetId || 'blur',
                  parameters: {
                    intensity: eff.intensity ?? 50,
                    opacity: eff.opacity ?? 1,
                    speed: eff.speed ?? 1,
                    angle: eff.angle ?? 0,
                    blendMode: eff.blendMode ?? 'normal',
                  },
                };
              }
            }

            let primaryFilter = c.filter || null;
            if (!primaryFilter && Array.isArray(c.filters) && c.filters.length > 0) {
              const filt = c.filters[0];
              if (filt) {
                const rawFiltInt = typeof filt.intensity === 'number' ? filt.intensity : 0.8;
                primaryFilter = {
                  filter_id: filt.id || filt.filterId || 'warm',
                  id: filt.id || filt.filterId || 'warm',
                  intensity: rawFiltInt > 1 ? rawFiltInt / 100 : rawFiltInt,
                  parameters: {},
                };
              }
            } else if (!primaryFilter && c.appliedFilter) {
              const filt = c.appliedFilter;
              const rawFiltInt = typeof filt.intensity === 'number' ? filt.intensity : 0.8;
              primaryFilter = {
                filter_id: filt.id || filt.filterId || 'warm',
                id: filt.id || filt.filterId || 'warm',
                intensity: rawFiltInt > 1 ? rawFiltInt / 100 : rawFiltInt,
                parameters: {},
              };
            }

            let primaryTransition = c.transition || null;
            if (!primaryTransition && c.appliedTransition) {
              const trans = c.appliedTransition;
              primaryTransition = {
                transition_type: trans.type || trans.transition_type || trans.name || 'fade',
                type: trans.type || trans.transition_type || trans.name || 'fade',
                duration: typeof trans.duration === 'number' ? trans.duration : 0.5,
                direction: trans.direction || 'in',
                parameters: {},
              };
            }

            const rawAssetType = (c.type || c.assetType || (c.isDetachedAudio ? 'AUDIO' : 'VIDEO')).toString().toUpperCase();

            return {
              ...c,
              id: c.id,
              media_url: c.url || c.media_url || c.src || '',
              url: c.url || c.media_url || c.src || '',
              asset_type: rawAssetType,
              type: rawAssetType,
              start_time: c.timelineStart ?? c.start_time ?? c.start ?? 0,
              startTime: c.timelineStart ?? c.start_time ?? c.start ?? 0,
              duration: c.duration,
              trim_start: c.startOffset ?? c.trimStart ?? c.trim_start ?? 0,
              trimStart: c.startOffset ?? c.trimStart ?? c.trim_start ?? 0,
              trim_end: c.trimEnd ?? c.trim_end ?? 0,
              trimEnd: c.trimEnd ?? c.trim_end ?? 0,
              playback_speed: c.playbackRate ?? c.speed ?? c.playback_speed ?? 1,
              speed: c.playbackRate ?? c.speed ?? c.playback_speed ?? 1,
              playbackRate: c.playbackRate ?? c.speed ?? c.playback_speed ?? 1,
              isReversed: c.isReversed ?? c.reverse ?? false,
              reverse: c.isReversed ?? c.reverse ?? false,
              isMuted: clipIsMuted,
              muted: clipIsMuted,
              volume: typeof c.volume === 'number' ? c.volume : 1,
              posX: posXVal,
              posY: posYVal,
              position: { x: posXVal, y: posYVal },
              scale: typeof c.scale === 'number' ? c.scale : 1,
              rotation: typeof c.rotation === 'number' ? c.rotation : 0,
              opacity: opacityNorm,
              crop: c.crop ?? { top: 0, bottom: 0, left: 0, right: 0 },
              effect: primaryEffect,
              filter: primaryFilter,
              transition: primaryTransition,
              appliedEffects: c.appliedEffects ?? (primaryEffect ? [primaryEffect] : []),
              filters: c.filters ?? (primaryFilter ? [primaryFilter] : []),
              appliedTransition: primaryTransition,
            };
          });

          const textClips = [
            ...(Array.isArray(textOverlays)
              ? textOverlays.map((t: any) => ({
                  id: `text-${t.id}`,
                  type: 'TEXT',
                  asset_type: 'TEXT',
                  start_time: t.startTime ?? 0,
                  duration: 5.0,
                  text: {
                    content: t.text || '',
                    font: t.font || 'Inter',
                    size: t.size || 24,
                    weight: t.weight || 'normal',
                    color: t.color || '#FFFFFF',
                    alignment: t.alignment || 'center',
                  },
                }))
              : []),
            ...(Array.isArray(captions)
              ? captions.map((cap: any) => ({
                  id: `cap-${cap.id}`,
                  type: 'TEXT',
                  asset_type: 'TEXT',
                  start_time: cap.start ?? 0,
                  duration: Math.max(0.5, (cap.end ?? 0) - (cap.start ?? 0)),
                  text: {
                    content: cap.text || '',
                    font: 'Inter',
                    size: 20,
                    color: '#FFFFFF',
                    alignment: 'center',
                  },
                }))
              : []),
          ];

          const videoClips = formattedClips.filter((c) => (c.asset_type === 'VIDEO' || c.asset_type === 'IMAGE') && c.trackId !== 'overlay');
          const overlayClips = formattedClips.filter((c) => (c.asset_type === 'VIDEO' || c.asset_type === 'IMAGE') && c.trackId === 'overlay');
          const audioClips = formattedClips.filter((c) => c.asset_type === 'AUDIO');

          const tracksList = [
            {
              id: 'track-video-main',
              name: 'Main Video Track',
              type: 'VIDEO',
              order: 0,
              muted: false,
              clips: videoClips,
            },
            {
              id: 'track-audio-main',
              name: 'Audio Track',
              type: 'AUDIO',
              order: 1,
              muted: isMuted,
              clips: audioClips,
            },
          ];

          if (overlayClips.length > 0) {
            tracksList.push({
              id: 'track-video-overlay',
              name: 'Overlay Track',
              type: 'VIDEO',
              order: 2,
              muted: false,
              clips: overlayClips,
            });
          }

          if (textClips.length > 0) {
            tracksList.push({
              id: 'track-text-main',
              name: 'Text Track',
              type: 'TEXT',
              order: 3,
              muted: false,
              clips: textClips,
            });
          }

          return {
            aspectRatio: aspectRatio,
            clips: [...formattedClips, ...textClips],
            tracks: tracksList,
            duration: getProjectTotalDuration(timelineClips),
            isMuted: isMuted,
            mutedClips: mutedClips,
          };
        })()}
      />

      {/* Save Project Options Modal */}
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        getPayload={getProjectPayload}
        onSave={async () => {
          const ok = await performSave(false);
          if (ok) setLastSavedTime(Date.now());
          return ok;
        }}
        isSaving={isSaving}
        lastSavedTime={lastSavedTime}
      />
    </div>
  );
}
