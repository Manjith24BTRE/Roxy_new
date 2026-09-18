// src/components/editor-main-screen/tools/effects/engines/blurFocus/BlurFocusEngine.ts
import { BLUR_FOCUS_PRESETS, BlurFocusPreset } from './blurFocusPresets';
import { clamp, formatBlurFilter, calculateLinearBlurMask, calculateRadialBlurMask } from './blurFocusUtils';

export interface BlurFocusResult {
  blurRadiusPx: number;
  filterStr: string;
  transformStr: string;
  maskStyleStr?: string;
  opacityMultiplier: number;
  overlayCss?: string;
  transformOffsetX?: number;
  transformOffsetY?: number;
  scaleMultiplier?: number;
  scaleXMultiplier?: number;
  scaleYMultiplier?: number;
  rotationOffset?: number;
  motionBlurPx?: number;
}

export interface BlurFocusEngineContext {
  clipWidth?: number;
  clipHeight?: number;
  timelineTime?: number; // In seconds
}

export class BlurFocusEngine {
  private static instance: BlurFocusEngine;

  public static getInstance(): BlurFocusEngine {
    if (!BlurFocusEngine.instance) {
      BlurFocusEngine.instance = new BlurFocusEngine();
    }
    return BlurFocusEngine.instance;
  }

  /**
   * Resolves preset metadata from Effect ID, exact Excel name, or preset key.
   * Handles alias lookups (e.g. "Bokeh Blur" -> "Broken Blur", "Tilt Shift" -> "Tilt Blur").
   */
  public getPreset(effectIdOrName: number | string): BlurFocusPreset | null {
    if (typeof effectIdOrName === 'number') {
      return BLUR_FOCUS_PRESETS[effectIdOrName] || null;
    }

    const numId = parseInt(effectIdOrName, 10);
    if (!isNaN(numId) && BLUR_FOCUS_PRESETS[numId]) {
      return BLUR_FOCUS_PRESETS[numId];
    }

    const targetStr = String(effectIdOrName).trim().toLowerCase();

    // Alias mapping for PDF vs Excel naming parity
    let searchStr = targetStr;
    if (targetStr === 'bokeh blur') searchStr = 'broken blur';
    if (targetStr === 'tilt shift') searchStr = 'tilt blur';

    const match = Object.values(BLUR_FOCUS_PRESETS).find(
      (p) =>
        p.name.trim().toLowerCase() === searchStr ||
        p.presetKey.trim().toLowerCase() === searchStr ||
        p.name.trim().toLowerCase() === targetStr
    );
    return match || null;
  }

