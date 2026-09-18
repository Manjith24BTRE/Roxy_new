// src/components/editor-main-screen/tools/effects/engines/transformAttention/TransformAttentionEngine.ts
import { TRANSFORM_ATTENTION_PRESETS, TransformAttentionPreset } from './transformAttentionPresets';
import { smoothPseudoNoise, lerp, clamp, calculatePivotOffset } from './transformAttentionUtils';

export interface TransformAttentionResult {
  transformOffsetX: number;
  transformOffsetY: number;
  scaleMultiplier: number;
  scaleXMultiplier: number;
  scaleYMultiplier: number;
  rotationOffset: number;
  opacityMultiplier: number;
  motionBlurPx: number;
  transformStr: string;
  filterStr: string;
}

export interface TransformEngineContext {
  clipWidth?: number;
  clipHeight?: number;
  baseScale?: number;
  baseRotation?: number;
  basePosX?: number;
  basePosY?: number;
}

export class TransformAttentionEngine {
  private static instance: TransformAttentionEngine;

  public static getInstance(): TransformAttentionEngine {
    if (!TransformAttentionEngine.instance) {
      TransformAttentionEngine.instance = new TransformAttentionEngine();
    }
    return TransformAttentionEngine.instance;
  }

  /**
   * Resolves preset metadata from Effect ID, exact Excel name, or preset key.
   */
  public getPreset(effectIdOrName: number | string): TransformAttentionPreset | null {
    if (typeof effectIdOrName === 'number') {
      return TRANSFORM_ATTENTION_PRESETS[effectIdOrName] || null;
    }

    const numId = parseInt(effectIdOrName, 10);
    if (!isNaN(numId) && TRANSFORM_ATTENTION_PRESETS[numId]) {
      return TRANSFORM_ATTENTION_PRESETS[numId];
    }

    const targetStr = String(effectIdOrName).trim().toLowerCase();
    const match = Object.values(TRANSFORM_ATTENTION_PRESETS).find(
      (p) =>
        p.name.trim().toLowerCase() === targetStr ||
        p.presetKey.trim().toLowerCase() === targetStr
    );
    return match || null;
  }

