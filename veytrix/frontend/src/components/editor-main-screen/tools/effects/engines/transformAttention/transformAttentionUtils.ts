// src/components/editor-main-screen/tools/effects/engines/transformAttention/transformAttentionUtils.ts

/**
 * Deterministic 1D pseudo-random noise generator based on seed and time.
 * Never uses Math.random() so preview and export produce identical results.
 */
export function deterministicNoise(t: number, seed: number = 42): number {
  const x = Math.sin(t * 12.9898 + seed * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1; // Range [-1.0, 1.0]
}

/**
 * Smooth pseudo-random wave derived from deterministic sines.
 */
export function smoothPseudoNoise(t: number, frequency: number, seed: number = 1): number {
  const w1 = Math.sin(t * frequency * 2 * Math.PI + seed);
  const w2 = Math.sin(t * frequency * 3.7 * Math.PI + seed * 2.3) * 0.5;
  const w3 = Math.cos(t * frequency * 1.3 * Math.PI + seed * 4.1) * 0.25;
  return (w1 + w2 + w3) / 1.75;
}

/**
 * Damped harmonic oscillation curve.
 */
export function dampedOscillation(t: number, frequency: number, damping: number): number {
  return Math.sin(t * frequency * 2 * Math.PI) * Math.exp(-damping * t);
}

/**
 * Damped spring overshoot curve for bounce effects.
 */
export function dampedSpring(t: number, frequency: number = 8, damping: number = 4): number {
  return Math.exp(-damping * t) * Math.cos(t * frequency * 2 * Math.PI);
}

/**
 * Linear interpolation between a and b.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Clamps value between min and max.
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Computes translation offset required to rotate around a custom pivot anchor (pxX, pxY)
 * relative to normalized clip center (0.5, 0.5).
 */
export function calculatePivotOffset(
  angleDeg: number,
  pivotX: number = 0.5,
  pivotY: number = 0.0,
  width: number = 1920,
  height: number = 1080
): { offsetX: number; offsetY: number } {
  const rad = (angleDeg * Math.PI) / 180;
  const rx = (0.5 - pivotX) * width;
  const ry = (0.5 - pivotY) * height;

  // Rotation matrix transformation for pivot shift
  const offsetX = rx * (1 - Math.cos(rad)) + ry * Math.sin(rad);
  const offsetY = ry * (1 - Math.cos(rad)) - rx * Math.sin(rad);

  return { offsetX, offsetY };
}
