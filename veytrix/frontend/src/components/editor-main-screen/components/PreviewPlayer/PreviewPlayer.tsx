import React, { useState, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Maximize2, ZoomIn, Grid, ShieldAlert, Sparkles, Sliders } from 'lucide-react';

interface PreviewPlayerProps {
  isPlaying: boolean;
  onPlayToggle: () => void;
  currentTime: number;
  onTimeChange: (time: number) => void;
  duration: number;
  aspectRatio: string;
  
  // Settings applied to show in "After" side
  colorSettings: Record<string, number>;
  activeFilterId: string | null;
  activeEffectId: string | null;
  textOverlays: Array<{ id: string; text: string; color: string; font: string; size: number }>;
}

export function PreviewPlayer({
  isPlaying, onPlayToggle,
  currentTime, onTimeChange, duration,
  aspectRatio, colorSettings, activeFilterId, activeEffectId, textOverlays
}: PreviewPlayerProps) {
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showSafeZone, setShowSafeZone] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStep = (direction: 'back' | 'forward') => {
    const stepSize = 0.1;
    if (direction === 'back') {
      onTimeChange(Math.max(0, currentTime - stepSize));
    } else {
      onTimeChange(Math.min(duration, currentTime + stepSize));
    }
  };

  const handleSplitDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1 || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    setSplitRatio(x);
  };

  const formatTimecode = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const f = Math.floor((secs % 1) * 30);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}`;
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case '16/9': return 'aspect-[16/9] max-w-4xl';
      case '9/16': return 'aspect-[9/16] max-w-xs';
      case '1/1': return 'aspect-square max-w-md';
      case '4/5': return 'aspect-[4/5] max-w-sm';
      case '21/9': return 'aspect-[21/9] max-w-5xl';
      default: return 'aspect-[16/9] max-w-4xl';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden select-none">
      {/* Visual Overlay Toggles */}
      <div className="h-10 border-b border-border px-4 flex items-center justify-between bg-surface text-xs">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Preview Window</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded transition cursor-pointer flex items-center gap-1 border ${
              showGrid ? 'bg-primary/10 border-sky-400 text-primary font-semibold' : 'bg-surface border-border text-muted-foreground hover:text-foreground'
            }`}
            title="Toggle Alignment Grid"
          >
            <Grid className="h-3.5 w-3.5" />
            <span className="text-[10px]">Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSafeZone(!showSafeZone)}
            className={`p-1.5 rounded transition cursor-pointer flex items-center gap-1 border ${
              showSafeZone ? 'bg-primary/10 border-sky-400 text-primary font-semibold' : 'bg-surface border-border text-muted-foreground hover:text-foreground'
            }`}
            title="Toggle Safe Area Zone Guidelines"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span className="text-[10px]">Safe Zone</span>
          </button>
          
          <div className="w-px h-4 bg-white/10 mx-1" />

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ZoomIn className="h-3.5 w-3.5" />
            <select
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="rounded bg-surface border border-border text-[10px] px-1 py-0.5 cursor-pointer text-foreground focus:outline-none"
            >
              <option value="50">50%</option>
              <option value="75">75%</option>
              <option value="100">100%</option>
              <option value="125">125%</option>
              <option value="150">150%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Preview Monitor */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center relative overflow-hidden" ref={containerRef}>
        <div
          className={`relative w-full rounded-xl border border-border bg-black overflow-hidden shadow-2xl flex flex-col justify-between p-2 group transition-all duration-300 ${getAspectClass()}`}
          style={{ transform: `scale(${zoom / 100})` }}
        >
          <div
            className="w-full h-full relative cursor-ew-resize select-none overflow-hidden"
            onMouseMove={handleSplitDrag}
          >
            {/* BEFORE LAYER */}
            <div className="absolute inset-0 bg-surface flex items-center justify-center pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80"
                alt="Before grading"
                className="h-full w-full object-cover filter saturate-[0.6] brightness-[0.8]"
              />
              <div className="absolute top-2 left-2 bg-black/60 text-[8px] font-mono font-bold text-muted-foreground px-1.5 py-0.5 rounded">
                BEFORE (RAW)
              </div>
            </div>

            {/* AFTER LAYER */}
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              style={{ clipPath: `polygon(${splitRatio}% 0, 100% 0, 100% 100%, ${splitRatio}% 100%)` }}
            >
              <div className="absolute inset-0 bg-surface flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80"
                  alt="After grading"
                  className="h-full w-full object-cover transition-all duration-300"
                  style={{
                    filter: `
                      brightness(${1 + (colorSettings.brightness ?? 0) / 100})
                      contrast(${1 + (colorSettings.contrast ?? 0) / 100})
                      saturate(${1 + (colorSettings.saturation ?? 0) / 100})
                      brightness(${1 + (colorSettings.exposure ?? 0) / 4})
                    `
                  }}
                />

                {activeEffectId === 'vhs-retro' && (
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] z-10 opacity-60 animate-pulse" />
                )}
                {activeEffectId === 'glitch-core' && (
                  <div className="absolute inset-0 bg-primary/5 mix-blend-color-dodge z-10 animate-[pulse_0.1s_infinite]" />
                )}

                {textOverlays.map((t) => (
                  <div
                    key={t.id}
                    className="absolute text-center select-none font-bold"
                    style={{
                      color: t.color,
                      fontFamily: t.font,
                      fontSize: `${t.size * 0.45}px`,
                      top: '40%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 20
                    }}
                  >
                    {t.text}
                  </div>
                ))}
              </div>
              <div className="absolute top-2 right-2 bg-primary/85 text-[8px] font-mono font-bold text-primary-foreground px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                <Sparkles className="h-2.5 w-2.5 fill-current" />
                <span>AFTER (GRADED)</span>
              </div>
            </div>

            {/* Split Drag handle */}
            <div
              className="absolute inset-y-0 w-1 bg-white cursor-ew-resize flex items-center justify-center z-15 shadow-glow"
              style={{ left: `${splitRatio}%` }}
            >
              <div className="h-8 w-5 rounded bg-surface border border-border-strong text-foreground text-[8px] flex items-center justify-center shadow-lg font-bold">
                <Sliders className="h-3 w-3 text-foreground" />
              </div>
            </div>

            {/* Grid overlay */}
            {showGrid && (
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10 border border-border">
                <div className="border-r border-b border-border" />
                <div className="border-r border-b border-border" />
                <div className="border-b border-border" />
                <div className="border-r border-b border-border" />
                <div className="border-r border-b border-border" />
                <div className="border-b border-border" />
                <div className="border-r border-border" />
                <div className="border-r border-border" />
                <div />
              </div>
            )}

            {/* Safe zone guidelines */}
            {showSafeZone && (
              <div className="absolute inset-[10%] border-2 border-dashed border-amber-500/25 pointer-events-none z-10 flex items-center justify-center">
                <div className="absolute inset-[10%] border border-dashed border-amber-500/15" />
                <span className="text-[7px] text-amber-500/30 uppercase font-mono absolute top-1 left-2">Action Safe 90%</span>
                <span className="text-[7px] text-amber-500/30 uppercase font-mono absolute top-8 left-8">Title Safe 80%</span>
              </div>
            )}
          </div>

          {/* Time Code Overlay */}
          <div className="absolute bottom-2 left-2 z-10 font-mono text-[9px] text-foreground bg-black/60 rounded px-1.5 py-0.5">
            {formatTimecode(currentTime)}
          </div>
        </div>
      </div>

      {/* Seek scrub controls bar */}
      <div className="border-t border-border bg-surface px-4 py-2 flex flex-col gap-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max={duration}
            step="0.05"
            value={currentTime}
            onChange={(e) => onTimeChange(Number(e.target.value))}
            className="w-full accent-primary h-1 bg-surface-hover rounded-lg cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-primary font-semibold">{formatTimecode(currentTime)}</span>
            <span className="text-muted-foreground">/</span>
            <span>{formatTimecode(duration)}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleStep('back')}
              className="p-1 hover:text-foreground cursor-pointer transition"
              title="Step Backward"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={onPlayToggle}
              className="h-7 w-7 rounded-md bg-white/10 hover:bg-white/20 text-foreground flex items-center justify-center transition cursor-pointer"
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current translate-x-0.5" />}
            </button>
            <button
              type="button"
              onClick={() => handleStep('forward')}
              className="p-1 hover:text-foreground cursor-pointer transition"
              title="Step Forward"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>

          <button
            type="button"
            className="p-1 text-muted-foreground hover:text-foreground cursor-pointer transition"
            title="Fullscreen Mode"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default PreviewPlayer;
