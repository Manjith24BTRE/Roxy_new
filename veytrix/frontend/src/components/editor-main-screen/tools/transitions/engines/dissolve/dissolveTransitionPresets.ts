// src/components/editor-main-screen/tools/transitions/engines/dissolve/dissolveTransitionPresets.ts

export type DissolveMode =
  | 'cross'
  | 'fade-black'
  | 'fade-white'
  | 'dip-color'
  | 'instant-cut'
  | 'smooth-fade'
  | 'flash-cut'
  | 'soft-dissolve'
  | 'blur-dissolve'
  | 'luma-fade';

export interface TransitionDefinition {
  id: number;
  name: string;
  engineKey: string;
  category: string;
  duration: number; // default duration in seconds (e.g. 1.0)
  easing: 'linear' | 'smoothstep' | 'sine' | 'cut' | 'ease-in-out' | string;
  mode: DissolveMode;
  color?: string; // Hex/RGB color for dip-to-color or custom fades
  blurRadius?: number; // max blur radius in px for blur dissolve
  flashIntensity?: number; // flash brightness peak for flash cut
  lumaThreshold?: number; // default luminance threshold midpoint
  lumaSoftness?: number; // edge feathering for luma fade
  parameters?: Record<string, any>;
}

export const DISSOLVE_TRANSITION_PRESETS: Record<string, TransitionDefinition> = {
  'Cross Dissolve': {
    id: 1,
    name: 'Cross Dissolve',
    engineKey: 'DissolveTransitionEngine',
    category: 'Basic',
    duration: 1.0,
    easing: 'linear',
    mode: 'cross',
    parameters: {
      blendCurve: 'linear',
      overlapLength: 1.0,
    },
  },
  'Fade To Black': {
    id: 2,
    name: 'Fade To Black',
    engineKey: 'DissolveTransitionEngine',
    category: 'Basic',
    duration: 1.0,
    easing: 'linear',
    mode: 'fade-black',
    color: '#000000',
    parameters: {
      blackLevel: 1.0,
      holdTime: 0.1,
    },
  },
  'Fade to Wight': {
    id: 3,
    name: 'Fade to Wight',
    engineKey: 'DissolveTransitionEngine',
    category: 'Basic',
    duration: 1.0,
    easing: 'linear',
    mode: 'fade-white',
    color: '#ffffff',
    parameters: {
      whiteIntensity: 1.0,
      exposureHold: 0.05,
    },
  },
  'Dip to color': {
    id: 4,
    name: 'Dip to color',
    engineKey: 'DissolveTransitionEngine',
    category: 'Basic',
    duration: 1.0,
    easing: 'ease-in-out',
    mode: 'dip-color',
    color: '#111827', // Dark sleek slate color default
    parameters: {
      holdRatio: 0.1,
    },
  },
  'Instant Cut': {
    id: 5,
    name: 'Instant Cut',
    engineKey: 'DissolveTransitionEngine',
    category: 'Basic',
    duration: 0.0, // Instant cut
    easing: 'cut',
    mode: 'instant-cut',
    parameters: {
      cutPoint: 0.5,
    },
  },
  'Smooth Fade': {
    id: 6,
    name: 'Smooth Fade',
    engineKey: 'DissolveTransitionEngine',
    category: 'Basic',
    duration: 1.0,
    easing: 'smoothstep',
    mode: 'smooth-fade',
    parameters: {
      opacityCurve: 'cubic-s-curve',
    },
  },
  'Flash Cut': {
    id: 7,
    name: 'Flash Cut',
    engineKey: 'DissolveTransitionEngine',
    category: 'Basic',
    duration: 0.6,
    easing: 'sine',
    mode: 'flash-cut',
    color: '#ffffff',
    flashIntensity: 1.5,
    parameters: {
      flashDuration: 0.2,
      exposureBoost: 1.5,
    },
  },
  'Soft Dissolve': {
    id: 8,
    name: 'Soft Dissolve',
    engineKey: 'DissolveTransitionEngine',
    category: 'Basic',
    duration: 1.2,
    easing: 'sine',
    mode: 'soft-dissolve',
    parameters: {
      softness: 1.2,
      exposureCompensation: 1.0,
    },
  },
  'Blur Disslove': {
    id: 9,
    name: 'Blur Disslove',
    engineKey: 'DissolveTransitionEngine',
    category: 'Basic',
    duration: 1.0,
    easing: 'smoothstep',
    mode: 'blur-dissolve',
    blurRadius: 16.0,
    parameters: {
      focusTiming: 0.5,
      maxBlur: 16.0,
    },
  },
  'Luma Fade': {
    id: 10,
    name: 'Luma Fade',
    engineKey: 'DissolveTransitionEngine',
    category: 'Basic',
    duration: 1.0,
    easing: 'linear',
    mode: 'luma-fade',
    lumaThreshold: 0.5,
    lumaSoftness: 0.15,
    parameters: {
      direction: 'dark-to-light',
      feather: 0.15,
    },
  },
};
