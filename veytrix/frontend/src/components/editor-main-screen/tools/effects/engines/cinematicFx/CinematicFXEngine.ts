// src/components/editor-main-screen/tools/effects/engines/cinematicFx/CinematicFXEngine.ts
import { CINEMATIC_FX_PRESETS, CinematicFXPreset } from './cinematicFxPresets';
import {
  deterministicSeededNoise,
  clamp,
  hexToRgb
} from './cinematicFxUtils';

export interface CinematicFXResult {
  filterStr: string;
  transformStr: string;
  opacityMultiplier: number;
  transformOffsetX?: number;
  transformOffsetY?: number;
  scaleMultiplier?: number;
  scaleXMultiplier?: number;
  scaleYMultiplier?: number;
  rotationOffset?: number;
  motionBlurPx?: number;
  overlayGradientCss?: string;
  lensGlowCss?: string;
}

export interface CinematicFXEngineContext {
  clipWidth?: number;
  clipHeight?: number;
  timelineTime?: number; // In seconds
}

export class CinematicFXEngine {
  private static instance: CinematicFXEngine;

  public static getInstance(): CinematicFXEngine {
    if (!CinematicFXEngine.instance) {
      CinematicFXEngine.instance = new CinematicFXEngine();
    }
    return CinematicFXEngine.instance;
  }

  /**
   * Resolves preset metadata from Effect ID, exact Excel name, or preset key.
   * Handles alias lookups (e.g. "Film Grain" -> "FIlm Grain").
   */
  public getPreset(effectIdOrName: number | string): CinematicFXPreset | null {
    if (typeof effectIdOrName === 'number') {
      return CINEMATIC_FX_PRESETS[effectIdOrName] || null;
    }

    const numId = parseInt(effectIdOrName, 10);
    if (!isNaN(numId) && CINEMATIC_FX_PRESETS[numId]) {
      return CINEMATIC_FX_PRESETS[numId];
    }

    const targetStr = String(effectIdOrName).trim().toLowerCase();

    // Alias mapping for PDF vs Excel catalog naming parity
    let searchStr = targetStr;
    if (targetStr === 'film grain') searchStr = 'film grain';

    const match = Object.values(CINEMATIC_FX_PRESETS).find(
      (p) =>
        p.name.trim().toLowerCase() === searchStr ||
        p.presetKey.trim().toLowerCase() === searchStr ||
        p.name.trim().toLowerCase() === targetStr
    );
    return match || null;
  }

