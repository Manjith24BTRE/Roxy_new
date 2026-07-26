import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Download, Film, Type, AudioWaveform,
  Wand2, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  ZoomIn, ZoomOut, Scissors, Split, Plus, Search,
  FolderPlus, Maximize2, RotateCcw, Image as ImageIcon,
  Languages, Crop, Lock, Unlock
} from 'lucide-react';
import { VeytrixLogo } from '../../../components/VeytrixLogo';
import { useProjectMedia } from '../../../contexts/ProjectMediaContext';

// Quick AI Edit Imports
import { AspectRatio } from '../../../../aspect-ratio/AspectRatio';
import { Audio } from '../../../../audio/Audio';
import { TextPanel, TextOverlay } from '../../../../text/TextPanel';
import { Captions, CaptionItem } from '../../../../captions/Captions';
import { Effects } from '../../../../effects/Effects';
// Force IDE cache refresh for folder casing
import { SAMPLE_FILTERS } from '../../../../filters/samples';

// Standalone Category Databases
import { CINEMATIC_EFFECTS } from '../../../../effects/Cinematic/CinematicEffects.data';
import { CAMERA_EFFECTS } from '../../../../effects/Camera/CameraEffects.data';
import { BLUR_EFFECTS } from '../../../../effects/Blur/BlurEffects.data';
import { GLITCH_EFFECTS } from '../../../../effects/Glitch/GlitchEffects.data';
import { LIGHT_EFFECTS } from '../../../../effects/Light/LightEffects';

// Context Menu
import { TimelineContextMenu } from '../components/Timeline/TimelineContextMenu';

