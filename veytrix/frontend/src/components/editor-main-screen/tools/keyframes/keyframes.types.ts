/**
 * Keyframe Animation System - Types
 * Fully encapsulated inside src/components/editor-main-screen/tools/keyframes/
 */

export type KeyframeProperty =
  | 'positionX'
  | 'positionY'
  | 'scale'
  | 'rotation'
  | 'opacity'
  | 'volume'
  | 'blur'
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'hue'
  | 'crop'
  | 'shadow'
  | 'glow';

export type InterpolationType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'hold' | 'bezier';

export interface BezierControlPoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface KeyframePoint {
  id: string;
  property: KeyframeProperty;
  /** Timestamp relative to the clip start in seconds */
  time: number;
  value: number;
  interpolation: InterpolationType;
  controlPoints?: BezierControlPoints;
}

export interface ClipKeyframeData {
  clipId: string;
  keyframes: KeyframePoint[];
}

export interface PropertyConfig {
  key: KeyframeProperty;
  label: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  category: 'transform' | 'audio' | 'filter' | 'style';
}

export const ALL_KEYFRAME_PROPERTIES: PropertyConfig[] = [
  // Transform
  { key: 'positionX', label: 'Position X', defaultValue: 0, min: -2000, max: 2000, step: 1, unit: 'px', category: 'transform' },
  { key: 'positionY', label: 'Position Y', defaultValue: 0, min: -2000, max: 2000, step: 1, unit: 'px', category: 'transform' },
  { key: 'scale', label: 'Scale', defaultValue: 1, min: 0.1, max: 10, step: 0.05, unit: 'x', category: 'transform' },
  { key: 'rotation', label: 'Rotation', defaultValue: 0, min: -360, max: 360, step: 1, unit: '°', category: 'transform' },

  // Audio
  { key: 'volume', label: 'Volume', defaultValue: 1, min: 0, max: 2, step: 0.05, category: 'audio' },

  // Style / Opacity
  { key: 'opacity', label: 'Opacity', defaultValue: 1, min: 0, max: 1, step: 0.01, category: 'style' },
  { key: 'crop', label: 'Crop', defaultValue: 0, min: 0, max: 100, step: 1, unit: '%', category: 'style' },
  { key: 'shadow', label: 'Shadow', defaultValue: 0, min: 0, max: 50, step: 1, unit: 'px', category: 'style' },
  { key: 'glow', label: 'Glow', defaultValue: 0, min: 0, max: 50, step: 1, unit: 'px', category: 'style' },

  // Filters
  { key: 'blur', label: 'Blur', defaultValue: 0, min: 0, max: 100, step: 1, unit: 'px', category: 'filter' },
  { key: 'brightness', label: 'Brightness', defaultValue: 100, min: 0, max: 200, step: 1, unit: '%', category: 'filter' },
  { key: 'contrast', label: 'Contrast', defaultValue: 100, min: 0, max: 200, step: 1, unit: '%', category: 'filter' },
  { key: 'saturation', label: 'Saturation', defaultValue: 100, min: 0, max: 200, step: 1, unit: '%', category: 'filter' },
  { key: 'hue', label: 'Hue Rotate', defaultValue: 0, min: 0, max: 360, step: 1, unit: '°', category: 'filter' },
];

export interface ClipboardKeyframeData {
  keyframes: Omit<KeyframePoint, 'id'>[];
  sourceClipId: string;
}
