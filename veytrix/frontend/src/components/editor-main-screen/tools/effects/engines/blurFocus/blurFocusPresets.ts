// src/components/editor-main-screen/tools/effects/engines/blurFocus/blurFocusPresets.ts

export type BlurFocusType =
  | 'gaussianBlur'
  | 'motionBlur'
  | 'directionalBlur'
  | 'radialBlur'
  | 'zoomBlur'
  | 'lensBlur'
  | 'bokehBlur'
  | 'tiltShift'
  | 'focusBlur'
  | 'backgroundBlur';

export interface BlurFocusPreset {
  id: number;
  name: string; // Exact Excel Name
  presetKey: BlurFocusType;
  type: BlurFocusType;
  intensity?: number;
  blurRadius?: number;
  blurLength?: number;
  angle?: number;
  shutter?: number;
  directionX?: number;
  directionY?: number;
  distance?: number;
  strength?: number;
  radius?: number;
  centerX?: number;
  centerY?: number;
  zoomStrength?: number;
  speed?: number;
  blurAmount?: number;
  focusArea?: number;
  feather?: number;
  bokeh?: number;
  bokehSize?: number;
  brightness?: number;
  shape?: 'circle' | 'hexagon' | 'octagon';
  focusWidth?: number;
  position?: number;
  focusPositionX?: number;
  focusPositionY?: number;
  tracking?: boolean;
  blurStrength?: number;
  subjectMaskRadius?: number;
}

export const BLUR_FOCUS_PRESETS: Record<number, BlurFocusPreset> = {
  31: {
    id: 31,
    name: 'Gaussian Blur',
    presetKey: 'gaussianBlur',
    type: 'gaussianBlur',
    blurRadius: 15,
    intensity: 1.0
  },
  32: {
    id: 32,
    name: 'Motion blur',
    presetKey: 'motionBlur',
    type: 'motionBlur',
    blurLength: 20,
    angle: 0,
    intensity: 1.0,
    shutter: 0.5
  },
  33: {
    id: 33,
    name: 'Directional Blur',
    presetKey: 'directionalBlur',
    type: 'directionalBlur',
    directionX: 1.0,
    directionY: 0.0,
    distance: 25,
    strength: 1.0
  },
  34: {
    id: 34,
    name: 'Radial Blur',
    presetKey: 'radialBlur',
    type: 'radialBlur',
    radius: 20,
    strength: 1.0,
    centerX: 0.5,
    centerY: 0.5
  },
  35: {
    id: 35,
    name: 'Zoom Blur',
    presetKey: 'zoomBlur',
    type: 'zoomBlur',
    zoomStrength: 30,
    speed: 3.0,
    centerX: 0.5,
    centerY: 0.5
  },
  36: {
    id: 36,
    name: 'Lens Blur ',
    presetKey: 'lensBlur',
    type: 'lensBlur',
    blurAmount: 20,
    focusArea: 0.3,
    feather: 0.2,
    bokeh: 0.5
  },
  37: {
    id: 37,
    name: 'Broken Blur', // Excel catalog name for ID 37 (PDF: Bokeh Blur)
    presetKey: 'bokehBlur',
    type: 'bokehBlur',
    bokehSize: 25,
    brightness: 1.2,
    shape: 'circle',
    intensity: 1.0
  },
  38: {
    id: 38,
    name: 'Tilt Blur', // Excel catalog name for ID 38 (PDF: Tilt Shift)
    presetKey: 'tiltShift',
    type: 'tiltShift',
    focusWidth: 0.25,
    blurAmount: 20,
    position: 0.5,
    feather: 0.2
  },
  39: {
    id: 39,
    name: 'Focus Blur',
    presetKey: 'focusBlur',
    type: 'focusBlur',
    focusPositionX: 0.5,
    focusPositionY: 0.5,
    blurRadius: 25,
    feather: 0.3,
    tracking: false
  },
  40: {
    id: 40,
    name: 'Background Blur',
    presetKey: 'backgroundBlur',
    type: 'backgroundBlur',
    blurStrength: 25,
    subjectMaskRadius: 0.35,
    feather: 0.25,
    tracking: false
  }
};