export function EditorPage() {
  const navigate = useNavigate();
  const { mediaFiles, activeMediaId, setActiveMediaId } = useProjectMedia();
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'media' | 'ratio' | 'audio' | 'text' | 'captions' | 'effects'>('media');
  const [zoomLevel, setZoomLevel] = useState(120);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Context Menu and overrides states
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; clip: any } | null>(null);
  const [lockedClips, setLockedClips] = useState<Record<string, boolean>>({});
  const [mutedClips, setMutedClips] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Timeline Clips sequence tracking
  const [timelineClips, setTimelineClips] = useState<any[]>([]);



  // Drag and drop index tracking
  const [draggedClipIndex, setDraggedClipIndex] = useState<number | null>(null);
  const [selectedTransitionIndex, setSelectedTransitionIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedClipIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault();
    if (draggedClipIndex === null || draggedClipIndex === overIndex) return;

    setTimelineClips((prev) => {
      const updated = [...prev];
      const [draggedClip] = updated.splice(draggedClipIndex, 1);
      updated.splice(overIndex, 0, draggedClip);
      return recalculateSequence(updated);
    });
    setDraggedClipIndex(overIndex);
  };

  const handleDragEnd = () => {
    setDraggedClipIndex(null);
    showToast('Clips reordered and snapped end-to-end');
  };

  const handleSelectTransition = (transitionId: string | null) => {
    setActiveTransitionId(transitionId);
    if (selectedTransitionIndex !== null) {
      setTimelineClips((prev) =>
        prev.map((clip, idx) => {
          if (idx === selectedTransitionIndex) {
            return {
              ...clip,
              appliedTransition: transitionId
            };
          }
          return clip;
        })
      );
      showToast(`Applied ${transitionId || 'None'} transition at clip gap`);
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

  const handleSplitClip = (clipId: string) => {
    const clipIndex = timelineClips.findIndex(c => c.id === clipId);
    if (clipIndex === -1) return;
    const clip = timelineClips[clipIndex];

    const relativePlayhead = currentTime - clip.timelineStart;

    if (relativePlayhead > 0.2 && relativePlayhead < clip.duration - 0.2) {
      const leftPart = {
        ...clip,
        duration: relativePlayhead
      };
      const rightPart = {
        ...clip,
        id: `${clip.id}-split-${Date.now()}`,
        duration: clip.duration - relativePlayhead,
        startOffset: clip.startOffset + relativePlayhead
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
            if (side === 'start') {
              return {
                ...c,
                startOffset: c.startOffset + relativePlayhead,
                duration: c.duration - relativePlayhead
              };
            } else {
              return {
                ...c,
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

  const handleAddEffectAtPlayhead = (effectId: string | null) => {
    setActiveEffectId(effectId);
    if (effectId) {
      setTimelineClips((prev) =>
        prev.map((c) => {
          if (currentTime >= c.timelineStart && currentTime <= c.timelineStart + c.duration) {
            const relativePlayhead = currentTime - c.timelineStart;
            const effects = c.effects ? [...c.effects, { id: effectId, time: relativePlayhead }] : [{ id: effectId, time: relativePlayhead }];
            return { ...c, effects };
          }
          return c;
        })
      );
      showToast(`Effect "${effectId}" applied at playhead position ${currentTime.toFixed(2)}s`);
    }
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

  const handleTrimMouseDown = (e: React.MouseEvent, clipId: string, isLeftEdge: boolean) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const clip = timelineClips.find(c => c.id === clipId);
    if (!clip) return;
    const initialDuration = clip.duration;
    const initialStartOffset = clip.startOffset;

    const pxPerSec = (zoomLevel / 100) * 35;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaTime = deltaX / pxPerSec;

      setTimelineClips((prev) => {
        const updated = prev.map((c) => {
          if (c.id === clipId) {
            if (isLeftEdge) {
              const maxDelta = initialDuration - 0.5;
              const finalDelta = Math.min(deltaTime, maxDelta);
              return {
                ...c,
                startOffset: Math.max(0, initialStartOffset + finalDelta),
                duration: Math.max(0.5, initialDuration - finalDelta)
              };
            } else {
              return {
                ...c,
                duration: Math.max(0.5, initialDuration + deltaTime)
              };
            }
          }
          return c;
        });
        return recalculateSequence(updated);
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Synchronize mediaFiles with timelineClips End-to-End
  useEffect(() => {
    if (mediaFiles.length > 0) {
      setTimelineClips((prev) => {
        const existingIds = new Set(prev.map(c => c.mediaId));
        const newClips = mediaFiles
          .filter(m => !existingIds.has(m.id))
          .map(m => ({
            id: m.id,
            mediaId: m.id,
            name: m.name,
            duration: m.duration || 5,
            durationFormatted: m.durationFormatted,
            thumbnails: m.thumbnails,
            url: m.url,
            startOffset: 0,
            timelineStart: 0
          }));
        return recalculateSequence([...prev, ...newClips]);
      });
    } else {
      setTimelineClips([]);
    }
  }, [mediaFiles]);

  // Quick AI Edit Modules State
  const [aspectRatio, setAspectRatio] = useState('16/9');
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null);
  const [captions, setCaptions] = useState<CaptionItem[]>([]);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [filterIntensity, setFilterIntensity] = useState(80);
  const [activeEffectId, setActiveEffectId] = useState<string | null>(null);
  const [effectStrength, setEffectStrength] = useState(60);
  const [effectSpeed, setEffectSpeed] = useState(50);
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
  const [canvasPos, setCanvasPos] = useState({ x: 0, y: 0 });
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasRotation, setCanvasRotation] = useState(0);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Wait, let's define dragStart type properly as { x: number, y: number }
  const [isResizingCanvas, setIsResizingCanvas] = useState<string | null>(null);
  const [isRotatingCanvas, setIsRotatingCanvas] = useState(false);

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
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      clip
    });
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
        showToast(`Mock Action: Replacing assets for ${clip.name}...`);
        break;
      default:
        showToast(`Action trigger: ${actionId}`);
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
        video.volume = volume;
        video.muted = isMuted || !!mutedClips[clip.id];
      }
    });
  }, [volume, isMuted, mutedClips, timelineClips]);

  useEffect(() => {
    timelineClips.forEach((clip) => {
      const video = videoRefs.current[clip.id];
      if (video) {
        video.playbackRate = playbackSpeed;
      }
    });
  }, [playbackSpeed, timelineClips]);

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
        const absoluteTime = (video.currentTime - clip.startOffset) + clip.timelineStart;
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
              const targetLocalTime = (currentTime - activeClip.timelineStart) + activeClip.startOffset;
              video.currentTime = targetLocalTime;
              video.play().catch(() => {});
            } else if (!video.seeking) {
              const absoluteTime = (video.currentTime - activeClip.startOffset) + activeClip.timelineStart;
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
          const targetLocalTime = (currentTime - activeClip.timelineStart) + activeClip.startOffset;
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

  // Compute CSS filter/transform for rendering transitions live in preview window
  const getTransitionStyleAndOverlay = () => {
    for (let i = 0; i < timelineClips.length - 1; i++) {
      const clip = timelineClips[i];
      const t_boundary = clip.timelineStart + clip.duration;
      if (clip.appliedTransition && Math.abs(currentTime - t_boundary) <= 0.4) {
        const progress = (currentTime - (t_boundary - 0.4)) / 0.8; // Normalized 0 to 1
        const type = clip.appliedTransition;
        
        // --- 200 NEW PREMIUM TRANSITIONS MAPPING ---
        if (type.includes('fade') || type.includes('dissolve') || type.includes('blend') || type.includes('dip')) {
          const opacity = Math.max(0, 1 - Math.sin(progress * Math.PI));
          return { opacity, overlayColor: null, filter: null, transform: null };
        }
        if (type.includes('zoom') || type.includes('perspective') || type.includes('tunnel')) {
          const scale = type.includes('out') ? 1 - Math.sin(progress * Math.PI) * 0.25 : 1 + Math.sin(progress * Math.PI) * 0.3;
          return { transform: `scale(${scale})`, opacity: 1, overlayColor: null, filter: null };
        }
        if (type.includes('spin') || type.includes('rotate') || type.includes('flip') || type.includes('roll') || type.includes('barrel') || type.includes('helix')) {
          const rotate = Math.sin(progress * Math.PI) * 180;
          const rotateY = type.includes('flip') ? ` rotateY(${rotate}deg)` : '';
          return { transform: `rotate(${rotate}deg)${rotateY}`, opacity: 1, overlayColor: null, filter: null };
        }
        if (type.includes('slide') || type.includes('push') || type.includes('swipe') || type.includes('card') || type.includes('gallery')) {
          const translateVal = (progress - 0.5) * 120;
          const isVert = type.includes('up') || type.includes('down');
          const factor = (type.includes('left') || type.includes('up')) ? -1 : 1;
          const transform = isVert ? `translateY(${translateVal * factor}px)` : `translateX(${translateVal * factor}px)`;
          return { transform, opacity: 1, overlayColor: null, filter: null };
        }
        if (type.includes('blur')) {
          const blurVal = Math.sin(progress * Math.PI) * 10;
          const opacity = Math.max(0, 1 - Math.sin(progress * Math.PI) * 0.5);
          return { filter: `blur(${blurVal}px)`, opacity, overlayColor: null, transform: null };
        }
        if (type.includes('glitch') || type.includes('static') || type.includes('loss') || type.includes('error') || type.includes('crash') || type.includes('storm')) {
          const flashOpacity = Math.sin(progress * Math.PI) * 0.5;
          const translateVal = (progress - 0.5) * 10;
          return {
            filter: 'hue-rotate(60deg) contrast(1.3)',
            overlayColor: `rgba(255,255,255,${flashOpacity})`,
            opacity: 1,
            transform: `translateX(${translateVal}px)`
          };
        }
        if (type.includes('light') || type.includes('flare') || type.includes('burn') || type.includes('glow') || type.includes('bloom') || type.includes('rays') || type.includes('burst') || type.includes('flash')) {
          const flashOpacity = Math.sin(progress * Math.PI) * 0.9;
          return {
            filter: null,
            overlayColor: `rgba(255,255,255,${flashOpacity})`,
            opacity: 1,
            transform: null
          };
        }
        if (type.includes('whip') || type.includes('pan') || type.includes('camera') || type.includes('shake') || type.includes('handheld') || type.includes('drone') || type.includes('crane')) {
          const blurVal = Math.sin(progress * Math.PI) * 10;
          const translateVal = (progress - 0.5) * 80;
          return { filter: `blur(${blurVal}px)`, transform: `translateX(${translateVal}px)`, opacity: 1, overlayColor: null };
        }

        // --- OLD TRANSITIONS FALLBACK ---
        if (type === 'fade-black' || type === 'cross-dissolve') {
          const opacity = Math.max(0, 1 - Math.sin(progress * Math.PI));
          return { opacity, overlayColor: null, filter: null, transform: null };
        }
        if (type === 'glitch-cut') {
          const flashOpacity = Math.sin(progress * Math.PI) * 0.7;
          return { filter: 'hue-rotate(90deg) contrast(1.5)', overlayColor: `rgba(255,255,255,${flashOpacity})`, opacity: 1, transform: null };
        }
        if (type === 'whip-pan') {
          const blurVal = Math.sin(progress * Math.PI) * 12;
          const translateVal = (progress - 0.5) * 120;
          return { filter: `blur(${blurVal}px)`, transform: `translateX(${translateVal}px)`, opacity: 1, overlayColor: null };
        }
        if (type === 'zoom-in') {
          const scale = 1 + Math.sin(progress * Math.PI) * 0.25;
          return { transform: `scale(${scale})`, opacity: 1, overlayColor: null, filter: null };
        }
        if (type === 'zoom-out') {
          const scale = 1 - Math.sin(progress * Math.PI) * 0.2;
          return { transform: `scale(${scale})`, opacity: 1, overlayColor: null, filter: null };
        }
        if (type === 'spin-clockwise') {
          const rotate = Math.sin(progress * Math.PI) * 180;
          return { transform: `rotate(${rotate}deg)`, opacity: 1, overlayColor: null, filter: null };
        }
        if (type === 'slide-left') {
          const translateVal = (progress - 0.5) * 120;
          return { transform: `translateX(${-translateVal}px)`, opacity: 1, overlayColor: null, filter: null };
        }
        if (type === 'slide-right') {
          const translateVal = (progress - 0.5) * 120;
          return { transform: `translateX(${translateVal}px)`, opacity: 1, overlayColor: null, filter: null };
        }
        if (type === 'page-flip') {
          const rotateY = (progress - 0.5) * 180;
          return { transform: `perspective(600px) rotateY(${rotateY}deg)`, opacity: 1, overlayColor: null, filter: null };
        }
      }
    }
    return null;
  };

  const handleSeek = (time: number) => {
    if (timelineClips.length === 0) {
      setCurrentTime(time);
      return;
    }

    const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
    const clampedTime = Math.min(totalDur, Math.max(0, time));
    
    setCurrentTime(clampedTime);
    if (timelineScrollRef.current) {
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
          targetActiveClip.startOffset + targetActiveClip.duration - 0.05,
          (clampedTime - targetActiveClip.timelineStart) + targetActiveClip.startOffset
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
    setIsMuted(!isMuted);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

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

  // Timeline Shift + Wheel Scroll
  const handleTimelineWheel = (e: React.WheelEvent) => {
    if (timelineScrollRef.current) {
      if (e.shiftKey) {
        timelineScrollRef.current.scrollLeft += e.deltaY;
      } else if (Math.abs(e.deltaX) > 0) {
        timelineScrollRef.current.scrollLeft += e.deltaX;
      } else {
        timelineScrollRef.current.scrollLeft += e.deltaY;
      }
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
          activeClip.startOffset + activeClip.duration - 0.05,
          (clampedTime - activeClip.timelineStart) + activeClip.startOffset
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
    <div className="h-screen w-screen flex flex-col bg-[#070a11] text-slate-100 overflow-hidden font-sans select-none">
      {/* ---------------- TOP BAR ---------------- */}
      <header className="h-12 border-b border-white/10 bg-[#0c101d] px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <VeytrixLogo className="h-5 w-5" />
            <span className="font-mono text-xs font-semibold text-slate-200">
              veytrix / {activeMedia ? activeMedia.name : 'untitled-project.vxp'}
            </span>
            <span className="rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-mono px-2 py-0.5">
              Draft
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-md bg-gradient-primary text-slate-950 font-semibold shadow-glow hover:opacity-95 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* ---------------- MAIN WORKSPACE GRID ---------------- */}
      <div className="flex-1 grid grid-cols-[280px_1fr_300px] overflow-hidden">

        {/* LEFT PANEL: Media Library & Quick AI Edit Modules */}
        <aside className="border-r border-white/10 bg-[#090d16] flex flex-col overflow-hidden">
          <div className="flex border-b border-white/10 bg-[#0c101d] p-1 gap-0.5 overflow-x-auto flex-shrink-0 scrollbar-none">
            {[
              { id: 'media', label: 'Media', icon: Film },
              { id: 'ratio', label: 'Ratio', icon: Crop },
              { id: 'audio', label: 'Audio', icon: AudioWaveform },
              { id: 'text', label: 'Text', icon: Type },
              { id: 'captions', label: 'Captions', icon: Languages },
              { id: 'effects', label: 'Effects', icon: Wand2 },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 px-1 min-w-[44px] text-[9px] font-semibold rounded-md transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/25'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
            {activeTab === 'media' && (
              <>
                <div className="p-3 border-b border-white/10 space-y-2 flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      className="w-full rounded-md bg-slate-900 border border-white/10 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/upload')}
                    className="w-full flex items-center justify-center gap-1.5 rounded-md bg-sky-500/10 border border-sky-500/20 py-1.5 text-xs font-medium text-sky-400 hover:bg-sky-500/20 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Import More Media</span>
                  </button>
                </div>

                {/* Media Asset List */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
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
                        className={`group relative aspect-video rounded-md border overflow-hidden bg-slate-900 cursor-pointer transition ${
                          item.id === activeMedia?.id
                            ? 'border-sky-400 ring-1 ring-sky-400 shadow-glow'
                            : 'border-white/10 hover:border-sky-400/50'
                        }`}
                      >
                        {item.thumbnails[0] ? (
                          <img src={item.thumbnails[0]} alt="" className="h-full w-full object-cover animate-fade-in" />
                        ) : (
                          <div className="h-full w-full bg-slate-800 flex items-center justify-center">
                            <Film className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-mono text-white">
                          {item.durationFormatted}
                        </div>
                        <div className="absolute top-1 left-1 rounded bg-black/70 px-1 py-0.5 text-[8px] font-mono text-slate-300 truncate max-w-[80px]">
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
                activeEffectId={activeEffectId}
                onSelectEffect={handleAddEffectAtPlayhead}
                activeTransitionId={activeTransitionId}
                onSelectTransition={handleSelectTransition}
                effectStrength={effectStrength}
                onEffectStrengthChange={setEffectStrength}
                effectSpeed={effectSpeed}
                onEffectSpeedChange={setEffectSpeed}
                activeFilterId={activeFilterId}
                onSelectFilter={handleAddFilterAtPlayhead}
                filterIntensity={filterIntensity}
                onFilterIntensityChange={setFilterIntensity}
              />
            )}
          </div>
        </aside>


        {/* CENTER: Live Video Preview Monitor with Interactive Bounding Box */}
        <main
          className="flex flex-col border-r border-white/10 bg-[#05080f] overflow-hidden"
          onDoubleClick={() => setIsSelectedOnCanvas(false)}
        >
          <div
            className="flex-1 p-4 flex flex-col items-center justify-center relative overflow-hidden"
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
          >
            <div
              className="relative w-full rounded-xl border border-white/15 bg-black overflow-hidden shadow-2xl flex flex-col justify-between p-2 group transition-all duration-300 mx-auto"
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
                  const transitionData = getTransitionStyleAndOverlay();
                  const totalDur = timelineClips.reduce((acc, c) => acc + c.duration, 0) || 5;
                  const activeClip = timelineClips.find(c => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration) || 
                                     (currentTime >= totalDur ? timelineClips[timelineClips.length - 1] : timelineClips[0]);
                  
                  return timelineClips.length > 0 ? (
                    <>
                      {timelineClips.map((clip) => {
                        const isClipActive = activeClip?.id === clip.id;
                        return (
                          <video
                            key={clip.id}
                            ref={(el) => {
                              videoRefs.current[clip.id] = el;
                              if (el) {
                                el.volume = volume;
                                el.muted = isMuted || !!mutedClips[clip.id];
                              }
                            }}
                            src={clip.url}
                            preload="auto"
                            className="h-full w-full object-contain mx-auto pointer-events-none transition-all duration-150 absolute inset-0"
                            style={{
                              display: isClipActive ? 'block' : 'none',
                              filter: (() => {
                                const filterObj = SAMPLE_FILTERS.find((f: any) => f.id === activeFilterId);
                                let filterStr = filterObj ? `${filterObj.cssFilter} brightness(${1 + (filterIntensity - 80) / 400})` : 'none';

                                // Apply categorized activeEffect visual styling
                                if (activeEffectId) {
                                  const cin = CINEMATIC_EFFECTS.find(e => e.id === activeEffectId);
                                  if (cin && cin.colorGrading) {
                                    filterStr = filterStr === 'none' ? cin.colorGrading : `${filterStr} ${cin.colorGrading}`;
                                  } else if (activeEffectId.includes('blur') || BLUR_EFFECTS.some(e => e.id === activeEffectId)) {
                                    filterStr = filterStr === 'none' ? 'blur(4px)' : `${filterStr} blur(4px)`;
                                  } else if (activeEffectId.includes('glitch') || GLITCH_EFFECTS.some(e => e.id === activeEffectId)) {
                                    filterStr = filterStr === 'none' ? 'hue-rotate(45deg) saturate(1.4) contrast(1.15)' : `${filterStr} hue-rotate(45deg) saturate(1.4) contrast(1.15)`;
                                  } else if (activeEffectId.includes('light') || LIGHT_EFFECTS.some(e => e.id === activeEffectId)) {
                                    filterStr = filterStr === 'none' ? 'brightness(1.2) saturate(1.1)' : `${filterStr} brightness(1.2) saturate(1.1)`;
                                  } else if (activeEffectId.includes('analog') || activeEffectId.includes('vhs') || activeEffectId.includes('retro') || activeEffectId.includes('sepia') || activeEffectId.includes('vintage') || activeEffectId.includes('old-movie') || activeEffectId.includes('super-8') || activeEffectId.includes('film-grain') || activeEffectId.includes('film-burn') || activeEffectId.includes('color-bleed') || activeEffectId.includes('crt') || activeEffectId.includes('dust-scratches') || activeEffectId.includes('cinema-archive')) {
                                    filterStr = filterStr === 'none' ? 'sepia(0.3) contrast(1.1) brightness(0.95)' : `${filterStr} sepia(0.3) contrast(1.1) brightness(0.95)`;
                                  } else if (activeEffectId.includes('fire') || activeEffectId.includes('flame') || activeEffectId.includes('ember') || activeEffectId.includes('burning') || activeEffectId.includes('heat-wave') || activeEffectId.includes('lava') || activeEffectId.includes('torch') || activeEffectId.includes('inferno') || activeEffectId.includes('camp') || activeEffectId.includes('molten') || activeEffectId.includes('ash-particles')) {
                                    filterStr = filterStr === 'none' ? 'saturate(1.2) hue-rotate(-10deg) brightness(1.05)' : `${filterStr} saturate(1.2) hue-rotate(-10deg) brightness(1.05)`;
                                  } else if (activeEffectId.includes('smoke') || activeEffectId.includes('fog') || activeEffectId.includes('mist') || activeEffectId.includes('steam') || activeEffectId.includes('vapor') || activeEffectId.includes('dry-ice') || activeEffectId.includes('dust-cloud')) {
                                    filterStr = filterStr === 'none' ? 'contrast(0.9) brightness(1.05) blur(1px)' : `${filterStr} contrast(0.9) brightness(1.05) blur(1px)`;
                                  } else if (activeEffectId.includes('rain') || activeEffectId.includes('snow') || activeEffectId.includes('storm') || activeEffectId.includes('blizzard') || activeEffectId.includes('hail') || activeEffectId.includes('lightning') || activeEffectId.includes('thunder') || activeEffectId.includes('wind') || activeEffectId.includes('aurora') || activeEffectId.includes('leaves') || activeEffectId.includes('blossom') || activeEffectId.includes('meteor') || activeEffectId.includes('moonlight') || activeEffectId.includes('rainbow') || activeEffectId.includes('sunshine') || activeEffectId.includes('cloud-overlay')) {
                                    filterStr = filterStr === 'none' ? 'hue-rotate(15deg) saturate(0.95)' : `${filterStr} hue-rotate(15deg) saturate(0.95)`;
                                  } else if (activeEffectId.includes('particle') || activeEffectId.includes('sparkle') || activeEffectId.includes('glitter') || activeEffectId.includes('confetti') || activeEffectId.includes('heart') || activeEffectId.includes('star') || activeEffectId.includes('bubble') || activeEffectId.includes('fireflies') || activeEffectId.includes('dust') || activeEffectId.includes('shape') || activeEffectId.includes('diamond')) {
                                    filterStr = filterStr === 'none' ? 'contrast(1.05) saturate(1.1) brightness(1.02)' : `${filterStr} contrast(1.05) saturate(1.1) brightness(1.02)`;
                                  }
                                }

                                if (isClipActive && transitionData?.filter) {
                                  filterStr = filterStr === 'none' ? transitionData.filter : `${filterStr} ${transitionData.filter}`;
                                }

                                return filterStr;
                              })(),
                              opacity: isClipActive && transitionData?.opacity !== undefined ? transitionData.opacity : 1,
                              transform: isClipActive && transitionData?.transform ? transitionData.transform : undefined,
                            }}
                            onTimeUpdate={() => handleTimeUpdate(clip.id)}
                            onEnded={() => handleClipEnded(clip.id)}
                          />
                        );
                      })}
                      {transitionData?.overlayColor && (
                        <div
                          className="absolute inset-0 pointer-events-none z-30"
                          style={{ backgroundColor: transitionData.overlayColor }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">
                      No video selected
                    </div>
                  );
                })()}

                {/* Dynamic Effect Overlay Simulation */}
                {(activeEffectId === 'vhs-retro' || activeEffectId?.includes('glitch') || activeEffectId?.includes('vhs') || activeEffectId?.includes('tv')) && (
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none z-10 opacity-70 animate-pulse" />
                )}
                {(activeEffectId === 'glitch-core' || activeEffectId?.includes('pixel') || activeEffectId?.includes('corruption') || activeEffectId?.includes('signal')) && (
                  <div className="absolute inset-0 bg-sky-500/5 mix-blend-color-dodge pointer-events-none z-10 animate-[pulse_0.1s_infinite]" />
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
                      className="absolute -top-7 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center cursor-grab pointer-events-auto shadow-md"
                      onMouseDown={(e) => {
                        e.stopPropagation();
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
                        className={`absolute h-3 w-3 bg-white border-2 border-sky-400 rounded-sm pointer-events-auto cursor-nwse-resize shadow-md ${
                          corner === 'top-left' ? '-top-1.5 -left-1.5' :
                          corner === 'top-right' ? '-top-1.5 -right-1.5' :
                          corner === 'bottom-left' ? '-bottom-1.5 -left-1.5' :
                          '-bottom-1.5 -right-1.5'
                        }`}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setIsResizingCanvas(corner);
                          setDragStart({ x: e.clientX, y: e.clientY });
                        }}
                      />
                    ))}

                    {/* Side Edge Handles */}
                    {['top', 'bottom', 'left', 'right'].map((edge) => (
                      <div
                        key={edge}
                        className={`absolute bg-white border border-sky-400 rounded-sm pointer-events-auto ${
                          edge === 'top' ? '-top-1 left-1/2 -translate-x-1/2 w-4 h-1.5 cursor-ns-resize' :
                          edge === 'bottom' ? '-bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 cursor-ns-resize' :
                          edge === 'left' ? '-left-1 top-1/2 -translate-y-1/2 h-4 w-1.5 cursor-ew-resize' :
                          '-right-1 top-1/2 -translate-y-1/2 h-4 w-1.5 cursor-ew-resize'
                        }`}
                        onMouseDown={(e) => {
                          e.stopPropagation();
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
                <span className="rounded bg-black/70 border border-white/10 px-2 py-0.5 text-slate-300">
                  {activeMedia ? activeMedia.name : '4K · 24fps'}
                </span>
                <span className="rounded bg-sky-500 text-slate-950 font-bold px-2 py-0.5">
                  LIVE PREVIEW
                </span>
              </div>
            </div>
          </div>

          {/* Full Professional Video Player Controls Bar */}
          <div className="border-t border-white/10 bg-[#090d16] px-4 py-2 flex flex-col gap-2 flex-shrink-0">
            {/* Seek Bar Slider */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max={duration || activeMedia?.duration || 1}
                step="0.05"
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Controls Info Bar */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1 text-slate-300">
                <span className="text-sky-400 font-semibold">{formatTimecode(currentTime)}</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">{formatTimecode(duration || activeMedia?.duration || 0)}</span>
              </div>

              <div className="flex items-center gap-4">
                {/* Volume & Mute */}
                <div className="flex items-center gap-1.5 text-slate-400">
                  <button type="button" onClick={toggleMute} className="hover:text-white transition">
                    <Volume2 className={`h-4 w-4 ${isMuted ? 'text-red-400' : 'text-slate-400'}`} />
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
                    className="w-16 accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Fullscreen */}
                <button type="button" onClick={toggleFullscreen} className="p-1 text-slate-400 hover:text-white transition">
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: Clip Inspector */}
        <aside className="border-l border-white/10 bg-[#090d16] flex flex-col overflow-y-auto p-4 space-y-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3">
              Active Clip Properties
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Asset Name</span>
                <span className="font-mono text-slate-200 truncate max-w-[140px]">{activeMedia?.name || 'None'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">File Size</span>
                <span className="font-mono text-slate-200">{activeMedia?.size || '0 MB'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Duration</span>
                <span className="font-mono text-slate-200">{activeMedia?.durationFormatted || '00:00'}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3">
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
                  <span className="text-slate-400">{k}</span>
                  <span className="font-mono text-slate-200 bg-slate-900 border border-white/10 px-2 py-1 rounded">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ---------------- BOTTOM TIMELINE SECTION ---------------- */}
      <footer className="h-64 border-t border-white/10 bg-[#090d16] flex flex-col flex-shrink-0">
        {/* Toolbar */}
        <div className="h-9 border-b border-white/10 px-4 flex items-center justify-between bg-[#0c101d] text-slate-400 select-none flex-shrink-0">
          <div className="flex items-center gap-2">
            <button type="button" className="p-1 hover:text-white transition" title="Undo">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button type="button" className="p-1 hover:text-white transition" title="Redo">
              <RotateCcw className="h-3.5 w-3.5 transform -scale-x-100" />
            </button>
            <div className="h-3.5 w-px bg-white/10 mx-1" />
            <button
              type="button"
              onClick={handleTrimActiveClip}
              className="p-1 hover:text-white transition"
              title="Trim active clip to playhead"
            >
              <Scissors className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleSplitActiveClip}
              className="p-1 hover:text-white transition"
              title="Split active clip at playhead"
            >
              <Split className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setActiveMediaId(mediaFiles[0]?.id || null);
                handleSeek(0);
              }}
              className="p-1 hover:text-white transition text-slate-400"
              title="Skip to Start"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleSeek(Math.max(0, currentTime - 1))}
              className="p-1 hover:text-white transition text-slate-400 font-mono text-[10px] font-bold"
              title="Backward 1 second (Left Arrow)"
            >
              -1s
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
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
              className="p-1 hover:text-white transition text-slate-400 font-mono text-[10px] font-bold"
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
                handleSeek(totalDur);
              }}
              className="p-1 hover:text-white transition text-slate-400"
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
              className="w-20 accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
            <ZoomIn className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Timeline Tracks Grid */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* FIXED CENTER PLAYHEAD LINE (CAPCUT STYLE) */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white z-40 pointer-events-none shadow-glow flex flex-col items-center"
            style={{ left: '50%' }}
          >
            <div className="h-4.5 w-4.5 bg-white rounded-full border-2 border-sky-400 shadow-glow flex items-center justify-center -translate-y-1">
              <div className="h-1.5 w-1.5 bg-sky-500 rounded-full" />
            </div>
          </div>
          {/* Timeline Fully Draggable Horizontal Container */}
          <div
            ref={timelineScrollRef}
            className="flex-1 min-w-0 relative bg-[#070a11] overflow-x-scroll overflow-y-hidden p-0 flex flex-col cursor-grab active:cursor-grabbing timeline-scroll-container"
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
                  <div className="flex flex-row h-6 border-b border-white/10 bg-[#0c101d] select-none flex-shrink-0">
                    <div className="w-40 flex-shrink-0 border-r border-white/10 bg-[#070a11] flex items-center justify-center text-[9px] font-mono text-slate-500 tracking-wider">
                      TRACKS
                    </div>
                    <div
                      onMouseDown={handleRulerMouseDown}
                      className="relative flex-1 h-full cursor-ew-resize flex items-center text-[9px] font-mono text-slate-400"
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
                            className="absolute border-l border-white/20 pl-1 h-full flex items-center"
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
                    <div className="flex flex-row h-8 items-center bg-[#0a0d16]/30">
                      <div
                        className="w-40 h-full flex-shrink-0 flex items-center justify-center bg-[#070a11] border-r border-white/10 border-b border-white/5 select-none hover:bg-slate-800/50 cursor-pointer text-xs font-semibold gap-1.5"
                        onClick={(e) => { e.stopPropagation(); setActiveTab('audio'); }}
                      >
                        <span className="text-sm">🎵</span>
                        <span className="text-[10px] font-medium tracking-wide">Music</span>
                      </div>
                      <div className="relative flex-1 h-full border-b border-white/5">
                        <div className="h-5 rounded bg-slate-900/40 border border-white/5 w-full absolute top-1.5" />
                      </div>
                    </div>

                    {/* Row 2: Text Track */}
                    <div className="flex flex-row h-8 items-center bg-[#0a0d16]/30">
                      <div
                        className="w-40 h-full flex-shrink-0 flex items-center justify-center bg-[#070a11] border-r border-white/10 border-b border-white/5 select-none hover:bg-slate-800/50 cursor-pointer text-xs font-semibold gap-1.5"
                        onClick={(e) => { e.stopPropagation(); setActiveTab('text'); }}
                      >
                        <span className="text-sm">T</span>
                        <span className="text-[10px] font-medium tracking-wide">Text</span>
                      </div>
                      <div className="relative flex-1 h-full border-b border-white/5 px-0 flex items-center">
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
                              className="absolute h-5 rounded bg-sky-500/25 border border-sky-500/35 text-[8px] px-1.5 truncate flex items-center font-mono cursor-pointer top-1.5 z-10"
                              style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                            >
                              💬 {cap.text}
                            </div>
                          );
                        })}
                        {textOverlays.length === 0 && captions.length === 0 && (
                          <div className="h-5 rounded bg-slate-900/40 border border-white/5 w-full absolute top-1.5" />
                        )}
                      </div>
                    </div>

                    {/* Row 3: Sticker Track */}
                    <div className="flex flex-row h-8 items-center bg-[#0a0d16]/30">
                      <div
                        className="w-40 h-full flex-shrink-0 flex items-center justify-center bg-[#070a11] border-r border-white/10 border-b border-white/5 select-none hover:bg-slate-800/50 cursor-pointer text-xs font-semibold gap-1.5"
                        onClick={(e) => { e.stopPropagation(); setActiveTab('effects'); }}
                      >
                        <span className="text-sm">🖼️</span>
                        <span className="text-[10px] font-medium tracking-wide">Sticker</span>
                      </div>
                      <div className="relative flex-1 h-full border-b border-white/5">
                        <div className="h-5 rounded bg-slate-900/40 border border-white/5 w-full absolute top-1.5" />
                      </div>
                    </div>

                    {/* Row 4: Video Track */}
                    <div className="flex flex-row h-14 items-center bg-slate-950/60 border-y border-sky-500/20">
                      <div
                        className="w-40 h-full flex-shrink-0 flex items-center justify-center bg-[#070a11] border-r border-white/10 select-none hover:bg-sky-500/10 cursor-pointer text-xs font-semibold gap-1.5"
                        onClick={(e) => { e.stopPropagation(); setActiveTab('media'); }}
                      >
                        <span className="text-sm">🎞️</span>
                        <span className="text-[10px] font-medium tracking-wide">Video</span>
                      </div>
                      <div className="relative flex-1 h-full px-0 flex items-center">
                        {timelineClips.reduce<React.ReactNode[]>((acc, clip, idx) => {
                          const clipWidthPx = clip.duration * pxPerSec;
                          const numThumbnails = Math.max(1, Math.floor(clipWidthPx / 48));
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
                                setContextMenu({
                                  x: e.clientX,
                                  y: e.clientY,
                                  clip
                                });
                              }}
                              onContextMenu={(e) => handleClipContextMenu(e, clip)}
                              draggable={!isLocked}
                              onDragStart={(e) => handleDragStart(e, idx)}
                              onDragOver={(e) => handleDragOver(e, idx)}
                              onDragEnd={handleDragEnd}
                              className={`h-12 rounded-md border flex items-center overflow-hidden cursor-pointer flex-shrink-0 transition absolute ${
                                isSelected
                                  ? 'border-sky-400 ring-2 ring-sky-400/50 bg-sky-500/25 z-20 shadow-glow scale-[1.01]'
                                  : 'border-white/15 bg-slate-900 hover:border-sky-400/60 z-10'
                              } ${isLocked ? 'opacity-70 border-dashed border-amber-500/30' : ''}`}
                              style={{ left: `${clip.timelineStart * pxPerSec + 4}px`, width: `${Math.max(12, clipWidthPx - 8)}px` }}
                            >
                              {/* Left Trim handle bar */}
                              {isSelected && !isLocked && (
                                <div
                                  onMouseDown={(e) => handleTrimMouseDown(e, clip.id, true)}
                                  className="absolute left-0 top-0 bottom-0 w-2.5 bg-sky-400 hover:bg-sky-300 cursor-ew-resize z-30 flex items-center justify-center rounded-l"
                                >
                                  <span className="text-[7px] text-black font-bold">|</span>
                                </div>
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

                              <span className="px-2 font-mono text-[9px] text-white font-semibold truncate bg-black/80 py-0.5 rounded-l absolute right-2 bottom-1 pointer-events-none flex items-center gap-1">
                                {isLocked && <Lock className="h-2.5 w-2.5 text-amber-400 flex-shrink-0" />}
                                {isMuted && <VolumeX className="h-2.5 w-2.5 text-red-400 flex-shrink-0" />}
                                {clip.name} ({formatTimecode(clip.duration)})
                              </span>

                              {/* Right Trim handle bar */}
                              {isSelected && !isLocked && (
                                <div
                                  onMouseDown={(e) => handleTrimMouseDown(e, clip.id, false)}
                                  className="absolute right-0 top-0 bottom-0 w-2.5 bg-sky-400 hover:bg-sky-300 cursor-ew-resize z-30 flex items-center justify-center rounded-r"
                                >
                                  <span className="text-[7px] text-black font-bold">|</span>
                                </div>
                              )}
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
                                  setActiveTab('effects');
                                  showToast('Select a transition to apply between clips');
                                }}
                                className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-200 shadow-lg z-40 absolute ${
                                  transitionId 
                                    ? 'bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 border-sky-400 ring-2 ring-sky-400/30 shadow-[0_0_10px_rgba(56,189,248,0.5)] scale-105' 
                                    : 'bg-[#111726]/95 text-sky-400 border-sky-500/40 hover:bg-sky-500 hover:text-slate-950 hover:border-sky-400 hover:scale-110'
                                }`}
                                style={{ left: `${(clip.timelineStart + clip.duration) * pxPerSec - 14}px` }}
                                title={transitionId ? `Transition: ${transitionId}` : 'Add Transition'}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            );
                          }

                          return acc;
                        }, [])}
                      </div>
                    </div>

                    {/* Row 5: Audio Track */}
                    <div className="flex flex-row h-8 items-center bg-[#0a0d16]/30">
                      <div
                        className="w-40 h-full flex-shrink-0 flex items-center justify-center bg-[#070a11] border-r border-white/10 border-t border-white/5 select-none hover:bg-slate-800/50 cursor-pointer text-xs font-semibold gap-1.5"
                        onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-medium tracking-wide">Audio</span>
                      </div>
                      <div className="relative flex-1 h-full border-t border-white/5 bg-slate-900/50">
                        <div className="h-5 rounded bg-slate-900/40 border border-white/5 w-full absolute top-1.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
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

      {/* RENDER CONTEXT MENU */}
      {contextMenu && (
        <TimelineContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          clip={{
            id: contextMenu.clip.id,
            name: contextMenu.clip.name,
            start: 0,
            duration: contextMenu.clip.duration || 5,
            trackId: 'video',
            color: ''
          }}
          isLocked={!!lockedClips[contextMenu.clip.id]}
          isMuted={!!mutedClips[contextMenu.clip.id]}
          onClose={() => setContextMenu(null)}
          onAction={handleMenuAction}
        />
      )}

      {/* RENDER TOAST ALERT NOTIFICATION */}
      {toast && (
        <div className="absolute bottom-24 right-4 bg-slate-900 border border-sky-400/30 text-sky-400 text-xs px-3.5 py-2 rounded-xl shadow-glow z-[150] flex items-center gap-1.5 animate-bounce">
          <span>⚡</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
