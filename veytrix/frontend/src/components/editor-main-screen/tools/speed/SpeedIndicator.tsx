// SpeedIndicator.tsx
// Purpose: Header badge & current speed indicator component.

import React, { memo } from 'react';
import { Gauge, Zap } from 'lucide-react';
import { formatSpeed, formatDuration } from './speedUtils';
import { SpeedIndicatorProps } from './speedTypes';

export const SpeedIndicator = memo<SpeedIndicatorProps>(({
  speed,
  sourceDuration,
  effectiveDuration
}) => {
  return (
    <div className="flex items-center justify-between p-3.5 bg-surface/80 border border-border rounded-xl backdrop-blur-md shadow-sm select-none">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400">
          <Gauge className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-400 inline" /> Speed
          </div>
          <div className="text-xl font-bold font-mono text-foreground flex items-baseline gap-1.5">
            <span>{formatSpeed(speed)}</span>
            {speed !== 1 && (
              <span className="text-[10px] text-sky-400 bg-sky-500/15 border border-sky-400/30 px-1.5 py-0.2 rounded font-sans">
                {speed > 1 ? 'Fast' : 'Slow'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Duration
        </div>
        <div className="text-sm font-semibold font-mono text-foreground">
          {formatDuration(effectiveDuration)}
        </div>
      </div>
    </div>
  );
});

SpeedIndicator.displayName = 'SpeedIndicator';
