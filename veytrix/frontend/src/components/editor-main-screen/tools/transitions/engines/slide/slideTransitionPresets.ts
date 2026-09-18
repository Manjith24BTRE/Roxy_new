// src/components/editor-main-screen/tools/transitions/engines/slide/slideTransitionPresets.ts

export type SlideMode =
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'push-left'
  | 'push-right'
  | 'push-up'
  | 'push-down'
  | 'diagonal-slide'
  | 'perspective-push';

export interface DirectionVector {
  x: number; // Normalized direction vector X (-1.0 to 1.0)
  y: number; // Normalized direction vector Y (-1.0 to 1.0)
}

export interface SlideTransitionDefinition {
  id: number;
  name: string;
  engineKey: string;
  category: string;
  duration: number; // Default duration in seconds (e.g. 1.0)
  easing: 'linear' | 'smoothstep' | 'sine' | 'cubic-bezier' | string;
  mode: SlideMode;
  directionVector: DirectionVector;
  distancePercent?: number; // 100% full-frame slide by default
  perspectivePx?: number; // Optional 3D perspective depth
  blurAmount?: number; // Optional motion blur
  parameters?: Record<string, any>;
}

export const SLIDE_TRANSITION_PRESETS: Record<string, SlideTransitionDefinition> = {
  'Slide Left': {
    id: 31,
    name: 'Slide Left',
    engineKey: 'SlideTransitionEngine',
    category: 'Slide',
    duration: 1.0,
    easing: 'smoothstep',
    mode: 'slide-left',
    directionVector: { x: -1.0, y: 0.0 },
    distancePercent: 100.0,
    blurAmount: 8.0,
    parameters: {
      screenSpaceTranslation: true,
    },
  },
  'Slide Right': {
    id: 32,
    name: 'Slide Right',
    engineKey: 'SlideTransitionEngine',
    category: 'Slide',
    duration: 1.0,
    easing: 'smoothstep',
    mode: 'slide-right',
    directionVector: { x: 1.0, y: 0.0 },
    distancePercent: 100.0,
    blurAmount: 8.0,
    parameters: {
      screenSpaceTranslation: true,
    },
  },
  'Slide Up': {
    id: 33,
    name: 'Slide Up',
    engineKey: 'SlideTransitionEngine',
    category: 'Slide',
    duration: 1.0,
    easing: 'smoothstep',
    mode: 'slide-up',
    directionVector: { x: 0.0, y: -1.0 },
    distancePercent: 100.0,
    blurAmount: 6.0,
    parameters: {
      aspect916Respect: true,
    },
  },
  'Slide Down': {
    id: 34,
    name: 'Slide Down',
    engineKey: 'SlideTransitionEngine',
    category: 'Slide',
    duration: 1.0,
    easing: 'smoothstep',
    mode: 'slide-down',
    directionVector: { x: 0.0, y: 1.0 },
    distancePercent: 100.0,
    blurAmount: 6.0,
    parameters: {
      screenCoordinates: true,
    },
  },
  'Push left ': {
    id: 35,
    name: 'Push left ',
    engineKey: 'SlideTransitionEngine',
    category: 'Slide',
    duration: 0.9,
    easing: 'smoothstep',
    mode: 'push-left',
    directionVector: { x: -1.0, y: 0.0 },
    distancePercent: 100.0,
    parameters: {
      matchedClips: true,
      zeroGapPush: true,
    },
  },
  'Push Right': {
    id: 36,
    name: 'Push Right',
    engineKey: 'SlideTransitionEngine',
    category: 'Slide',
    duration: 0.9,
    easing: 'smoothstep',
    mode: 'push-right',
    directionVector: { x: 1.0, y: 0.0 },
    distancePercent: 100.0,
    parameters: {
      synchronizedMotion: true,
    },
  },
  'Push Up': {
    id: 37,
    name: 'Push Up',
    engineKey: 'SlideTransitionEngine',
    category: 'Slide',
    duration: 0.9,
    easing: 'smoothstep',
    mode: 'push-up',
    directionVector: { x: 0.0, y: -1.0 },
    distancePercent: 100.0,
    parameters: {
      verticalPush: true,
    },
  },
  'Push Down': {
    id: 38,
    name: 'Push Down',
    engineKey: 'SlideTransitionEngine',
    category: 'Slide',
    duration: 0.9,
    easing: 'smoothstep',
    mode: 'push-down',
    directionVector: { x: 0.0, y: 1.0 },
    distancePercent: 100.0,
    parameters: {
      verticalPush: true,
    },
  },
  'Diagonal Slide': {
    id: 39,
    name: 'Diagonal Slide',
    engineKey: 'SlideTransitionEngine',
    category: 'Slide',
    duration: 1.0,
    easing: 'smoothstep',
    mode: 'diagonal-slide',
    directionVector: { x: -0.7071, y: -0.7071 }, // 45 degree diagonal vector
    distancePercent: 100.0,
    blurAmount: 10.0,
    parameters: {
      diagonalAngleDeg: 135,
    },
  },
  'Perspective Push': {
    id: 40,
    name: 'Perspective Push',
    engineKey: 'SlideTransitionEngine',
    category: 'Slide',
    duration: 1.1,
    easing: 'sine',
    mode: 'perspective-push',
    directionVector: { x: -1.0, y: 0.0 },
    distancePercent: 100.0,
    perspectivePx: 800,
    parameters: {
      scaleDepth: 0.85,
      tiltAngle: 15.0,
    },
  },
};
