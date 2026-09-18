// src/components/editor-main-screen/tools/effects/engines/distortionFx/distortionFxUtils.ts

/**
 * Clamps value to min and max bounds safely.
 */
export function clamp(val: number, min: number = 0.0, max: number = 1.0): number {
  return Math.min(max, Math.max(min, val));
}

/**
 * Smooth Hermite interpolation between edge0 and edge1.
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

/**
 * Deterministic pseudo-random noise generator.
 * Produces exact output for given seed and time without Math.random().
 */
export function deterministicSeededNoise(seed: number, time: number): number {
  const val = Math.sin(seed * 12.9898 + time * 78.233) * 43758.5453123;
  return val - Math.floor(val);
}

/**
 * SHARED DISTORTION PRIMITIVE: uvWarp
 * Generic 2D offset displacement of UV coordinates.
 */
export function uvWarp(uvX: number, uvY: number, offsetX: number, offsetY: number): { u: number; v: number } {
  return {
    u: clamp(uvX + offsetX, 0.0, 1.0),
    v: clamp(uvY + offsetY, 0.0, 1.0)
  };
}

/**
 * SHARED DISTORTION PRIMITIVE: radialWarp (Swirl / Vortex)
 * Rotates UV coordinates around (centerX, centerY) based on distance falloff.
 */
export function radialWarp(
  uvX: number,
  uvY: number,
  centerX: number,
  centerY: number,
  angleDeg: number,
  radius: number
): { u: number; v: number } {
  const dx = uvX - centerX;
  const dy = uvY - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist >= radius || dist < 0.0001) {
    return { u: uvX, v: uvY };
  }

  const factor = Math.pow(1.0 - dist / radius, 2.0);
  const rad = ((angleDeg * factor) * Math.PI) / 180.0;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  const u = centerX + (dx * cosA - dy * sinA);
  const v = centerY + (dx * sinA + dy * cosA);

  return { u: clamp(u, 0.0, 1.0), v: clamp(v, 0.0, 1.0) };
}

/**
 * SHARED DISTORTION PRIMITIVE: barrelWarp
 * Outward quadratic optical radial distortion r' = r * (1 + k * r^2).
 */
export function barrelWarp(
  uvX: number,
  uvY: number,
  kFactor: number,
  centerX: number = 0.5,
  centerY: number = 0.5
): { u: number; v: number } {
  const dx = uvX - centerX;
  const dy = uvY - centerY;
  const r2 = dx * dx + dy * dy;
  const factor = 1.0 + kFactor * r2;

  const u = centerX + dx * factor;
  const v = centerY + dy * factor;
  return { u: clamp(u, 0.0, 1.0), v: clamp(v, 0.0, 1.0) };
}

/**
 * SHARED DISTORTION PRIMITIVE: pincushionWarp
 * Inward quadratic optical radial distortion r' = r * (1 - k * r^2).
 */
export function pincushionWarp(
  uvX: number,
  uvY: number,
  kFactor: number,
  centerX: number = 0.5,
  centerY: number = 0.5
): { u: number; v: number } {
  const dx = uvX - centerX;
  const dy = uvY - centerY;
  const r2 = dx * dx + dy * dy;
  const factor = Math.max(0.1, 1.0 - kFactor * r2);

  const u = centerX + dx * factor;
  const v = centerY + dy * factor;
  return { u: clamp(u, 0.0, 1.0), v: clamp(v, 0.0, 1.0) };
}

/**
 * SHARED DISTORTION PRIMITIVE: sphericalWarp
 * 3D spherical lens projection mapping.
 */
export function sphericalWarp(
  uvX: number,
  uvY: number,
  radius: number,
  strength: number,
  centerX: number = 0.5,
  centerY: number = 0.5
): { u: number; v: number } {
  const dx = uvX - centerX;
  const dy = uvY - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist >= radius || dist < 0.0001) return { u: uvX, v: uvY };

  const normDist = dist / radius;
  const z = Math.sqrt(Math.max(0, 1.0 - normDist * normDist));
  const factor = (1.0 - z) * strength;

  const u = centerX + dx * (1.0 + factor);
  const v = centerY + dy * (1.0 + factor);
  return { u: clamp(u, 0.0, 1.0), v: clamp(v, 0.0, 1.0) };
}

/**
 * SHARED DISTORTION PRIMITIVE: fishEyeWarp
 * High curvature fisheye distortion with radial magnification.
 */
export function fishEyeWarp(
  uvX: number,
  uvY: number,
  distortionFactor: number,
  centerX: number = 0.5,
  centerY: number = 0.5
): { u: number; v: number } {
  const dx = uvX - centerX;
  const dy = uvY - centerY;
  const r = Math.sqrt(dx * dx + dy * dy);

  if (r < 0.0001) return { u: uvX, v: uvY };

  const theta = Math.atan2(dy, dx);
  const radius = Math.pow(r, 1.0 / Math.max(0.1, 1.0 + distortionFactor));

  const u = centerX + radius * Math.cos(theta);
  const v = centerY + radius * Math.sin(theta);
  return { u: clamp(u, 0.0, 1.0), v: clamp(v, 0.0, 1.0) };
}

