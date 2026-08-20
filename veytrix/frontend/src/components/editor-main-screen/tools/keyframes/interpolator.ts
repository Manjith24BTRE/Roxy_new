/**
 * Keyframe Animation System - Real-time Interpolator Engine
 * Supports: Linear, Ease In, Ease Out, Ease In Out, Hold, Bezier
 * Fully optimized for 60 FPS real-time playback without lag or rerenders.
 */

import { KeyframePoint, KeyframeProperty, InterpolationType, ALL_KEYFRAME_PROPERTIES } from './keyframes.types';

/**
 * Solve cubic bezier for t in [0, 1]
 */
function solveCubicBezier(x1: number, y1: number, x2: number, y2: number, t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  // Newton-Raphson method for finding progress along cubic bezier curve
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleCurveX = (time: number) => ((ax * time + bx) * time + cx) * time;
  const sampleCurveY = (time: number) => ((ay * time + by) * time + cy) * time;
  const sampleCurveDerivativeX = (time: number) => (3 * ax * time + 2 * bx) * time + cx;

  let t2 = t;
  for (let i = 0; i < 8; i++) {
    const x = sampleCurveX(t2) - t;
    if (Math.abs(x) < 1e-5) return sampleCurveY(t2);
    const d2 = sampleCurveDerivativeX(t2);
    if (Math.abs(d2) < 1e-5) break;
    t2 -= x / d2;
  }

  // Fallback to binary subdivision if Newton-Raphson doesn't converge
  let t0 = 0;
  let t1 = 1;
  t2 = t;

  while (t0 < t1) {
    const x = sampleCurveX(t2);
    if (Math.abs(x - t) < 1e-5) return sampleCurveY(t2);
    if (t > x) t0 = t2;
    else t1 = t2;
    t2 = (t1 - t0) * 0.5 + t0;
  }

  return sampleCurveY(t2);
}

/**
 * Calculate easing factor in range [0, 1] based on interpolation mode
 */
export function getEasingFactor(
  progress: number,
  interpolation: InterpolationType,
  controlPoints?: { x1: number; y1: number; x2: number; y2: number }
): number {
  const p = Math.max(0, Math.min(1, progress));

  switch (interpolation) {
    case 'linear':
      return p;
    case 'easeIn':
      return p * p * p; // Cubic Ease In
    case 'easeOut':
      return 1 - Math.pow(1 - p, 3); // Cubic Ease Out
    case 'easeInOut':
      return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // Cubic Ease In-Out
    case 'hold':
      return p >= 1 ? 1 : 0; // Hold until target keyframe reached
    case 'bezier': {
      const cp = controlPoints || { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1.0 };
      return solveCubicBezier(cp.x1, cp.y1, cp.x2, cp.y2, p);
    }
    default:
      return p;
  }
}

/**
 * Interpolate value for a single keyframe property at clip-relative time (in seconds)
 */
export function interpolatePropertyValue(
  keyframes: KeyframePoint[],
  property: KeyframeProperty,
  clipTimeSecs: number,
  defaultValue: number
): number {
  if (!keyframes || keyframes.length === 0) {
    return defaultValue;
  }

  // Filter & sort keyframes for this specific property
  const propKeyframes = keyframes
    .filter((k) => k.property === property)
    .sort((a, b) => a.time - b.time);

  if (propKeyframes.length === 0) {
    return defaultValue;
  }

  // Before first keyframe -> hold first keyframe value
  if (clipTimeSecs <= propKeyframes[0].time) {
    return propKeyframes[0].value;
  }

  // After last keyframe -> hold last keyframe value
  if (clipTimeSecs >= propKeyframes[propKeyframes.length - 1].time) {
    return propKeyframes[propKeyframes.length - 1].value;
  }

  // Find segment containing clipTimeSecs using binary search / range check
  for (let i = 0; i < propKeyframes.length - 1; i++) {
    const kf1 = propKeyframes[i];
    const kf2 = propKeyframes[i + 1];

    if (clipTimeSecs >= kf1.time && clipTimeSecs <= kf2.time) {
      const duration = kf2.time - kf1.time;
      if (duration <= 0.0001) return kf2.value;

      const rawProgress = (clipTimeSecs - kf1.time) / duration;
      const easedProgress = getEasingFactor(rawProgress, kf1.interpolation, kf1.controlPoints);

      return kf1.value + (kf2.value - kf1.value) * easedProgress;
    }
  }

  return defaultValue;
}

export interface InterpolatedProperties {
  positionX: number;
  positionY: number;
  scale: number;
  rotation: number;
  opacity: number;
  volume: number;
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  crop: number;
  shadow: number;
  glow: number;
}

export function hasKeyframeForProperty(keyframes: KeyframePoint[] | undefined, property: KeyframeProperty): boolean {
  if (!keyframes || keyframes.length === 0) return false;
  return keyframes.some((k) => k.property === property);
}

/**
 * Calculate interpolated values for ALL supported properties at clip relative time
 */
export function interpolateAllProperties(
  keyframes: KeyframePoint[] | undefined,
  clipTimeSecs: number,
  baseOverrides?: Partial<InterpolatedProperties>
): InterpolatedProperties {
  const result: any = {};
  const kfs = keyframes || [];

  ALL_KEYFRAME_PROPERTIES.forEach((prop) => {
    const baseVal = baseOverrides && baseOverrides[prop.key] !== undefined
      ? baseOverrides[prop.key]!
      : prop.defaultValue;

    result[prop.key] = interpolatePropertyValue(kfs, prop.key, clipTimeSecs, baseVal);
  });

  return result as InterpolatedProperties;
}
