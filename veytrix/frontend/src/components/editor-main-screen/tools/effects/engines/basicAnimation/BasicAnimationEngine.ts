// src/components/editor-main-screen/tools/effects/engines/basicAnimation/BasicAnimationEngine.ts
import { BASIC_ANIMATION_PRESETS, BasicAnimationPreset } from './basicAnimationPresets';
import { getEasingValue, lerp, clamp } from './basicAnimationUtils';

export interface AnimationResult {
  transformOffsetX: number;
  transformOffsetY: number;
  scaleMultiplier: number;
  scaleXMultiplier?: number;
  scaleYMultiplier?: number;
  rotationOffset: number;
  opacityMultiplier: number;
  motionBlurPx: number;
  transformStr: string;
  filterStr: string;
}

export interface AnimationEngineContext {
  clipWidth?: number;
  clipHeight?: number;
  baseScale?: number;
  baseRotation?: number;
  basePosX?: number;
  basePosY?: number;
}

export class BasicAnimationEngine {
  private static instance: BasicAnimationEngine;

  public static getInstance(): BasicAnimationEngine {
    if (!BasicAnimationEngine.instance) {
      BasicAnimationEngine.instance = new BasicAnimationEngine();
    }
    return BasicAnimationEngine.instance;
  }

  /**
   * Resolves preset metadata from Effect ID, exact Excel name, or preset key.
   */
  public getPreset(effectIdOrName: number | string): BasicAnimationPreset | null {
    if (typeof effectIdOrName === 'number') {
      return BASIC_ANIMATION_PRESETS[effectIdOrName] || null;
    }

    const numId = parseInt(effectIdOrName, 10);
    if (!isNaN(numId) && BASIC_ANIMATION_PRESETS[numId]) {
      return BASIC_ANIMATION_PRESETS[numId];
    }

    const targetStr = String(effectIdOrName).trim().toLowerCase();
    const match = Object.values(BASIC_ANIMATION_PRESETS).find(
      (p) =>
        p.name.trim().toLowerCase() === targetStr ||
        p.presetKey.trim().toLowerCase() === targetStr
    );
    return match || null;
  }