  /**
   * Evaluates deterministic temporary rendering transform for Effects 11–20.
   */
  public evaluateEffect(
    effectIdOrName: number | string,
    rawProgress: number,
    rawIntensity: number = 1.0,
    overrideParams: Partial<TransformAttentionPreset> = {},
    context: TransformEngineContext = {}
  ): TransformAttentionResult {
    const neutralResult: TransformAttentionResult = {
      transformOffsetX: 0,
      transformOffsetY: 0,
      scaleMultiplier: 1.0,
      scaleXMultiplier: 1.0,
      scaleYMultiplier: 1.0,
      rotationOffset: 0,
      opacityMultiplier: 1.0,
      motionBlurPx: 0,
      transformStr: '',
      filterStr: ''
    };

    const basePreset = this.getPreset(effectIdOrName);
    if (!basePreset) {
      return neutralResult;
    }

    const preset: TransformAttentionPreset = { ...basePreset, ...overrideParams };

    // Strict single-boundary intensity normalization
    const normIntensity = rawIntensity > 1.0 ? clamp(rawIntensity / 100, 0, 1) : clamp(rawIntensity, 0, 1);

    if (normIntensity === 0) {
      return neutralResult;
    }

    const progress = clamp(rawProgress, 0, 1);

    let transformOffsetX = 0;
    let transformOffsetY = 0;
    let scaleMultiplier = 1.0;
    let scaleXMultiplier = 1.0;
    let scaleYMultiplier = 1.0;
    let rotationOffset = 0;
    let opacityMultiplier = 1.0;
    let motionBlurPx = 0;

    switch (preset.type) {
      case 'shakeIn': {
        const damping = preset.damping ?? 5.5;
        const decay = progress >= 1.0 ? 0 : Math.exp(-damping * progress) * (1.0 - progress);
        const str = (preset.strength ?? 35) * normIntensity * decay;
        const freq = preset.frequency ?? 18;

        transformOffsetX = smoothPseudoNoise(progress, freq, 101) * str;
        transformOffsetY = smoothPseudoNoise(progress, freq * 1.3, 202) * str * 0.7;
        rotationOffset = smoothPseudoNoise(progress, freq * 0.8, 303) * (preset.rotation ?? 12) * normIntensity * decay;
        break;
      }

      case 'zoomBounce': {
        const zoomTarget = preset.zoom ?? 1.4;
        const speed = preset.speed ?? 4.0;
        const damping = preset.damping ?? 3.0;
        const bounceAmount = preset.bounce ?? 0.35;

        // Damped spring oscillation overshooting initially
        const bounceOffset = bounceAmount * Math.exp(-damping * progress) * Math.sin(progress * speed * Math.PI);
        const animScale = lerp(1.0, zoomTarget, progress) + bounceOffset;
        scaleMultiplier = lerp(1.0, animScale, normIntensity);
        break;
      }

      case 'pulse': {
        const speed = preset.speed ?? 1.0;
        const phase = preset.phase ?? 0;
        const scaleRange = preset.scaleRange ?? 0.15;

        const pulseWave = Math.sin(progress * speed * 2 * Math.PI + phase);
        scaleMultiplier = 1.0 + pulseWave * scaleRange * normIntensity;
        break;
      }

      case 'popIn': {
        const startScale = preset.startScale ?? 0.1;
        const endScale = preset.endScale ?? 1.0;
        // Cubic ease out
        const p = progress - 1;
        const easedProgress = p * p * p + 1;
        const animScale = lerp(startScale, endScale, easedProgress);
        scaleMultiplier = lerp(1.0, animScale, normIntensity);
        break;
      }

      case 'popOut': {
        const startScale = preset.startScale ?? 1.0;
        const endScale = preset.endScale ?? 0.0;
        // Cubic ease in
        const easedProgress = progress * progress * progress;
        const animScale = lerp(startScale, endScale, easedProgress);
        scaleMultiplier = lerp(1.0, animScale, normIntensity);
        break;
      }

      case 'expand': {
        const targetX = preset.scaleX ?? 1.5;
        const targetY = preset.scaleY ?? 1.15;
        // Ease out
        const eased = progress * (2 - progress);
        const animX = lerp(1.0, targetX, eased);
        const animY = lerp(1.0, targetY, eased);
        scaleXMultiplier = lerp(1.0, animX, normIntensity);
        scaleYMultiplier = lerp(1.0, animY, normIntensity);
        break;
      }

      case 'collapse': {
        const targetX = preset.scaleX ?? 0.0;
        const targetY = preset.scaleY ?? 0.0;
        // Ease in
        const eased = progress * progress;
        const animX = lerp(1.0, targetX, eased);
        const animY = lerp(1.0, targetY, eased);
        scaleXMultiplier = lerp(1.0, animX, normIntensity);
        scaleYMultiplier = lerp(1.0, animY, normIntensity);
        break;
      }

      case 'swing': {
        const swingAngle = (preset.swingAngle ?? 25) * normIntensity;
        const speed = preset.speed ?? 3.0;
        const damping = preset.damping ?? 2.0;
        const decay = Math.exp(-damping * progress);

        const rotAngle = swingAngle * Math.sin(progress * speed * 2 * Math.PI) * decay;
        const pivotOffset = calculatePivotOffset(
          rotAngle,
          preset.pivotX ?? 0.5,
          preset.pivotY ?? 0.0,
          context.clipWidth ?? 1920,
          context.clipHeight ?? 1080
        );

        transformOffsetX = pivotOffset.offsetX;
        transformOffsetY = pivotOffset.offsetY;
        rotationOffset = rotAngle;
        break;
      }

      case 'bounce': {
        const height = (preset.bounceHeight ?? 180) * normIntensity;
        const freq = preset.frequency ?? 4.0;
        const damping = preset.damping ?? 3.0;
        const decay = Math.exp(-damping * progress);

        const yWave = Math.abs(Math.sin(progress * freq * Math.PI)) * decay;
        transformOffsetY = -height * yWave;
        break;
      }

      case 'wiggle': {
        const freq = preset.frequency ?? 8.0;
        const speed = preset.speed ?? 6.0;
        const str = (preset.strength ?? 25) * normIntensity;

        transformOffsetX = Math.sin(progress * freq * speed * Math.PI) * str;
        rotationOffset = Math.sin(progress * freq * speed * Math.PI + Math.PI / 4) * (preset.rotation ?? 6) * normIntensity;
        break;
      }
    }

    const transforms: string[] = [];
    if (transformOffsetX !== 0 || transformOffsetY !== 0) {
      transforms.push(`translate(${transformOffsetX.toFixed(1)}px, ${transformOffsetY.toFixed(1)}px)`);
    }
    if (scaleMultiplier !== 1.0 || scaleXMultiplier !== 1.0 || scaleYMultiplier !== 1.0) {
      const finalX = scaleMultiplier * scaleXMultiplier;
      const finalY = scaleMultiplier * scaleYMultiplier;
      transforms.push(`scale(${finalX.toFixed(3)}, ${finalY.toFixed(3)})`);
    }
    if (rotationOffset !== 0) {
      transforms.push(`rotate(${rotationOffset.toFixed(2)}deg)`);
    }

    const transformStr = transforms.join(' ');
    const filterStr = motionBlurPx > 0 ? `blur(${motionBlurPx.toFixed(1)}px)` : '';

    return {
      transformOffsetX,
      transformOffsetY,
      scaleMultiplier,
      scaleXMultiplier,
      scaleYMultiplier,
      rotationOffset,
      opacityMultiplier,
      motionBlurPx,
      transformStr,
      filterStr
    };
  }
}

export const transformAttentionEngine = TransformAttentionEngine.getInstance();
