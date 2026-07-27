// speedTypes.ts
// Purpose: Type definitions for the Roxie Video Speed Tool.

export interface SpeedPreset {
  value: number;
  label: string;
  isDefault?: boolean;
}

export interface ClipSpeedState {
  speed: number;
  baseDuration: number;
  effectiveDuration: number;
  playbackRate: number;
}

export interface SpeedToolProps {
  activeClip: {
    id: string;
    name: string;
    duration: number;
    baseDuration?: number;
    speed?: number;
    timelineStart?: number;
    mediaId?: string;
  } | null;
  onUpdateClipSpeed: (clipId: string, newSpeed: number) => void;
  onResetClipSpeed?: (clipId: string) => void;
  disabled?: boolean;
}

export interface SpeedSliderProps {
  value: number;
  onChange: (speed: number) => void;
  min?: number;
  max?: number;
  step?: number;
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
  baseDuration?: number;
  effectiveDuration?: number;
}