/**
 * SHARED DISTORTION PRIMITIVE: directionalWarp
 * Linear UV displacement along specified direction angle.
 */
export function directionalWarp(
  uvX: number,
  uvY: number,
  angleDeg: number,
  distance: number
): { u: number; v: number } {
  const rad = (angleDeg * Math.PI) / 180.0;
  const u = uvX + Math.cos(rad) * distance;
  const v = uvY + Math.sin(rad) * distance;
  return { u: clamp(u, 0.0, 1.0), v: clamp(v, 0.0, 1.0) };
}

/**
 * SHARED DISTORTION PRIMITIVE: waveWarp
 * Sine/Cosine wave displacement across UV coordinates.
 */
export function waveWarp(
  uvX: number,
  uvY: number,
  frequency: number,
  amplitude: number,
  time: number
): { u: number; v: number } {
  const offsetU = Math.sin(uvY * frequency + time) * amplitude;
  const offsetV = Math.cos(uvX * frequency + time) * amplitude;
  return {
    u: clamp(uvX + offsetU, 0.0, 1.0),
    v: clamp(uvY + offsetV, 0.0, 1.0)
  };
}

/**
 * SHARED DISTORTION PRIMITIVE: rippleWarp
 * Concentric circular wave ripples expanding outward from focal origin.
 */
export function rippleWarp(
  uvX: number,
  uvY: number,
  centerX: number,
  centerY: number,
  frequency: number,
  amplitude: number,
  time: number
): { u: number; v: number } {
  const dx = uvX - centerX;
  const dy = uvY - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 0.0001) return { u: uvX, v: uvY };

  const wave = Math.sin(dist * frequency - time * 5.0) * amplitude * Math.exp(-dist * 2.0);
  const dirX = dx / dist;
  const dirY = dy / dist;

  return {
    u: clamp(uvX + dirX * wave, 0.0, 1.0),
    v: clamp(uvY + dirY * wave, 0.0, 1.0)
  };
}

/**
 * SHARED DISTORTION PRIMITIVE: prismSplit
 * Prism dispersion RGB color separation offset vectors.
 */
export function prismSplit(
  shiftPx: number,
  angleDeg: number,
  facets: number = 5
): { rOffset: { x: number; y: number }; bOffset: { x: number; y: number } } {
  const rad = (angleDeg * Math.PI) / 180.0;
  const normShift = shiftPx / 1000.0;
  return {
    rOffset: { x: Math.cos(rad) * normShift, y: Math.sin(rad) * normShift },
    bOffset: { x: -Math.cos(rad) * normShift, y: -Math.sin(rad) * normShift }
  };
}

/**
 * SHARED DISTORTION PRIMITIVE: reflectionWarp
 * Mirrors UV coordinates across a vertical or horizontal split plane.
 */
export function reflectionWarp(
  uvY: number,
  splitY: number = 0.5,
  rippleOffset: number = 0.0
): { v: number; isReflected: boolean } {
  if (uvY >= splitY) {
    const normDist = (uvY - splitY) / Math.max(0.01, 1.0 - splitY);
    const reflectedV = clamp(splitY - normDist * splitY + rippleOffset, 0.0, 1.0);
    return { v: reflectedV, isReflected: true };
  }
  return { v: uvY, isReflected: false };
}

/**
 * SHARED DISTORTION PRIMITIVE: edgeMask
 * Smooth feather mask to prevent hard clipping artifacts at frame edges.
 */
export function edgeMask(uvX: number, uvY: number, border: number = 0.05): number {
  const maskX = smoothstep(0.0, border, uvX) * smoothstep(1.0, 1.0 - border, uvX);
  const maskY = smoothstep(0.0, border, uvY) * smoothstep(1.0, 1.0 - border, uvY);
  return maskX * maskY;
}

/**
 * SHARED DISTORTION PRIMITIVE: chromaticOffset
 * Calculates CSS drop-shadow or text-shadow style string for chromatic separation.
 */
export function chromaticOffset(shiftPx: number, angleDeg: number, intensity: number): string {
  if (shiftPx <= 0 || intensity <= 0) return 'none';
  const rad = (angleDeg * Math.PI) / 180.0;
  const dx = (Math.cos(rad) * shiftPx * intensity).toFixed(1);
  const dy = (Math.sin(rad) * shiftPx * intensity).toFixed(1);
  return `drop-shadow(${dx}px ${dy}px 0px rgba(255,0,0,0.7)) drop-shadow(-${dx}px -${dy}px 0px rgba(0,255,255,0.7))`;
}

/**
 * SHARED DISTORTION PRIMITIVE: distortionFalloff
 * Calculates radial intensity falloff multiplier.
 */
export function distortionFalloff(dist: number, maxRadius: number): number {
  if (dist >= maxRadius) return 0.0;
  return clamp(1.0 - dist / maxRadius);
}
