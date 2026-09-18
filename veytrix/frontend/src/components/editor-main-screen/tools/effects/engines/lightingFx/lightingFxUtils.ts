// src/components/editor-main-screen/tools/effects/engines/lightingFx/lightingFxUtils.ts

/**
 * Clamps value to min and max bounds.
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
 * Parses Hex color code (#RRGGBB or #RGB) into RGB [0..255] object.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 255, g: 255, b: 255 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Deterministic pseudo-random noise generator using sine/fractional hash.
 * Reproduces exact value for given seed and time.
 */
export function deterministicSeededNoise(seed: number, time: number): number {
  const val = Math.sin(seed * 12.9898 + time * 78.233) * 43758.5453123;
  return val - Math.floor(val);
}

/**
 * SHARED LIGHTING PRIMITIVE: radialLight
 * Calculates radial distance falloff mask from (centerX, centerY).
 */
export function radialLight(
  uvX: number,
  uvY: number,
  centerX: number,
  centerY: number,
  radius: number,
  falloffFactor: number = 1.0
): number {
  const dx = uvX - centerX;
  const dy = uvY - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const normDist = clamp(dist / Math.max(0.001, radius));
  return Math.pow(1.0 - normDist, Math.max(0.1, falloffFactor));
}

/**
 * SHARED LIGHTING PRIMITIVE: directionalLight
 * Calculates directional light intensity based on light angle.
 */
export function directionalLight(
  uvX: number,
  uvY: number,
  angleDeg: number
): number {
  const rad = (angleDeg * Math.PI) / 180.0;
  const dirX = Math.cos(rad);
  const dirY = Math.sin(rad);
  const proj = (uvX - 0.5) * dirX + (uvY - 0.5) * dirY;
  return clamp(proj + 0.5);
}

/**
 * SHARED LIGHTING PRIMITIVE: coneLight
 * Calculates spotlight cone lighting mask with customizable aperture and feathering.
 */
export function coneLight(
  uvX: number,
  uvY: number,
  originX: number,
  originY: number,
  angleDeg: number,
  apertureDeg: number = 45,
  feather: number = 0.5
): number {
  const dx = uvX - originX;
  const dy = uvY - originY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 0.0001) return 1.0;

  const currentAngle = (Math.atan2(dy, dx) * 180.0) / Math.PI;
  let angleDiff = Math.abs(((currentAngle - angleDeg + 180) % 360) - 180);

  const halfAperture = apertureDeg / 2.0;
  if (angleDiff > halfAperture + feather * 20) return 0.0;

  const edge = smoothstep(halfAperture + feather * 20, halfAperture * (1 - feather * 0.5), angleDiff);
  const falloff = 1.0 / (1.0 + dist * 1.5);
  return clamp(edge * falloff);
}

/**
 * SHARED LIGHTING PRIMITIVE: pointLight
 * Point light contribution with distance field and quadratic attenuation.
 */
export function pointLight(
  uvX: number,
  uvY: number,
  posX: number,
  posY: number,
  attenuation: number = 2.0
): number {
  const dx = uvX - posX;
  const dy = uvY - posY;
  const distSq = dx * dx + dy * dy;
  return 1.0 / (1.0 + distSq * attenuation * 10.0);
}

/**
 * SHARED LIGHTING PRIMITIVE: softLight
 * Computes soft light blending value between base lumin and light layer.
 */
export function softLight(base: number, blend: number): number {
  return blend < 0.5
    ? 2.0 * base * blend + base * base * (1.0 - 2.0 * blend)
    : Math.sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend);
}

/**
 * SHARED LIGHTING PRIMITIVE: lightFalloff
 * Inverse square distance falloff calculation.
 */
export function lightFalloff(distance: number, radius: number, exponent: number = 2.0): number {
  if (distance >= radius) return 0.0;
  const norm = 1.0 - distance / radius;
  return Math.pow(clamp(norm), exponent);
}

/**
 * SHARED LIGHTING PRIMITIVE: lightMask
 * Combines spatial shapes into a unified lighting mask.
 */
export function lightMask(
  type: 'radial' | 'directional' | 'conical' | 'ring',
  uvX: number,
  uvY: number,
  opts: any = {}
): number {
  switch (type) {
    case 'radial':
      return radialLight(uvX, uvY, opts.posX ?? 0.5, opts.posY ?? 0.5, opts.radius ?? 0.5);
    case 'directional':
      return directionalLight(uvX, uvY, opts.angle ?? 45);
    case 'conical':
      return coneLight(uvX, uvY, opts.posX ?? 0.5, opts.posY ?? 0.0, opts.angle ?? 90, opts.aperture ?? 45, opts.feather ?? 0.5);
    case 'ring': {
      const dx = uvX - (opts.posX ?? 0.5);
      const dy = uvY - (opts.posY ?? 0.5);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const inner = opts.innerRadius ?? 0.2;
      const outer = opts.outerRadius ?? 0.5;
      if (dist < inner || dist > outer) return 0.0;
      const mid = (inner + outer) / 2.0;
      const halfW = (outer - inner) / 2.0;
      return smoothstep(1.0, 0.0, Math.abs(dist - mid) / halfW);
    }
    default:
      return 1.0;
  }
}

