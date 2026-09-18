// src/components/editor-main-screen/tools/effects/engines/atmosphericFx/atmosphericFxPresets.ts

export type AtmosphericFXType =
  | 'fog'
  | 'mist'
  | 'smoke'
  | 'rain'
  | 'snow'
  | 'lightningFlash'
  | 'dust'
  | 'atmosphere'
  | 'haze'
  | 'heatBlur';

export interface AtmosphericFXPreset {
  id: number;
  name: string; // Exact Excel Name
  presetKey: AtmosphericFXType;
  type: AtmosphericFXType;
  intensity?: number;
  density?: number;
  speed?: number;
  opacity?: number;
  color?: string;
  turbulence?: number;
  direction?: number;
  streakLength?: number;
  drift?: number;
  particleSize?: number;
  frequency?: number;
  brightness?: number;
  duration?: number;
  size?: number;
  glow?: number;
  warmth?: number;
  softness?: number;
  exposure?: number;
  distortion?: number;
}

export const ATMOSPHERIC_FX_PRESETS: Record<number, AtmosphericFXPreset> = {
  61: {
    id: 61,
    name: 'Fog',
    presetKey: 'fog',
    type: 'fog',
    density: 0.6,
    speed: 1.0,
    opacity: 0.7,
    color: '#e0e5eb',
    intensity: 1.0
  },
  62: {
    id: 62,
    name: 'Mist',
    presetKey: 'mist',
    type: 'mist',
    density: 0.3,
    speed: 0.8,
    opacity: 0.5,
    color: '#ffffff',
    intensity: 1.0
  },
  63: {
    id: 63,
    name: 'Smoke Overlay', // Exact catalog name for ID 63
    presetKey: 'smoke',
    type: 'smoke',
    density: 0.5,
    turbulence: 0.7,
    speed: 1.5,
    color: '#888888',
    intensity: 1.0
  },
  64: {
    id: 64,
    name: 'Rain',
    presetKey: 'rain',
    type: 'rain',
    speed: 8.0,
    density: 0.7,
    direction: 15,
    streakLength: 25,
    opacity: 0.6,
    intensity: 1.0
  },
  65: {
    id: 65,
    name: 'Snow',
    presetKey: 'snow',
    type: 'snow',
    speed: 1.5,
    density: 0.6,
    drift: 0.4,
    particleSize: 3.0,
    opacity: 0.8,
    intensity: 1.0
  },
  66: {
    id: 66,
    name: 'Lightning Flash',
    presetKey: 'lightningFlash',
    type: 'lightningFlash',
    frequency: 2.0,
    brightness: 1.8,
    duration: 0.15,
    intensity: 1.0
  },
  67: {
    id: 67,
    name: 'Dust Particles', // Exact catalog name for ID 67
    presetKey: 'dust',
    type: 'dust',
    density: 0.5,
    speed: 0.5,
    size: 2.0,
    opacity: 0.6,
    intensity: 1.0
  },
  68: {
    id: 68,
    name: 'Atmosphere',
    presetKey: 'atmosphere',
    type: 'atmosphere',
    glow: 0.6,
    warmth: 0.4,
    density: 0.5,
    intensity: 1.0
  },
  69: {
    id: 69,
    name: 'Haze',
    presetKey: 'haze',
    type: 'haze',
    density: 0.4,
    softness: 0.6,
    exposure: 1.05,
    intensity: 1.0
  },
  70: {
    id: 70,
    name: 'Heat Blur',
    presetKey: 'heatBlur',
    type: 'heatBlur',
    distortion: 15,
    speed: 3.0,
    frequency: 5.0,
    intensity: 1.0
  }
};
