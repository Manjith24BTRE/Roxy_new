import './theme/editorTheme.css';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Download, Film, Type, AudioWaveform,
  Wand2, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  ZoomIn, ZoomOut, Scissors, Split, Plus, Search,
  FolderPlus, Maximize2, RotateCcw, Image as ImageIcon,
  Languages, Crop, Lock, Unlock, Gauge, Replace
} from 'lucide-react';
import { VeytrixLogo } from '../VeytrixLogo';
import { useProjectMedia } from '../../contexts/ProjectMediaContext';

// Quick AI Edit Imports
import { AspectRatio } from './tools/aspect-ratio/AspectRatio';
import { Audio } from './tools/audio/Audio';
import { TextPanel, TextOverlay } from './tools/text/TextPanel';
import { Captions, CaptionItem } from './tools/captions/Captions';
import { Effects } from './tools/effects/Effects';
import { SpeedTool, clampPlaybackRate, getSourceDuration, getEffectiveDuration, timelineTimeToSourceTime, sourceTimeToTimelineTime } from './tools/speed';
import { ReplaceTool, ReplaceMediaPayload } from './tools/replace';
// Force IDE cache refresh for folder casing
import { SAMPLE_FILTERS, getInterpolatedFilter } from './tools/filters/samples';
import { SAMPLE_TRANSITIONS_NEW } from './tools/transitions/Transitions.data';
import { EFFECT_PRESETS, EffectPreset, AppliedEffect, EffectKeyframe, getInterpolatedEffectProps } from './tools/effects/effectsPreset';
import { applyEffectPipeline, renderStateToCSS, createDefaultRenderState } from './tools/effects/renderers';



// Context Menu
import { ClipActionsPanel } from './clip-actions/ClipActionsPanel';
import { ClipTrimHandles } from './trim/ClipTrimHandles';
import { EditorHistoryProvider, useEditorHistory, ProjectState } from './history';

export function EditorMainScreen() {
  return (
    <EditorHistoryProvider>
      <EditorMainScreenContent />
    </EditorHistoryProvider>
  );
}

