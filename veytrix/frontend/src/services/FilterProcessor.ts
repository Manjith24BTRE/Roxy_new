// src/services/FilterProcessor.ts
import { getCinematicFilterPreset, CinematicFilterAdjustmentSpec } from '../components/editor-main-screen/tools/filters/cinematic';
import { getToneAdjustmentPreset } from '../components/editor-main-screen/tools/filters/engines/toneAdjustment/toneAdjustmentPresets';
import { ClipAdjustments, getDefaultClipAdjustments } from '../types/assetInteraction';

export interface ProcessedFilterParameters {
  brightness: number;
  contrast: number;
  exposure: number;
  saturation: number;
  hue: number;
  temperature: number;
  tint: number;
  highlights: number;
  shadows: number;
  fade: number;
  grain: number;
  bloom: number;
  clarity: number;
  skinProtectionActive: boolean;
  resolutionGrainActive: boolean;
  hdrRecoveryActive: boolean;
  tealOrangeSplitActive: boolean;
  warmHighlightToningActive: boolean;
  coolShadowToningActive: boolean;
  moodyGradingActive: boolean;
  dreamBloomActive: boolean;
  vintageEmulationActive: boolean;
}

export class FilterProcessor {
  private static instance: FilterProcessor;

  private constructor() {}

  public static getInstance(): FilterProcessor {
    if (!FilterProcessor.instance) {
      FilterProcessor.instance = new FilterProcessor();
    }
    return FilterProcessor.instance;
  }

  /**
   * Processes a filter preset and intensity into linearly interpolated parameter values.
   */
  public process(
    filterId: string | number | null,
    intensity: number = 100, // 0 to 100 or 0.0 to 1.0
    customAdjustments?: ClipAdjustments,
    targetWidth: number = 1920,
    targetHeight: number = 1080
  ): ProcessedFilterParameters {
    const normIntensity = intensity > 1.0 ? Math.min(100, Math.max(0, intensity)) / 100 : Math.min(1.0, Math.max(0, intensity));
    const preset = filterId ? getCinematicFilterPreset(filterId) : null;
    const tonePreset = !preset && filterId ? getToneAdjustmentPreset(filterId) : null;

    const spec: CinematicFilterAdjustmentSpec = preset?.adjustments || (tonePreset ? {
      exposure: (tonePreset.params.exposure || 0) * 100,
      contrast: (tonePreset.params.contrast || 0) * 100,
      brightness: (tonePreset.params.brightness || 0) * 100,
      saturation: (tonePreset.params.saturation || 0) * 100,
      highlights: (tonePreset.params.highlights || 0) * 100,
      shadows: (tonePreset.params.shadows || 0) * 100,
      temperature: (tonePreset.params.temperature || 0) * 100,
      clarity: (tonePreset.params.clarity || 0) * 100,
      fade: (tonePreset.params.fade || 0) * 100,
    } : {});

    const custom = customAdjustments || getDefaultClipAdjustments();

    // Linear Interpolation: scaledValue = rawValue * normIntensity
    const exposure = (spec.exposure ?? 0) * normIntensity + custom.exposure;
    const contrast = (spec.contrast ?? 0) * normIntensity + custom.contrast;
    const brightness = (spec.brightness ?? 0) * normIntensity + custom.brightness;
    const saturation = (spec.saturation ?? 0) * normIntensity + custom.saturation;
    const hue = (spec.hue ?? 0) * normIntensity + custom.hue;
    const temperature = (spec.temperature ?? 0) * normIntensity + custom.temperature;
    const tint = (spec.tint ?? 0) * normIntensity + custom.tint;
    const rawHighlights = (spec.highlights ?? 0) * normIntensity + custom.highlights;
    const rawShadows = (spec.shadows ?? 0) * normIntensity + custom.shadows;
    const fade = (spec.fade ?? 0) * normIntensity + custom.fade;
    const rawGrain = (spec.grain ?? 0) * normIntensity + custom.grain;
    const bloom = (spec.bloom ?? 0) * normIntensity;
    const clarity = (spec.clarity ?? 0) * normIntensity + custom.clarity;

    // Feature 1: Skin Protection math
    const skinProtectionActive = !!spec.skinProtection;
    let finalHue = hue;
    let finalSat = saturation;
    if (skinProtectionActive) {
      // Protect skin hue band (15° to 50°) by damping extreme hue shifts and preserving skin warmth
      finalHue = hue * 0.45;
      finalSat = saturation > 0 ? saturation * 0.85 : saturation;
    }

    // Feature 2: Resolution-aware Grain math
    const resolutionGrainActive = !!spec.resolutionGrain;
    let finalGrain = rawGrain;
    if (resolutionGrainActive && targetWidth > 0) {
      // Scale grain size proportionally to resolution (1080p baseline factor)
      const resFactor = Math.sqrt((targetWidth * targetHeight) / (1920 * 1080));
      finalGrain = Math.min(100, rawGrain * Math.max(0.5, resFactor));
    }

    // Feature 3: Highlight / Shadow Recovery math
    const hdrRecoveryActive = !!spec.hdrRecovery;
    let finalHighlights = rawHighlights;
    let finalShadows = rawShadows;
    if (hdrRecoveryActive) {
      // Dynamic S-curve recovery compression for HDR Film
      finalHighlights = rawHighlights < 0 ? rawHighlights * 1.2 : rawHighlights * 0.8;
      finalShadows = rawShadows > 0 ? rawShadows * 1.25 : rawShadows * 0.85;
    }

    const tealOrangeSplitActive = !!spec.tealOrangeSplit;
    const warmHighlightToningActive = !!spec.warmHighlightToning;
    const coolShadowToningActive = !!spec.coolShadowToning;
    const moodyGradingActive = !!spec.moodyGrading;
    const dreamBloomActive = !!spec.dreamBloom;
    const vintageEmulationActive = !!spec.vintageEmulation;

    return {
      brightness,
      contrast,
      exposure,
      saturation: finalSat,
      hue: finalHue,
      temperature,
      tint,
      highlights: finalHighlights,
      shadows: finalShadows,
      fade,
      grain: finalGrain,
      bloom,
      clarity,
      skinProtectionActive,
      resolutionGrainActive,
      hdrRecoveryActive,
      tealOrangeSplitActive,
      warmHighlightToningActive,
      coolShadowToningActive,
      moodyGradingActive,
      dreamBloomActive,
      vintageEmulationActive,
    };
  }

