// src/components/editor-main-screen/tools/effects/engines/distortionFx/DistortionFXEngine.ts

import { DISTORTION_FX_PRESETS, DistortionFXPreset } from './distortionFxPresets';
import {
  clamp,
  chromaticOffset,
  radialWarp,
  barrelWarp,
  pincushionWarp,
  fishEyeWarp,
  waveWarp,
  rippleWarp,
  prismSplit,
  deterministicSeededNoise
} from './distortionFxUtils';

export interface DistortionFXResult {
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
  chromaticOffsetPx?: number;
}

export interface DistortionFXEngineContext {
  clipWidth?: number;
  clipHeight?: number;
  timelineTime?: number; // In seconds
}

export class DistortionFXEngine {
  private static instance: DistortionFXEngine;

  public static getInstance(): DistortionFXEngine {
    if (!DistortionFXEngine.instance) {
      DistortionFXEngine.instance = new DistortionFXEngine();
    }
    return DistortionFXEngine.instance;
  }

  /**
   * Resolves preset metadata from Effect ID, exact Excel name, or preset key.
   * Handles alias lookups for exact Excel and PDF naming parity (including trailing spaces).
   */
  public getPreset(effectIdOrName: number | string): DistortionFXPreset | null {
    if (typeof effectIdOrName === 'number') {
      return DISTORTION_FX_PRESETS[effectIdOrName] || null;
    }

    const numId = parseInt(effectIdOrName, 10);
    if (!isNaN(numId) && DISTORTION_FX_PRESETS[numId]) {
      return DISTORTION_FX_PRESETS[numId];
    }

    const targetRaw = String(effectIdOrName);
    const targetTrimmed = targetRaw.trim().toLowerCase();

    const match = Object.values(DISTORTION_FX_PRESETS).find(
      (p) =>
        p.name === targetRaw ||
        p.name.trim().toLowerCase() === targetTrimmed ||
        p.presetKey.trim().toLowerCase() === targetTrimmed
    );
    return match || null;
  }

