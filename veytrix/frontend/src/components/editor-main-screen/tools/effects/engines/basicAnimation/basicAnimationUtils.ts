// src/components/editor-main-screen/tools/effects/engines/basicAnimation/basicAnimationUtils.ts

export type EasingType =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'bounce'
  | 'cubicEaseIn'
  | 'cubicEaseOut';

/**
 * Calculates eased value for progress t in range [0, 1].
 */
export function getEasingValue(type: EasingType = 'linear', progress: number): number {
  const p = Math.max(0, Math.min(1, progress));
  switch (type) {
    case 'linear':
      return p;
    case 'easeIn':
      return p * p;
    case 'easeOut':
      return p * (2 - p);
    case 'easeInOut':
      return p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
    case 'cubicEaseIn':
      return p * p * p;
    case 'cubicEaseOut': {
      const t = p - 1;
      return t * t * t + 1;
    }
    case 'bounce': {
      // Standard bounce ease out
      const n1 = 7.5625;
      const d1 = 2.75;
      let t = p;
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        t -= 1.5 / d1;
        return n1 * t * t + 0.75;
      } else if (t < 2.5 / d1) {
        t -= 2.25 / d1;
        return n1 * t * t + 0.9375;
      } else {
        t -= 2.625 / d1;
        return n1 * t * t + 0.984375;
      }
    }
    default:
      return p;
  }
}

/**
 * Linear interpolation between a and b at normalized factor t.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Clamps a number between min and max bounds.
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