  /**
   * Converts processed filter parameters into a live CSS filter string for immediate preview rendering.
   */
  public toCSSFilterString(params: ProcessedFilterParameters): string {
    const brightnessVal = 1.0 + (params.brightness / 100) + (params.exposure / 100) * 0.4;
    const contrastVal = 1.0 + (params.contrast / 100) + (params.clarity / 100) * 0.2;
    const saturationVal = Math.max(0, 1.0 + (params.saturation / 100));
    let hueVal = (params.hue + params.tint) * 0.5;
    if (params.tealOrangeSplitActive) {
      // Split toning shift: cyan/teal in shadows combined with subtle orange highlights
      hueVal = -10.0 * (1.0 + params.shadows / 100);
    } else if (params.warmHighlightToningActive) {
      // Warm amber highlight shift with soft magenta protection
      hueVal = 2.0 * (1.0 + (params.temperature / 100));
    } else if (params.coolShadowToningActive) {
      // Cool blue-cyan shadow toning shift (-15° hue rotation)
      hueVal = -15.0 * (Math.abs(params.temperature) / 10);
    } else if (params.moodyGradingActive) {
      // Subtle cool green-teal shadow bias with neutral midtones (-4° hue rotation)
      hueVal = -4.0 * (1.0 + Math.abs(params.shadows) / 50);
    } else if (params.dreamBloomActive) {
      // Soft warm pastel highlight shift (+1.5° hue rotation)
      hueVal = 1.5 * (1.0 + params.temperature / 10);
    } else if (params.vintageEmulationActive) {
      // Kodak 1970s warm film tone shift (+3.0° hue rotation)
      hueVal = 3.0 * (1.0 + params.temperature / 10);
    }
    const sepiaVal = Math.min(1.0, Math.max(0, (params.temperature > 0 ? params.temperature * 0.015 : 0) + (params.fade / 100) * 0.3));

    const parts: string[] = [];
    if (brightnessVal !== 1.0) parts.push(`brightness(${brightnessVal.toFixed(3)})`);
    if (contrastVal !== 1.0) parts.push(`contrast(${contrastVal.toFixed(3)})`);
    if (saturationVal !== 1.0) parts.push(`saturate(${saturationVal.toFixed(3)})`);
    if (hueVal !== 0) parts.push(`hue-rotate(${hueVal.toFixed(1)}deg)`);
    if (sepiaVal > 0) parts.push(`sepia(${sepiaVal.toFixed(3)})`);

    return parts.length > 0 ? parts.join(' ') : 'none';
  }
}

export const filterProcessor = FilterProcessor.getInstance();
