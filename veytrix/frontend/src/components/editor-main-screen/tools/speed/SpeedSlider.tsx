// SpeedSlider.tsx
// Purpose: Discrete step range slider for speed adjustment (0.25x - 8x).
// Uses SPEED_STEPS array index for predictable, non-linear control.

import React, { memo, useCallback } from 'react';
import { SpeedSliderProps } from './speedTypes';
import { SPEED_STEPS } from './speedConstants';
import { formatSpeed, speedToStepIndex, stepIndexToSpeed } from './speedUtils';

export const SpeedSlider = memo<SpeedSliderProps>(({
  value,
  onChange,
  onStartChange,
  onEndChange,
  disabled = false
}) => {
  const currentIndex = speedToStepIndex(value);
  const maxIndex = SPEED_STEPS.length - 1;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const idx = parseInt(e.target.value, 10);
      if (!isNaN(idx)) {
        onChange(stepIndexToSpeed(idx));
      }
    },
    [onChange]
  );

  const percentage = Math.min(100, Math.max(0, (currentIndex / maxIndex) * 100));

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        <span>Smooth Control</span>
        <span className="font-mono text-sky-400 font-semibold">{formatSpeed(value)}</span>
      </div>

      <div className="relative flex items-center h-6">
        <input
          type="range"
          min={0}
          max={maxIndex}
          step={1}
          value={currentIndex}
          disabled={disabled}
          onChange={handleInputChange}
          onMouseDown={onStartChange}
          onMouseUp={onEndChange}
          onTouchStart={onStartChange}
          onTouchEnd={onEndChange}
          className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, #38bdf8 0%, #38bdf8 ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
      </div>

      <div className="flex justify-between text-[10px] font-mono text-muted-foreground px-0.5">
        <span>0.25x</span>
        <span>1x</span>
        <span>2x</span>
        <span>4x</span>
        <span>8x</span>
      </div>
    </div>
  );
});

SpeedSlider.displayName = 'SpeedSlider';
