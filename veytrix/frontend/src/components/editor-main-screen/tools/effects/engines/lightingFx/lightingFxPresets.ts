// src/components/editor-main-screen/tools/effects/engines/lightingFx/lightingFxPresets.ts

export type LightingFXType =
  | 'sunGlow'
  | 'sunRays'
  | 'godRays'
  | 'spotlight'
  | 'studioLight'
  | 'ringLight'
  | 'fillLight'
  | 'rimLight'
  | 'neonGlow'
  | 'volumetricLight';

export interface LightingFXPreset {
  id: number;
  name: string; // Exact Excel Name
  presetKey: LightingFXType;
  type: LightingFXType;
  intensity?: number;
  
  // Positional & Falloff
  posX?: number; // Normalized 0..1
  posY?: number; // Normalized 0..1
  radius?: number; // 0..1
  innerRadius?: number; // 0..1
  outerRadius?: number; // 0..1
  
  // Lighting Colors
  color?: string;
  keyColor?: string;
  fillColor?: string;
  
  // Ray & Beam properties
  angle?: number; // Degrees 0..360
  beamWidth?: number; // 0..1
  rayCount?: number;
  rayLength?: number;
  scattering?: number;
  
  // Glow & Bloom
  glow?: number; // 0..1
  bloomRadius?: number; // px
  feather?: number; // 0..1
  
  // Noise & Animation
  flicker?: number; // 0..1
  pulsate?: number; // 0..1
  density?: number; // 0..1
  falloff?: number; // 0..1
  shadowLift?: number; // 0..1
  brightness?: number;
  warmth?: number;
  threshold?: number;
  edgeWidth?: number;
  dim?: number;
}

export const LIGHTING_FX_PRESETS: Record<number, LightingFXPreset> = {
  71: {
    id: 71,
    name: 'Sun GLow', // Exact Excel catalog name
    presetKey: 'sunGlow',
    type: 'sunGlow',
    posX: 0.85,
    posY: 0.15,
    radius: 0.65,
    color: '#ffcc66',
    glow: 0.8,
    brightness: 1.2,
    intensity: 1.0
  },
  72: {
    id: 72,
    name: 'Sun Rays',
    presetKey: 'sunRays',
    type: 'sunRays',
    posX: 0.9,
    posY: 0.1,
    angle: 135,
    rayCount: 12,
    rayLength: 0.85,
    color: '#fff2cc',
    flicker: 0.2,
    intensity: 1.0
  },
  73: {
    id: 73,
    name: 'God Rays',
    presetKey: 'godRays',
    type: 'godRays',
    posX: 0.5,
    posY: 0.0,
    angle: 90,
    beamWidth: 0.4,
    scattering: 0.7,
    color: '#ffffff',
    brightness: 1.3,
    intensity: 1.0
  },
  74: {
    id: 74,
    name: 'Spotlight',
    presetKey: 'spotlight',
    type: 'spotlight',
    posX: 0.5,
    posY: 0.4,
    radius: 0.45,
    angle: 45,
    feather: 0.5,
    dim: 0.5,
    color: '#ffffff',
    intensity: 1.0
  },
  75: {
    id: 75,
    name: 'Studio Light',
    presetKey: 'studioLight',
    type: 'studioLight',
    keyColor: '#fffaed',
    fillColor: '#e3f2fd',
    feather: 0.6,
    brightness: 1.15,
    intensity: 1.0
  },
  76: {
    id: 76,
    name: 'Ring Light',
    presetKey: 'ringLight',
    type: 'ringLight',
    posX: 0.5,
    posY: 0.5,
    innerRadius: 0.3,
    outerRadius: 0.55,
    glow: 0.75,
    feather: 0.4,
    color: '#ffffff',
    intensity: 1.0
  },
  77: {
    id: 77,
    name: 'FIll Light', // Exact Excel catalog name with capital 'I'
    presetKey: 'fillLight',
    type: 'fillLight',
    shadowLift: 0.4,
    warmth: 0.2,
    color: '#f0f4f8',
    brightness: 1.1,
    intensity: 1.0
  },
  78: {
    id: 78,
    name: 'Rim Light',
    presetKey: 'rimLight',
    type: 'rimLight',
    edgeWidth: 15,
    threshold: 0.4,
    color: '#00d2ff',
    glow: 0.7,
    intensity: 1.0
  },
  79: {
    id: 79,
    name: 'Neon Glow',
    presetKey: 'neonGlow',
    type: 'neonGlow',
    color: '#ff007f',
    bloomRadius: 20,
    brightness: 1.4,
    pulsate: 0.3,
    intensity: 1.0
  },
  80: {
    id: 80,
    name: 'Volumetric Light',
    presetKey: 'volumetricLight',
    type: 'volumetricLight',
    posX: 0.5,
    posY: 0.1,
    density: 0.6,
    falloff: 0.8,
    color: '#fff5e6',
    brightness: 1.25,
    intensity: 1.0
  }
};
