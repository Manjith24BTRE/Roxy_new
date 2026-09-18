// src/components/editor-main-screen/tools/effects/engines/glitchDigital/glitchDigitalUtils.ts

/**
 * Deterministic pseudo-random noise generator based on seed and time.
 * Never uses Math.random() so preview and export produce identical results.
 */
export function deterministicSeededNoise(t: number, seed: number = 42): number {
  const x = Math.sin(t * 12.9898 + seed * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1; // Range [-1.0, 1.0]
}

/**
 * 2D Block Noise generator for block corruption & digital glitch artifacts.
 */
export function blockNoise(x: number, y: number, scale: number = 10, seed: number = 1): number {
  const ix = Math.floor(x * scale);
  const iy = Math.floor(y * scale);
  const hash = Math.sin(ix * 12.9898 + iy * 78.233 + seed * 43.123) * 43758.5453;
  return hash - Math.floor(hash); // Range [0.0, 1.0]
}

/**
 * Clamps value between min and max.
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Smooth Hermite interpolation between 0 and 1.
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0 || 0.0001), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

/**
 * Computes X/Y displacement vectors for RGB channel separation.
 */
export function calculateRgbSplitOffsets(offsetPx: number, directionDeg: number = 0): {
  r: { x: number; y: number };
  b: { x: number; y: number };
} {
  const rad = (directionDeg * Math.PI) / 180;
  const dx = Math.cos(rad) * offsetPx;
  const dy = Math.sin(rad) * offsetPx;

  return {
    r: { x: dx, y: dy },
    b: { x: -dx, y: -dy }
  };
}
