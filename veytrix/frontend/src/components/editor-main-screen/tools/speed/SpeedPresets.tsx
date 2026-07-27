// SpeedPresets.tsx
// Purpose: Preset grid buttons for quick video speed selections.

import React, { memo } from 'react';
import { SpeedPresetsProps } from './speedTypes';
import { SPEED_PRESETS } from './speedConstants';

export const SpeedPresets = memo<SpeedPresetsProps>(({
  currentSpeed,
  onSelectPreset,
  presets = SPEED_PRESETS,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
        <span>Presets</span>
        <span className="text-[10px] text-sky-400/80 font-mono">14 Options</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {presets.map((preset) => {
          const isSelected = Math.abs(currentSpeed - preset.value) < 0.01;

          return (
            <button
              key={preset.value}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPreset(preset.value)}
              className={`h-8 rounded-lg font-mono text-xs font-semibold transition-all duration-150 flex items-center justify-center border ${
                isSelected
                  ? 'bg-sky-500 text-white border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.4)] scale-[1.02] z-10'
                  : 'bg-surface hover:bg-surface-hover text-foreground/90 border-border hover:border-sky-400/50 hover:text-sky-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});

SpeedPresets.displayName = 'SpeedPresets';
