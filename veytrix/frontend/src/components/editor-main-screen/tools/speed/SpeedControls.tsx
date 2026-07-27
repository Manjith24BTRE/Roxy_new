// SpeedControls.tsx
// Purpose: Combined control panel incorporating Presets, Slider, and Reset Action.

import React, { memo } from 'react';
import { RotateCcw, Zap } from 'lucide-react';
import { SpeedPresets } from './SpeedPresets';
import { SpeedSlider } from './SpeedSlider';
import { DEFAULT_SPEED, SPEED_QUICK_MULTIPLIERS } from './speedConstants';

interface SpeedControlsProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
  onResetSpeed: () => void;
  disabled?: boolean;
}

export const SpeedControls = memo<SpeedControlsProps>(({
  currentSpeed,
  onSpeedChange,
  onResetSpeed,
  disabled = false
}) => {
  const isDefault = Math.abs(currentSpeed - DEFAULT_SPEED) < 0.01;

  return (
    <div className="space-y-5">
      {/* Smooth Slider */}
      <SpeedSlider
        value={currentSpeed}
        onChange={onSpeedChange}
        disabled={disabled}
      />

      {/* Quick Multipliers */}
      <div className="space-y-2">
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Quick Speed
        </div>
        <div className="grid grid-cols-4 gap-2">
          {SPEED_QUICK_MULTIPLIERS.map((mult) => {
            const isActive = Math.abs(currentSpeed - mult) < 0.01;
            return (
              <button
                key={mult}
                type="button"
                disabled={disabled}
                onClick={() => onSpeedChange(mult)}
                className={`h-9 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-400 border-sky-400/60 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                    : 'bg-surface hover:bg-surface-hover text-foreground/80 border-border hover:border-sky-400/40'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
              >
                <Zap className="h-3 w-3" />
                {mult}x
              </button>
            );
          })}
        </div>
      </div>

      {/* Presets Grid */}
      <SpeedPresets
        currentSpeed={currentSpeed}
        onSelectPreset={onSpeedChange}
        disabled={disabled}
      />

      {/* Reset Speed Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={disabled || isDefault}
          onClick={onResetSpeed}
          className={`w-full h-10 rounded-xl font-mono text-xs font-semibold flex items-center justify-center gap-2 border transition-all duration-200 ${
            isDefault
              ? 'bg-surface/50 text-muted-foreground border-border/40 opacity-60 cursor-not-allowed'
              : 'bg-surface hover:bg-red-500/10 text-foreground hover:text-red-400 border-border hover:border-red-500/40 cursor-pointer active:scale-[0.98]'
          }`}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Speed to 1x
        </button>
      </div>
    </div>
  );
});

SpeedControls.displayName = 'SpeedControls';