  /**
   * Computes deterministic non-destructive transform state for an effect at a given progress and intensity.
   *
   * @param effectIdOrName ID or exact Excel name of effect
   * @param rawProgress Normalized time progress [0.0 - 1.0]
   * @param rawIntensity Raw intensity (supports 0.0-1.0 or 0-100%)
   * @param overrideParams Optional param overrides (speed, duration, distance, etc.)
   * @param context Optional clip transform context
   */
  public evaluateEffect(
    effectIdOrName: number | string,
    rawProgress: number,
    rawIntensity: number = 1.0,
    overrideParams: Partial<BasicAnimationPreset> = {},
    context: AnimationEngineContext = {}
  ): AnimationResult {
    // Default neutral state
    const neutralResult: AnimationResult = {
      transformOffsetX: 0,
      transformOffsetY: 0,
      scaleMultiplier: 1.0,
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

    const preset: BasicAnimationPreset = { ...basePreset, ...overrideParams };

    // Strict single-boundary intensity normalization
    const normIntensity = rawIntensity > 1.0 ? clamp(rawIntensity / 100, 0, 1) : clamp(rawIntensity, 0, 1);

    // If intensity is 0, return neutral state immediately
    if (normIntensity === 0) {
      return neutralResult;
    }

    // Normalized progress [0.0 - 1.0]
    const progress = clamp(rawProgress, 0, 1);
    const easedProgress = getEasingValue(preset.easing, progress);

    let transformOffsetX = 0;
    let transformOffsetY = 0;
    let scaleMultiplier = 1.0;
    let rotationOffset = 0;
    let opacityMultiplier = 1.0;
    let motionBlurPx = 0;

    switch (preset.type) {
      case 'fadeIn': {
        const startOp = preset.startOpacity ?? 0.0;
        const endOp = preset.endOpacity ?? 1.0;
        const animOpacity = lerp(startOp, endOp, easedProgress);
        opacityMultiplier = lerp(1.0, animOpacity, normIntensity);
        break;
      }

      case 'fadeOut': {
        const startOp = preset.startOpacity ?? 1.0;
        const endOp = preset.endOpacity ?? 0.0;
        const animOpacity = lerp(startOp, endOp, easedProgress);
        opacityMultiplier = lerp(1.0, animOpacity, normIntensity);
        break;
      }

      case 'zoomIn': {
        const targetZoom = preset.zoomAmount ?? 1.5;
        const animScale = lerp(1.0, targetZoom, easedProgress);
        scaleMultiplier = lerp(1.0, animScale, normIntensity);

        // Center X / Y anchor shift calculation
        const cx = preset.centerX ?? 0.5;
        const cy = preset.centerY ?? 0.5;
        const width = context.clipWidth ?? 1920;
        const height = context.clipHeight ?? 1080;
        if (cx !== 0.5 || cy !== 0.5) {
          transformOffsetX = (0.5 - cx) * (scaleMultiplier - 1.0) * width * 0.5;
          transformOffsetY = (0.5 - cy) * (scaleMultiplier - 1.0) * height * 0.5;
        }
        break;
      }

      case 'zoomOut': {
        const initialZoom = preset.zoomAmount ?? 1.5;
        const animScale = lerp(initialZoom, 1.0, easedProgress);
        scaleMultiplier = lerp(1.0, animScale, normIntensity);
        break;
      }

      case 'spin': {
        const totalAngle = (preset.rotationAngle ?? 360) * (preset.direction ?? 1);
        const animAngle = totalAngle * easedProgress;
        rotationOffset = animAngle * normIntensity;

        if (preset.motionBlur && preset.motionBlur > 0) {
          const speedFactor = Math.abs(Math.sin(progress * Math.PI));
          motionBlurPx = preset.motionBlur * 12 * speedFactor * normIntensity;
        }
        break;
      }

      case 'drop': {
        const dist = preset.distance ?? 400;
        // Bounce ease brings Y from -dist to 0
        const animOffsetY = lerp(-dist, 0, easedProgress);
        transformOffsetY = animOffsetY * normIntensity;
        break;
      }

      case 'moveLeft': {
        const dist = preset.distance ?? 400;
        // Starts at +dist (shifted right) and moves left to 0
        const animOffsetX = dist * (1.0 - easedProgress);
        transformOffsetX = animOffsetX * normIntensity;
        break;
      }

      case 'moveRight': {
        const dist = preset.distance ?? 400;
        // Starts at -dist (shifted left) and moves right to 0
        const animOffsetX = -dist * (1.0 - easedProgress);
        transformOffsetX = animOffsetX * normIntensity;
        break;
      }

      case 'moveUp': {
        const dist = preset.distance ?? 300;
        // Starts at +dist (shifted down) and moves up to 0
        const animOffsetY = dist * (1.0 - easedProgress);
        transformOffsetY = animOffsetY * normIntensity;
        break;
      }

      case 'moveDown': {
        const dist = preset.distance ?? 300;
        // Starts at -dist (shifted up) and moves down to 0
        const animOffsetY = -dist * (1.0 - easedProgress);
        transformOffsetY = animOffsetY * normIntensity;
        break;
      }
    }

    // Build CSS strings
    const transforms: string[] = [];
    if (transformOffsetX !== 0 || transformOffsetY !== 0) {
      transforms.push(`translate(${transformOffsetX.toFixed(1)}px, ${transformOffsetY.toFixed(1)}px)`);
    }
    if (scaleMultiplier !== 1.0) {
      transforms.push(`scale(${scaleMultiplier.toFixed(3)})`);
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
      rotationOffset,
      opacityMultiplier,
      motionBlurPx,
      transformStr,
      filterStr
    };
  }
}

export const basicAnimationEngine = BasicAnimationEngine.getInstance();
