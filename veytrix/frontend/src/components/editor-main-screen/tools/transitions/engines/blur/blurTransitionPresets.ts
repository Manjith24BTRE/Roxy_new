// src/components/editor-main-screen/tools/transitions/engines/blur/blurTransitionPresets.ts

export type BlurMode =
  | 'motion-blur'
  | 'gaussian-blur'
  | 'directional-blur'
  | 'radial-blur'
  | 'lens-blur'
  | 'broken-blur'
  | 'blur-flash'
  | 'blur-stretch'
  | 'blur-tunnel'
  | 'cinematic-blur';

export interface BlurTransitionDefinition {
  id: number;
  name: string;
  engineKey: 'BlurTransitionEngine';
  mode: BlurMode;
  maxRadiusPx: number;
  directionDeg?: number;
  focalPointX?: number;
  focalPointY?: number;
  flashIntensity?: number;
  stretchScale?: number;
  tunnelZoom?: number;
  easing: 'linear' | 'ease-in-out' | 'ease-out' | 'cubic-bezier';
}

export const BLUR_TRANSITION_PRESETS: Record<string, BlurTransitionDefinition> = {
  'Motion Blur': {
    id: 51,
    name: 'Motion Blur',
    engineKey: 'BlurTransitionEngine',
    mode: 'motion-blur',
    maxRadiusPx: 20,
    directionDeg: 0, // Horizontal velocity motion blur
    easing: 'ease-in-out',
  },
  'Gaussian Blur': {
    id: 52,
    name: 'Gaussian Blur',
    engineKey: 'BlurTransitionEngine',
    mode: 'gaussian-blur',
    maxRadiusPx: 25,
    easing: 'ease-in-out',
  },
  'Directional Blur': {
    id: 53,
    name: 'Directional Blur',
    engineKey: 'BlurTransitionEngine',
    mode: 'directional-blur',
    maxRadiusPx: 22,
    directionDeg: 45, // 45° diagonal directional blur
    easing: 'cubic-bezier',
  },
  'Radial Blur': {
    id: 54,
    name: 'Radial Blur',
    engineKey: 'BlurTransitionEngine',
    mode: 'radial-blur',
    maxRadiusPx: 18,
    focalPointX: 0.5,
    focalPointY: 0.5,
    easing: 'cubic-bezier',
  },
  // Exact Excel catalog spelling: "Lens Blur " (trailing space)
  'Lens Blur ': {
    id: 55,
    name: 'Lens Blur ',
    engineKey: 'BlurTransitionEngine',
    mode: 'lens-blur',
    maxRadiusPx: 16,
    focalPointX: 0.5,
    focalPointY: 0.5,
    easing: 'ease-in-out',
  },
  'Lens Blur': {
    id: 55,
    name: 'Lens Blur ',
    engineKey: 'BlurTransitionEngine',
    mode: 'lens-blur',
    maxRadiusPx: 16,
    focalPointX: 0.5,
    focalPointY: 0.5,
    easing: 'ease-in-out',
  },
  'Broken Blur': {
    id: 56,
    name: 'Broken Blur',
    engineKey: 'BlurTransitionEngine',
    mode: 'broken-blur',
    maxRadiusPx: 24,
    focalPointX: 0.5,
    focalPointY: 0.5,
    easing: 'cubic-bezier',
  },
  'Blur Flash': {
    id: 57,
    name: 'Blur Flash',
    engineKey: 'BlurTransitionEngine',
    mode: 'blur-flash',
    maxRadiusPx: 26,
    flashIntensity: 0.85,
    easing: 'ease-in-out',
  },
  'Blur Stretch': {
    id: 58,
    name: 'Blur Stretch',
    engineKey: 'BlurTransitionEngine',
    mode: 'blur-stretch',
    maxRadiusPx: 20,
    directionDeg: 0,
    stretchScale: 1.45,
    easing: 'cubic-bezier',
  },
  // Exact Excel catalog spelling: "Blur Tunnel " (trailing space)
  'Blur Tunnel ': {
    id: 59,
    name: 'Blur Tunnel ',
    engineKey: 'BlurTransitionEngine',
    mode: 'blur-tunnel',
    maxRadiusPx: 22,
    tunnelZoom: 2.2,
    focalPointX: 0.5,
    focalPointY: 0.5,
    easing: 'cubic-bezier',
  },
  'Blur Tunnel': {
    id: 59,
    name: 'Blur Tunnel ',
    engineKey: 'BlurTransitionEngine',
    mode: 'blur-tunnel',
    maxRadiusPx: 22,
    tunnelZoom: 2.2,
    focalPointX: 0.5,
    focalPointY: 0.5,
    easing: 'cubic-bezier',
  },
  'Cinematic Blur': {
    id: 60,
    name: 'Cinematic Blur',
    engineKey: 'BlurTransitionEngine',
    mode: 'cinematic-blur',
    maxRadiusPx: 18,
    flashIntensity: 0.25,
    stretchScale: 1.1,
    easing: 'ease-in-out',
  },
};
