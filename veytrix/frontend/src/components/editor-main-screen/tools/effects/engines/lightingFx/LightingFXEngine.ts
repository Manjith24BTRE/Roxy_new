// src/components/editor-main-screen/tools/effects/engines/lightingFx/LightingFXEngine.ts

import { LIGHTING_FX_PRESETS, LightingFXPreset } from './lightingFxPresets';
import {
  clamp,
  hexToRgb,
  lightFlicker,
  bloom,
  glow,
  directionalGradient,
  lightMask,
  deterministicSeededNoise
} from './lightingFxUtils';

export interface LightingFXResult {
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
}

export interface LightingFXEngineContext {
  clipWidth?: number;
  clipHeight?: number;
  timelineTime?: number; // In seconds
}

export class LightingFXEngine {
  private static instance: LightingFXEngine;

  public static getInstance(): LightingFXEngine {
    if (!LightingFXEngine.instance) {
      LightingFXEngine.instance = new LightingFXEngine();
    }
    return LightingFXEngine.instance;
  }

  /**
   * Resolves preset metadata from Effect ID, exact Excel name, or preset key.
   * Handles alias lookups for exact Excel and PDF naming parity.
   */
  public getPreset(effectIdOrName: number | string): LightingFXPreset | null {
    if (typeof effectIdOrName === 'number') {
      return LIGHTING_FX_PRESETS[effectIdOrName] || null;
    }

    const numId = parseInt(effectIdOrName, 10);
    if (!isNaN(numId) && LIGHTING_FX_PRESETS[numId]) {
      return LIGHTING_FX_PRESETS[numId];
    }

    const targetStr = String(effectIdOrName).trim().toLowerCase();

    // Alias lookups for Excel & friendly strings
    let searchStr = targetStr;
    if (targetStr === 'sun glow') searchStr = 'sun glow';
    if (targetStr === 'fill light') searchStr = 'fill light';

    const match = Object.values(LIGHTING_FX_PRESETS).find(
      (p) =>
        p.name.trim().toLowerCase() === searchStr ||
        p.presetKey.trim().toLowerCase() === searchStr ||
        p.name.trim().toLowerCase() === targetStr
    );
    return match || null;
  }