/**
 * SHARED LIGHTING PRIMITIVE: volumetricRay
 * Computes volumetric ray intensity along ray direction from light origin.
 */
export function volumetricRay(
  uvX: number,
  uvY: number,
  originX: number,
  originY: number,
  rayAngleDeg: number,
  beamWidth: number = 0.3
): number {
  const dx = uvX - originX;
  const dy = uvY - originY;
  const angle = (Math.atan2(dy, dx) * 180.0) / Math.PI;
  const diff = Math.abs(((angle - rayAngleDeg + 180) % 360) - 180);
  const rayIntensity = smoothstep(beamWidth * 40, 0.0, diff);
  const dist = Math.sqrt(dx * dx + dy * dy);
  return rayIntensity / (1.0 + dist * 1.2);
}

/**
 * SHARED LIGHTING PRIMITIVE: rayNoise
 * Generates procedural ray pattern noise across angles.
 */
export function rayNoise(angleDeg: number, rayCount: number, seed: number = 42): number {
  const rayIdx = Math.floor((angleDeg / 360.0) * rayCount);
  return 0.5 + 0.5 * deterministicSeededNoise(seed, rayIdx);
}

/**
 * SHARED LIGHTING PRIMITIVE: glow
 * Calculates soft radial glow CSS or uniform glow map.
 */
export function glow(colorHex: string, intensity: number, radiusPx: number): string {
  if (intensity <= 0) return 'none';
  const rgb = hexToRgb(colorHex);
  const alpha = clamp(intensity * 0.8, 0, 1).toFixed(2);
  return `drop-shadow(0px 0px ${radiusPx}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha}))`;
}

/**
 * SHARED LIGHTING PRIMITIVE: bloom
 * Generates box-shadow / radial-gradient bloom CSS layer representation.
 */
export function bloom(colorHex: string, intensity: number, radiusPct: number = 50): string {
  if (intensity <= 0) return 'transparent';
  const rgb = hexToRgb(colorHex);
  const alpha1 = (clamp(intensity) * 0.75).toFixed(2);
  const alpha2 = (clamp(intensity) * 0.2).toFixed(2);
  return `radial-gradient(circle, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha1}) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha2}) ${radiusPct}%, transparent 100%)`;
}

/**
 * SHARED LIGHTING PRIMITIVE: lightFlicker
 * Deterministic flicker modulation based on time and seed.
 */
export function lightFlicker(seed: number, timelineTime: number, amount: number = 0.2): number {
  if (amount <= 0) return 1.0;
  const n = deterministicSeededNoise(seed, timelineTime * 15.0);
  return 1.0 - amount * 0.5 + (n - 0.5) * amount;
}

/**
 * SHARED LIGHTING PRIMITIVE: lightColor
 * Multiplies light color by intensity and mask contribution.
 */
export function lightColor(
  hex: string,
  mask: number,
  intensity: number
): { r: number; g: number; b: number; alpha: number } {
  const rgb = hexToRgb(hex);
  const alpha = clamp(mask * intensity);
  return {
    r: Math.round(rgb.r * alpha),
    g: Math.round(rgb.g * alpha),
    b: Math.round(rgb.b * alpha),
    alpha
  };
}

/**
 * SHARED LIGHTING PRIMITIVE: lightBlend
 * Blends base luminance value with light intensity using additive or screen blend.
 */
export function lightBlend(baseLum: number, lightVal: number, mode: 'add' | 'screen' | 'overlay' = 'add'): number {
  if (mode === 'add') {
    return clamp(baseLum + lightVal);
  } else if (mode === 'screen') {
    return clamp(1.0 - (1.0 - baseLum) * (1.0 - lightVal));
  } else {
    return baseLum < 0.5
      ? clamp(2.0 * baseLum * lightVal)
      : clamp(1.0 - 2.0 * (1.0 - baseLum) * (1.0 - lightVal));
  }
}

/**
 * SHARED LIGHTING PRIMITIVE: distanceField
 * Distance from arbitrary 2D point (x, y) to point (px, py).
 */
export function distanceField(x: number, y: number, px: number, py: number): number {
  const dx = x - px;
  const dy = y - py;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * SHARED LIGHTING PRIMITIVE: directionalGradient
 * Creates directional CSS linear gradient string.
 */
export function directionalGradient(
  colorHex: string,
  angleDeg: number,
  intensity: number
): string {
  const rgb = hexToRgb(colorHex);
  const a1 = (clamp(intensity) * 0.6).toFixed(2);
  const a2 = (clamp(intensity) * 0.05).toFixed(2);
  return `linear-gradient(${angleDeg}deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a1}) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a2}) 100%)`;
}
