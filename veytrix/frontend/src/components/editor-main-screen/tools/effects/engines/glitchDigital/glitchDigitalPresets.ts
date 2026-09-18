// src/components/editor-main-screen/tools/effects/engines/glitchDigital/glitchDigitalPresets.ts

export type GlitchDigitalType =
  | 'rgbSplit'
  | 'digitalGlitch'
  | 'dataCorruption'
  | 'signalLoss'
  | 'screenTear'
  | 'pixelSort'
  | 'pixelStretch'
  | 'pixelExplosion'
  | 'tvStatic'
  | 'scanLines';

export interface GlitchDigitalPreset {
  id: number;
  name: string; // Exact Excel Name
  presetKey: GlitchDigitalType;
  type: GlitchDigitalType;
  intensity?: number;
  rgbOffset?: number;
  direction?: number;
  blend?: number;
  frequency?: number;
  blockSize?: number;
  seed?: number;
  corruptionAmount?: number;
  speed?: number;
  noise?: number;
  signalStrength?: number;
  flicker?: number;
  tearSize?: number;
  threshold?: number;
  length?: number;
  amount?: number;
  stretchDistance?: number;
  explosionSize?: number;
  fragmentCount?: number;
  noiseDensity?: number;
  grainSize?: number;
  opacity?: number;
  lineThickness?: number;
  spacing?: number;
  brightness?: number;
}

export const GLITCH_DIGITAL_PRESETS: Record<number, GlitchDigitalPreset> = {
  41: {
    id: 41,
    name: 'RGB Split',
    presetKey: 'rgbSplit',
    type: 'rgbSplit',
    rgbOffset: 12,
    direction: 0,
    intensity: 1.0,
    blend: 0.8
  },
  42: {
    id: 42,
    name: 'Digital Glitch',
    presetKey: 'digitalGlitch',
    type: 'digitalGlitch',
    intensity: 1.0,
    frequency: 5.0,
    blockSize: 30,
    seed: 42
  },
  43: {
    id: 43,
    name: 'Data Corruption',
    presetKey: 'dataCorruption',
    type: 'dataCorruption',
    corruptionAmount: 0.7,
    speed: 4.0,
    blockSize: 40,
    noise: 0.5
  },
  44: {
    id: 44,
    name: 'Signal loss', // Exact catalog name for ID 44
    presetKey: 'signalLoss',
    type: 'signalLoss',
    signalStrength: 0.8,
    flicker: 0.6,
    noise: 0.4,
    frequency: 3.0
  },
  45: {
    id: 45,
    name: 'Screen Tear',
    presetKey: 'screenTear',
    type: 'screenTear',
    tearSize: 20,
    speed: 6.0,
    frequency: 4.0,
    intensity: 1.0
  },
  46: {
    id: 46,
    name: 'Pixel Sort',
    presetKey: 'pixelSort',
    type: 'pixelSort',
    direction: 90,
    threshold: 0.4,
    length: 150,
    amount: 1.0
  },
  47: {
    id: 47,
    name: 'Pixel Stretch',
    presetKey: 'pixelStretch',
    type: 'pixelStretch',
    stretchDistance: 200,
    direction: 0,
    threshold: 0.5,
    intensity: 1.0
  },
  48: {
    id: 48,
    name: 'Pixel Explosion',
    presetKey: 'pixelExplosion',
    type: 'pixelExplosion',
    explosionSize: 100,
    speed: 2.5,
    fragmentCount: 16,
    direction: 0
  },
  49: {
    id: 49,
    name: 'TV Static',
    presetKey: 'tvStatic',
    type: 'tvStatic',
    noiseDensity: 0.8,
    grainSize: 2.0,
    flicker: 0.5,
    opacity: 0.6
  },
  50: {
    id: 50,
    name: 'Scan Lines',
    presetKey: 'scanLines',
    type: 'scanLines',
    lineThickness: 2.0,
    spacing: 6.0,
    opacity: 0.4,
    brightness: 0.9
  }
};
