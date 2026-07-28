// speedTypes.ts
// Purpose: Type definitions for the VEYTRIX Video Speed Tool.

export interface SpeedPreset {
  value: number;
  label: string;
  isDefault?: boolean;
}

export interface SpeedToolProps {
  activeClip: {
    id: string;
    name: string;
    duration: number;
    baseDuration?: number;
    playbackRate?: number;
    startOffset?: number;
    timelineStart?: number;
    mediaId?: string;
  } | null;
  onUpdateClipSpeed: (clipId: string, newRate: number) => void;
  onStartSpeedChange?: (label: string) => void;
  onEndSpeedChange?: () => void;
  disabled?: boolean;
}

export interface SpeedSliderProps {
  value: number;
  onChange: (speed: number) => void;
  onStartChange?: () => void;
  onEndChange?: () => void;
  disabled?: boolean;
}

export interface SpeedPresetsProps {
  currentSpeed: number;
  onSelectPreset: (speed: number) => void;
  presets?: SpeedPreset[];
  disabled?: boolean;
}

export interface SpeedIndicatorProps {
  speed: number;
  sourceDuration: number;
  effectiveDuration: number;
}
