// src/components/editor-main-screen/tools/effects/engines/retroFx/retroFxUtils.ts

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
 * Deterministic pseudo-random noise generator using sine-fraction hash.
 * Reproduces exact output for given seed and time without Math.random().
 */
export function deterministicSeededNoise(seed: number, time: number): number {
  const val = Math.sin(seed * 12.9898 + time * 78.233) * 43758.5453123;
  return val - Math.floor(val);
}

/**
 * Alias for seededNoise primitive.
 */
export function seededNoise(seed: number, x: number = 0, y: number = 0): number {
  return deterministicSeededNoise(seed, x * 0.1 + y * 0.01);
}

/**
 * SHARED RETRO PRIMITIVE: filmGrain
 * Calculates resolution-aware procedural film grain opacity multiplier or CSS filter.
 */
export function filmGrain(intensity: number, seed: number = 91): string {
  if (intensity <= 0) return 'none';
  const noiseVal = (0.05 + 0.1 * intensity).toFixed(2);
  return `contrast(${(1.0 + 0.05 * intensity).toFixed(2)})`;
}

/**
 * SHARED RETRO PRIMITIVE: filmFlicker
 * Calculates subtle deterministic gate flicker multiplier derived from timeline time.
 */
export function filmFlicker(seed: number, timelineTime: number, amount: number = 0.3): number {
  if (amount <= 0) return 1.0;
  const n = deterministicSeededNoise(seed, timelineTime * 18.0);
  return 1.0 - amount * 0.15 + (n - 0.5) * amount * 0.3;
}

/**
 * SHARED RETRO PRIMITIVE: colorFade
 * Reduces saturation and lifts shadow tones for faded print look.
 */
export function colorFade(amount: number): { saturation: number; contrast: number; sepia: number } {
  const norm = clamp(amount);
  return {
    saturation: 1.0 - norm * 0.35,
    contrast: 1.0 - norm * 0.15,
    sepia: norm * 0.2
  };
}

/**
 * SHARED RETRO PRIMITIVE: fadedBlacks
 * Lifts minimum black level (black level offset).
 */
export function fadedBlacks(amount: number): string {
  const norm = clamp(amount);
  return `brightness(${(1.0 + norm * 0.08).toFixed(2)}) contrast(${(1.0 - norm * 0.12).toFixed(2)})`;
}

/**
 * SHARED RETRO PRIMITIVE: fadedHighlights
 * Compresses maximum white highlights for analog paper print look.
 */
export function fadedHighlights(amount: number): string {
  const norm = clamp(amount);
  return `brightness(${(1.0 - norm * 0.05).toFixed(2)})`;
}

/**
 * SHARED RETRO PRIMITIVE: vignette
 * Radial lens edge darkening gradient CSS.
 */
export function vignette(intensity: number, radiusPct: number = 65): string {
  if (intensity <= 0) return 'transparent';
  const alpha = (0.5 * clamp(intensity)).toFixed(2);
  return `radial-gradient(circle at 50% 50%, transparent ${radiusPct}%, rgba(0,0,0,${alpha}) 100%)`;
}

/**
 * SHARED RETRO PRIMITIVE: halation
 * Soft red/warm glow around bright highlight zones.
 */
export function halation(intensity: number, colorHex: string = '#ff6633'): string {
  if (intensity <= 0) return 'none';
  const rgb = hexToRgb(colorHex);
  const alpha = (0.4 * clamp(intensity)).toFixed(2);
  return `drop-shadow(0px 0px 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha}))`;
}

/**
 * SHARED RETRO PRIMITIVE: chromaticShift
 * RGB channel separation drop-shadow CSS string.
 */
export function chromaticShift(shiftPx: number, intensity: number): string {
  if (shiftPx <= 0 || intensity <= 0) return 'none';
  const dx = (shiftPx * clamp(intensity)).toFixed(1);
  return `drop-shadow(${dx}px 0px 0px rgba(255,0,0,0.6)) drop-shadow(-${dx}px 0px 0px rgba(0,255,255,0.6))`;
}

/**
 * SHARED RETRO PRIMITIVE: scanline
 * Horizontal TV CRT scanline pattern CSS.
 */
