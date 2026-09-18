// src/components/editor-main-screen/tools/effects/engines/atmosphericFx/AtmosphericFXEngine.ts
import { ATMOSPHERIC_FX_PRESETS, AtmosphericFXPreset } from './atmosphericFxPresets';
import {
  deterministicSeededNoise,
  clamp,
  hexToRgb
} from './atmosphericFxUtils';

export interface AtmosphericFXResult {
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
  atmosphericOverlayCss?: string;
  particleOverlayCss?: string;
}

export interface AtmosphericFXEngineContext {
  clipWidth?: number;
  clipHeight?: number;
  timelineTime?: number; // In seconds
}

export class AtmosphericFXEngine {
  private static instance: AtmosphericFXEngine;

  public static getInstance(): AtmosphericFXEngine {
    if (!AtmosphericFXEngine.instance) {
      AtmosphericFXEngine.instance = new AtmosphericFXEngine();
    }
    return AtmosphericFXEngine.instance;
  }

  /**
   * Resolves preset metadata from Effect ID, exact Excel name, or preset key.
   * Handles alias lookups (e.g. "Smoke" -> "Smoke Overlay", "Dust" -> "Dust Particles").
   */
  public getPreset(effectIdOrName: number | string): AtmosphericFXPreset | null {
    if (typeof effectIdOrName === 'number') {
      return ATMOSPHERIC_FX_PRESETS[effectIdOrName] || null;
    }

    const numId = parseInt(effectIdOrName, 10);
    if (!isNaN(numId) && ATMOSPHERIC_FX_PRESETS[numId]) {
      return ATMOSPHERIC_FX_PRESETS[numId];
    }

    const targetStr = String(effectIdOrName).trim().toLowerCase();

    // Alias mapping for PDF vs Excel catalog naming parity
    let searchStr = targetStr;
    if (targetStr === 'smoke') searchStr = 'smoke overlay';
    if (targetStr === 'dust' || targetStr === 'ash') searchStr = 'dust particles';

    const match = Object.values(ATMOSPHERIC_FX_PRESETS).find(
      (p) =>
        p.name.trim().toLowerCase() === searchStr ||
        p.presetKey.trim().toLowerCase() === searchStr ||
        p.name.trim().toLowerCase() === targetStr
    );
    return match || null;
  }

