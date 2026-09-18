// src/components/editor-main-screen/tools/effects/engines/motionCamera/MotionCameraEngine.ts
import { MOTION_CAMERA_PRESETS, MotionCameraPreset } from './motionCameraPresets';
import {
  deterministicNoise,
  smoothCameraNoise,
  lerp,
  clamp,
  calculatePerspectiveScale,
  whipPanVelocity
} from './motionCameraUtils';
import { getEasingValue } from '../basicAnimation/basicAnimationUtils';

export interface MotionCameraResult {
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

export interface MotionCameraEngineContext {
  clipWidth?: number;
  clipHeight?: number;
  baseScale?: number;
  baseRotation?: number;
  basePosX?: number;
  basePosY?: number;
  timelineTime?: number; // In seconds
}

export class MotionCameraEngine {
  private static instance: MotionCameraEngine;

  public static getInstance(): MotionCameraEngine {
    if (!MotionCameraEngine.instance) {
      MotionCameraEngine.instance = new MotionCameraEngine();
    }
    return MotionCameraEngine.instance;
  }

  /**
   * Resolves preset metadata from Effect ID, exact Excel name, or preset key.
   */
  public getPreset(effectIdOrName: number | string): MotionCameraPreset | null {
    if (typeof effectIdOrName === 'number') {
      return MOTION_CAMERA_PRESETS[effectIdOrName] || null;
    }

    const numId = parseInt(effectIdOrName, 10);
    if (!isNaN(numId) && MOTION_CAMERA_PRESETS[numId]) {
      return MOTION_CAMERA_PRESETS[numId];
    }

    const targetStr = String(effectIdOrName).trim().toLowerCase();
    const match = Object.values(MOTION_CAMERA_PRESETS).find(
      (p) =>
        p.name.trim().toLowerCase() === targetStr ||
        p.presetKey.trim().toLowerCase() === targetStr
    );
    return match || null;
  }

