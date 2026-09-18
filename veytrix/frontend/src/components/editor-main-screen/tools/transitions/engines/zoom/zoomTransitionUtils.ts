// src/components/editor-main-screen/tools/transitions/engines/zoom/zoomTransitionUtils.ts

import { FocalPoint } from './zoomTransitionPresets';

/**
 * Clamps progress strictly within [0.0, 1.0].
 * Prevents NaN, Infinity, and out-of-bound overflow.
 */
export function clampProgress(progress: number): number {
  if (isNaN(progress) || !isFinite(progress)) return 0;
  return Math.max(0, Math.min(1, progress));
}

/**
 * Computes eased progress based on curve type.
 */
export function easedProgress(progress: number, easingType: string = 'linear'): number {
  const p = clampProgress(progress);

  switch (easingType) {
    case 'smoothstep':
      return p * p * (3 - 2 * p);
    case 'sine':
      return 0.5 - 0.5 * Math.cos(p * Math.PI);
    case 'cubic-accel':
      // Slow start, rapid acceleration surge, smooth deceleration
      return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    case 'elastic': {
      // Deterministic elastic spring curve
      if (p === 0) return 0;
      if (p === 1) return 1;
      const c4 = (2 * Math.PI) / 3;
      return Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * c4) + 1;
    }
    case 'bounce': {
      // Deterministic 3-bounce decay curve
      const n1 = 7.5625;
      const d1 = 2.75;
      if (p < 1 / d1) {
        return n1 * p * p;
      } else if (p < 2 / d1) {
        const p2 = p - 1.5 / d1;
        return n1 * p2 * p2 + 0.75;
      } else if (p < 2.5 / d1) {
        const p2 = p - 2.25 / d1;
        return n1 * p2 * p2 + 0.9375;
      } else {
        const p2 = p - 2.625 / d1;
        return n1 * p2 * p2 + 0.984375;
      }
    }
    case 'linear':
    default:
      return p;
  }
}

/**
 * Linearly interpolates scale between start and end.
 */
export function interpolateScale(start: number, end: number, progress: number): number {
  const p = clampProgress(progress);
  return start + (end - start) * p;
}

/**
 * Calculates zoom scale with spring overshoot.
 */
export function overshootScale(start: number, end: number, progress: number, overshootAmount = 0.35): number {
  const p = clampProgress(progress);
  const s = 1.70158 * (1 + overshootAmount);
  const p2 = p - 1;
  const overshootFactor = p2 * p2 * ((s + 1) * p2 + s) + 1;
  return start + (end - start) * overshootFactor;
}

/**
 * Calculates zoom scale with deterministic elastic oscillation.
 */
export function elasticScale(start: number, end: number, progress: number): number {
  const elasticFactor = easedProgress(progress, 'elastic');
  return start + (end - start) * elasticFactor;
}

/**
 * Calculates zoom scale with deterministic bounce oscillation.
 */
export function bounceScale(start: number, end: number, progress: number): number {
  const bounceFactor = easedProgress(progress, 'bounce');
  return start + (end - start) * bounceFactor;
}

/**
 * Calculates rhythmic zoom pulses.
 */
export function pulseScale(baseScale: number, progress: number, pulseCount = 3, amplitude = 0.3): number {
  const p = clampProgress(progress);
  const pulseFactor = Math.sin(p * Math.PI * pulseCount * 2) * amplitude * Math.sin(p * Math.PI);
  return Math.max(0.1, baseScale + pulseFactor);
}

/**
 * Calculates dynamic velocity-accelerated zoom scale.
 */
export function velocityScale(start: number, end: number, progress: number): number {
  const pAccel = easedProgress(progress, 'cubic-accel');
  return start + (end - start) * pAccel;
}

/**
 * Generates CSS transform and transform-origin strings for zoom anchored to a focal point.
 */
export function composeZoomTransform(
  scaleVal: number,
  focalPoint: FocalPoint = { x: 0.5, y: 0.5 }
): { transform: string; transformOrigin: string } {
  const transform = Math.abs(scaleVal - 1.0) > 0.0001 ? `scale(${scaleVal.toFixed(4)})` : '';
  const transformOrigin = `${(focalPoint.x * 100).toFixed(1)}% ${(focalPoint.y * 100).toFixed(1)}%`;
  return { transform, transformOrigin };
}

export interface ZoomTransitionState {
  outgoingOpacity: number;
  incomingOpacity: number;
  outgoingFilter: string;
  incomingFilter: string;
  outgoingTransform: string;
  incomingTransform: string;
  outgoingTransformOrigin: string;
  incomingTransformOrigin: string;
  overlayColor?: string;
  overlayOpacity?: number;
  renderMode: string;
}