  /**
   * Computes deterministic non-destructive cinematic state for an effect at a given progress/time and intensity.
   *
   * @param effectIdOrName ID or exact Excel name of effect
   * @param rawProgress Normalized progress [0.0 - 1.0] or continuous time
   * @param rawIntensity Raw intensity (supports 0.0-1.0 or 0-100%)
   * @param overrideParams Optional param overrides
   * @param context Optional clip context
   */
  public evaluateEffect(
    effectIdOrName: number | string,
    rawProgress: number,
    rawIntensity: number = 1.0,
    overrideParams: Partial<CinematicFXPreset> = {},
    context: CinematicFXEngineContext = {}
  ): CinematicFXResult {
    // Default neutral state
    const neutralResult: CinematicFXResult = {
      filterStr: '',
      transformStr: '',
      opacityMultiplier: 1.0,
      transformOffsetX: 0,
      transformOffsetY: 0,
      scaleMultiplier: 1.0,
      scaleXMultiplier: 1.0,
      scaleYMultiplier: 1.0,
      rotationOffset: 0,
      motionBlurPx: 0
    };

    const basePreset = this.getPreset(effectIdOrName);
    if (!basePreset) {
      return neutralResult;
    }

    const preset: CinematicFXPreset = { ...basePreset, ...overrideParams };

    // Strict single-boundary intensity normalization
    const normIntensity = rawIntensity > 1.0 ? clamp(rawIntensity / 100, 0, 1) : clamp(rawIntensity, 0, 1);

    // At intensity = 0, return neutral state immediately
    if (normIntensity === 0) {
      return neutralResult;
    }

    const time = context.timelineTime ?? rawProgress;

    let filterStr = '';
    let transformStr = '';
    let opacityMultiplier = 1.0;
    let transformOffsetX = 0;
    let transformOffsetY = 0;
    let scaleMultiplier = 1.0;
    let scaleXMultiplier = 1.0;
    let scaleYMultiplier = 1.0;
    let rotationOffset = 0;
    let motionBlurPx = 0;
    let overlayGradientCss = '';
    let lensGlowCss = '';

    switch (preset.type) {
      case 'filmGrain': {
        const amount = (preset.grainAmount ?? 0.5) * normIntensity;
        const opacity = (preset.opacity ?? 0.6) * normIntensity;
        const grainNoise = deterministicSeededNoise(time * 24, 51);

        filterStr = `contrast(${(1.0 + amount * 0.25).toFixed(2)}) brightness(${(1.0 + grainNoise * amount * 0.04).toFixed(2)})`;
        overlayGradientCss = `rgba(180, 180, 180, ${(opacity * 0.15).toFixed(2)})`;
        break;
      }

      case 'filmBurn': {
        const size = (preset.burnSize ?? 0.4) * 100;
        const bright = (preset.brightness ?? 1.5) * normIntensity;
        const speed = preset.speed ?? 2.0;
        const rgb = hexToRgb(preset.color ?? '#ff6600');

        const animNoise = 0.5 + 0.5 * deterministicSeededNoise(time * speed, 52);
        const curSize = size * (0.8 + 0.4 * animNoise) * normIntensity;
        const op = clamp(0.7 * normIntensity, 0, 1);

        filterStr = `brightness(${(1.0 + (bright - 1.0) * 0.4).toFixed(2)}) contrast(${(1.0 + 0.1 * normIntensity).toFixed(2)})`;
        overlayGradientCss = `radial-gradient(circle at 100% 50%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${op.toFixed(2)}) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(op * 0.4).toFixed(2)}) ${curSize.toFixed(0)}%, transparent ${(curSize * 1.5).toFixed(0)}%)`;
        break;
      }

      case 'lightLeak': {
        const posX = (preset.positionX ?? 0.8) * 100;
        const posY = (preset.positionY ?? 0.2) * 100;
        const opacity = (preset.opacity ?? 0.8) * normIntensity;
        const rgb = hexToRgb(preset.color ?? '#ffaa44');

        filterStr = `brightness(${(1.0 + 0.15 * normIntensity).toFixed(2)})`;
        overlayGradientCss = `radial-gradient(circle at ${posX.toFixed(0)}% ${posY.toFixed(0)}%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity.toFixed(2)}) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(opacity * 0.3).toFixed(2)}) 45%, transparent 75%)`;
        break;
      }

      case 'lensFlare': {
        const posX = (preset.positionX ?? 0.7) * 100;
        const posY = (preset.positionY ?? 0.3) * 100;
        const bright = (preset.brightness ?? 1.2) * normIntensity;
        const streaks = (preset.streaks ?? 0.8) * normIntensity;

        filterStr = `brightness(${(1.0 + (bright - 1.0) * 0.3).toFixed(2)})`;
        overlayGradientCss = `radial-gradient(circle at ${posX.toFixed(0)}% ${posY.toFixed(0)}%, rgba(255, 245, 200, ${(0.8 * normIntensity).toFixed(2)}) 0%, rgba(255, 200, 100, ${(0.4 * normIntensity).toFixed(2)}) 25%, transparent 60%)`;

        if (streaks > 0) {
          lensGlowCss = `linear-gradient(to right, transparent 0%, rgba(255, 220, 150, ${(0.4 * streaks).toFixed(2)}) ${posX.toFixed(0)}%, transparent 100%)`;
        }
        break;
      }

      case 'bloom': {
        const rad = (preset.glowRadius ?? 15) * normIntensity;
        const thresh = preset.threshold ?? 0.7;

        filterStr = `blur(${(rad * 0.4).toFixed(1)}px) brightness(${(1.0 + (1.0 - thresh) * 0.5 * normIntensity).toFixed(2)}) contrast(${(1.0 + 0.2 * normIntensity).toFixed(2)})`;
        break;
      }

      case 'softGlow': {
        const strength = (preset.glowStrength ?? 12) * normIntensity;
        const softness = (preset.softness ?? 20) * normIntensity;

        filterStr = `blur(${(softness * 0.2).toFixed(1)}px) brightness(${(1.0 + (strength / 40) * normIntensity).toFixed(2)})`;
        break;
      }

      case 'goldenHour': {
        const warmth = (preset.warmth ?? 0.6) * normIntensity;
        const bright = (preset.brightness ?? 1.1);
        const posX = (preset.positionX ?? 0.8) * 100;
        const posY = (preset.positionY ?? 0.3) * 100;

        const sepiaVal = (warmth * 0.5).toFixed(2);
        const hueVal = (-15 * warmth).toFixed(0);
        const brightVal = (1.0 + (bright - 1.0) * normIntensity).toFixed(2);

        filterStr = `sepia(${sepiaVal}) hue-rotate(${hueVal}deg) brightness(${brightVal}) saturate(${(1.0 + 0.2 * warmth).toFixed(2)})`;
        overlayGradientCss = `radial-gradient(circle at ${posX.toFixed(0)}% ${posY.toFixed(0)}%, rgba(255, 180, 60, ${(0.35 * normIntensity).toFixed(2)}) 0%, transparent 70%)`;
        break;
      }

      case 'blueHour': {
        const blueTint = (preset.blueTint ?? 0.6) * normIntensity;
        const exp = preset.exposure ?? 0.95;
        const sat = preset.saturation ?? 0.85;

        const hueVal = (180 * blueTint * 0.15).toFixed(0);
        const satVal = (1.0 - (1.0 - sat) * normIntensity).toFixed(2);
        const brightVal = (1.0 - (1.0 - exp) * normIntensity).toFixed(2);

        filterStr = `hue-rotate(${hueVal}deg) saturate(${satVal}) brightness(${brightVal})`;
        overlayGradientCss = `linear-gradient(to bottom, rgba(20, 50, 120, ${(0.2 * normIntensity).toFixed(2)}), transparent)`;
        break;
      }

      case 'moonlight': {
        const blueTint = (preset.blueTint ?? 0.8) * normIntensity;
        const bright = preset.brightness ?? 0.9;
        const shadows = preset.shadows ?? 0.4;

        const hueVal = (195 * blueTint * 0.18).toFixed(0);
        const brightVal = (1.0 - (1.0 - bright) * normIntensity).toFixed(2);
        const contrastVal = (1.0 + shadows * 0.3 * normIntensity).toFixed(2);

        filterStr = `hue-rotate(${hueVal}deg) brightness(${brightVal}) contrast(${contrastVal})`;
        overlayGradientCss = `radial-gradient(circle at 50% 0%, rgba(100, 150, 255, ${(0.25 * normIntensity).toFixed(2)}) 0%, rgba(10, 20, 50, ${(0.35 * normIntensity).toFixed(2)}) 100%)`;
        break;
      }

      case 'cinematicContrast': {
        const cont = (preset.contrast ?? 1.3);
        const shadows = preset.shadows ?? 0.9;
        const highlights = preset.highlights ?? 1.1;

        const finalContrast = (1.0 + (cont - 1.0) * normIntensity).toFixed(2);
        const finalBright = (1.0 + (highlights - shadows) * 0.2 * normIntensity).toFixed(2);

        filterStr = `contrast(${finalContrast}) brightness(${finalBright})`;
        break;
      }
    }

    return {
      filterStr,
      transformStr,
      opacityMultiplier,
      transformOffsetX,
      transformOffsetY,
      scaleMultiplier,
      scaleXMultiplier,
      scaleYMultiplier,
      rotationOffset,
      motionBlurPx,
      overlayGradientCss,
      lensGlowCss
    };
  }
}

export const cinematicFXEngine = CinematicFXEngine.getInstance();
