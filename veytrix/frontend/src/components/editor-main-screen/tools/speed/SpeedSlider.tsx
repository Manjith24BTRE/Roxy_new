// SpeedSlider.tsx
// Purpose: Continuous smooth range slider for fine-grained speed adjustment (0.25x - 8.0x).

import React, { memo, useCallback } from 'react';
import { SpeedSliderProps } from './speedTypes';
import { MIN_SPEED, MAX_SPEED, SLIDER_STEP } from './speedConstants';
import { formatSpeed } from './speedUtils';

export const SpeedSlider = memo<SpeedSliderProps>(({
  value,
  onChange,
  min = MIN_SPEED,
  max = MAX_SPEED,
  step = SLIDER_STEP,
  disabled = false
}) => {
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        onChange(val);
      }
    },
    [onChange]
  );

  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        <span>Smooth Control</span>
        <span className="font-mono text-sky-400 font-semibold">{formatSpeed(value)}</span>
      </div>

      <div className="relative flex items-center h-6">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={handleInputChange}
          className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, #38bdf8 0%, #38bdf8 ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
      </div>

      <div className="flex justify-between text-[10px] font-mono text-muted-foreground px-0.5">
        <span>{min}x</span>
        <span>1x</span>
        <span>2x</span>
        <span>4x</span>
        <span>{max}x</span>
      </div>
    </div>
  );
});

SpeedSlider.displayName = 'SpeedSlider';
