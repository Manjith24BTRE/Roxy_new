// speedConstants.ts
// Purpose: Constants and preset definitions for Video Speed Tool.

import { SpeedPreset } from './speedTypes';

export const DEFAULT_SPEED = 1.0;
export const MIN_SPEED = 0.25;
export const MAX_SPEED = 8.0;
export const SLIDER_STEP = 0.05;

export const SPEED_PRESETS: SpeedPreset[] = [
  { value: 0.25, label: '0.25x' },
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1.0, label: '1x', isDefault: true },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 1.75, label: '1.75x' },
  { value: 2.0, label: '2x' },
  { value: 2.5, label: '2.5x' },
  { value: 3.0, label: '3x' },
  { value: 4.0, label: '4x' },
  { value: 5.0, label: '5x' },
  { value: 6.0, label: '6x' },
  { value: 8.0, label: '8x' }
];

export const SPEED_QUICK_MULTIPLIERS = [0.5, 1.0, 2.0, 4.0];