  /**
   * Computes deterministic non-destructive distortion state for an effect at a given progress/time and intensity.
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
    overrideParams: Partial<DistortionFXPreset> = {},
    context: DistortionFXEngineContext = {}
  ): DistortionFXResult {
    // Default neutral state
    const neutralResult: DistortionFXResult = {
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
      chromaticOffsetPx: 0
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

    const preset: DistortionFXPreset = { ...basePreset, ...overrideParams };
    const time = context.timelineTime ?? rawProgress * 5.0;

    let filterParts: string[] = [];
    let distortionOverlayCss = '';
    let opacityMultiplier = 1.0;
    let scaleMultiplier = 1.0;
    let scaleXMultiplier = 1.0;
    let scaleYMultiplier = 1.0;
    let rotationOffset = 0;
    let chromaticOffsetPx = 0;

    switch (preset.type) {
      case 'fishEye': {
        // 81. Fish Eye - Strong spherical radial bulge with scale correction & edge contrast
        const distFactor = (preset.distortion || 0.8) * intensity;
        const targetScale = 1.0 + ((preset.scale || 1.15) - 1.0) * intensity;
        scaleMultiplier = targetScale;
        scaleXMultiplier = targetScale;
        scaleYMultiplier = targetScale;

        filterParts.push(`contrast(${(1.0 + 0.12 * intensity).toFixed(2)})`);
        filterParts.push(`saturate(${(1.0 + 0.08 * intensity).toFixed(2)})`);

        // Circular fisheye lens vignette
        const vAlpha = (0.3 * intensity).toFixed(2);
        distortionOverlayCss = `radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,${vAlpha}) 100%)`;
        break;
      }

      case 'wideAngle': {
        // 82. Wide Angle - Wide-angle lens perspective expansion & lateral stretch
        const targetScaleX = 1.0 + ((preset.scale || 1.1) - 1.0) * intensity;
        const targetScaleY = 1.0 + 0.04 * intensity;
        scaleXMultiplier = targetScaleX;
        scaleYMultiplier = targetScaleY;
        scaleMultiplier = targetScaleX;

        filterParts.push(`contrast(${(1.0 + 0.06 * intensity).toFixed(2)})`);
        break;
      }

      case 'barrelDistortion': {
        // 83. Barrel Distortion - Convex optical barrel expansion bending edges outward
        const k = (preset.kFactor || 0.5) * intensity;
        const targetScale = 1.0 + ((preset.scale || 1.12) - 1.0) * intensity;
        scaleMultiplier = targetScale;
        scaleXMultiplier = targetScale;
        scaleYMultiplier = targetScale;

        filterParts.push(`contrast(${(1.0 + 0.1 * intensity).toFixed(2)})`);
        filterParts.push(`brightness(${(1.0 + 0.03 * intensity).toFixed(2)})`);
        break;
      }

      case 'pincushion': {
        // 84. Pincushion - Concave optical pincushion contraction bending edges inward
        const targetScale = 1.0 - (1.0 - (preset.scale || 0.95)) * intensity;
        scaleMultiplier = targetScale;
        scaleXMultiplier = targetScale;
        scaleYMultiplier = targetScale;

        filterParts.push(`contrast(${(1.0 + 0.08 * intensity).toFixed(2)})`);
        break;
      }

      case 'chromaticAberration': {
        // 85. Chromatic Aberration - Optical RGB channel separation offset
        const shift = (preset.shiftPx || 12) * intensity;
        chromaticOffsetPx = shift;
        const angle = preset.angle || 45;

        filterParts.push(chromaticOffset(shift, angle, 1.0));
        filterParts.push(`contrast(${(1.0 + 0.05 * intensity).toFixed(2)})`);
        break;
      }

      case 'prism': {
        // 86. Prism - Multi-facet glass prism refraction spectrum split
        const dispersion = (preset.dispersion || 0.8) * intensity;
        const angle = preset.angle || 30;

        filterParts.push(chromaticOffset(16 * dispersion, angle, 1.0));
        filterParts.push(`brightness(${(1.0 + 0.1 * intensity).toFixed(2)})`);

        const pAlpha = (0.25 * intensity).toFixed(2);
        distortionOverlayCss = `linear-gradient(${angle}deg, rgba(255,0,0,${pAlpha}) 0%, rgba(0,255,0,${pAlpha}) 50%, rgba(0,0,255,${pAlpha}) 100%)`;
        break;
      }

      case 'glassReflection': {
        // 87. Glass Reflection - Diagonal glass plane mirror reflection sheen overlay
        const reflectivity = (preset.reflectivity || 0.4) * intensity;
        const angle = preset.angle || 45;

        if ((preset.blurPx || 4) > 0) {
          filterParts.push(`brightness(${(1.0 + 0.08 * intensity).toFixed(2)})`);
        }

        const rAlpha1 = (0.35 * reflectivity).toFixed(2);
        const rAlpha2 = (0.05 * reflectivity).toFixed(2);
        distortionOverlayCss = `linear-gradient(${angle}deg, rgba(255,255,255,${rAlpha1}) 0%, transparent 40%, rgba(255,255,255,${rAlpha2}) 60%, transparent 100%)`;
        break;
      }

      case 'waterReflection': {
        // 88. Water Reflection - Horizontal water surface plane mirror ripple
        const speed = preset.speed || 1.5;
        const amp = (preset.amplitude || 0.03) * intensity;
        const freq = preset.frequency || 15;
        const splitY = (preset.splitY || 0.55) * 100;

        const waveVal = Math.sin(time * speed * 4.0) * amp * 10.0;
        filterParts.push(`brightness(${(1.0 + 0.05 * intensity).toFixed(2)})`);

        const wAlpha = (0.45 * intensity).toFixed(2);
        distortionOverlayCss = `linear-gradient(to bottom, transparent ${splitY}%, rgba(200,230,255,${wAlpha}) ${splitY + 5}%, transparent 100%)`;
        break;
      }

      case 'ripple': {
        // 89. Ripple - Concentric animated liquid wave displacement
        const speed = preset.speed || 2.0;
        const amp = (preset.amplitude || 0.04) * intensity;
        const freq = preset.frequency || 20;

        const ripplePhase = (time * speed * 3.0) % (Math.PI * 2);
        const scaleWave = 1.0 + Math.sin(ripplePhase) * amp * 0.5;
        scaleMultiplier = scaleWave;

        filterParts.push(`brightness(${(1.0 + 0.06 * intensity).toFixed(2)})`);

        const rAlpha = (0.25 * intensity).toFixed(2);
        distortionOverlayCss = `radial-gradient(circle at 50% 50%, transparent 30%, rgba(255,255,255,${rAlpha}) 50%, transparent 70%)`;
        break;
      }

      case 'swirl': {
        // 90. Swirl - Rotational vortex spiral UV warp around focal point
        const targetRot = (preset.swirlAngle || 180) * 0.05 * intensity;
        rotationOffset = targetRot;

        filterParts.push(`contrast(${(1.0 + 0.1 * intensity).toFixed(2)})`);

        const sAlpha = (0.2 * intensity).toFixed(2);
        distortionOverlayCss = `radial-gradient(circle at 50% 50%, rgba(255,255,255,${sAlpha}) 0%, transparent 60%)`;
        break;
      }
    }

    const filterStr = filterParts.join(' ').trim();
    const transformParts: string[] = [];
    if (scaleMultiplier !== 1.0 && (scaleXMultiplier === scaleYMultiplier)) {
      transformParts.push(`scale(${scaleMultiplier.toFixed(4)})`);
    } else if (scaleXMultiplier !== 1.0 || scaleYMultiplier !== 1.0) {
      transformParts.push(`scale(${scaleXMultiplier.toFixed(4)}, ${scaleYMultiplier.toFixed(4)})`);
    }
    if (rotationOffset !== 0) {
      transformParts.push(`rotate(${rotationOffset.toFixed(2)}deg)`);
    }

    return {
      filterStr,
      transformStr: transformParts.join(' '),
      opacityMultiplier,
      transformOffsetX: 0,
      transformOffsetY: 0,
      scaleMultiplier,
      scaleXMultiplier,
      scaleYMultiplier,
      rotationOffset,
      motionBlurPx: 0,
      distortionOverlayCss,
      lightingOverlayCss: '',
      radialGlowCss: '',
      chromaticOffsetPx
    };
  }
}

export const distortionFXEngine = DistortionFXEngine.getInstance();
