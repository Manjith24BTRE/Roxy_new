import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Download, Film, Type, AudioWaveform,
  Wand2, Play, Pause, SkipBack, SkipForward, Volume2,
  ZoomIn, ZoomOut, Scissors, Split, Plus, Search,
  FolderPlus, Maximize2, RotateCcw, Image as ImageIcon
} from 'lucide-react';
import { VeytrixLogo } from '../../../components/VeytrixLogo';
import { useProjectMedia } from '../../../contexts/ProjectMediaContext';

export function EditorPage() {
  const navigate = useNavigate();
  const { mediaFiles, activeMediaId, setActiveMediaId } = useProjectMedia();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'media' | 'audio' | 'text' | 'effects'>('media');
  const [zoomLevel, setZoomLevel] = useState(120);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Canvas Video Interactive Object Transform State
  const [isSelectedOnCanvas, setIsSelectedOnCanvas] = useState(true);
  const [canvasPos, setCanvasPos] = useState({ x: 0, y: 0 });
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasRotation, setCanvasRotation] = useState(0);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizingCanvas, setIsResizingCanvas] = useState<string | null>(null);
  const [isRotatingCanvas, setIsRotatingCanvas] = useState(false);

  // Timeline Mouse Drag Scroll State
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const [timelineStartX, setTimelineStartX] = useState(0);
  const [timelineScrollLeft, setTimelineScrollLeft] = useState(0);

  const activeMedia = mediaFiles.find((m) => m.id === activeMediaId) || mediaFiles[0];

  // Auto-load first clip on mount and ensure playhead is at 00:00:00
  useEffect(() => {
    if (mediaFiles.length > 0 && !activeMediaId) {
      setActiveMediaId(mediaFiles[0].id);
    }
  }, [mediaFiles, activeMediaId, setActiveMediaId]);

  // Video playback time update handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
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
      timelineScrollRef.current.scrollLeft += e.deltaY || e.deltaX;
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

        {/* LEFT PANEL: Media Library */}
        <aside className="border-r border-white/10 bg-[#090d16] flex flex-col overflow-hidden">
          <div className="flex border-b border-white/10 bg-[#0c101d] p-1 gap-1">
            {[
              { id: 'media', label: 'Media', icon: Film },
              { id: 'audio', label: 'Audio', icon: AudioWaveform },
              { id: 'text', label: 'Text', icon: Type },
              { id: 'effects', label: 'Effects', icon: Wand2 },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition ${
                  activeTab === tab.id
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-3 border-b border-white/10 space-y-2">
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
              className="w-full flex items-center justify-center gap-1.5 rounded-md bg-sky-500/10 border border-sky-500/20 py-1.5 text-xs font-medium text-sky-400 hover:bg-sky-500/20 transition"
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
                    <img src={item.thumbnails[0]} alt="" className="h-full w-full object-cover" />
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
            <div className="relative aspect-video w-full max-w-4xl rounded-xl border border-white/15 bg-black overflow-hidden shadow-2xl flex flex-col justify-between p-2 group">
              
              {/* HTML5 Native Video Tag wrapped in transform container */}
              <div
                className="h-full w-full relative flex items-center justify-center cursor-move"
                style={{
                  transform: `translate(${canvasPos.x}px, ${canvasPos.y}px) scale(${canvasScale}) rotate(${canvasRotation}deg)`,
                  transition: isDraggingCanvas ? 'none' : 'transform 0.05s ease-out',
                }}
                onMouseDown={handleCanvasMouseDown}
              >
                {activeMedia ? (
                  <video
                    ref={videoRef}
                    src={activeMedia.url}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => {
                      // Continuous playback: Advance to next clip or loop back to first clip
                      const currentIndex = mediaFiles.findIndex((m) => m.id === activeMedia.id);
                      if (currentIndex !== -1 && currentIndex < mediaFiles.length - 1) {
                        setActiveMediaId(mediaFiles[currentIndex + 1].id);
                      } else if (mediaFiles.length > 0) {
                        setActiveMediaId(mediaFiles[0].id);
                      }
                      setTimeout(() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0;
                          videoRef.current.play();
                        }
                      }, 50);
                    }}
                    className="h-full w-full object-contain mx-auto pointer-events-none"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">
                    No video selected
                  </div>
                )}

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
                      if (videoRef.current) {
                        videoRef.current.volume = v;
                        videoRef.current.muted = false;
                      }
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
            <button type="button" className="p-1 hover:text-white transition" title="Cut">
              <Scissors className="h-3.5 w-3.5" />
            </button>
            <button type="button" className="p-1 hover:text-white transition" title="Split">
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
              onClick={togglePlay}
              className="h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current translate-x-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                const lastClip = mediaFiles[mediaFiles.length - 1];
                if (lastClip) {
                  setActiveMediaId(lastClip.id);
                  handleSeek(lastClip.duration);
                }
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
        <div className="flex-1 flex overflow-hidden">
          <div className="w-52 border-r border-white/10 bg-[#070a11] flex flex-shrink-0 flex-col">
            <div className="h-6 border-b border-white/10 bg-[#0c101d] px-3 flex items-center text-[9px] font-mono text-slate-500 flex-shrink-0 tracking-wider">
              TIME RULER
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-20 flex items-center justify-center border-r border-white/5 flex-shrink-0 bg-[#080c14]">
                <div className="w-14 h-14 rounded-lg border border-white/15 bg-slate-900/90 hover:bg-slate-800 flex flex-col items-center justify-center text-slate-400 hover:text-white cursor-pointer transition shadow-sm">
                  <span className="text-xs">✏️</span>
                  <span className="text-[9px] font-medium mt-0.5">Cover</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col divide-y divide-white/5 text-slate-400 overflow-hidden">
                <div className="h-8 flex items-center justify-center"><span className="text-base">🎵+</span></div>
                <div className="h-8 flex items-center justify-center"><div className="h-4 w-4 border-2 border-current rounded flex items-center justify-center text-[9px] font-bold">T+</div></div>
                <div className="h-8 flex items-center justify-center"><div className="h-4 w-4 border-2 border-current rounded flex items-center justify-center text-[9px]">🖼️+</div></div>
                <div className="h-14 flex items-center justify-center bg-sky-500/10 border-y border-sky-500/20"><div className="h-5 w-5 border-2 border-sky-400 text-sky-400 rounded flex items-center justify-center text-xs">🎞️+</div></div>
                <div className="h-8 flex items-center justify-center bg-slate-900/50"><Volume2 className="h-4 w-4 text-slate-200" /></div>
              </div>
            </div>
          </div>

          {/* Timeline Fully Draggable Horizontal Container */}
          <div
            ref={timelineScrollRef}
            className="flex-1 relative bg-[#070a11] overflow-x-auto overflow-y-hidden p-0 flex flex-col cursor-grab active:cursor-grabbing"
            onMouseDown={handleTimelineMouseDown}
            onMouseMove={handleTimelineMouseMove}
            onMouseUp={handleTimelineMouseUp}
            onMouseLeave={handleTimelineMouseUp}
            onWheel={handleTimelineWheel}
          >
            {(() => {
              const pxPerSec = (zoomLevel / 100) * 14;
              const totalTimelineSecs = Math.max(
                60,
                mediaFiles.reduce((acc, item) => acc + (item.duration || 5), 0) + 10
              );
              const totalTimelineWidth = totalTimelineSecs * pxPerSec;

              let cumulativeTimeBeforeActive = 0;
              const activeIndex = mediaFiles.findIndex((m) => m.id === activeMedia?.id);
              for (let i = 0; i < activeIndex; i++) {
                cumulativeTimeBeforeActive += mediaFiles[i].duration || 5;
              }
              const currentPlayheadSecs = cumulativeTimeBeforeActive + currentTime;
              const playheadPx = currentPlayheadSecs * pxPerSec;

              return (
                <div className="relative h-full flex flex-col justify-between" style={{ width: `${totalTimelineWidth}px` }}>
                  <div className="h-6 border-b border-white/10 bg-[#0c101d] flex items-center relative text-[9px] font-mono text-slate-400 select-none flex-shrink-0">
                    {Array.from({ length: Math.ceil(totalTimelineSecs / 5) + 1 }).map((_, i) => {
                      const sec = i * 5;
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

                  <div
                    className="absolute inset-y-0 w-0.5 bg-white z-30 pointer-events-none shadow-glow transition-all duration-75"
                    style={{ left: `${playheadPx}px` }}
                  >
                    <div className="h-3 w-3 -translate-x-[5.5px] bg-white rotate-45 rounded-sm" />
                  </div>

                  <div className="flex flex-col divide-y divide-white/5 flex-1">
                    <div className="h-8 flex items-center">
                      <div className="h-5 rounded bg-slate-900/40 border border-white/5 w-full" />
                    </div>
                    <div className="h-8 flex items-center">
                      <div className="h-5 rounded bg-slate-900/40 border border-white/5 w-full" />
                    </div>
                    <div className="h-8 flex items-center">
                      <div className="h-5 rounded bg-slate-900/40 border border-white/5 w-full" />
                    </div>
                    <div className="h-14 flex items-center flex-row bg-slate-950/60 border-y border-sky-500/20 px-0">
                      {mediaFiles.map((clip) => {
                        const clipWidthPx = (clip.duration || 5) * pxPerSec;
                        const numThumbnails = Math.max(1, Math.floor(clipWidthPx / 48));

                        return (
                          <div
                            key={clip.id}
                            onClick={() => {
                              setActiveMediaId(clip.id);
                              setIsSelectedOnCanvas(true);
                              handleSeek(0);
                            }}
                            className={`h-12 rounded-md border flex items-center overflow-hidden cursor-pointer flex-shrink-0 transition shadow-md ${
                              clip.id === activeMedia?.id
                                ? 'border-sky-400 ring-2 ring-sky-400/50 bg-sky-500/25'
                                : 'border-white/15 bg-slate-900 hover:border-sky-400/60'
                            }`}
                            style={{ width: `${clipWidthPx}px` }}
                          >
                            <div className="h-full flex-1 flex overflow-hidden opacity-90">
                              {Array.from({ length: numThumbnails }).map((_, idx) => (
                                <img
                                  key={idx}
                                  src={clip.thumbnails[idx % clip.thumbnails.length] || clip.thumbnails[0]}
                                  alt=""
                                  className="h-full w-12 object-cover flex-shrink-0 border-r border-black/40"
                                />
                              ))}
                            </div>
                            <span className="px-2 font-mono text-[9px] text-white font-semibold truncate bg-black/80 py-0.5 rounded-l">
                              {clip.name} ({clip.durationFormatted})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="h-8 flex items-center">
                      <div className="h-5 rounded bg-slate-900/40 border border-white/5 w-full" />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </footer>
    </div>
  );
}
