// src/components/editor-main-screen/tools/effects/engines/cinematicFx/cinematicFxUtils.ts

/**
 * Deterministic pseudo-random noise generator based on seed and time.
 * Never uses Math.random() so preview and export produce identical results.
 */
export function deterministicSeededNoise(t: number, seed: number = 42): number {
  const x = Math.sin(t * 12.9898 + seed * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1; // Range [-1.0, 1.0]
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
 * Converts hex color string to RGB object {r, g, b} [0-255].
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return { r: 255, g: 102, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}