  /**
   * Computes deterministic non-destructive atmospheric state for an effect at a given progress/time and intensity.
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
    overrideParams: Partial<AtmosphericFXPreset> = {},
    context: AtmosphericFXEngineContext = {}
  ): AtmosphericFXResult {
    // Default neutral state
    const neutralResult: AtmosphericFXResult = {
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

    const preset: AtmosphericFXPreset = { ...basePreset, ...overrideParams };

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
    let atmosphericOverlayCss = '';
    let particleOverlayCss = '';

    switch (preset.type) {
      case 'fog': {
        const density = (preset.density ?? 0.6) * normIntensity;
        const opacity = (preset.opacity ?? 0.7) * normIntensity;
        const speed = preset.speed ?? 1.0;
        const rgb = hexToRgb(preset.color ?? '#e0e5eb');

        const driftX = (deterministicSeededNoise(time * speed * 0.2, 61) * 20 * normIntensity).toFixed(1);

        filterStr = `blur(${(density * 12).toFixed(1)}px) brightness(${(1.0 + density * 0.1).toFixed(2)})`;
        transformStr = `translate(${driftX}px, 0px)`;
        atmosphericOverlayCss = `radial-gradient(ellipse at 50% 100%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(opacity * 0.6).toFixed(2)}) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(opacity * 0.2).toFixed(2)}) 70%, transparent 100%)`;
        break;
      }

      case 'mist': {
        const density = (preset.density ?? 0.3) * normIntensity;
        const opacity = (preset.opacity ?? 0.5) * normIntensity;
        const speed = preset.speed ?? 0.8;
        const rgb = hexToRgb(preset.color ?? '#ffffff');

        const driftX = (deterministicSeededNoise(time * speed * 0.15, 62) * 10 * normIntensity).toFixed(1);

        filterStr = `blur(${(density * 5).toFixed(1)}px)`;
        transformStr = `translate(${driftX}px, 0px)`;
        atmosphericOverlayCss = `linear-gradient(to bottom, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(opacity * 0.3).toFixed(2)}), transparent)`;
        break;
      }

      case 'smoke': {
        const density = (preset.density ?? 0.5) * normIntensity;
        const speed = preset.speed ?? 1.5;
        const rgb = hexToRgb(preset.color ?? '#888888');

        const waveY = (deterministicSeededNoise(time * speed * 0.3, 63) * -15 * normIntensity).toFixed(1);
        const waveX = (deterministicSeededNoise(time * speed * 0.2, 631) * 10 * normIntensity).toFixed(1);

        filterStr = `blur(${(density * 8).toFixed(1)}px) contrast(${(1.0 + density * 0.2).toFixed(2)})`;
        transformStr = `translate(${waveX}px, ${waveY}px)`;
        atmosphericOverlayCss = `radial-gradient(circle at 40% 60%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(density * 0.5).toFixed(2)}) 0%, transparent 70%)`;
        break;
      }

      case 'rain': {
        const speed = preset.speed ?? 8.0;
        const opacity = (preset.opacity ?? 0.6) * normIntensity;
        const dir = preset.direction ?? 15;

        // Downward streak movement simulation
        const fallOffset = ((time * speed * 100) % 100).toFixed(1);

        filterStr = `brightness(${(1.0 - 0.05 * normIntensity).toFixed(2)})`;
        particleOverlayCss = `repeating-linear-gradient(${dir}deg, transparent 0px, transparent 15px, rgba(200, 220, 255, ${opacity.toFixed(2)}) 15px, rgba(200, 220, 255, ${opacity.toFixed(2)}) 17px)`;
        break;
      }

      case 'snow': {
        const speed = preset.speed ?? 1.5;
        const opacity = (preset.opacity ?? 0.8) * normIntensity;

        const driftX = (deterministicSeededNoise(time * speed * 0.5, 65) * 20 * normIntensity).toFixed(1);
        const fallY = ((time * speed * 40) % 100).toFixed(1);

        filterStr = `brightness(${(1.0 + 0.05 * normIntensity).toFixed(2)})`;
        particleOverlayCss = `radial-gradient(circle at ${driftX}px ${fallY}%, rgba(255, 255, 255, ${opacity.toFixed(2)}) 0%, transparent 80%)`;
        break;
      }

      case 'lightningFlash': {
        const freq = preset.frequency ?? 2.0;
        const bright = preset.brightness ?? 1.8;
        const dur = preset.duration ?? 0.15;

        const flashNoise = deterministicSeededNoise(time * freq * 5, 66);
        if (flashNoise > (1.0 - dur * 2)) {
          const flashBright = 1.0 + (bright - 1.0) * normIntensity;
          filterStr = `brightness(${flashBright.toFixed(2)}) contrast(${(1.0 + 0.3 * normIntensity).toFixed(2)})`;
          atmosphericOverlayCss = `rgba(240, 245, 255, ${(0.4 * normIntensity).toFixed(2)})`;
        }
        break;
      }

      case 'dust': {
        const opacity = (preset.opacity ?? 0.6) * normIntensity;
        const speed = preset.speed ?? 0.5;

        const floatX = (deterministicSeededNoise(time * speed, 67) * 15 * normIntensity).toFixed(1);
        const floatY = (deterministicSeededNoise(time * speed * 0.7, 671) * 15 * normIntensity).toFixed(1);

        transformStr = `translate(${floatX}px, ${floatY}px)`;
        particleOverlayCss = `radial-gradient(circle at 30% 40%, rgba(240, 230, 200, ${(opacity * 0.4).toFixed(2)}) 0%, transparent 60%)`;
        break;
      }

      case 'atmosphere': {
        const glow = (preset.glow ?? 0.6) * normIntensity;
        const warmth = (preset.warmth ?? 0.4) * normIntensity;

        filterStr = `brightness(${(1.0 + glow * 0.2).toFixed(2)}) sepia(${(warmth * 0.3).toFixed(2)})`;
        atmosphericOverlayCss = `radial-gradient(circle at center, rgba(255, 220, 150, ${(glow * 0.3).toFixed(2)}) 0%, transparent 70%)`;
        break;
      }

      case 'haze': {
        const density = (preset.density ?? 0.4) * normIntensity;
        const exp = preset.exposure ?? 1.05;

        filterStr = `blur(${(density * 6).toFixed(1)}px) brightness(${(1.0 + (exp - 1.0) * normIntensity).toFixed(2)})`;
        atmosphericOverlayCss = `linear-gradient(to bottom, rgba(220, 230, 240, ${(density * 0.4).toFixed(2)}), transparent)`;
        break;
      }

      case 'heatBlur': {
        const dist = (preset.distortion ?? 15) * normIntensity;
        const speed = preset.speed ?? 3.0;

        const waveX = (deterministicSeededNoise(time * speed, 70) * dist * 0.5).toFixed(1);
        const waveY = (deterministicSeededNoise(time * speed * 1.3, 701) * dist * 0.5).toFixed(1);

        transformOffsetX = parseFloat(waveX);
        transformOffsetY = parseFloat(waveY);
        transformStr = `translate(${waveX}px, ${waveY}px)`;
        filterStr = `blur(${(dist * 0.2).toFixed(1)}px)`;
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
      atmosphericOverlayCss,
      particleOverlayCss
    };
  }
}

export const atmosphericFXEngine = AtmosphericFXEngine.getInstance();
