// src/components/editor-main-screen/tools/effects/engines/distortionFx/distortionFxPresets.ts

export type DistortionFXType =
  | 'fishEye'
  | 'wideAngle'
  | 'barrelDistortion'
  | 'pincushion'
  | 'chromaticAberration'
  | 'prism'
  | 'glassReflection'
  | 'waterReflection'
  | 'ripple'
  | 'swirl';

export interface DistortionFXPreset {
  id: number;
  name: string; // Exact Excel Name
  presetKey: DistortionFXType;
  type: DistortionFXType;
  intensity?: number;

  // Lens & Warp Parameters
  radius?: number; // 0.1..1.0
  distortion?: number; // Strength factor
  kFactor?: number; // Polynomial warp factor
  scale?: number; // Scale correction factor
  fov?: number; // Field of view expansion

  // Chromatic & Prism Parameters
  shiftPx?: number; // Chromatic offset in px
  angle?: number; // Angle in degrees 0..360
  facets?: number; // Prism facet count
  dispersion?: number; // Spectrum spread factor

  // Reflection & Surface Parameters
  reflectivity?: number; // Reflection opacity 0..1
  splitY?: number; // Reflection horizon line Y 0..1
  blurPx?: number; // Surface reflection blur

  // Wave & Ripple Animation Parameters
  speed?: number; // Wave speed multiplier
  amplitude?: number; // Wave displacement magnitude
  frequency?: number; // Wave spatial frequency
  swirlAngle?: number; // Swirl twist angle in degrees (-720..720)
  posX?: number; // Center position X 0..1
  posY?: number; // Center position Y 0..1
}

export const DISTORTION_FX_PRESETS: Record<number, DistortionFXPreset> = {
  81: {
    id: 81,
    name: 'Fish Eye',
    presetKey: 'fishEye',
    type: 'fishEye',
    radius: 0.75,
    distortion: 0.8,
    scale: 1.15,
    intensity: 1.0
  },
  82: {
    id: 82,
    name: 'Wide Angle ', // Exact Excel catalog name with trailing space
    presetKey: 'wideAngle',
    type: 'wideAngle',
    fov: 0.6,
    kFactor: 0.35,
    scale: 1.1,
    intensity: 1.0
  },
  83: {
    id: 83,
    name: 'Barrel Distortion',
    presetKey: 'barrelDistortion',
    type: 'barrelDistortion',
    kFactor: 0.5,
    scale: 1.12,
    intensity: 1.0
  },
  84: {
    id: 84,
    name: 'Pincushion',
    presetKey: 'pincushion',
    type: 'pincushion',
    kFactor: 0.45,
    scale: 0.95,
    intensity: 1.0
  },
  85: {
    id: 85,
    name: 'Chromatic Aberration',
    presetKey: 'chromaticAberration',
    type: 'chromaticAberration',
    shiftPx: 12,
    angle: 45,
    dispersion: 0.7,
    intensity: 1.0
  },
  86: {
    id: 86,
    name: 'Prism',
    presetKey: 'prism',
    type: 'prism',
    facets: 5,
    dispersion: 0.8,
    angle: 30,
    intensity: 1.0
  },
  87: {
    id: 87,
    name: 'Glass Reflection',
    presetKey: 'glassReflection',
    type: 'glassReflection',
    reflectivity: 0.4,
    blurPx: 4,
    angle: 45,
    intensity: 1.0
  },
  88: {
    id: 88,
    name: 'Water Reflection ', // Exact Excel catalog name with trailing space
    presetKey: 'waterReflection',
    type: 'waterReflection',
    splitY: 0.55,
    speed: 1.5,
    amplitude: 0.03,
    frequency: 15,
    reflectivity: 0.7,
    intensity: 1.0
  },
  89: {
    id: 89,
    name: 'Ripple ', // Exact Excel catalog name with trailing space
    presetKey: 'ripple',
    type: 'ripple',
    posX: 0.5,
    posY: 0.5,
    speed: 2.0,
    amplitude: 0.04,
    frequency: 20,
    intensity: 1.0
  },
  90: {
    id: 90,
    name: 'Swirl',
    presetKey: 'swirl',
    type: 'swirl',
    posX: 0.5,
    posY: 0.5,
    swirlAngle: 180,
    radius: 0.6,
    intensity: 1.0
  }
};
