// src/components/editor-main-screen/tools/effects/engines/blurFocus/blurFocusUtils.ts

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
 * Computes mask factor [0.0 - 1.0] for a linear focus band (e.g. Tilt Shift).
 * Returns 0.0 inside focus band (sharp), 1.0 outside (blurred).
 */
export function calculateLinearBlurMask(
  yNorm: number,
  centerPos: number = 0.5,
  halfWidth: number = 0.125,
  feather: number = 0.2
): number {
  const dist = Math.abs(yNorm - centerPos);
  if (dist <= halfWidth) return 0.0;
  return smoothstep(halfWidth, halfWidth + feather, dist);
}

/**
 * Computes mask factor [0.0 - 1.0] for a radial focus zone (e.g. Focus Blur / Lens Blur).
 * Returns 0.0 inside focus radius (sharp), 1.0 outside (blurred).
 */
export function calculateRadialBlurMask(
  xNorm: number,
  yNorm: number,
  cx: number = 0.5,
  cy: number = 0.5,
  innerRadius: number = 0.2,
  feather: number = 0.3
): number {
  const dist = Math.hypot(xNorm - cx, yNorm - cy);
  if (dist <= innerRadius) return 0.0;
  return smoothstep(innerRadius, innerRadius + feather, dist);
}

/**
 * Formats CSS filter string for blur.
 */
export function formatBlurFilter(blurPx: number): string {
  if (blurPx <= 0) return '';
  return `blur(${blurPx.toFixed(1)}px)`;
}
