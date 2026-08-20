// -----------------------------------------------------------------------------
// InteractiveTransitionPlayer.tsx
// -----------------------------------------------------------------------------
// High-performance, pure progress-driven transition player component.
// Guarantees zero stale closures, instant state resets, manual scrubbing, and
// accurate 1-to-1 visual rendering for all 200 frontend transition IDs.
// STRICTLY FRONTEND ONLY.
// -----------------------------------------------------------------------------

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { VisualSceneA, VisualSceneB } from './TransitionThumbnail';
import {
  resolveFrontendTransition,
  renderFrontendTransitionFrame,
  TransitionResolvedConfig,
} from './frontendTransitionEngine';

export interface InteractiveTransitionPlayerProps {
  transitionInput: any;
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
  showControls?: boolean;
  durationSeconds?: number;
}

export const InteractiveTransitionPlayer: React.FC<InteractiveTransitionPlayerProps> = ({
  transitionInput,
  className = '',
  autoplay = true,
  loop = true,
  showControls = true,
  durationSeconds = 1.5,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoplay);
  const [config, setConfig] = useState<TransitionResolvedConfig>(() =>
    resolveFrontendTransition(transitionInput)
  );

  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // 1. FORCE PREVIEW RESET WHEN TRANSITION SELECTION CHANGES
  useEffect(() => {
    const resolved = resolveFrontendTransition(transitionInput);
    setConfig(resolved);
    setProgress(0);
    setIsPlaying(autoplay);

    // Cancel existing RAF loop & reset start time
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    startTimeRef.current = null;

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[TransitionPlayer] Reset & Initialized: '${resolved.id}' | Renderer: '${resolved.renderer}' | Direction: '${resolved.direction}'`
      );
    }
  }, [transitionInput, autoplay]);

  // 2. ANIMATION RAF LOOP (0.0 -> 1.0)
  const animate = useCallback(
    (time: number) => {
      const effectiveSpeed = Math.max(config.speed || 1.0, 0.1);
      const totalMs = (durationSeconds * 1000) / effectiveSpeed;

      if (!startTimeRef.current) {
        startTimeRef.current = time - progress * totalMs;
      }

      const elapsed = time - startTimeRef.current;
      let newProgress = elapsed / totalMs;

      if (newProgress >= 1.0) {
        if (loop) {
          startTimeRef.current = time;
          newProgress = 0.0;
        } else {
          newProgress = 1.0;
          setIsPlaying(false);
          animRef.current = null;
          setProgress(1.0);
          return;
        }
      }

      setProgress(newProgress);
      if (process.env.NODE_ENV !== 'production' && Math.floor(newProgress * 10) % 3 === 0) {
        console.log(
          `[TransitionPlayer] Playing '${config.id}' (${config.renderer}) - Progress: ${newProgress.toFixed(2)}`
        );
      }

      animRef.current = requestAnimationFrame(animate);
    },
    [config.id, config.renderer, durationSeconds, loop, progress]
  );

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = null;
      animRef.current = requestAnimationFrame(animate);
    } else if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
  }, [isPlaying, animate]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    startTimeRef.current = null;
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setIsPlaying(false);
    setProgress(val);
    startTimeRef.current = null;
  };

  // Render current frame calculation
  const frame = renderFrontendTransitionFrame(config, progress);

  return (
    <div className={`relative flex flex-col w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none ${className}`}>
      {/* 16:9 CANVAS VIEWPORT */}
      <div className="relative w-full aspect-video overflow-hidden bg-black">
        {/* SCENE A */}
        <VisualSceneA
          style={{
            opacity: frame.sceneA.opacity,
            transform: frame.sceneA.transform,
            filter: frame.sceneA.filter,
            zIndex: frame.sceneA.zIndex,
            transition: isPlaying ? 'none' : 'opacity 0.05s ease-out, transform 0.05s ease-out',
          }}
        />

        {/* SCENE B */}
        <VisualSceneB
          style={{
            opacity: frame.sceneB.opacity,
            transform: frame.sceneB.transform,
            filter: frame.sceneB.filter,
            zIndex: frame.sceneB.zIndex,
            transition: isPlaying ? 'none' : 'opacity 0.05s ease-out, transform 0.05s ease-out',
          }}
        />

        {/* OVERLAY COLOR LAYER (for Fade to Black / White Flash / Glitch) */}
        {frame.overlayColor && (
          <div
            className="absolute inset-0 pointer-events-none z-20 transition-opacity"
            style={{ backgroundColor: frame.overlayColor }}
          />
        )}

        {/* OVERLAY GRADIENT LAYER (for Film Burn / Light Leaks) */}
        {frame.overlayGradient && (
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{ background: frame.overlayGradient }}
          />
        )}
      </div>

      {/* PLAYER CONTROLS & TIMELINE SCRUBBER */}
      {showControls && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900 border-t border-slate-800/80">
          <button
            type="button"
            onClick={togglePlay}
            className="p-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition cursor-pointer"
            title={isPlaying ? 'Pause Preview' : 'Play Preview'}
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Reset to 0%"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* PROGRESS SLIDER SCRUBBER */}
          <div className="flex-1 flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={progress}
              onChange={handleScrub}
              className="w-full accent-sky-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] font-mono text-slate-400 w-9 text-right">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
