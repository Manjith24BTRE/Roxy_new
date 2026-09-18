// src/components/editor-main-screen/tools/effects/engines/retroFx/RetroFXEngine.ts

import { RETRO_FX_PRESETS, RetroFXPreset } from './retroFxPresets';
import {
  clamp,
  fadedBlacks,
  vignette,
  halation,
  filmFlicker,
  scratchMask,
  dustMask,
  frameJitter,
  filmGrain
} from './retroFxUtils';

export interface RetroFXResult {
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
  lightingOverlayCss?: string;
  radialGlowCss?: string;
  distortionOverlayCss?: string;
  retroOverlayCss?: string;
  dustOverlayCss?: string;
}

export interface RetroFXEngineContext {
  clipWidth?: number;
  clipHeight?: number;
  timelineTime?: number; // In seconds
}

export class RetroFXEngine {
  private static instance: RetroFXEngine;

  public static getInstance(): RetroFXEngine {
    if (!RetroFXEngine.instance) {
      RetroFXEngine.instance = new RetroFXEngine();
    }
    return RetroFXEngine.instance;
  }

  /**
   * Resolves preset metadata from Effect ID, exact Excel name, or preset key.
   * Handles alias lookups for exact Excel and PDF naming parity (including capital 'I' and 'gth' spellings).
   */
  public getPreset(effectIdOrName: number | string): RetroFXPreset | null {
    if (typeof effectIdOrName === 'number') {
      return RETRO_FX_PRESETS[effectIdOrName] || null;
    }

    const numId = parseInt(effectIdOrName, 10);
    if (!isNaN(numId) && RETRO_FX_PRESETS[numId]) {
      return RETRO_FX_PRESETS[numId];
    }

    const targetRaw = String(effectIdOrName).trim();
    const targetLower = targetRaw.toLowerCase();

    // Alias mapping for friendly vs exact Excel spellings
    let searchLower = targetLower;
    if (targetLower === 'vintage film') searchLower = 'vintage film';
    if (targetLower === 'sepia film') searchLower = 'sepia film';
    if (targetLower === 'old photograph' || targetLower === 'old photo') searchLower = 'old photograpgh';

    const match = Object.values(RETRO_FX_PRESETS).find(
      (p) =>
        p.name.trim().toLowerCase() === searchLower ||
        p.presetKey.trim().toLowerCase() === searchLower ||
        p.name.trim().toLowerCase() === targetLower
    );
    return match || null;
  }

