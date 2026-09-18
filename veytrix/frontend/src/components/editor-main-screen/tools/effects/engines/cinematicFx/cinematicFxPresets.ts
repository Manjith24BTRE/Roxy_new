// src/components/editor-main-screen/tools/effects/engines/cinematicFx/cinematicFxPresets.ts

export type CinematicFXType =
  | 'filmGrain'
  | 'filmBurn'
  | 'lightLeak'
  | 'lensFlare'
  | 'bloom'
  | 'softGlow'
  | 'goldenHour'
  | 'blueHour'
  | 'moonlight'
  | 'cinematicContrast';

export interface CinematicFXPreset {
  id: number;
  name: string; // Exact Excel Name
  presetKey: CinematicFXType;
  type: CinematicFXType;
  intensity?: number;
  grainAmount?: number;
  size?: number;
  opacity?: number;
  roughness?: number;
  burnSize?: number;
  brightness?: number;
  speed?: number;
  color?: string;
  positionX?: number;
  positionY?: number;
  streaks?: number;
  glowRadius?: number;
  threshold?: number;
  glowStrength?: number;
  softness?: number;
  warmth?: number;
  glow?: number;
  blueTint?: number;
  exposure?: number;
  saturation?: number;
  shadows?: number;
  contrast?: number;
  highlights?: number;
}

export const CINEMATIC_FX_PRESETS: Record<number, CinematicFXPreset> = {
  51: {
    id: 51,
    name: 'FIlm Grain', // Exact catalog name for ID 51
    presetKey: 'filmGrain',
    type: 'filmGrain',
    grainAmount: 0.5,
    size: 1.5,
    opacity: 0.6,
    roughness: 0.5,
    intensity: 1.0
  },
  52: {
    id: 52,
    name: 'Film Burn',
    presetKey: 'filmBurn',
    type: 'filmBurn',
    burnSize: 0.4,
    brightness: 1.5,
    speed: 2.0,
    color: '#ff6600',
    intensity: 1.0
  },
  53: {
    id: 53,
    name: 'Light Leak',
    presetKey: 'lightLeak',
    type: 'lightLeak',
    color: '#ffaa44',
    intensity: 0.7,
    positionX: 0.8,
    positionY: 0.2,
    opacity: 0.8
  },
  54: {
    id: 54,
    name: 'Lens Flare',
    presetKey: 'lensFlare',
    type: 'lensFlare',
    brightness: 1.2,
    positionX: 0.7,
    positionY: 0.3,
    size: 1.0,
    streaks: 0.8,
    intensity: 1.0
  },
  55: {
    id: 55,
    name: 'Bloom',
    presetKey: 'bloom',
    type: 'bloom',
    glowRadius: 15,
    threshold: 0.7,
    intensity: 1.0
  },
  56: {
    id: 56,
    name: 'Soft Glow',
    presetKey: 'softGlow',
    type: 'softGlow',
    glowStrength: 12,
    softness: 20,
    threshold: 0.5,
    opacity: 0.8,
    intensity: 1.0
  },
  57: {
    id: 57,
    name: 'Golden Hour',
    presetKey: 'goldenHour',
    type: 'goldenHour',
    warmth: 0.6,
    brightness: 1.1,
    glow: 0.5,
    positionX: 0.8,
    positionY: 0.3,
    intensity: 1.0
  },
  58: {
    id: 58,
    name: 'Blue Hour',
    presetKey: 'blueHour',
    type: 'blueHour',
    blueTint: 0.6,
    exposure: 0.95,
    saturation: 0.85,
    intensity: 1.0
  },
  59: {
    id: 59,
    name: 'Moonlight',
    presetKey: 'moonlight',
    type: 'moonlight',
    blueTint: 0.8,
    brightness: 0.9,
    shadows: 0.4,
    intensity: 1.0
  },
  60: {
    id: 60,
    name: 'Cinematic Contrast',
    presetKey: 'cinematicContrast',
    type: 'cinematicContrast',
    contrast: 1.3,
    shadows: 0.9,
    highlights: 1.1,
    intensity: 1.0
  }
};
