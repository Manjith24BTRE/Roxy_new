// src/components/editor-main-screen/tools/effects/engines/glitchDigital/GlitchDigitalEngine.ts
import { GLITCH_DIGITAL_PRESETS, GlitchDigitalPreset } from './glitchDigitalPresets';
import {
  deterministicSeededNoise,
  blockNoise,
  clamp,
  calculateRgbSplitOffsets
} from './glitchDigitalUtils';

export interface GlitchDigitalResult {
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
  scanlineStyleStr?: string;
  glitchOverlayCss?: string;
  splitOffsetR?: { x: number; y: number };
  splitOffsetB?: { x: number; y: number };
}

export interface GlitchDigitalEngineContext {
  clipWidth?: number;
  clipHeight?: number;
  timelineTime?: number; // In seconds
}

export class GlitchDigitalEngine {
  private static instance: GlitchDigitalEngine;

  public static getInstance(): GlitchDigitalEngine {
    if (!GlitchDigitalEngine.instance) {
      GlitchDigitalEngine.instance = new GlitchDigitalEngine();
    }
    return GlitchDigitalEngine.instance;
  }

  /**
   * Resolves preset metadata from Effect ID, exact Excel name, or preset key.
   */
  public getPreset(effectIdOrName: number | string): GlitchDigitalPreset | null {
    if (typeof effectIdOrName === 'number') {
      return GLITCH_DIGITAL_PRESETS[effectIdOrName] || null;
    }

    const numId = parseInt(effectIdOrName, 10);
    if (!isNaN(numId) && GLITCH_DIGITAL_PRESETS[numId]) {
      return GLITCH_DIGITAL_PRESETS[numId];
    }

    const targetStr = String(effectIdOrName).trim().toLowerCase();
    const match = Object.values(GLITCH_DIGITAL_PRESETS).find(
      (p) =>
        p.name.trim().toLowerCase() === targetStr ||
        p.presetKey.trim().toLowerCase() === targetStr
    );
    return match || null;
  }

