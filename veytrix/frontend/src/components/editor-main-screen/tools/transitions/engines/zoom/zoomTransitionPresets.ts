// src/components/editor-main-screen/tools/transitions/engines/zoom/zoomTransitionPresets.ts

export type ZoomMode =
  | 'zoom-in'
  | 'zoom-out'
  | 'hyper-zoom'
  | 'elastic-zoom'
  | 'bounce-zoom'
  | 'pulse-zoom'
  | 'center-zoom'
  | 'corner-zoom'
  | 'radial-zoom'
  | 'velocity-zoom';

export interface FocalPoint {
  x: number; // Normalized 0.0 to 1.0 (0.5 is center)
  y: number; // Normalized 0.0 to 1.0 (0.5 is center)
}

export interface ZoomTransitionDefinition {
  id: number;
  name: string;
  engineKey: string;
  category: string;
  duration: number; // Default duration in seconds (e.g. 1.0)
  easing: 'linear' | 'smoothstep' | 'sine' | 'elastic' | 'bounce' | 'cubic-accel' | string;
  mode: ZoomMode;
  scaleStart?: number;
  scaleEnd?: number;
  overshoot?: number;
  bounceAmount?: number;
  pulseCount?: number;
  focalPoint?: FocalPoint;
  blurAmount?: number;
  parameters?: Record<string, any>;
}

export const ZOOM_TRANSITION_PRESETS: Record<string, ZoomTransitionDefinition> = {
  'Zoom In': {
    id: 21,
    name: 'Zoom In',
    engineKey: 'ZoomTransitionEngine',
    category: 'Zoom',
    duration: 1.0,
    easing: 'smoothstep',
    mode: 'zoom-in',
    scaleStart: 1.0,
    scaleEnd: 2.2,
    focalPoint: { x: 0.5, y: 0.5 },
    parameters: {
      blur: 4.0,
    },
  },
  'Zoom Out': {
    id: 22,
    name: 'Zoom Out',
    engineKey: 'ZoomTransitionEngine',
    category: 'Zoom',
    duration: 1.0,
    easing: 'smoothstep',
    mode: 'zoom-out',
    scaleStart: 1.0,
    scaleEnd: 0.45,
    focalPoint: { x: 0.5, y: 0.5 },
    parameters: {
      backgroundFill: true,
    },
  },
  'Hyper Zoom': {
    id: 23,
    name: 'Hyper Zoom',
    engineKey: 'ZoomTransitionEngine',
    category: 'Zoom',
    duration: 0.6,
    easing: 'cubic-accel',
    mode: 'hyper-zoom',
    scaleStart: 1.0,
    scaleEnd: 4.8,
    blurAmount: 24.0,
    focalPoint: { x: 0.5, y: 0.5 },
    parameters: {
      velocityBlur: true,
    },
  },
  'Elastic Zoom': {
    id: 24,
    name: 'Elastic Zoom',
    engineKey: 'ZoomTransitionEngine',
    category: 'Zoom',
    duration: 1.1,
    easing: 'elastic',
    mode: 'elastic-zoom',
    scaleStart: 1.0,
    scaleEnd: 1.6,
    overshoot: 0.35,
    focalPoint: { x: 0.5, y: 0.5 },
    parameters: {
      damping: 0.7,
    },
  },
  'Bounce Zoom': {
    id: 25,
    name: 'Bounce Zoom',
    engineKey: 'ZoomTransitionEngine',
    category: 'Zoom',
    duration: 0.9,
    easing: 'bounce',
    mode: 'bounce-zoom',
    scaleStart: 1.0,
    scaleEnd: 1.75,
    bounceAmount: 0.25,
    focalPoint: { x: 0.5, y: 0.5 },
    parameters: {
      bounceCount: 2,
    },
  },
  'Pulse Zoom': {
    id: 26,
    name: 'Pulse Zoom',
    engineKey: 'ZoomTransitionEngine',
    category: 'Zoom',
    duration: 1.0,
    easing: 'sine',
    mode: 'pulse-zoom',
    pulseCount: 3,
    bounceAmount: 0.3,
    focalPoint: { x: 0.5, y: 0.5 },
    parameters: {
      frequency: 3.0,
    },
  },
  'Center Zoom': {
    id: 27,
    name: 'Center Zoom',
    engineKey: 'ZoomTransitionEngine',
    category: 'Zoom',
    duration: 1.0,
    easing: 'smoothstep',
    mode: 'center-zoom',
    scaleStart: 1.0,
    scaleEnd: 2.0,
    focalPoint: { x: 0.5, y: 0.5 },
    parameters: {
      frameCenterAnchor: true,
    },
  },
  'Corner Zoom': {
    id: 28,
    name: 'Corner Zoom',
    engineKey: 'ZoomTransitionEngine',
    category: 'Zoom',
    duration: 1.0,
    easing: 'smoothstep',
    mode: 'corner-zoom',
    scaleStart: 1.0,
    scaleEnd: 2.2,
    focalPoint: { x: 0.0, y: 0.0 }, // Top-Left corner anchor
    parameters: {
      corner: 'top-left',
    },
  },
  'Radial Zoom': {
    id: 29,
    name: 'Radial Zoom',
    engineKey: 'ZoomTransitionEngine',
    category: 'Zoom',
    duration: 1.0,
    easing: 'smoothstep',
    mode: 'radial-zoom',
    scaleStart: 1.0,
    scaleEnd: 2.1,
    blurAmount: 16.0,
    focalPoint: { x: 0.5, y: 0.5 },
    parameters: {
      radialBlurCenter: { x: 0.5, y: 0.5 },
    },
  },
  'Velocity Zoom': {
    id: 30,
    name: 'Velocity Zoom',
    engineKey: 'ZoomTransitionEngine',
    category: 'Zoom',
    duration: 0.8,
    easing: 'cubic-accel',
    mode: 'velocity-zoom',
    scaleStart: 1.0,
    scaleEnd: 3.2,
    blurAmount: 20.0,
    focalPoint: { x: 0.5, y: 0.5 },
    parameters: {
      dynamicVelocity: true,
    },
  },
};
