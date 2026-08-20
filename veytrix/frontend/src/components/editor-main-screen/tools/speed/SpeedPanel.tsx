// SpeedPanel.tsx
// Purpose: Inspector Panel for Video Speed Tool.

import React, { memo } from 'react';
import { Film, Info } from 'lucide-react';
import { SpeedIndicator } from './SpeedIndicator';
import { SpeedControls } from './SpeedControls';
import { SpeedToolProps } from './speedTypes';
import { DEFAULT_SPEED } from './speedConstants';
import { formatDuration, getSourceDuration, getEffectiveDuration, clampPlaybackRate } from './speedUtils';

export const SpeedPanel = memo<SpeedToolProps>(({
  activeClip,
  onUpdateClipSpeed,
  onStartSpeedChange,
  onEndSpeedChange
}) => {
  if (!activeClip) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground select-none">
        <div className="h-12 w-12 rounded-2xl bg-surface border border-border flex items-center justify-center mb-3 text-muted-foreground">
          <Film className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">No Clip Selected</p>
        <p className="text-xs text-muted-foreground max-w-[200px]">
          Select a video clip on the timeline to adjust its speed.
        </p>
      </div>
    );
  }

  const currentRate = clampPlaybackRate(activeClip.playbackRate ?? DEFAULT_SPEED);
  const sourceDuration = getSourceDuration({
    baseDuration: activeClip.baseDuration,
    duration: activeClip.duration,
    playbackRate: currentRate
  });
  const effectiveDuration = getEffectiveDuration(sourceDuration, currentRate);

  const handleSpeedChange = (newRate: number) => {
    onUpdateClipSpeed(activeClip.id, newRate);
  };

  const handleReset = () => {
    onUpdateClipSpeed(activeClip.id, DEFAULT_SPEED);
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-5 overflow-y-auto text-foreground select-none">
      {/* Clip Title Badge */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 truncate">
          <Film className="h-4 w-4 text-sky-400 flex-shrink-0" />
          <span className="text-xs font-semibold truncate text-foreground/90 font-mono">
            {activeClip.name}
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground bg-surface border border-border px-2 py-0.5 rounded">
          {activeClip.id.slice(0, 8)}
        </span>
      </div>

      {/* Speed Indicator Badge */}
      <SpeedIndicator
        speed={currentRate}
        sourceDuration={sourceDuration}
        effectiveDuration={effectiveDuration}
      />

      {/* Speed Controls */}
      <SpeedControls
        currentSpeed={currentRate}
        onSpeedChange={handleSpeedChange}
        onResetSpeed={handleReset}
        onStartSpeedChange={onStartSpeedChange}
        onEndSpeedChange={onEndSpeedChange}
      />

      {/* Duration Comparison Stats */}
      <div className="p-3 bg-surface/50 border border-border rounded-xl space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1">
            <Info className="h-3 w-3 text-sky-400" /> Original Length:
          </span>
          <span className="font-semibold text-foreground">{formatDuration(sourceDuration)}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span>Adjusted Length:</span>
          <span className="font-semibold text-sky-400">{formatDuration(effectiveDuration)}</span>
        </div>
      </div>
    </div>
  );
});

SpeedPanel.displayName = 'SpeedPanel';
