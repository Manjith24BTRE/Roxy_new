// src/components/editor-main-screen/tools/effects/engines/motionCamera/motionCameraUtils.ts

/**
 * Deterministic 1D pseudo-random noise generator based on seed and time.
 * Never uses Math.random() so preview and export produce identical results.
 */
export function deterministicNoise(t: number, seed: number = 42): number {
  const x = Math.sin(t * 12.9898 + seed * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1; // Range [-1.0, 1.0]
}

/**
 * Smooth continuous pseudo-random wave for organic camera drift.
 */
export function smoothCameraNoise(t: number, frequency: number, seed: number = 1): number {
  const w1 = Math.sin(t * frequency * 2 * Math.PI + seed);
  const w2 = Math.sin(t * frequency * 2.7 * Math.PI + seed * 1.9) * 0.5;
  const w3 = Math.cos(t * frequency * 0.9 * Math.PI + seed * 3.3) * 0.25;
  return (w1 + w2 + w3) / 1.75;
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
 * Perspective scale factor approximation for dolly effects.
 */
export function calculatePerspectiveScale(distanceFactor: number, perspectiveStrength: number = 0.5): number {
  // Perspective projection: scale = 1 / (1 + z * perspective)
  const z = distanceFactor;
  const scale = 1.0 / Math.max(0.1, 1.0 + z * perspectiveStrength);
  return scale;
}

/**
 * Velocity profile for whip pan transitions.
 */
export function whipPanVelocity(t: number, speed: number = 5.0): number {
  // Bell curve / Gaussian velocity envelope centered at t = 0.5
  const p = clamp(t, 0, 1);
  const diff = p - 0.5;
  return Math.exp(-diff * diff * speed * 8.0);
}