  /**
   * Computes deterministic non-destructive transform state for an effect at a given progress/time and intensity.
   *
   * @param effectIdOrName ID or exact Excel name of effect
   * @param rawProgress Normalized progress [0.0 - 1.0] or continuous time
   * @param rawIntensity Raw intensity (supports 0.0-1.0 or 0-100%)
   * @param overrideParams Optional param overrides
   * @param context Optional clip transform context
   */
  public evaluateEffect(
    effectIdOrName: number | string,
    rawProgress: number,
    rawIntensity: number = 1.0,
    overrideParams: Partial<MotionCameraPreset> = {},
    context: MotionCameraEngineContext = {}
  ): MotionCameraResult {
    // Default neutral state
    const neutralResult: MotionCameraResult = {
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

    const preset: MotionCameraPreset = { ...basePreset, ...overrideParams };

    // Strict single-boundary intensity normalization
    const normIntensity = rawIntensity > 1.0 ? clamp(rawIntensity / 100, 0, 1) : clamp(rawIntensity, 0, 1);

    // At intensity = 0, return neutral state immediately
    if (normIntensity === 0) {
      return neutralResult;
    }

    // Determine current timeline time or progress
    const time = context.timelineTime ?? rawProgress * (preset.duration ?? 1.0);
    const progress = clamp(rawProgress, 0, 1);
    const easedProgress = getEasingValue(preset.easing || 'linear', progress);

    let transformOffsetX = 0;
    let transformOffsetY = 0;
    let scaleMultiplier = 1.0;
    let rotationOffset = 0;
    let opacityMultiplier = 1.0;
    let motionBlurPx = 0;

    const width = context.clipWidth ?? 1920;
    const height = context.clipHeight ?? 1080;

    switch (preset.type) {
      case 'handheldCamera': {
        const strength = preset.shakeStrength ?? 15;
        const speed = preset.speed ?? 1.5;
        const smoothness = Math.max(0.1, preset.smoothness ?? 2.0);
        const maxRot = preset.rotation ?? 2.5;

        // Smooth correlated procedural motion driven by timeline time
        const sampleFreq = speed / smoothness;
        const nx = smoothCameraNoise(time, sampleFreq, 10);
        const ny = smoothCameraNoise(time, sampleFreq, 20);
        const nr = smoothCameraNoise(time, sampleFreq * 0.8, 30);

        transformOffsetX = nx * strength * normIntensity;
        transformOffsetY = ny * strength * normIntensity;
        rotationOffset = nr * maxRot * normIntensity;
        break;
      }

      case 'cameraShake': {
        const frequency = preset.frequency ?? 14.0;
        const dirX = preset.directionX ?? 1.0;
        const dirY = preset.directionY ?? 0.3;
        const len = Math.hypot(dirX, dirY) || 1.0;
        const ndx = dirX / len;
        const ndy = dirY / len;

        const baseStrength = (preset.shakeStrength ?? 25) * (preset.intensity ?? 1.0);
        const oscillation = Math.sin(time * frequency * 2 * Math.PI);

        transformOffsetX = ndx * oscillation * baseStrength * normIntensity;
        transformOffsetY = ndy * oscillation * baseStrength * normIntensity;

        if (preset.motionBlur && preset.motionBlur > 0) {
          const velocity = Math.abs(Math.cos(time * frequency * 2 * Math.PI));
          motionBlurPx = preset.motionBlur * 10.0 * velocity * normIntensity;
        }
        break;
      }

      case 'microShake': {
        const speed = preset.speed ?? 2.0;
        const smoothness = Math.max(0.1, preset.smoothness ?? 3.0);
        const strength = (preset.shakeStrength ?? 6) * (preset.intensity ?? 0.6);

        const sampleFreq = speed / smoothness;
        const nx = smoothCameraNoise(time, sampleFreq, 101);
        const ny = smoothCameraNoise(time, sampleFreq, 202);

        transformOffsetX = nx * strength * normIntensity;
        transformOffsetY = ny * strength * normIntensity;
        break;
      }

      case 'heavyShake': {
        const frequency = preset.frequency ?? 22.0;
        const strength = (preset.shakeStrength ?? 45) * (preset.intensity ?? 1.0);
        const maxRot = preset.rotation ?? 8.0;

        const nx = deterministicNoise(time * frequency, 11);
        const ny = deterministicNoise(time * frequency, 22);
        const nr = deterministicNoise(time * frequency, 33);

        transformOffsetX = nx * strength * normIntensity;
        transformOffsetY = ny * strength * normIntensity;
        rotationOffset = nr * maxRot * normIntensity;

        if (preset.motionBlur && preset.motionBlur > 0) {
          motionBlurPx = preset.motionBlur * 16.0 * normIntensity;
        }
        break;
      }

      case 'crashZoom': {
        const speed = preset.speed ?? 4.5;
        const targetZoom = preset.zoomAmount ?? 0.8;
        const cx = preset.centerX ?? 0.5;
        const cy = preset.centerY ?? 0.5;

        // Rapid acceleration curve: progress^2 * speed factor
        const accelProgress = clamp(Math.pow(progress, 1.8) * (speed / 3.0), 0, 1);
        const zoomDelta = targetZoom * accelProgress * normIntensity;
        scaleMultiplier = 1.0 + zoomDelta;

        if (cx !== 0.5 || cy !== 0.5) {
          transformOffsetX = (0.5 - cx) * (scaleMultiplier - 1.0) * width * 0.5;
          transformOffsetY = (0.5 - cy) * (scaleMultiplier - 1.0) * height * 0.5;
        }

        if (preset.motionBlur && preset.motionBlur > 0) {
          const vel = Math.abs(2.0 * progress * speed);
          motionBlurPx = preset.motionBlur * 8.0 * vel * normIntensity;
        }
        break;
      }

      case 'smoothZoom': {
        const targetZoom = preset.zoomAmount ?? 0.4;
        const cx = preset.centerX ?? 0.5;
        const cy = preset.centerY ?? 0.5;

        const zoomDelta = targetZoom * easedProgress * normIntensity;
        scaleMultiplier = 1.0 + zoomDelta;

        if (cx !== 0.5 || cy !== 0.5) {
          transformOffsetX = (0.5 - cx) * (scaleMultiplier - 1.0) * width * 0.5;
          transformOffsetY = (0.5 - cy) * (scaleMultiplier - 1.0) * height * 0.5;
        }
        break;
      }

      case 'dollyIn': {
        const dist = preset.distance ?? 0.5;
        const persp = preset.perspective ?? 0.6;
        const zFactor = dist * easedProgress;

        // Camera moves closer: z decreases in camera space, scale increases
        const pScale = calculatePerspectiveScale(-zFactor, persp);
        scaleMultiplier = 1.0 + (pScale - 1.0) * normIntensity;
        break;
      }

      case 'dollyOut': {
        const dist = preset.distance ?? 0.5;
        const persp = preset.perspective ?? 0.6;
        const zFactor = dist * easedProgress;

        // Camera moves away: z increases in camera space, scale decreases
        const pScale = calculatePerspectiveScale(zFactor, persp);
        scaleMultiplier = 1.0 + (pScale - 1.0) * normIntensity;
        break;
      }

      case 'whipPanLeft': {
        const amount = preset.amount ?? 500;
        const speed = preset.speed ?? 6.0;
        const dir = -1.0; // Left movement

        const vel = whipPanVelocity(progress, speed);
        // Fast horizontal translation
        const moveDist = dir * amount * easedProgress;
        transformOffsetX = moveDist * normIntensity;

        if (preset.motionBlur && preset.motionBlur > 0) {
          motionBlurPx = preset.motionBlur * 25.0 * vel * normIntensity;
        }
        break;
      }

      case 'whipPanRight': {
        const amount = preset.amount ?? 500;
        const speed = preset.speed ?? 6.0;
        const dir = 1.0; // Right movement

        const vel = whipPanVelocity(progress, speed);
        const moveDist = dir * amount * easedProgress;
        transformOffsetX = moveDist * normIntensity;

        if (preset.motionBlur && preset.motionBlur > 0) {
          motionBlurPx = preset.motionBlur * 25.0 * vel * normIntensity;
        }
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

export const motionCameraEngine = MotionCameraEngine.getInstance();