  /**
   * Computes deterministic non-destructive retro state for an effect at a given progress/time and intensity.
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
    overrideParams: Partial<RetroFXPreset> = {},
    context: RetroFXEngineContext = {}
  ): RetroFXResult {
    // Default neutral state
    const neutralResult: RetroFXResult = {
      filterStr: '',
      transformStr: '',
      opacityMultiplier: 1.0,
      transformOffsetX: 0,
      transformOffsetY: 0,
      scaleMultiplier: 1.0,
      scaleXMultiplier: 1.0,
      scaleYMultiplier: 1.0,
      rotationOffset: 0,
      motionBlurPx: 0,
      lightingOverlayCss: '',
      radialGlowCss: '',
      distortionOverlayCss: '',
      retroOverlayCss: '',
      dustOverlayCss: ''
    };

    const basePreset = this.getPreset(effectIdOrName);
    if (!basePreset) {
      return neutralResult;
    }

    // Normalize intensity safely: 0-100 scale converted to 0.0-1.0
    let intensity = clamp(rawIntensity > 1.0 ? rawIntensity / 100.0 : rawIntensity, 0.0, 1.0);
    if (intensity <= 0.0001) {
      return neutralResult;
    }

    const preset: RetroFXPreset = { ...basePreset, ...overrideParams };
    const time = context.timelineTime ?? rawProgress * 5.0;

    let filterParts: string[] = [];
    let retroOverlayCss = '';
    let dustOverlayCss = '';
    let scaleMultiplier = 1.0;
    let rotationOffset = 0;
    let transformOffsetY = 0;

    switch (preset.type) {
      case 'vintageFilm': {
        // 91. Vintage FIlm - Warm aged film aesthetic with faded blacks & grain
        const pWarmth = (preset.warmth || 0.5) * intensity;
        const pFade = (preset.fade || 0.3) * intensity;

        filterParts.push(fadedBlacks(pFade));
        filterParts.push(`sepia(${(0.45 * intensity).toFixed(2)})`);
        filterParts.push(`hue-rotate(${(-10 * pWarmth).toFixed(0)}deg)`);
        filterParts.push(`saturate(${(1.0 - 0.15 * intensity).toFixed(2)})`);
        filterParts.push(filmGrain(preset.grain || 0.4 * intensity, 91));

        retroOverlayCss = vignette(intensity * (preset.vignette || 0.5));
        break;
      }

      case 'super8Film': {
        // 92. Super 8 Film - Coarse 8mm film grain, gate flicker & vertical jitter
        const flickerVal = filmFlicker(92, time, preset.flicker || 0.4);
        const jitter = frameJitter(92, time, (preset.jitter || 0.3) * intensity);
        transformOffsetY = jitter.offsetY;

        const pBright = 1.0 + 0.12 * intensity * (flickerVal - 1.0);

        filterParts.push(`brightness(${pBright.toFixed(2)})`);
        filterParts.push(`sepia(${(0.35 * intensity).toFixed(2)})`);
        filterParts.push(`saturate(${(1.0 + 0.2 * intensity).toFixed(2)})`);
        filterParts.push(filmGrain((preset.grain || 0.7) * intensity, 92));

        retroOverlayCss = vignette(intensity * (preset.vignette || 0.6));
        dustOverlayCss = scratchMask((preset.scratches || 0.3) * intensity, time);
        break;
      }

      case 'film16mm': {
        // 93. 16mm Film - Organic indie film stock response with halation glow
        const pHalation = (preset.halation || 0.4) * intensity;

        filterParts.push(`contrast(${((preset.contrast || 1.1) * (1.0 + 0.1 * intensity)).toFixed(2)})`);
        filterParts.push(halation(pHalation));
        filterParts.push(filmGrain((preset.grain || 0.5) * intensity, 93));

        retroOverlayCss = vignette(intensity * (preset.vignette || 0.4));
        break;
      }

      case 'film35mm': {
        // 94. 35mm Film - High-end theatrical film grade with fine grain & highlight rolloff
        filterParts.push(`contrast(${((preset.contrast || 1.15) * (1.0 + 0.1 * intensity)).toFixed(2)})`);
        filterParts.push(`saturate(${(1.0 + 0.1 * intensity).toFixed(2)})`);
        filterParts.push(filmGrain((preset.grain || 0.25) * intensity, 94));

        retroOverlayCss = vignette(intensity * (preset.vignette || 0.3));
        break;
      }

      case 'silentFilm': {
        // 95. Silent Film - High-contrast 1920s B&W, scratches & shutter flicker
        const flickerVal = filmFlicker(95, time, preset.flicker || 0.5);
        const pBright = (1.0 + 0.15 * intensity * (flickerVal - 1.0)).toFixed(2);

        filterParts.push(`grayscale(${(1.0 * intensity).toFixed(2)})`);
        filterParts.push(`contrast(${((preset.contrast || 1.35) * (1.0 + 0.2 * intensity)).toFixed(2)})`);
        filterParts.push(`brightness(${pBright})`);

        retroOverlayCss = vignette(intensity * (preset.vignette || 0.7));
        dustOverlayCss = scratchMask((preset.scratches || 0.6) * intensity, time);
        break;
      }

      case 'sepiaFilm': {
        // 96. Sepia FIlm - Warm antique brown monochrome grading & fine grain
        const tone = (preset.sepiaTone || 0.85) * intensity;

        filterParts.push(`sepia(${tone.toFixed(2)})`);
        filterParts.push(`contrast(${((preset.contrast || 1.05) * (1.0 + 0.05 * intensity)).toFixed(2)})`);
        filterParts.push(filmGrain((preset.grain || 0.3) * intensity, 96));

        retroOverlayCss = vignette(intensity * 0.4);
        break;
      }

      case 'oldPhotograph': {
        // 97. Old Photograpgh - Aged paper degradation, dust & faded colors
        const pFade = (preset.fade || 0.5) * intensity;

        filterParts.push(fadedBlacks(pFade));
        filterParts.push(`sepia(${(0.5 * intensity).toFixed(2)})`);
        filterParts.push(`saturate(${(1.0 - 0.3 * intensity).toFixed(2)})`);

        retroOverlayCss = vignette(intensity * (preset.vignette || 0.6));
        dustOverlayCss = dustMask((preset.dust || 0.5) * intensity, time);
        break;
      }

      case 'colorIsolation': {
        // 98. Color Isolation - Selective color focus with desaturated background
        const satVal = (1.0 - (1.0 - (preset.saturation || 0.2)) * intensity).toFixed(2);

        filterParts.push(`saturate(${satVal})`);
        filterParts.push(`contrast(${(1.0 + 0.15 * intensity).toFixed(2)})`);
        break;
      }

      case 'doubleExposure': {
        // 99. Double Exposure - Dual-layer artistic gradient blend overlay
        const bOpacity = (preset.blendOpacity || 0.5) * intensity;

        filterParts.push(`contrast(${((preset.contrast || 1.1) * (1.0 + 0.08 * intensity)).toFixed(2)})`);

        const alpha = (0.4 * bOpacity).toFixed(2);
        retroOverlayCss = `linear-gradient(135deg, rgba(255,200,150,${alpha}) 0%, rgba(100,150,255,${alpha}) 100%)`;
        break;
      }

      case 'kaleidoscope': {
        // 100. Kaleidoscope - Mandala optical mirror effect & rotation offset
        scaleMultiplier = 1.0 + ((preset.scale || 1.1) - 1.0) * intensity;
        rotationOffset = (preset.rotation || 45) * 0.2 * intensity;

        filterParts.push(`contrast(${(1.0 + 0.1 * intensity).toFixed(2)})`);

        const kAlpha = (0.25 * intensity).toFixed(2);
        retroOverlayCss = `radial-gradient(circle at 50% 50%, transparent 40%, rgba(255,255,255,${kAlpha}) 70%, transparent 100%)`;
        break;
      }
    }

    const filterStr = filterParts.join(' ').trim();
    const transformParts: string[] = [];
    if (transformOffsetY !== 0) {
      transformParts.push(`translateY(${transformOffsetY}px)`);
    }
    if (scaleMultiplier !== 1.0) {
      transformParts.push(`scale(${scaleMultiplier.toFixed(4)})`);
    }
    if (rotationOffset !== 0) {
      transformParts.push(`rotate(${rotationOffset.toFixed(2)}deg)`);
    }

    return {
      filterStr,
      transformStr: transformParts.join(' '),
      opacityMultiplier: 1.0,
      transformOffsetX: 0,
      transformOffsetY,
      scaleMultiplier,
      scaleXMultiplier: scaleMultiplier,
      scaleYMultiplier: scaleMultiplier,
      rotationOffset,
      motionBlurPx: 0,
      lightingOverlayCss: '',
      radialGlowCss: '',
      distortionOverlayCss: '',
      retroOverlayCss,
      dustOverlayCss
    };
  }
}

export const retroFXEngine = RetroFXEngine.getInstance();