  /**
   * Computes deterministic non-destructive glitch state for an effect at a given progress/time and intensity.
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
    overrideParams: Partial<GlitchDigitalPreset> = {},
    context: GlitchDigitalEngineContext = {}
  ): GlitchDigitalResult {
    // Default neutral state
    const neutralResult: GlitchDigitalResult = {
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

    const preset: GlitchDigitalPreset = { ...basePreset, ...overrideParams };

    // Strict single-boundary intensity normalization
    const normIntensity = rawIntensity > 1.0 ? clamp(rawIntensity / 100, 0, 1) : clamp(rawIntensity, 0, 1);

    // At intensity = 0, return neutral state immediately
    if (normIntensity === 0) {
      return neutralResult;
    }

    const time = context.timelineTime ?? rawProgress;
    const seed = preset.seed ?? 42;

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
    let scanlineStyleStr = '';
    let glitchOverlayCss = '';
    let splitOffsetR: { x: number; y: number } | undefined;
    let splitOffsetB: { x: number; y: number } | undefined;

    switch (preset.type) {
      case 'rgbSplit': {
        const offsetPx = (preset.rgbOffset ?? 12) * normIntensity;
        const dir = preset.direction ?? 0;
        const blend = clamp(preset.blend ?? 0.8, 0, 1) * normIntensity;

        const splits = calculateRgbSplitOffsets(offsetPx, dir);
        splitOffsetR = splits.r;
        splitOffsetB = splits.b;

        // CSS drop shadow approximation for RGB separation
        const rx = splits.r.x.toFixed(1);
        const ry = splits.r.y.toFixed(1);
        const bx = splits.b.x.toFixed(1);
        const by = splits.b.y.toFixed(1);
        filterStr = `drop-shadow(${rx}px ${ry}px 0 rgba(255,0,0,${blend.toFixed(2)})) drop-shadow(${bx}px ${by}px 0 rgba(0,0,255,${blend.toFixed(2)}))`;
        break;
      }

      case 'digitalGlitch': {
        const freq = preset.frequency ?? 5.0;
        const blockSize = preset.blockSize ?? 30;

        // Intermittent block jitter driven by timeline time and seed
        const glitchTrigger = deterministicSeededNoise(time * freq, seed);
        if (Math.abs(glitchTrigger) > 0.3) {
          const jitterX = deterministicSeededNoise(time * freq * 1.5, seed + 1) * blockSize * normIntensity;
          const jitterY = deterministicSeededNoise(time * freq * 1.5, seed + 2) * (blockSize * 0.3) * normIntensity;

          transformOffsetX = jitterX;
          transformOffsetY = jitterY;
          transformStr = `translate(${jitterX.toFixed(1)}px, ${jitterY.toFixed(1)}px)`;

          if (Math.abs(glitchTrigger) > 0.7) {
            filterStr = `hue-rotate(${(glitchTrigger * 90).toFixed(0)}deg) contrast(${1.0 + Math.abs(glitchTrigger) * 0.5})`;
          }
        }
        break;
      }

      case 'dataCorruption': {
        const amount = (preset.corruptionAmount ?? 0.7) * normIntensity;
        const speed = preset.speed ?? 4.0;

        const noiseVal = deterministicSeededNoise(time * speed, seed + 10);
        if (Math.abs(noiseVal) > 0.2) {
          const shiftX = noiseVal * 40 * amount;
          const shiftY = deterministicSeededNoise(time * speed, seed + 20) * 15 * amount;

          transformOffsetX = shiftX;
          transformOffsetY = shiftY;
          transformStr = `translate(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px)`;
          filterStr = `invert(${(Math.abs(noiseVal) * 0.3 * amount).toFixed(2)}) contrast(${(1.0 + amount * 0.8).toFixed(2)})`;
        }
        break;
      }

      case 'signalLoss': {
        const sigStrength = preset.signalStrength ?? 0.8;
        const flicker = preset.flicker ?? 0.6;
        const freq = preset.frequency ?? 3.0;

        // Signal degradation & brightness flicker wave
        const flickerWave = Math.sin(time * freq * Math.PI * 2);
        const noiseDrop = deterministicSeededNoise(time * freq * 3, seed + 30);

        if (noiseDrop < -0.4) {
          const dropFactor = 0.3 + 0.7 * (1.0 - (Math.abs(noiseDrop) * flicker * normIntensity));
          opacityMultiplier = clamp(dropFactor, 0.1, 1.0);
          filterStr = `grayscale(${(0.5 * normIntensity).toFixed(2)}) brightness(${(0.7 + 0.3 * flickerWave).toFixed(2)})`;
        } else {
          filterStr = `brightness(${(1.0 + 0.1 * flickerWave * normIntensity).toFixed(2)})`;
        }
        break;
      }

      case 'screenTear': {
        const speed = preset.speed ?? 6.0;
        const tearSize = preset.tearSize ?? 20;

        const tearTrigger = deterministicSeededNoise(time * speed, seed + 40);
        if (Math.abs(tearTrigger) > 0.4) {
          const tearOffset = tearTrigger * tearSize * 2 * normIntensity;
          transformOffsetX = tearOffset;
          transformStr = `translate(${tearOffset.toFixed(1)}px, 0px)`;
        }
        break;
      }

      case 'pixelSort': {
        const amount = (preset.amount ?? 1.0) * normIntensity;
        const length = preset.length ?? 150;
        const dir = preset.direction ?? 90;

        // Directional pixel streak scale simulation
        const scaleFactor = 1.0 + (length / 500) * amount;
        if (dir === 90 || dir === 270) {
          scaleYMultiplier = scaleFactor;
          transformStr = `scaleY(${scaleFactor.toFixed(3)})`;
        } else {
          scaleXMultiplier = scaleFactor;
          transformStr = `scaleX(${scaleFactor.toFixed(3)})`;
        }
        filterStr = `contrast(${(1.0 + 0.4 * amount).toFixed(2)})`;
        break;
      }

      case 'pixelStretch': {
        const dist = (preset.stretchDistance ?? 200) * normIntensity;
        const dir = preset.direction ?? 0;

        const stretchFactor = 1.0 + dist / 300;
        if (dir === 90 || dir === 270) {
          scaleYMultiplier = stretchFactor;
          transformStr = `scaleY(${stretchFactor.toFixed(3)})`;
        } else {
          scaleXMultiplier = stretchFactor;
          transformStr = `scaleX(${stretchFactor.toFixed(3)})`;
        }
        break;
      }

      case 'pixelExplosion': {
        const speed = preset.speed ?? 2.5;
        const expSize = (preset.explosionSize ?? 100) * normIntensity;

        // Radial fragment expansion driven by speed and time
        const expProgress = clamp(Math.abs(Math.sin(time * speed)), 0, 1);
        const currentExp = expProgress * expSize;

        scaleMultiplier = 1.0 + (currentExp / 300);
        scaleXMultiplier = scaleMultiplier;
        scaleYMultiplier = scaleMultiplier;

        const rotJitter = deterministicSeededNoise(time * speed, seed + 50) * 5 * normIntensity;
        rotationOffset = rotJitter;

        transformStr = `scale(${scaleMultiplier.toFixed(3)}) rotate(${rotJitter.toFixed(2)}deg)`;
        filterStr = `blur(${(expProgress * 3 * normIntensity).toFixed(1)}px)`;
        break;
      }

      case 'tvStatic': {
        const opacity = (preset.opacity ?? 0.6) * normIntensity;
        const flicker = preset.flicker ?? 0.5;

        // Temporal CRT flicker opacity variation
        const flickerVal = deterministicSeededNoise(time * 18, seed + 60);
        const curOpacity = clamp(opacity * (1.0 + flickerVal * flicker * 0.3), 0, 1);

        filterStr = `contrast(${(1.0 + 0.3 * curOpacity).toFixed(2)}) brightness(${(0.9 + 0.2 * Math.abs(flickerVal)).toFixed(2)})`;
        glitchOverlayCss = `rgba(255, 255, 255, ${(curOpacity * 0.15).toFixed(2)})`;
        break;
      }

      case 'scanLines': {
        const op = (preset.opacity ?? 0.4) * normIntensity;
        const spacing = preset.spacing ?? 6.0;
        const thickness = preset.lineThickness ?? 2.0;

        scanlineStyleStr = `repeating-linear-gradient(to bottom, transparent 0px, transparent ${(spacing - thickness).toFixed(1)}px, rgba(0,0,0,${op.toFixed(2)}) ${(spacing - thickness).toFixed(1)}px, rgba(0,0,0,${op.toFixed(2)}) ${spacing.toFixed(1)}px)`;
        filterStr = `brightness(${(1.0 - 0.1 * op).toFixed(2)})`;
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
      scanlineStyleStr,
      glitchOverlayCss,
      splitOffsetR,
      splitOffsetB
    };
  }
}

export const glitchDigitalEngine = GlitchDigitalEngine.getInstance();
