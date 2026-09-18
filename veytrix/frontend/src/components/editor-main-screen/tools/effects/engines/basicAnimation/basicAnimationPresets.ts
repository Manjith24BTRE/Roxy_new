// src/components/editor-main-screen/tools/effects/engines/basicAnimation/basicAnimationPresets.ts
import { EasingType } from './basicAnimationUtils';

export type BasicAnimationType =
  | 'fadeIn'
  | 'fadeOut'
  | 'zoomIn'
  | 'zoomOut'
  | 'spin'
  | 'drop'
  | 'moveLeft'
  | 'moveRight'
  | 'moveUp'
  | 'moveDown';

export interface BasicAnimationPreset {
  id: number;
  name: string; // Exact Excel Name
  presetKey: BasicAnimationType;
  type: BasicAnimationType;
  duration?: number; // Default animation duration in seconds if unspecified (e.g. 1.0s)
  startOpacity?: number;
  endOpacity?: number;
  zoomAmount?: number; // Target zoom scale ratio (e.g. 1.5 for Zoom In, 1.5 -> 1.0 for Zoom Out)
  centerX?: number; // Normalized center X (0.5 = clip center)
  centerY?: number; // Normalized center Y (0.5 = clip center)
  rotationAngle?: number; // Degrees, e.g. 360
  direction?: 1 | -1; // 1 = clockwise / right / down, -1 = counter-clockwise / left / up
  distance?: number; // Distance in pixels
  bounce?: number; // Bounce elasticity factor for Drop effect
  easing?: EasingType;
  motionBlur?: number; // 0 to 1
}

export const BASIC_ANIMATION_PRESETS: Record<number, BasicAnimationPreset> = {
  1: {
    id: 1,
    name: 'Fade in',
    presetKey: 'fadeIn',
    type: 'fadeIn',
    startOpacity: 0.0,
    endOpacity: 1.0,
    duration: 1.0,
    easing: 'linear'
  },
  2: {
    id: 2,
    name: 'Fade Out',
    presetKey: 'fadeOut',
    type: 'fadeOut',
    startOpacity: 1.0,
    endOpacity: 0.0,
    duration: 1.0,
    easing: 'linear'
  },
  3: {
    id: 3,
    name: 'Zoom In ',
    presetKey: 'zoomIn',
    type: 'zoomIn',
    zoomAmount: 1.5,
    centerX: 0.5,
    centerY: 0.5,
    duration: 1.0,
    easing: 'easeOut'
  },
  4: {
    id: 4,
    name: 'Zoom Out',
    presetKey: 'zoomOut',
    type: 'zoomOut',
    zoomAmount: 1.5,
    centerX: 0.5,
    centerY: 0.5,
    duration: 1.0,
    easing: 'easeOut'
  },
  5: {
    id: 5,
    name: 'Spin',
    presetKey: 'spin',
    type: 'spin',
    rotationAngle: 360,
    direction: 1,
    duration: 1.0,
    easing: 'easeInOut',
    motionBlur: 0.2
  },
  6: {
    id: 6,
    name: 'Drop',
    presetKey: 'drop',
    type: 'drop',
    distance: 400,
    bounce: 0.4,
    duration: 1.2,
    easing: 'bounce'
  },
  7: {
    id: 7,
    name: 'Move Left',
    presetKey: 'moveLeft',
    type: 'moveLeft',
    distance: 400,
    direction: -1,
    duration: 1.0,
    easing: 'easeOut'
  },
  8: {
    id: 8,
    name: 'Move Right',
    presetKey: 'moveRight',
    type: 'moveRight',
    distance: 400,
    direction: 1,
    duration: 1.0,
    easing: 'easeOut'
  },
  9: {
    id: 9,
    name: 'Move Up',
    presetKey: 'moveUp',
    type: 'moveUp',
    distance: 300,
    direction: -1,
    duration: 1.0,
    easing: 'easeOut'
  },
  10: {
    id: 10,
    name: 'Move Down',
    presetKey: 'moveDown',
    type: 'moveDown',
    distance: 300,
    direction: 1,
    duration: 1.0,
    easing: 'easeOut'
  }
};
