// src/types/assetInteraction.ts

export type AssetInteractionState = 'not-applied' | 'applied-selected' | 'settings-open';

export interface ClipFilterSpec {
  filterId: string | null;
  intensity: number;  // 0.0 to 1.0 (or 0 to 100)
  opacity: number;    // 0 to 100
  blendMode: string;  // 'normal' | 'multiply' | 'screen' | etc.
}

export interface ClipAdjustments {
  exposure: number;      // -100 to +100 or -1.0 to +1.0
  brightness: number;    // -100 to +100
  contrast: number;      // -100 to +100
  highlights: number;    // -100 to +100
  shadows: number;       // -100 to +100
  whites: number;        // -100 to +100
  blacks: number;        // -100 to +100
  saturation: number;    // -100 to +100 or 0 to 200
  vibrance: number;      // -100 to +100
  temperature: number;   // -100 to +100
  tint: number;          // -100 to +100
  sharpen: number;       // 0 to 100
  clarity: number;       // 0 to 100
  fade: number;          // 0 to 100
  vignette: number;      // 0 to 100
  grain: number;         // 0 to 100
  hue: number;           // -180 to +180
  gamma: number;         // 0.5 to 2.5
}

export function getDefaultClipFilterSpec(filterId: string | null = null): ClipFilterSpec {
  return {
    filterId,
    intensity: 1.0,
    opacity: 100,
    blendMode: 'normal',
  };
}

export function getDefaultClipAdjustments(): ClipAdjustments {
  return {
    exposure: 0,
    brightness: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    saturation: 0,
    vibrance: 0,
    temperature: 0,
    tint: 0,
    sharpen: 0,
    clarity: 0,
    fade: 0,
    vignette: 0,
    grain: 0,
    hue: 0,
    gamma: 1.0,
  };
}

export interface FilterInstanceParameters extends Partial<ClipAdjustments> {
  intensity: number; // 0.0 to 1.0
  [key: string]: any;
}

export interface EffectInstanceParameters {
  id: string;
  assetId: number | string;
  assetName: string;
  engineKey: string;
  enabled: boolean;
  startTime: number;
  endTime: number;
  duration: number;
  intensity: number; // 0.0 to 1.0
  speed?: number;
  amount?: number;
  scale?: number;
  blur?: number;
  [key: string]: any;
}

export interface TransitionInstanceParameters {
  id: string;
  assetId: number | string;
  assetName: string;
  engineKey: string;
  duration: number; // seconds
  direction?: 'left' | 'right' | 'up' | 'down' | string;
  amount?: number;
  [key: string]: any;
}

/**
 * Calculates local progress for bounded timeline effects.
 */
export function calculateEffectLocalProgress(
  currentTime: number,
  startTime: number,
  endTime: number
): number {
  if (endTime <= startTime) return 1.0;
  const raw = (currentTime - startTime) / (endTime - startTime);
  return Math.min(1.0, Math.max(0.0, raw));
}
