// src/components/editor-main-screen/tools/effects/engines/transformAttention/transformAttentionPresets.ts

export type TransformAttentionType =
  | 'shakeIn'
  | 'zoomBounce'
  | 'pulse'
  | 'popIn'
  | 'popOut'
  | 'expand'
  | 'collapse'
  | 'swing'
  | 'bounce'
  | 'wiggle';

export interface TransformAttentionPreset {
  id: number;
  name: string; // Exact Excel Name
  presetKey: TransformAttentionType;
  type: TransformAttentionType;
  strength?: number;
  frequency?: number;
  rotation?: number;
  duration?: number;
  zoom?: number;
  bounce?: number;
  speed?: number;
  damping?: number;
  scaleRange?: number;
  phase?: number;
  intensity?: number;
  startScale?: number;
  endScale?: number;
  scaleX?: number;
  scaleY?: number;
  swingAngle?: number;
  pivotX?: number;
  pivotY?: number;
  bounceHeight?: number;
}

export const TRANSFORM_ATTENTION_PRESETS: Record<number, TransformAttentionPreset> = {
  11: {
    id: 11,
    name: 'Shake in',
    presetKey: 'shakeIn',
    type: 'shakeIn',
    strength: 35,
    frequency: 18,
    rotation: 12,
    duration: 0.8,
    damping: 5.5
  },
  12: {
    id: 12,
    name: 'Zoom Bounce',
    presetKey: 'zoomBounce',
    type: 'zoomBounce',
    zoom: 1.4,
    bounce: 0.35,
    speed: 6.0,
    damping: 4.0,
    duration: 1.0
  },
  13: {
    id: 13,
    name: 'Pulse',
    presetKey: 'pulse',
    type: 'pulse',
    scaleRange: 0.15,
    speed: 3.5,
    phase: 0,
    duration: 1.0
  },
  14: {
    id: 14,
    name: 'Pop In',
    presetKey: 'popIn',
    type: 'popIn',
    startScale: 0.1,
    endScale: 1.0,
    speed: 4.0,
    duration: 0.6
  },
  15: {
    id: 15,
    name: 'Pop Out',
    presetKey: 'popOut',
    type: 'popOut',
    startScale: 1.0,
    endScale: 0.0,
    speed: 4.0,
    duration: 0.6
  },
  16: {
    id: 16,
    name: 'Expand',
    presetKey: 'expand',
    type: 'expand',
    scaleX: 1.5,
    scaleY: 1.15,
    duration: 1.0
  },
  17: {
    id: 17,
    name: 'Collapse',
    presetKey: 'collapse',
    type: 'collapse',
    scaleX: 0.0,
    scaleY: 0.0,
    duration: 1.0
  },
  18: {
    id: 18,
    name: 'Swing',
    presetKey: 'swing',
    type: 'swing',
    swingAngle: 25,
    speed: 3.0,
    damping: 2.0,
    pivotX: 0.5,
    pivotY: 0.0,
    duration: 1.2
  },
  19: {
    id: 19,
    name: 'Bounce',
    presetKey: 'bounce',
    type: 'bounce',
    bounceHeight: 180,
    frequency: 4.0,
    damping: 3.0,
    duration: 1.2
  },
  20: {
    id: 20,
    name: 'Wiggle',
    presetKey: 'wiggle',
    type: 'wiggle',
    strength: 25,
    speed: 6.0,
    rotation: 6,
    frequency: 8.0,
    duration: 1.0
  }
};
