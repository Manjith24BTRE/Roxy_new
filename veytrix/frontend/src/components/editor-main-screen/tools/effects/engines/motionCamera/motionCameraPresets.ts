// src/components/editor-main-screen/tools/effects/engines/motionCamera/motionCameraPresets.ts
import { EasingType } from '../basicAnimation/basicAnimationUtils';

export type MotionCameraType =
  | 'handheldCamera'
  | 'cameraShake'
  | 'microShake'
  | 'heavyShake'
  | 'crashZoom'
  | 'smoothZoom'
  | 'dollyIn'
  | 'dollyOut'
  | 'whipPanLeft'
  | 'whipPanRight';

export interface MotionCameraPreset {
  id: number;
  name: string; // Exact Excel Name
  presetKey: MotionCameraType;
  type: MotionCameraType;
  intensity?: number;
  shakeStrength?: number;
  smoothness?: number;
  speed?: number;
  frequency?: number;
  directionX?: number;
  directionY?: number;
  rotation?: number;
  zoomAmount?: number;
  centerX?: number;
  centerY?: number;
  duration?: number;
  easing?: EasingType;
  distance?: number;
  perspective?: number;
  amount?: number;
  motionBlur?: number;
}

export const MOTION_CAMERA_PRESETS: Record<number, MotionCameraPreset> = {
  21: {
    id: 21,
    name: 'Handheld Camera',
    presetKey: 'handheldCamera',
    type: 'handheldCamera',
    shakeStrength: 15,
    smoothness: 2.0,
    speed: 1.5,
    rotation: 2.5,
    duration: 1.0
  },
  22: {
    id: 22,
    name: 'Camera Shake',
    presetKey: 'cameraShake',
    type: 'cameraShake',
    intensity: 1.0,
    frequency: 14.0,
    directionX: 1.0,
    directionY: 0.3,
    motionBlur: 0.3,
    duration: 0.8
  },
  23: {
    id: 23,
    name: 'Micro Shake',
    presetKey: 'microShake',
    type: 'microShake',
    intensity: 0.6,
    speed: 2.0,
    smoothness: 3.0,
    shakeStrength: 6,
    duration: 1.0
  },
  24: {
    id: 24,
    name: 'Heavy Shake',
    presetKey: 'heavyShake',
    type: 'heavyShake',
    intensity: 1.0,
    frequency: 22.0,
    rotation: 8.0,
    shakeStrength: 45,
    motionBlur: 0.5,
    duration: 1.0
  },
  25: {
    id: 25,
    name: 'Crash Zoom ',
    presetKey: 'crashZoom',
    type: 'crashZoom',
    zoomAmount: 0.8,
    speed: 4.5,
    centerX: 0.5,
    centerY: 0.5,
    motionBlur: 0.4,
    duration: 0.5
  },
  26: {
    id: 26,
    name: 'Smooth Zoom ',
    presetKey: 'smoothZoom',
    type: 'smoothZoom',
    zoomAmount: 0.4,
    duration: 1.5,
    easing: 'easeInOut',
    centerX: 0.5,
    centerY: 0.5
  },
  27: {
    id: 27,
    name: 'Dolly In',
    presetKey: 'dollyIn',
    type: 'dollyIn',
    distance: 0.5,
    speed: 2.0,
    perspective: 0.6,
    easing: 'easeOut',
    duration: 1.2
  },
  28: {
    id: 28,
    name: 'Dolly out',
    presetKey: 'dollyOut',
    type: 'dollyOut',
    distance: 0.5,
    speed: 2.0,
    perspective: 0.6,
    easing: 'easeOut',
    duration: 1.2
  },
  29: {
    id: 29,
    name: 'Whip Pan Left',
    presetKey: 'whipPanLeft',
    type: 'whipPanLeft',
    amount: 500,
    speed: 6.0,
    motionBlur: 0.6,
    directionX: -1.0,
    duration: 0.8
  },
  30: {
    id: 30,
    name: 'Whip Pan Right',
    presetKey: 'whipPanRight',
    type: 'whipPanRight',
    amount: 500,
    speed: 6.0,
    motionBlur: 0.6,
    directionX: 1.0,
    duration: 0.8
  }
};
