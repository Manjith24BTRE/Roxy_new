// src/components/editor-main-screen/tools/transitions/engines/camera/cameraTransitionPresets.ts

export type CameraMode =
  | 'handheld'
  | 'shake'
  | 'crash-zoom'
  | 'snap-zoom'
  | 'dolly-zoom'
  | 'pull-in'
  | 'pull-out'
  | 'orbit'
  | 'whip-pan-left'
  | 'whip-pan-right';

export interface CameraTransitionDefinition {
  id: number;
  name: string;
  engineKey: string;
  category: string;
  duration: number; // default duration in seconds (e.g. 1.0)
  easing: 'linear' | 'smoothstep' | 'sine' | 'bounce' | 'cubic-bezier' | string;
  mode: CameraMode;
  amplitude?: number; // Shake or movement amplitude in px/deg
  frequency?: number; // Shake frequency / speed
  scaleStart?: number; // Zoom start scale multiplier
  scaleEnd?: number; // Zoom end scale multiplier
  rotationAmount?: number; // Max rotation angle in degrees
  blurAmount?: number; // Motion blur amount in px
  direction?: 'left' | 'right' | 'in' | 'out' | 'orbit';
  parameters?: Record<string, any>;
}

export const CAMERA_TRANSITION_PRESETS: Record<string, CameraTransitionDefinition> = {
  'Handheld Transition': {
    id: 11,
    name: 'Handheld Transition',
    engineKey: 'CameraTransitionEngine',
    category: 'Camera',
    duration: 1.0,
    easing: 'sine',
    mode: 'handheld',
    amplitude: 15.0, // 15px displacement amplitude
    frequency: 8.0, // 8Hz organic movement
    rotationAmount: 2.5, // 2.5 deg rotation wobble
    parameters: {
      motionBlur: 4.0,
      focalPoint: { x: 0.5, y: 0.5 },
    },
  },
  'Camera Shake': {
    id: 12,
    name: 'Camera Shake',
    engineKey: 'CameraTransitionEngine',
    category: 'Camera',
    duration: 0.8,
    easing: 'sine',
    mode: 'shake',
    amplitude: 28.0, // 28px peak vibration amplitude
    frequency: 24.0, // 24Hz fast shake frequency
    rotationAmount: 4.0, // 4 deg peak rotational vibration
    parameters: {
      decay: 2.5,
      motionBlur: 8.0,
    },
  },
  'Crash Zoom': {
    id: 13,
    name: 'Crash Zoom',
    engineKey: 'CameraTransitionEngine',
    category: 'Camera',
    duration: 0.7,
    easing: 'smoothstep',
    mode: 'crash-zoom',
    scaleStart: 1.0,
    scaleEnd: 3.8, // 3.8x rapid zoom surge
    blurAmount: 18.0,
    parameters: {
      velocityBlur: true,
      zoomPoint: { x: 0.5, y: 0.5 },
    },
  },
  'Snap Zoom': {
    id: 14,
    name: 'Snap Zoom',
    engineKey: 'CameraTransitionEngine',
    category: 'Camera',
    duration: 0.5,
    easing: 'bounce',
    mode: 'snap-zoom',
    scaleStart: 1.0,
    scaleEnd: 1.85, // 1.85x punchy zoom with overshoot
    parameters: {
      overshootRatio: 0.2,
      dampening: 0.8,
    },
  },
  'Dolly Zoom': {
    id: 15,
    name: 'Dolly Zoom',
    engineKey: 'CameraTransitionEngine',
    category: 'Camera',
    duration: 1.2,
    easing: 'smoothstep',
    mode: 'dolly-zoom',
    scaleStart: 1.0,
    scaleEnd: 1.6, // Reverse zoom & perspective compression
    parameters: {
      perspectiveDepth: 800,
      positionTravel: 200,
    },
  },
  'Pull In': {
    id: 16,
    name: 'Pull In',
    engineKey: 'CameraTransitionEngine',
    category: 'Camera',
    duration: 1.0,
    easing: 'smoothstep',
    mode: 'pull-in',
    scaleStart: 1.0,
    scaleEnd: 1.55,
    direction: 'in',
    parameters: {
      subjectAnchor: { x: 0.5, y: 0.5 },
    },
  },
  'Pull Out': {
    id: 17,
    name: 'Pull Out',
    engineKey: 'CameraTransitionEngine',
    category: 'Camera',
    duration: 1.0,
    easing: 'smoothstep',
    mode: 'pull-out',
    scaleStart: 1.0,
    scaleEnd: 0.65,
    direction: 'out',
    parameters: {
      preserveFraming: true,
    },
  },
  'Orbit Camera': {
    id: 18,
    name: 'Orbit Camera',
    engineKey: 'CameraTransitionEngine',
    category: 'Camera',
    duration: 1.1,
    easing: 'sine',
    mode: 'orbit',
    rotationAmount: 25.0, // 25 deg perspective orbit rotation
    direction: 'orbit',
    parameters: {
      orbitRadius: 300,
      perspective: 1000,
    },
  },
  'Whip Pan Left': {
    id: 19,
    name: 'Whip Pan Left',
    engineKey: 'CameraTransitionEngine',
    category: 'Camera',
    duration: 0.6,
    easing: 'smoothstep',
    mode: 'whip-pan-left',
    direction: 'left',
    amplitude: 100.0, // 100% viewport width sweep
    blurAmount: 22.0,
    parameters: {
      sweepDirection: -1,
      motionBlurAngle: 0,
    },
  },
  'Whip Pan Right ': {
    id: 20,
    name: 'Whip Pan Right ',
    engineKey: 'CameraTransitionEngine',
    category: 'Camera',
    duration: 0.6,
    easing: 'smoothstep',
    mode: 'whip-pan-right',
    direction: 'right',
    amplitude: 100.0, // 100% viewport width sweep
    blurAmount: 22.0,
    parameters: {
      sweepDirection: 1,
      motionBlurAngle: 0,
    },
  },
};
