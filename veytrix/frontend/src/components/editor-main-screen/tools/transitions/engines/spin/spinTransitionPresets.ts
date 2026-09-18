// src/components/editor-main-screen/tools/transitions/engines/spin/spinTransitionPresets.ts

export type SpinMode =
  | 'spin-left'
  | 'spin-right'
  | '360-rotate'
  | '3d-flip'
  | 'page-flip'
  | 'barrel-roll'
  | 'twist-rotate'
  | 'helix-spin'
  | 'cylinder-rotate'
  | 'portal-spin';

export interface SpinTransitionDefinition {
  id: number;
  name: string;
  engineKey: 'SpinTransitionEngine';
  mode: SpinMode;
  direction?: 'ccw' | 'cw' | 'left' | 'right' | 'up' | 'down';
  rotationStartDeg: number;
  rotationEndDeg: number;
  axisX?: number;
  axisY?: number;
  axisZ?: number;
  perspectivePx?: number;
  peakScale?: number;
  easing: 'linear' | 'ease-in-out' | 'ease-out' | 'cubic-bezier';
  blurAmount?: number;
  transformOrigin?: string;
}

export const SPIN_TRANSITION_PRESETS: Record<string, SpinTransitionDefinition> = {
  'Spin Left': {
    id: 41,
    name: 'Spin Left',
    engineKey: 'SpinTransitionEngine',
    mode: 'spin-left',
    direction: 'ccw',
    rotationStartDeg: 0,
    rotationEndDeg: -180,
    axisX: 0,
    axisY: 0,
    axisZ: 1,
    perspectivePx: 800,
    peakScale: 0.85,
    easing: 'ease-in-out',
    blurAmount: 4,
    transformOrigin: 'center center',
  },
  'Spin Right': {
    id: 42,
    name: 'Spin Right',
    engineKey: 'SpinTransitionEngine',
    mode: 'spin-right',
    direction: 'cw',
    rotationStartDeg: 0,
    rotationEndDeg: 180,
    axisX: 0,
    axisY: 0,
    axisZ: 1,
    perspectivePx: 800,
    peakScale: 0.85,
    easing: 'ease-in-out',
    blurAmount: 4,
    transformOrigin: 'center center',
  },
  '360 Rotate': {
    id: 43,
    name: '360 Rotate',
    engineKey: 'SpinTransitionEngine',
    mode: '360-rotate',
    direction: 'cw',
    rotationStartDeg: 0,
    rotationEndDeg: 360,
    axisX: 0,
    axisY: 0,
    axisZ: 1,
    perspectivePx: 1000,
    peakScale: 1.15, // Scale up slightly at midpoint to prevent transparent corners during full 360 rotation
    easing: 'cubic-bezier',
    blurAmount: 6,
    transformOrigin: 'center center',
  },
  '3D Flip': {
    id: 44,
    name: '3D Flip',
    engineKey: 'SpinTransitionEngine',
    mode: '3d-flip',
    direction: 'left',
    rotationStartDeg: 0,
    rotationEndDeg: 180,
    axisX: 0,
    axisY: 1,
    axisZ: 0,
    perspectivePx: 800,
    peakScale: 1.0,
    easing: 'cubic-bezier',
    blurAmount: 2,
    transformOrigin: 'center center',
  },
  'Page Flip': {
    id: 45,
    name: 'Page Flip',
    engineKey: 'SpinTransitionEngine',
    mode: 'page-flip',
    direction: 'left',
    rotationStartDeg: 0,
    rotationEndDeg: -180,
    axisX: 0,
    axisY: 1,
    axisZ: 0,
    perspectivePx: 1000,
    peakScale: 1.0,
    easing: 'ease-in-out',
    blurAmount: 1,
    transformOrigin: 'left center',
  },
  'Barrel Roll': {
    id: 46,
    name: 'Barrel Roll',
    engineKey: 'SpinTransitionEngine',
    mode: 'barrel-roll',
    direction: 'cw',
    rotationStartDeg: 0,
    rotationEndDeg: 360,
    axisX: 0,
    axisY: 0,
    axisZ: 1,
    perspectivePx: 900,
    peakScale: 0.75, // Dips to 0.75 at midpoint simulating aircraft roll flight distance
    easing: 'cubic-bezier',
    blurAmount: 5,
    transformOrigin: 'center center',
  },
  'Twist Rotate': {
    id: 47,
    name: 'Twist Rotate',
    engineKey: 'SpinTransitionEngine',
    mode: 'twist-rotate',
    direction: 'cw',
    rotationStartDeg: 0,
    rotationEndDeg: 270,
    axisX: 0,
    axisY: 0,
    axisZ: 1,
    perspectivePx: 800,
    peakScale: 0.4, // Squeezes down to 0.4 twist core before unwinding
    easing: 'ease-in-out',
    blurAmount: 8,
    transformOrigin: 'center center',
  },
  'Helix Spin': {
    id: 48,
    name: 'Helix Spin',
    engineKey: 'SpinTransitionEngine',
    mode: 'helix-spin',
    direction: 'ccw',
    rotationStartDeg: 0,
    rotationEndDeg: -360,
    axisX: 0.2,
    axisY: 0.2,
    axisZ: 1,
    perspectivePx: 800,
    peakScale: 0.6,
    easing: 'cubic-bezier',
    blurAmount: 6,
    transformOrigin: 'center center',
  },
  'Cylinder Rotate': {
    id: 49,
    name: 'Cylinder Rotate',
    engineKey: 'SpinTransitionEngine',
    mode: 'cylinder-rotate',
    direction: 'right',
    rotationStartDeg: 0,
    rotationEndDeg: 180,
    axisX: 0,
    axisY: 1,
    axisZ: 0,
    perspectivePx: 1200,
    peakScale: 0.9,
    easing: 'ease-in-out',
    blurAmount: 3,
    transformOrigin: 'center center',
  },
  // Exact Excel catalog spelling: "Portal SPin"
  'Portal SPin': {
    id: 50,
    name: 'Portal SPin',
    engineKey: 'SpinTransitionEngine',
    mode: 'portal-spin',
    direction: 'ccw',
    rotationStartDeg: 0,
    rotationEndDeg: -720,
    axisX: 0,
    axisY: 0,
    axisZ: 1,
    perspectivePx: 600,
    peakScale: 0.0, // Collapses to a single point portal at midpoint before expanding out
    easing: 'cubic-bezier',
    blurAmount: 10,
    transformOrigin: 'center center',
  },
  // Standard title alias for convenience
  'Portal Spin': {
    id: 50,
    name: 'Portal SPin',
    engineKey: 'SpinTransitionEngine',
    mode: 'portal-spin',
    direction: 'ccw',
    rotationStartDeg: 0,
    rotationEndDeg: -720,
    axisX: 0,
    axisY: 0,
    axisZ: 1,
    perspectivePx: 600,
    peakScale: 0.0,
    easing: 'cubic-bezier',
    blurAmount: 10,
    transformOrigin: 'center center',
  },
};