export function scanline(intensity: number, spacingPx: number = 4): string {
  if (intensity <= 0) return 'transparent';
  const alpha = (0.15 * clamp(intensity)).toFixed(2);
  return `repeating-linear-gradient(0deg, rgba(0,0,0,${alpha}) 0px, transparent 1px, transparent ${spacingPx}px)`;
}

/**
 * SHARED RETRO PRIMITIVE: analogNoise
 * Analog TV static noise texture overlay CSS.
 */
export function analogNoise(intensity: number, time: number): string {
  if (intensity <= 0) return 'transparent';
  const n = deterministicSeededNoise(92, time * 10.0);
  const alpha = (0.1 * clamp(intensity) * n).toFixed(2);
  return `rgba(255, 255, 255, ${alpha})`;
}

/**
 * SHARED RETRO PRIMITIVE: dustMask
 * Generates dust speckle pattern representation.
 */
export function dustMask(intensity: number, time: number): string {
  if (intensity <= 0) return 'transparent';
  const posX = (deterministicSeededNoise(97, time * 2.0) * 80 + 10).toFixed(0);
  const posY = (deterministicSeededNoise(98, time * 2.0) * 80 + 10).toFixed(0);
  const alpha = (0.35 * clamp(intensity)).toFixed(2);
  return `radial-gradient(circle at ${posX}% ${posY}%, rgba(40,30,20,${alpha}) 0px, transparent 3px)`;
}

/**
 * SHARED RETRO PRIMITIVE: scratchMask
 * Vertical film scratch lines overlay CSS.
 */
export function scratchMask(intensity: number, time: number): string {
  if (intensity <= 0) return 'transparent';
  const posX = (deterministicSeededNoise(95, time * 5.0) * 90 + 5).toFixed(1);
  const alpha = (0.4 * clamp(intensity)).toFixed(2);
  return `linear-gradient(to right, transparent ${posX}%, rgba(255,255,255,${alpha}) ${posX}%, transparent ${Number(posX) + 0.2}%)`;
}

/**
 * SHARED RETRO PRIMITIVE: frameJitter
 * Vertical frame gate movement offset.
 */
export function frameJitter(seed: number, time: number, amount: number): { offsetY: number } {
  if (amount <= 0) return { offsetY: 0 };
  const n = deterministicSeededNoise(seed, time * 12.0) - 0.5;
  return { offsetY: Math.round(n * amount * 10) };
}

/**
 * SHARED RETRO PRIMITIVE: colorChannelShift
 * Color matrix channel response factor.
 */
export function colorChannelShift(hueDeg: number, saturationPct: number): string {
  return `hue-rotate(${hueDeg}deg) saturate(${saturationPct}%)`;
}

/**
 * SHARED RETRO PRIMITIVE: filmCurve
 * S-curve contrast adjustment for analog film response.
 */
export function filmCurve(x: number, slope: number = 1.2): number {
  return clamp(Math.pow(x, slope));
}

/**
 * SHARED RETRO PRIMITIVE: retroToneCurve
 * Tone curve contrast and gamma adjustment.
 */
export function retroToneCurve(contrastVal: number, brightnessVal: number): string {
  return `contrast(${contrastVal.toFixed(2)}) brightness(${brightnessVal.toFixed(2)})`;
}

/**
 * SHARED RETRO PRIMITIVE: softGlow
 * Soft highlight glow diffusion.
 */
export function softGlow(radiusPx: number, opacity: number): string {
  if (opacity <= 0) return 'none';
  return `drop-shadow(0px 0px ${radiusPx}px rgba(255, 240, 220, ${opacity.toFixed(2)}))`;
}

/**
 * SHARED RETRO PRIMITIVE: edgeFade
 * Soft edge darkening or paper yellowing border.
 */
export function edgeFade(colorHex: string, widthPct: number = 10): string {
  const rgb = hexToRgb(colorHex);
  return `radial-gradient(ellipse at 50% 50%, transparent ${100 - widthPct}%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5) 100%)`;
}

/**
 * SHARED RETRO PRIMITIVE: textureBlend
 * Linear gradient layer blend string for double exposure or aged paper.
 */
export function textureBlend(color1: string, color2: string, opacity: number): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const a = clamp(opacity).toFixed(2);
  return `linear-gradient(135deg, rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, ${a}) 0%, rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, ${a}) 100%)`;
}