function EditorMainScreenContent() {
  const navigate = useNavigate();
  const { mediaFiles, activeMediaId, setActiveMediaId } = useProjectMedia();
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'media' | 'ratio' | 'audio' | 'text' | 'captions' | 'effects' | 'speed' | 'replace'>('media');
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

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Timeline Clips sequence tracking
  const [timelineClips, setTimelineClipsState] = useState<any[]>([]);



  // Drag and drop index tracking
  const [draggedClipIndex, setDraggedClipIndex] = useState<number | null>(null);
  const [selectedTransitionIndex, setSelectedTransitionIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    beginTransaction('Move clip', getProjectState());
    setDraggedClipIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault();
    if (draggedClipIndex === null || draggedClipIndex === overIndex) return;

    setTimelineClips((prev: any[]) => {
      const updated = [...prev];
      const [draggedClip] = updated.splice(draggedClipIndex, 1);
      updated.splice(overIndex, 0, draggedClip);
      return recalculateSequence(updated);
    });
    setDraggedClipIndex(overIndex);
  };

  const handleDragEnd = () => {
    setDraggedClipIndex(null);
    commitTransaction(getProjectState());
    showToast('Clips reordered and snapped end-to-end');
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
    let currentStart = 0;
    return clips.map((c) => {
      const updated = { ...c, timelineStart: currentStart };
      currentStart += c.duration;
      return updated;
    });
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
          newCurrentTime = sourceTimeToTimelineTime(updatedClip, targetSourceTime);
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
    const clipIndex = timelineClips.findIndex(c => c.id === clipId);
    if (clipIndex === -1) return;
    const clip = timelineClips[clipIndex];

    const relativePlayhead = currentTime - clip.timelineStart;

    if (relativePlayhead > 0.2 && relativePlayhead < clip.duration - 0.2) {
      const originalSourceDur = getSourceDuration(clip);
      const leftSourceDur = relativePlayhead * (clip.playbackRate || 1);
      const rightSourceDur = originalSourceDur - leftSourceDur;

      const leftPart = {
        ...clip,
        baseDuration: leftSourceDur,
        duration: relativePlayhead
      };
      const rightPart = {
        ...clip,
        id: `${clip.id}-split-${Date.now()}`,
        startOffset: clip.startOffset + leftSourceDur,
        baseDuration: rightSourceDur,
        duration: clip.duration - relativePlayhead
      };

      const updated = [...timelineClips];
      updated.splice(clipIndex, 1, leftPart, rightPart);
      setTimelineClips(recalculateSequence(updated));
      showToast('Split clip successfully');
    } else {
      showToast('Seek playhead inside clip to split');
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
              const newSourceStart = c.startOffset + trimmedSource;
              const newSourceDur = getSourceDuration(c) - trimmedSource;
              return {
                ...c,
                startOffset: newSourceStart,
                baseDuration: newSourceDur,
                duration: c.duration - relativePlayhead
              };
            } else {
              const newSourceDur = relativePlayhead * currentPlaybackRate;
              return {
                ...c,
                baseDuration: newSourceDur,
                duration: relativePlayhead
              };
            }
          }
          return c;
        });
        return recalculateSequence(updated);
      });
      showToast(`Trimmed ${side} to playhead`);
    } else {
      showToast('Seek playhead inside clip to trim');
    }
  };

  const handleAddKeyframeAtPlayhead = (clipId: string) => {
    const clip = timelineClips.find(c => c.id === clipId);
    if (!clip) return;
    const relativePlayhead = currentTime - clip.timelineStart;

    if (relativePlayhead >= 0 && relativePlayhead <= clip.duration) {
      setTimelineClips((prev) =>
        prev.map((c) => {
          if (c.id === clipId) {
            const newKeyframe = {
              time: relativePlayhead,
              properties: { opacity: 1, scale: 1, rotation: 0 }
            };
            const keyframes = c.keyframes ? [...c.keyframes, newKeyframe] : [newKeyframe];
            return { ...c, keyframes };
          }
          return c;
        })
      );
      showToast(`Keyframe added at ${currentTime.toFixed(2)}s`);
    }
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

      setTimelineClips((prev) =>
        prev.map((c) => {
          if (c.id === activeClip.id) {
            const appliedEffects = c.appliedEffects ? [...c.appliedEffects, newEffect] : [newEffect];
            return { ...c, appliedEffects };
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
    if (clip && clip.appliedEffects) {
      const target = clip.appliedEffects.find((e: any) => e.id === effectId);
      if (target) {
        showToast(`Cannot duplicate: "${target.name}" is already applied to this clip`);
        return;
      }
    }
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
    const clipIndex = timelineClips.findIndex(c => c.id === clipId);
    if (clipIndex === -1) return;
    const clip = timelineClips[clipIndex];
    const copy = {
      ...clip,
      id: `${clip.id}-dup-${Date.now()}`,
      name: `${clip.name} (Copy)`
    };

    const updated = [...timelineClips];
    updated.splice(clipIndex + 1, 0, copy);
    setTimelineClips(recalculateSequence(updated));
    showToast('Duplicated clip');
  };

  const handleDeleteClip = (clipId: string) => {
    const updated = timelineClips.filter(c => c.id !== clipId);
    setTimelineClips(recalculateSequence(updated));
    if (activeMediaId === clipId) {
      setActiveMediaId(updated[0]?.mediaId || null);
    }
    showToast('Deleted clip');
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

  const handleTrimUpdate = (clipId: string, _newTimelineStart: number, newSourceStart: number, newDuration: number) => {
    // During drag: update sourceStart and duration, then reflow sequential positions.
    // We intentionally ignore _newTimelineStart from the hook because this is a
    // sequential (VN-style) timeline where clip positions are derived from durations.
    setTimelineClips((prev) => {
      const updated = prev.map(c => 
        c.id === clipId 
          ? { ...c, startOffset: newSourceStart, duration: newDuration } 
          : c
      );
      return recalculateSequence(updated);
    });
  };

  const handleTrimCommit = () => {
    // On pointer up: ensure sequential reflow is committed and show toast.
    setTimelineClipsState((prev) => recalculateSequence(prev));
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
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Wait, let's define dragStart type properly as { x: number, y: number }
  const [isResizingCanvas, setIsResizingCanvas] = useState<string | null>(null);
  const [isRotatingCanvas, setIsRotatingCanvas] = useState(false);

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
        setLockedClips({ ...lockedClips, [clipId]: true });
        showToast(`Locked clip: ${clip.name}`);
        break;
      case 'unlock':
        setLockedClips({ ...lockedClips, [clipId]: false });
        showToast(`Unlocked clip: ${clip.name}`);
        break;
      case 'mute-audio':
        const isCurrentlyMuted = !!mutedClips[clipId];
        setMutedClips({ ...mutedClips, [clipId]: !isCurrentlyMuted });
        showToast(`${isCurrentlyMuted ? 'Unmuted' : 'Muted'} audio track of: ${clip.name}`);
        break;
      case 'reverse':
        showToast(`Mock Action: Reversing video stream for ${clip.name}`);
        break;
      case 'keyframes':
        handleAddKeyframeAtPlayhead(clipId);
        break;
      case 'trim':
        handleTrimToPlayhead(clipId, 'start');
        break;
      case 'add-transition':
        showToast(`Opened transition selection dialog for ${clip.name}`);
        break;
      case 'copy':
        showToast(`Copied clip coordinates to clipboard`);
        break;
      case 'paste':
        showToast(`Pasted attributes to: ${clip.name}`);
        break;
      case 'rename':
        const newName = prompt('Rename clip to:', clip.name);
        if (newName) {
          showToast(`Renamed clip to: ${newName}`);
        }
        break;
      case 'speed':
        const sp = prompt('Adjust speed factor (e.g. 0.5x, 2.0x):', '1.0');
        if (sp) showToast(`Set speed multiplier of ${clip.name} to ${sp}`);
        break;
      case 'detach-audio':
        showToast(`Mock Action: Detached audio stream from ${clip.name}`);
        break;
      case 'freeze-frame':
        showToast(`Mock Action: Created freeze frame at playhead for ${clip.name}`);
        break;
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
        const updatedClips = prevClips.map((clip) => {
          if (clip.id === targetClip.id) {
            const newBaseDuration = newMedia.duration || clip.baseDuration || clip.duration || 5;
            return {
              ...clip, // Preserves clip.id, timelineStart, startOffset, playbackRate, appliedEffects, appliedTransition, keyframes, transforms, animations, volume, mute state, color adjustments, etc.
              mediaId: newMedia.mediaId,
              url: newMedia.url,
              name: newMedia.name,
              thumbnails: newMedia.thumbnails && newMedia.thumbnails.length > 0 ? newMedia.thumbnails : clip.thumbnails,
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
        video.volume = Math.min(1, Math.max(0, volume));
        video.muted = isMuted || !!mutedClips[clip.id];
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

  // Clean up videoRefs
  useEffect(() => {
    const activeIds = new Set(timelineClips.map((c) => c.id));
    Object.keys(videoRefs.current).forEach((id) => {
      if (!activeIds.has(id)) {
        delete videoRefs.current[id];
      }
    });
  }, [timelineClips]);

  // Keyframe interpolation handler
  useEffect(() => {
    const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
    const activeClip = timelineClips.find(c => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration) || 
                       (currentTime >= totalDur ? timelineClips[timelineClips.length - 1] : timelineClips[0]);
    if (activeClip && activeClip.keyframes && activeClip.keyframes.length > 0) {
      const localTime = (currentTime - activeClip.timelineStart) + activeClip.startOffset;
      const sorted = [...activeClip.keyframes].sort((a, b) => a.time - b.time);
      
      let prevKf = sorted[0];
      let nextKf = sorted[sorted.length - 1];
      
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].time <= localTime) {
          prevKf = sorted[i];
        }
        if (sorted[i].time >= localTime) {
          nextKf = sorted[i];
          break;
        }
      }
      
      if (prevKf.id === nextKf.id || prevKf.time === nextKf.time) {
        if (prevKf.properties.scale !== undefined) setCanvasScale(prevKf.properties.scale);
        if (prevKf.properties.rotation !== undefined) setCanvasRotation(prevKf.properties.rotation);
      } else {
        const progress = (localTime - prevKf.time) / (nextKf.time - prevKf.time);
        const lerp = (start: number, end: number) => start + (end - start) * progress;
        
        if (prevKf.properties.scale !== undefined && nextKf.properties.scale !== undefined) {
          setCanvasScale(lerp(prevKf.properties.scale, nextKf.properties.scale));
        }
        if (prevKf.properties.rotation !== undefined && nextKf.properties.rotation !== undefined) {
          setCanvasRotation(lerp(prevKf.properties.rotation, nextKf.properties.rotation));
        }
      }
    }
  }, [currentTime, timelineClips]);

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
    const clip = timelineClips.find((c) => c.id === clipId);
    const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
    const activeClip = timelineClips.find(
      (c) => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration
    ) || timelineClips[0];

    if (clip && activeClip?.id === clip.id) {
      const currentClipIndex = timelineClips.findIndex((c) => c.id === clip.id);
      if (currentClipIndex !== -1 && currentClipIndex < timelineClips.length - 1) {
        const nextClip = timelineClips[currentClipIndex + 1];
        const nextVideo = videoRefs.current[nextClip.id];
        if (nextVideo) {
          nextVideo.currentTime = nextClip.startOffset;
          if (isPlaying) {
            nextVideo.play().catch(() => {});
          }
        }
        setActiveMediaId(nextClip.mediaId);
        setCurrentTime(nextClip.timelineStart);
      } else {
        // Last clip ended
        setIsPlaying(false);
        setCurrentTime(totalDur);
        showToast('Video playback completed');
      }
    }
  };

  // Smooth 60 FPS playhead tracking and auto-follow scrolling loop
  useEffect(() => {
    let animationFrameId: number;

    const updateLoop = () => {
      if (isPlaying) {
        const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
        const activeClip = timelineClips.find(
          (c) => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration
        ) || (currentTime >= totalDur ? timelineClips[timelineClips.length - 1] : timelineClips[0]);

        if (activeClip) {
          const video = videoRefs.current[activeClip.id];
          if (video) {
            // Ensure this active clip is playing
            if (video.paused && !video.seeking) {
              // Pause other clips to be sure
              timelineClips.forEach((c) => {
                const v = videoRefs.current[c.id];
                if (v && c.id !== activeClip.id) {
                  v.pause();
                }
              });
              const targetLocalTime = timelineTimeToSourceTime(activeClip, currentTime);
              video.currentTime = targetLocalTime;
              video.play().catch(() => {});
            } else if (!video.seeking) {
              const absoluteTime = sourceTimeToTimelineTime(activeClip, video.currentTime);
              setCurrentTime(absoluteTime);

              // Center the playhead smoothly by scrolling the container
              if (timelineScrollRef.current) {
                const pxPerSec = (zoomLevel / 100) * 35;
                timelineScrollRef.current.scrollLeft = absoluteTime * pxPerSec;
              }

              // Check if boundary crossed or timeline finished
              if (absoluteTime >= totalDur) {
                video.pause();
                setIsPlaying(false);
                setCurrentTime(totalDur);
                showToast('Video playback completed');
                return;
              }

              // Dynamic boundary switching
              if (absoluteTime >= activeClip.timelineStart + activeClip.duration) {
                const currentClipIndex = timelineClips.findIndex((c) => c.id === activeClip.id);
                if (currentClipIndex !== -1 && currentClipIndex < timelineClips.length - 1) {
                  const nextClip = timelineClips[currentClipIndex + 1];
                  const nextVideo = videoRefs.current[nextClip.id];
                  video.pause();
                  if (nextVideo) {
                    nextVideo.currentTime = nextClip.startOffset;
                    nextVideo.play().catch(() => {});
                  }
                  setActiveMediaId(nextClip.mediaId);
                  setCurrentTime(nextClip.timelineStart);
                }
              }
            }
          }
        }

        animationFrameId = requestAnimationFrame(updateLoop);
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(updateLoop);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, timelineClips, zoomLevel, currentTime, setActiveMediaId]);

  const togglePlay = () => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);

    const activeClip = timelineClips.find(
      (c) => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration
    ) || timelineClips[0];
    if (activeClip) {
      const activeVid = videoRefs.current[activeClip.id];
      if (activeVid) {
        if (nextPlaying) {
          // Pause others just to be sure
          timelineClips.forEach((c) => {
            const v = videoRefs.current[c.id];
            if (v && c.id !== activeClip.id) {
              v.pause();
            }
          });
          const targetLocalTime = timelineTimeToSourceTime(activeClip, currentTime);
          activeVid.currentTime = targetLocalTime;
          activeVid.play().catch(() => {});
        } else {
          activeVid.pause();
        }
      }
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

    const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
    const activeClip = timelineClips.find(c => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration) || 
                       (currentTime >= totalDur ? timelineClips[timelineClips.length - 1] : timelineClips[0]);

    timelineClips.forEach(c => {
      states[c.id] = {
        display: activeClip?.id === c.id,
        opacity: 1,
        filter: '',
        transform: '',
        zIndex: 1
      };
    });

    for (let i = 0; i < timelineClips.length - 1; i++) {
      const clipA = timelineClips[i];
      const clipB = timelineClips[i + 1];
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

  const handleSeek = (time: number, scrollViewport = false) => {
    if (timelineClips.length === 0) {
      setCurrentTime(time);
      return;
    }

    const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
    const clampedTime = Math.min(totalDur, Math.max(0, time));
    
    setCurrentTime(clampedTime);
    if (scrollViewport && timelineScrollRef.current) {
      const pxPerSec = (zoomLevel / 100) * 35;
      timelineScrollRef.current.scrollLeft = clampedTime * pxPerSec;
    }

    const targetActiveClip = timelineClips.find(
      (c) => clampedTime >= c.timelineStart && clampedTime < c.timelineStart + c.duration
    ) || (clampedTime >= totalDur ? timelineClips[timelineClips.length - 1] : timelineClips[0]);

    if (targetActiveClip) {
      if (activeMediaId !== targetActiveClip.mediaId) {
        setActiveMediaId(targetActiveClip.mediaId);
      }
      
      const localTime = Math.max(
        targetActiveClip.startOffset,
        Math.min(
          targetActiveClip.startOffset + getSourceDuration(targetActiveClip) - 0.05,
          timelineTimeToSourceTime(targetActiveClip, clampedTime)
        )
      );

      // Pause all video elements except the target active one
      timelineClips.forEach((c) => {
        const v = videoRefs.current[c.id];
        if (v && c.id !== targetActiveClip.id) {
          v.pause();
        }
      });

      const activeVid = videoRefs.current[targetActiveClip.id];
      if (activeVid) {
        activeVid.currentTime = localTime;
        if (isPlaying) {
          activeVid.play().catch(() => {});
        }
      }
    }
  };

  // Keep the duration state updated and clamp playhead if clips list changes
  useEffect(() => {
    const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0);
    setDuration(totalDur);
    if (currentTime > totalDur) {
      handleSeek(totalDur);
    }
  }, [timelineClips, currentTime]);

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
      setCanvasPos({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (isResizingCanvas) {
      const deltaX = e.clientX - dragStart.x;
      const newScale = Math.max(0.3, Math.min(2.5, canvasScale + deltaX * 0.005));
      setCanvasScale(newScale);
    } else if (isRotatingCanvas) {
      const deltaX = e.clientX - dragStart.x;
      setCanvasRotation((prev: number) => (prev + deltaX * 0.5) % 360);
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

    const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
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

  return (
    <div className="veytrix-editor h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-sans select-none">
      {/* ---------------- TOP BAR ---------------- */}
      <header className="h-12 border-b border-border bg-surface px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md hover:bg-surface-hover transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          <div className="h-4 w-px bg-surface/10" />
          <div className="flex items-center gap-2">
            <VeytrixLogo className="h-5 w-5" />
            <span className="font-mono text-xs font-semibold text-foreground">
              veytrix / {activeMedia ? activeMedia.name : 'untitled-project.vxp'}
            </span>
            <span className="rounded bg-primary/10 border border-sky-500/20 text-primary text-[10px] font-mono px-2 py-0.5">
              Draft
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-surface-hover hover:bg-surface-hover text-foreground transition"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-md bg-gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-95 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>
        </div>
      </header>

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
          <div className="flex border-b border-border bg-surface p-1 gap-0.5 overflow-x-auto flex-shrink-0 scrollbar-none">
            {[
              { id: 'media', label: 'Media', icon: Film },
              { id: 'ratio', label: 'Ratio', icon: Crop },
              { id: 'audio', label: 'Audio', icon: AudioWaveform },
              { id: 'text', label: 'Text', icon: Type },
              { id: 'captions', label: 'Captions', icon: Languages },
              { id: 'effects', label: 'Effects', icon: Wand2 },
              { id: 'speed', label: 'Speed', icon: Gauge },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'effects') {
                    setEffectsSubTab('effects');
                  }
                  setActiveTab(tab.id as any);
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 min-w-0 text-[8px] font-semibold rounded-md transition cursor-pointer overflow-hidden ${
                  activeTab === tab.id
                    ? 'bg-primary/15 text-primary border border-sky-500/25'
                    : 'text-muted-foreground hover:bg-surface-hover'
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
                  <button
                    type="button"
                    onClick={() => navigate('/upload')}
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
                        className={`group relative aspect-video rounded-md border overflow-hidden bg-surface cursor-pointer transition ${
                          item.id === activeMedia?.id
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
              <Audio volume={volume} onVolumeChange={setVolume} />
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

            {activeTab === 'effects' && (
              <Effects
                timelineClips={timelineClips}
                currentTime={currentTime}
                activeTransitionId={activeTransitionId}
                onSelectTransition={handleSelectTransition}
                activeFilterId={activeFilterId}
                onSelectFilter={handleAddFilterAtPlayhead}
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
                effectsSubTab={effectsSubTab}
                onSubTabChange={setEffectsSubTab}
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
                activeClip={timelineClips.find(c => c.mediaId === activeMediaId) || timelineClips[0] || null}
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
                aspectRatio: aspectRatio,
                maxWidth: aspectRatio === '16/9' ? '896px' :
                          aspectRatio === '9/16' ? '260px' :
                          aspectRatio === '1/1' ? '448px' :
                          aspectRatio === '4/3' ? '672px' :
                          aspectRatio === '21/9' ? '1024px' :
                          '896px'
              }}
            >
              
              {/* HTML5 Native Video Tag wrapped in transform container */}
              <div
                className={`h-full w-full relative flex items-center justify-center cursor-move ${
                  (activeEffectId?.includes('shake') || activeEffectId?.includes('jitter') || activeEffectId?.includes('spin') || activeEffectId?.includes('roll')) ? 'animate-shake' :
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
                  const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
                  const activeClip = timelineClips.find(c => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration) || 
                                     (currentTime >= totalDur ? timelineClips[timelineClips.length - 1] : timelineClips[0]);
                  
                  return timelineClips.length > 0 ? (
                    <>
                      {timelineClips.map((clip) => {
                        const isClipActive = activeClip?.id === clip.id;
                        const tState = transitionStates[clip.id] || { display: isClipActive, opacity: 1, filter: '', transform: '', zIndex: 1 };
                        const localTime = (currentTime - clip.timelineStart) + clip.startOffset;

                        // Dynamic transform interpolation from applied effects keyframes
                        let clipScale = canvasScale;
                        let clipRotation = canvasRotation;
                        let clipScaleX = 1;
                        let clipScaleY = 1;
                        let posX = 0;
                        let posY = 0;

                        if (clip.appliedEffects && tState.display) {
                          clip.appliedEffects.forEach((eff: AppliedEffect) => {
                            if (!eff.enabled || showBeforeOnly) return;
                            const props = getInterpolatedEffectProps(eff, localTime);
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

                        const finalFilterStr = [rawFilterStr !== 'none' ? rawFilterStr : null, tState.filter || null].filter(Boolean).join(' ') || 'none';

                        const finalOpacity = tState.opacity * renderedCSS.opacityVal * (filterEnabled && !showBeforeOnly ? filterOpacity / 100 : 1);
                        const finalBlendMode = (filterEnabled && !showBeforeOnly) ? (filterBlendMode as any) : renderedCSS.mixBlendModeVal;
                        const finalTransform = `translate(${posX}px, ${posY}px) scale(${clipScale * clipScaleX}, ${clipScale * clipScaleY}) rotate(${clipRotation}deg) ${renderedCSS.transformStr} ${tState.transform}`;

                        return (
                          <div
                            key={clip.id}
                            className="absolute inset-0 pointer-events-none"
                            style={{ display: tState.display ? 'block' : 'none', zIndex: tState.zIndex }}
                          >
                            <video
                              ref={(el) => {
                                videoRefs.current[clip.id] = el;
                                if (el) {
                                  el.volume = Math.min(1, Math.max(0, volume));
                                  el.muted = isMuted || !!mutedClips[clip.id];
                                }
                              }}
                              src={clip.url}
                              preload="auto"
                              className="h-full w-full object-contain mx-auto pointer-events-none transition-all duration-150 absolute inset-0"
                              style={{
                                filter: finalFilterStr,
                                opacity: finalOpacity,
                                mixBlendMode: finalBlendMode,
                                transform: finalTransform
                              }}
                              onTimeUpdate={() => handleTimeUpdate(clip.id)}
                              onEnded={() => handleClipEnded(clip.id)}
                            />
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
                  .filter((overlay) => currentTime >= (overlay.startTime ?? 0) && currentTime <= (overlay.startTime ?? 0) + 5)
                  .map((overlay) => (
                    <div
                      key={overlay.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveOverlayId(overlay.id);
                        setActiveTab('text');
                      }}
                      className={`absolute cursor-pointer select-none transition-all hover:scale-105 active:scale-95 ${
                        activeOverlayId === overlay.id ? 'ring-1 ring-sky-400 rounded px-1' : ''
                      }`}
                      style={{
                        color: overlay.color,
                        fontFamily: overlay.font,
                        fontSize: `${overlay.size * canvasScale * 0.45}px`,
                        textAlign: overlay.align,
                        fontWeight: overlay.bold ? 'bold' : 'normal',
                        fontStyle: overlay.italic ? 'italic' : 'normal',
                        textDecoration: overlay.underline ? 'underline' : 'none',
                        textShadow: overlay.shadow ? `2px 2px ${overlay.shadowBlur}px ${overlay.shadowColor}` : 'none',
                        WebkitTextStroke: overlay.stroke ? `${overlay.strokeWidth}px ${overlay.strokeColor}` : 'none',
                        top: '45%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 20
                      }}
                    >
                      {overlay.text}
                    </div>
                  ))}

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

                {/* Professional Bounding Box & Transform Handles when Selected */}
                {isSelectedOnCanvas && activeMedia && (
                  <div className="absolute inset-0 border-2 border-sky-400 pointer-events-none z-20 shadow-glow">
                    {/* Top Rotation Handle */}
                    <div
                      className="absolute -top-7 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-sky-400 text-primary-foreground flex items-center justify-center cursor-grab pointer-events-auto shadow-md"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        beginTransaction('Rotate clip', getProjectState());
                        setIsRotatingCanvas(true);
                        setDragStart({ x: e.clientX, y: e.clientY });
                      }}
                      title="Rotate Video"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </div>

                    {/* Corner Handles */}
                    {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
                      <div
                        key={corner}
                        className={`absolute h-3 w-3 bg-surface border-2 border-sky-400 rounded-sm pointer-events-auto cursor-nwse-resize shadow-md ${
                          corner === 'top-left' ? '-top-1.5 -left-1.5' :
                          corner === 'top-right' ? '-top-1.5 -right-1.5' :
                          corner === 'bottom-left' ? '-bottom-1.5 -left-1.5' :
                          '-bottom-1.5 -right-1.5'
                        }`}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          beginTransaction('Resize clip', getProjectState());
                          setIsResizingCanvas(corner);
                          setDragStart({ x: e.clientX, y: e.clientY });
                        }}
                      />
                    ))}

                    {/* Side Edge Handles */}
                    {['top', 'bottom', 'left', 'right'].map((edge) => (
                      <div
                        key={edge}
                        className={`absolute bg-surface border border-sky-400 rounded-sm pointer-events-auto ${
                          edge === 'top' ? '-top-1 left-1/2 -translate-x-1/2 w-4 h-1.5 cursor-ns-resize' :
                          edge === 'bottom' ? '-bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 cursor-ns-resize' :
                          edge === 'left' ? '-left-1 top-1/2 -translate-y-1/2 h-4 w-1.5 cursor-ew-resize' :
                          '-right-1 top-1/2 -translate-y-1/2 h-4 w-1.5 cursor-ew-resize'
                        }`}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          beginTransaction('Resize clip', getProjectState());
                          setIsResizingCanvas(edge);
                          setDragStart({ x: e.clientX, y: e.clientY });
                        }}
                      />
                    ))}
                  </div>
                )}
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
                  <button type="button" onClick={toggleMute} className="hover:text-foreground transition">
                    <Volume2 className={`h-4 w-4 ${isMuted ? 'text-red-400' : 'text-muted-foreground'}`} />
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
            <div className="space-y-3">
              {[
                ['Opacity', '100%'],
                ['Scale', `${canvasScale.toFixed(2)}x`],
                ['Rotation', `${canvasRotation.toFixed(1)}°`],
                ['Position X', `${Math.round(canvasPos.x)} px`],
                ['Position Y', `${Math.round(canvasPos.y)} px`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono text-foreground bg-surface border border-border px-2 py-1 rounded">
                    {v}
                  </span>
                </div>
              ))}
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
                const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
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
                const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
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
              const totalTimelineSecs = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
              const totalTimelineWidth = totalTimelineSecs * pxPerSec;
              const playheadPx = currentTime * pxPerSec;

              return (
                <div
                  className="relative h-full flex flex-col justify-between pb-3"
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
                  <div className="flex flex-col divide-y divide-white/5 flex-1">
                    {/* Row 1: Music Track */}
                    <div className="flex flex-row h-8 items-center bg-surface">
                      <div
                        className="w-40 h-full flex-shrink-0 flex items-center justify-center bg-background border-r border-border border-b border-border select-none hover:bg-surface-hover/50 cursor-pointer text-xs font-semibold gap-1.5"
                        onClick={(e) => { e.stopPropagation(); setActiveTab('audio'); }}
                      >
                        <span className="text-sm">🎵</span>
                        <span className="text-[10px] font-medium tracking-wide">Music</span>
                      </div>
                      <div className="relative flex-1 h-full border-b border-border">
                        <div className="h-5 rounded bg-surface/40 border border-border w-full absolute top-1.5" />
                      </div>
                    </div>

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
                          const widthPx = 5 * pxPerSec; // default 5s duration for text overlays
                          return (
                            <div
                              key={overlay.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveOverlayId(overlay.id);
                                setActiveTab('text');
                                handleSeek(overlay.startTime ?? 0);
                              }}
                              className={`absolute h-5 rounded bg-amber-500/25 border text-[9px] px-1.5 truncate flex items-center font-mono cursor-pointer transition top-1.5 ${
                                activeOverlayId === overlay.id ? 'border-amber-400 ring-1 ring-amber-400 bg-amber-500/40' : 'border-amber-500/35'
                              }`}
                              style={{ left: `${leftPx}px`, width: `${widthPx}px`, zIndex: 10 }}
                            >
                              ✍️ {overlay.text}
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

                    {/* Row 3: Sticker Track */}
                    <div className="flex flex-row h-8 items-center bg-surface">
                      <div
                        className="w-40 h-full flex-shrink-0 flex items-center justify-center bg-background border-r border-border border-b border-border select-none hover:bg-surface-hover/50 cursor-pointer text-xs font-semibold gap-1.5"
                        onClick={(e) => { e.stopPropagation(); setActiveTab('effects'); }}
                      >
                        <span className="text-sm">🖼️</span>
                        <span className="text-[10px] font-medium tracking-wide">Sticker</span>
                      </div>
                      <div className="relative flex-1 h-full border-b border-border">
                        <div className="h-5 rounded bg-surface/40 border border-border w-full absolute top-1.5" />
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
                      <div className="relative flex-1 h-full px-0 flex items-center">
                        {timelineClips.reduce<React.ReactNode[]>((acc, clip, idx) => {
                          const clipWidthPx = clip.duration * pxPerSec;
                          const isFirst = idx === 0;
                          const isLast = idx === timelineClips.length - 1;
                          const startGapPx = isFirst ? 4 : 16;
                          const endGapPx = isLast ? 4 : 16;
                          const clipLeftPx = clip.timelineStart * pxPerSec + startGapPx;
                          const clipComputedWidth = Math.max(12, clipWidthPx - (startGapPx + endGapPx));

                          const numThumbnails = Math.max(1, Math.floor(clipComputedWidth / 48));
                          const isLocked = !!lockedClips[clip.id];
                          const isMuted = !!mutedClips[clip.id];
                          const isSelected = clip.mediaId === activeMediaId;

                          const clipEl = (
                            <div
                              key={clip.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMediaId(clip.mediaId);
                                setIsSelectedOnCanvas(true);
                                handleSeek(clip.timelineStart);
                              }}
                              draggable={!isLocked}
                              onDragStart={(e) => handleDragStart(e, idx)}
                              onDragOver={(e) => handleDragOver(e, idx)}
                              onDragEnd={handleDragEnd}
                              className={`h-12 rounded-md border flex items-center overflow-hidden cursor-pointer flex-shrink-0 transition absolute ${
                                isSelected
                                  ? 'border-sky-400 ring-2 ring-sky-400/50 bg-primary/25 z-20 shadow-glow scale-[1.01]'
                                  : 'border-border-strong bg-surface hover:border-sky-400/60 z-10'
                              } ${isLocked ? 'opacity-70 border-dashed border-amber-500/30' : ''}`}
                              style={{ left: `${clipLeftPx}px`, width: `${clipComputedWidth}px` }}
                            >
                              {/* Left Trim handle bar */}
                              {isSelected && !isLocked && (
                                <ClipTrimHandles
                                  clipId={clip.id}
                                  timelineStart={clip.timelineStart}
                                  sourceStart={clip.startOffset}
                                  duration={clip.duration}
                                  maxSourceDuration={mediaFiles.find(m => m.id === clip.mediaId)?.duration || Infinity}
                                  pixelsPerSecond={pxPerSec}
                                  playbackRate={clip.playbackRate || 1}
                                  isLocked={isLocked}
                                  onTrimStart={(edge) => beginTransaction(`Trim clip ${edge}`, getProjectState())}
                                  onTrimUpdate={(newTimelineStart, newSourceStart, newDuration) => {
                                    handleTrimUpdate(clip.id, newTimelineStart, newSourceStart, newDuration);
                                  }}
                                  onTrimEnd={handleTrimCommit}
                                />
                              )}

                              <div className="h-full flex-1 flex overflow-hidden opacity-90 px-2 pointer-events-none">
                                {Array.from({ length: numThumbnails }).map((_, idx) => (
                                  <img
                                    key={idx}
                                    src={clip.thumbnails[idx % clip.thumbnails.length] || clip.thumbnails[0]}
                                    alt=""
                                    className="h-full w-12 object-cover flex-shrink-0 border-r border-black/40"
                                  />
                                ))}
                              </div>

                              <span className="px-2 font-mono text-[9px] text-foreground font-semibold truncate bg-black/80 py-0.5 rounded-l absolute right-2 bottom-1 pointer-events-none flex items-center gap-1">
                                {isLocked && <Lock className="h-2.5 w-2.5 text-amber-400 flex-shrink-0" />}
                                {isMuted && <VolumeX className="h-2.5 w-2.5 text-red-400 flex-shrink-0" />}
                                {clip.name} ({formatTimecode(clip.duration)})
                              </span>
                            </div>
                          );

                          acc.push(clipEl);

                          if (idx < timelineClips.length - 1) {
                            const nextClip = timelineClips[idx + 1];
                            const transitionId = clip.appliedTransition;
                            
                            acc.push(
                              <button
                                key={`trans-${clip.id}-${nextClip.id}`}
                                type="button"
                                onClick={() => {
                                  setSelectedTransitionIndex(idx);
                                  setActiveTransitionId(transitionId);
                                  setEffectsSubTab('transitions');
                                  setActiveTab('effects');
                                  showToast('Select a transition to apply between clips');
                                }}
                                className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-200 shadow-lg z-40 absolute ${
                                  transitionId 
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
                        className={`w-40 h-full flex-shrink-0 flex items-center justify-center border-r border-border border-t border-border select-none hover:bg-surface-hover/50 cursor-pointer text-xs font-semibold gap-1.5 transition ${
                          isMuted ? 'text-red-400 bg-red-500/10' : 'text-foreground bg-background'
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
          clip={activeMediaId ? {
            id: activeMediaId,
            name: timelineClips.find(c => c.mediaId === activeMediaId)?.name || activeMediaId,
            trackId: 'video'
          } : null}
          isLocked={!!lockedClips[timelineClips.find(c => c.mediaId === activeMediaId)?.id || '']}
          isMuted={!!mutedClips[timelineClips.find(c => c.mediaId === activeMediaId)?.id || '']}
          onAction={(actionId) => handleMenuAction(actionId, timelineClips.find(c => c.mediaId === activeMediaId)?.id || '')}
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


      {/* RENDER TOAST ALERT NOTIFICATION */}
      {toast && (
        <div className="absolute bottom-24 right-4 bg-surface border border-sky-400/30 text-primary text-xs px-3.5 py-2 rounded-xl shadow-glow z-[150] flex items-center gap-1.5 animate-bounce">
          <span>⚡</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
