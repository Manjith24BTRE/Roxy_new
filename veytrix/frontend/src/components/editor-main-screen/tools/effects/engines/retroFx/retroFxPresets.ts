// src/components/editor-main-screen/tools/effects/engines/retroFx/retroFxPresets.ts

export type RetroFXType =
  | 'vintageFilm'
  | 'super8Film'
  | 'film16mm'
  | 'film35mm'
  | 'silentFilm'
  | 'sepiaFilm'
  | 'oldPhotograph'
  | 'colorIsolation'
  | 'doubleExposure'
  | 'kaleidoscope';

export interface RetroFXPreset {
  id: number;
  name: string; // Exact Excel Name
  presetKey: RetroFXType;
  type: RetroFXType;
  intensity?: number;

  // Film & Grain Parameters
  grain?: number; // 0..1
  flicker?: number; // 0..1
  jitter?: number; // 0..1
  scratches?: number; // 0..1
  dust?: number; // 0..1

  // Color & Tonal Parameters
  fade?: number; // Faded blacks 0..1
  warmth?: number; // Warmth color shift 0..1
  vignette?: number; // Vignette strength 0..1
  halation?: number; // Highlight halation glow 0..1
  sepiaTone?: number; // Sepia intensity 0..1
  yellowing?: number; // Paper yellowing 0..1
  contrast?: number; // Contrast factor

  // Selective Color Parameters
  targetHue?: number; // 0..360
  hueTolerance?: number; // 10..60
  saturation?: number;

  // Double Exposure & Kaleidoscope Parameters
  blendOpacity?: number; // 0..1
  segments?: number; // 4..12
  rotation?: number; // 0..360
  scale?: number;
}

export const RETRO_FX_PRESETS: Record<number, RetroFXPreset> = {
  91: {
    id: 91,
    name: 'Vintage FIlm', // Exact Excel catalog name with capital 'I'
    presetKey: 'vintageFilm',
    type: 'vintageFilm',
    grain: 0.4,
    fade: 0.3,
    warmth: 0.5,
    vignette: 0.5,
    intensity: 1.0
  },
  92: {
    id: 92,
    name: 'Super 8 Film',
    presetKey: 'super8Film',
    type: 'super8Film',
    grain: 0.7,
    flicker: 0.4,
    jitter: 0.3,
    warmth: 0.6,
    vignette: 0.6,
    intensity: 1.0
  },
  93: {
    id: 93,
    name: '16mm Film',
    presetKey: 'film16mm',
    type: 'film16mm',
    grain: 0.5,
    halation: 0.4,
    contrast: 1.1,
    vignette: 0.4,
    intensity: 1.0
  },
  94: {
    id: 94,
    name: '35mm Film',
    presetKey: 'film35mm',
    type: 'film35mm',
    grain: 0.25,
    contrast: 1.15,
    warmth: 0.2,
    vignette: 0.3,
    intensity: 1.0
  },
  95: {
    id: 95,
    name: 'Silent Film',
    presetKey: 'silentFilm',
    type: 'silentFilm',
    contrast: 1.35,
    scratches: 0.6,
    flicker: 0.5,
    vignette: 0.7,
    intensity: 1.0
  },
  96: {
    id: 96,
    name: 'Sepia FIlm', // Exact Excel catalog name with capital 'I'
    presetKey: 'sepiaFilm',
    type: 'sepiaFilm',
    sepiaTone: 0.85,
    contrast: 1.05,
    grain: 0.3,
    warmth: 0.6,
    intensity: 1.0
  },
  97: {
    id: 97,
    name: 'Old Photograpgh', // Exact Excel catalog name with 'gth' spelling
    presetKey: 'oldPhotograph',
    type: 'oldPhotograph',
    fade: 0.5,
    yellowing: 0.4,
    dust: 0.5,
    vignette: 0.6,
    intensity: 1.0
  },
  98: {
    id: 98,
    name: 'Color Isolation',
    presetKey: 'colorIsolation',
    type: 'colorIsolation',
    targetHue: 0, // Red focus
    hueTolerance: 30,
    saturation: 0.2,
    intensity: 1.0
  },
  99: {
    id: 99,
    name: 'Double Exposure',
    presetKey: 'doubleExposure',
    type: 'doubleExposure',
    blendOpacity: 0.5,
    contrast: 1.1,
    warmth: 0.3,
    intensity: 1.0
  },
  100: {
    id: 100,
    name: 'Kaleidoscope',
    presetKey: 'kaleidoscope',
    type: 'kaleidoscope',
    segments: 6,
    rotation: 45,
    scale: 1.1,
    intensity: 1.0
  }
};