  /**
   * Computes deterministic non-destructive blur state for an effect at a given progress/time and intensity.
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
    overrideParams: Partial<BlurFocusPreset> = {},
    context: BlurFocusEngineContext = {}
  ): BlurFocusResult {
    // Default neutral state
    const neutralResult: BlurFocusResult = {
      blurRadiusPx: 0,
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

    const preset: BlurFocusPreset = { ...basePreset, ...overrideParams };

    // Strict single-boundary intensity normalization
    const normIntensity = rawIntensity > 1.0 ? clamp(rawIntensity / 100, 0, 1) : clamp(rawIntensity, 0, 1);

    // At intensity = 0, return neutral state immediately
    if (normIntensity === 0) {
      return neutralResult;
    }

    const time = context.timelineTime ?? rawProgress;

    let blurRadiusPx = 0;
    let filterStr = '';
    let transformStr = '';
    let opacityMultiplier = 1.0;
    let maskStyleStr = '';
    let overlayCss = '';

    let transformOffsetX = 0;
    let transformOffsetY = 0;
    let scaleMultiplier = 1.0;
    let scaleXMultiplier = 1.0;
    let scaleYMultiplier = 1.0;
    let rotationOffset = 0;
    let motionBlurPx = 0;

    switch (preset.type) {
      case 'gaussianBlur': {
        const radius = preset.blurRadius ?? 15;
        blurRadiusPx = radius * normIntensity;
        filterStr = formatBlurFilter(blurRadiusPx);
        break;
      }

      case 'motionBlur': {
        const length = (preset.blurLength ?? 20) * (preset.intensity ?? 1.0);
        const angleRad = ((preset.angle ?? 0) * Math.PI) / 180;
        const shutter = preset.shutter ?? 0.5;

        blurRadiusPx = length * normIntensity;
        filterStr = formatBlurFilter(blurRadiusPx);

        // Motion directional sample offset preview translation
        transformOffsetX = Math.cos(angleRad) * length * 0.1 * shutter * normIntensity;
        transformOffsetY = Math.sin(angleRad) * length * 0.1 * shutter * normIntensity;
        if (transformOffsetX !== 0 || transformOffsetY !== 0) {
          transformStr = `translate(${transformOffsetX.toFixed(1)}px, ${transformOffsetY.toFixed(1)}px)`;
        }
        break;
      }

      case 'directionalBlur': {
        const dirX = preset.directionX ?? 1.0;
        const dirY = preset.directionY ?? 0.0;
        const len = Math.hypot(dirX, dirY) || 1.0;
        const dist = (preset.distance ?? 25) * (preset.strength ?? 1.0);

        blurRadiusPx = dist * normIntensity;
        filterStr = formatBlurFilter(blurRadiusPx);

        transformOffsetX = (dirX / len) * dist * 0.15 * normIntensity;
        transformOffsetY = (dirY / len) * dist * 0.15 * normIntensity;
        if (transformOffsetX !== 0 || transformOffsetY !== 0) {
          transformStr = `translate(${transformOffsetX.toFixed(1)}px, ${transformOffsetY.toFixed(1)}px)`;
        }
        break;
      }

      case 'radialBlur': {
        const strength = (preset.radius ?? 20) * (preset.strength ?? 1.0);
        blurRadiusPx = strength * normIntensity;
        filterStr = formatBlurFilter(blurRadiusPx);
        break;
      }

      case 'zoomBlur': {
        const zStrength = preset.zoomStrength ?? 30;
        const speed = preset.speed ?? 3.0;

        // Animated rush progression based on timeline time
        const animFactor = 0.5 + 0.5 * Math.abs(Math.sin(time * speed));
        blurRadiusPx = zStrength * animFactor * normIntensity;
        filterStr = formatBlurFilter(blurRadiusPx);

        const scaleN = 1.0 + 0.05 * animFactor * normIntensity;
        scaleMultiplier = scaleN;
        scaleXMultiplier = scaleN;
        scaleYMultiplier = scaleN;
        transformStr = `scale(${scaleN.toFixed(3)})`;
        break;
      }

      case 'lensBlur': {
        const amount = preset.blurAmount ?? 20;
        const focusArea = preset.focusArea ?? 0.3;
        const feather = preset.feather ?? 0.2;

        blurRadiusPx = amount * normIntensity;
        filterStr = formatBlurFilter(blurRadiusPx);

        const innerR = focusArea * 100;
        const outerR = (focusArea + feather) * 100;
        maskStyleStr = `radial-gradient(circle at center, transparent ${innerR.toFixed(0)}%, black ${outerR.toFixed(0)}%)`;
        break;
      }

      case 'bokehBlur': {
        const size = preset.bokehSize ?? 25;
        const brightness = preset.brightness ?? 1.2;

        blurRadiusPx = size * normIntensity;
        const brightFactor = 1.0 + (brightness - 1.0) * normIntensity;
        filterStr = `blur(${blurRadiusPx.toFixed(1)}px) brightness(${brightFactor.toFixed(2)})`;
        break;
      }

      case 'tiltShift': {
        const amount = preset.blurAmount ?? 20;
        const pos = (preset.position ?? 0.5) * 100;
        const width = (preset.focusWidth ?? 0.25) * 50;
        const feather = (preset.feather ?? 0.2) * 50;

        blurRadiusPx = amount * normIntensity;
        filterStr = formatBlurFilter(blurRadiusPx);

        const bandTop = Math.max(0, pos - width);
        const bandBottom = Math.min(100, pos + width);
        const topFeather = Math.max(0, bandTop - feather);
        const bottomFeather = Math.min(100, bandBottom + feather);

        maskStyleStr = `linear-gradient(to bottom, black 0%, black ${topFeather.toFixed(0)}%, transparent ${bandTop.toFixed(0)}%, transparent ${bandBottom.toFixed(0)}%, black ${bottomFeather.toFixed(0)}%, black 100%)`;
        break;
      }

      case 'focusBlur': {
        const radius = preset.blurRadius ?? 25;
        const posX = (preset.focusPositionX ?? 0.5) * 100;
        const posY = (preset.focusPositionY ?? 0.5) * 100;
        const feather = (preset.feather ?? 0.3) * 50;

        blurRadiusPx = radius * normIntensity;
        filterStr = formatBlurFilter(blurRadiusPx);

        const innerR = Math.max(5, 20 - feather);
        const outerR = 20 + feather;
        maskStyleStr = `radial-gradient(circle at ${posX.toFixed(0)}% ${posY.toFixed(0)}%, transparent ${innerR.toFixed(0)}%, black ${outerR.toFixed(0)}%)`;
        break;
      }

      case 'backgroundBlur': {
        const strength = preset.blurStrength ?? 25;
        const maskRad = (preset.subjectMaskRadius ?? 0.35) * 100;
        const feather = (preset.feather ?? 0.25) * 50;

        blurRadiusPx = strength * normIntensity;
        filterStr = formatBlurFilter(blurRadiusPx);

        const innerR = Math.max(0, maskRad - feather);
        const outerR = maskRad + feather;
        maskStyleStr = `radial-gradient(circle at center, transparent ${innerR.toFixed(0)}%, black ${outerR.toFixed(0)}%)`;
        break;
      }
    }

    return {
      blurRadiusPx,
      filterStr,
      transformStr,
      maskStyleStr,
      opacityMultiplier,
      overlayCss,
      transformOffsetX,
      transformOffsetY,
      scaleMultiplier,
      scaleXMultiplier,
      scaleYMultiplier,
      rotationOffset,
      motionBlurPx
    };
  }
}

export const blurFocusEngine = BlurFocusEngine.getInstance();