  /**
   * Computes deterministic non-destructive lighting state for an effect at a given progress/time and intensity.
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
    overrideParams: Partial<LightingFXPreset> = {},
    context: LightingFXEngineContext = {}
  ): LightingFXResult {
    // Default neutral state
    const neutralResult: LightingFXResult = {
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
      radialGlowCss: ''
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

    const preset: LightingFXPreset = { ...basePreset, ...overrideParams };
    const time = context.timelineTime ?? rawProgress * 5.0;

    let filterParts: string[] = [];
    let lightingOverlayCss = '';
    let radialGlowCss = '';
    let scaleMultiplier = 1.0;
    let opacityMultiplier = 1.0;

    switch (preset.type) {
      case 'sunGlow': {
        // 71. Sun GLow - Warm golden sun bloom emanating from upper corner
        const pColor = preset.color || '#ffcc66';
        const pRadius = (preset.radius || 0.65) * 100;
        const pBright = 1.0 + (preset.brightness || 1.2 - 1.0) * intensity;

        filterParts.push(`brightness(${pBright.toFixed(2)})`);
        filterParts.push(`sepia(${(0.15 * intensity).toFixed(2)})`);

        radialGlowCss = bloom(pColor, intensity * (preset.glow || 0.8), pRadius);
        break;
      }

      case 'sunRays': {
        // 72. Sun Rays - Volumetric light rays with subtle deterministic flicker
        const pColor = preset.color || '#fff2cc';
        const flickerVal = lightFlicker(72, time, preset.flicker || 0.2);
        const rayAngle = preset.angle || 135;
        const pBright = 1.0 + 0.18 * intensity * flickerVal;

        filterParts.push(`brightness(${pBright.toFixed(2)})`);
        filterParts.push(`contrast(${(1.0 + 0.08 * intensity).toFixed(2)})`);

        lightingOverlayCss = directionalGradient(pColor, rayAngle, intensity * flickerVal * 0.5);
        break;
      }

      case 'godRays': {
        // 73. God Rays - Dramatic crepuscular crevice rays piercing downwards
        const pColor = preset.color || '#ffffff';
        const pBright = 1.0 + (preset.brightness || 1.3 - 1.0) * intensity;
        const beamAngle = preset.angle || 90;

        filterParts.push(`brightness(${pBright.toFixed(2)})`);
        filterParts.push(`contrast(${(1.0 + 0.15 * intensity).toFixed(2)})`);

        const rgb = hexToRgb(pColor);
        const alpha = (0.35 * intensity).toFixed(2);
        lightingOverlayCss = `linear-gradient(${beamAngle}deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha}) 0%, transparent 80%)`;
        break;
      }

      case 'spotlight': {
        // 74. Spotlight - Focused light beam with dimmed surroundings
        const pColor = preset.color || '#ffffff';
        const pRadius = (preset.radius || 0.45) * 100;
        const pDim = (preset.dim || 0.5) * intensity;
        const rgb = hexToRgb(pColor);

        filterParts.push(`brightness(${(1.0 + 0.1 * intensity).toFixed(2)})`);

        // Vignette dimming + spot highlight
        const alphaSpot = (0.4 * intensity).toFixed(2);
        const alphaDim = pDim.toFixed(2);
        radialGlowCss = `radial-gradient(circle at 50% 40%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaSpot}) 0%, rgba(0,0,0,${alphaDim}) ${pRadius}%)`;
        break;
      }

      case 'studioLight': {
        // 75. Studio Light - Balanced key & fill illumination
        const keyRgb = hexToRgb(preset.keyColor || '#fffaed');
        const fillRgb = hexToRgb(preset.fillColor || '#e3f2fd');
        const pBright = 1.0 + 0.12 * intensity;

        filterParts.push(`brightness(${pBright.toFixed(2)})`);
        filterParts.push(`contrast(${(1.0 + 0.05 * intensity).toFixed(2)})`);

        const keyAlpha = (0.2 * intensity).toFixed(2);
        const fillAlpha = (0.15 * intensity).toFixed(2);
        lightingOverlayCss = `linear-gradient(135deg, rgba(${keyRgb.r}, ${keyRgb.g}, ${keyRgb.b}, ${keyAlpha}) 0%, rgba(${fillRgb.r}, ${fillRgb.g}, ${fillRgb.b}, ${fillAlpha}) 100%)`;
        break;
      }

      case 'ringLight': {
        // 76. Ring Light - Soft circular halo lighting around center
        const pColor = preset.color || '#ffffff';
        const rgb = hexToRgb(pColor);
        const innerPct = (preset.innerRadius || 0.3) * 100;
        const outerPct = (preset.outerRadius || 0.55) * 100;
        const pBright = 1.0 + 0.15 * intensity;

        filterParts.push(`brightness(${pBright.toFixed(2)})`);

        const ringAlpha = (0.4 * intensity).toFixed(2);
        radialGlowCss = `radial-gradient(circle at 50% 50%, transparent ${innerPct}%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${ringAlpha}) ${(innerPct + outerPct) / 2}%, transparent ${outerPct}%)`;
        break;
      }

      case 'fillLight': {
        // 77. FIll Light - Ambient shadow lift & subtle warmth
        const pColor = preset.color || '#f0f4f8';
        const shadowLift = (preset.shadowLift || 0.4) * intensity;
        const pBright = 1.0 + 0.1 * intensity;

        filterParts.push(`brightness(${pBright.toFixed(2)})`);
        filterParts.push(`contrast(${(1.0 - 0.1 * shadowLift).toFixed(2)})`);
        if ((preset.warmth || 0.2) > 0) {
          filterParts.push(`sepia(${(0.08 * intensity).toFixed(2)})`);
        }

        lightingOverlayCss = directionalGradient(pColor, 0, intensity * 0.15);
        break;
      }

      case 'rimLight': {
        // 78. Rim Light - High-contrast edge backlight glow
        const pColor = preset.color || '#00d2ff';
        const edgePx = (preset.edgeWidth || 15) * intensity;

        filterParts.push(glow(pColor, intensity * (preset.glow || 0.7), edgePx));
        filterParts.push(`contrast(${(1.0 + 0.1 * intensity).toFixed(2)})`);
        break;
      }

      case 'neonGlow': {
        // 79. Neon Glow - Vibrant electric pink/cyan drop-shadow & pulsating glow
        const pColor = preset.color || '#ff007f';
        const pulsateVal = 1.0 + (preset.pulsate || 0.3) * (deterministicSeededNoise(79, time * 3.0) - 0.5);
        const pBright = 1.0 + (preset.brightness || 1.4 - 1.0) * intensity * pulsateVal;
        const bloomPx = (preset.bloomRadius || 20) * intensity * pulsateVal;

        filterParts.push(`brightness(${pBright.toFixed(2)})`);
        filterParts.push(`saturate(${(1.0 + 0.4 * intensity).toFixed(2)})`);
        filterParts.push(glow(pColor, intensity, bloomPx));
        break;
      }

      case 'volumetricLight': {
        // 80. Volumetric Light - 3D atmospheric light fog & distance falloff
        const pColor = preset.color || '#fff5e6';
        const rgb = hexToRgb(pColor);
        const pBright = 1.0 + (preset.brightness || 1.25 - 1.0) * intensity;

        filterParts.push(`brightness(${pBright.toFixed(2)})`);
        filterParts.push(`contrast(${(1.0 + 0.06 * intensity).toFixed(2)})`);

        const vAlpha1 = (0.35 * intensity).toFixed(2);
        const vAlpha2 = (0.05 * intensity).toFixed(2);
        radialGlowCss = `radial-gradient(ellipse at 50% 10%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${vAlpha1}) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${vAlpha2}) 70%, transparent 100%)`;
        break;
      }
    }

    const filterStr = filterParts.join(' ').trim();

    return {
      filterStr,
      transformStr: scaleMultiplier !== 1.0 ? `scale(${scaleMultiplier.toFixed(4)})` : '',
      opacityMultiplier,
      transformOffsetX: 0,
      transformOffsetY: 0,
      scaleMultiplier,
      scaleXMultiplier: scaleMultiplier,
      scaleYMultiplier: scaleMultiplier,
      rotationOffset: 0,
      motionBlurPx: 0,
      lightingOverlayCss,
      radialGlowCss
    };
  }
}

export const lightingFXEngine = LightingFXEngine.getInstance();
