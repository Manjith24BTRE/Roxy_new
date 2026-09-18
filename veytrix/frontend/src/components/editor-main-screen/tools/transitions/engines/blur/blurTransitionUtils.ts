// src/components/editor-main-screen/tools/transitions/engines/blur/blurTransitionUtils.ts
import { BlurTransitionDefinition } from './blurTransitionPresets';

export interface BlurTransitionState {
  outgoingOpacity: number;
  incomingOpacity: number;
  outgoingFilter: string;
  incomingFilter: string;
  outgoingTransform: string;
  incomingTransform: string;
  outgoingTransformOrigin?: string;
  incomingTransformOrigin?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  renderMode: string;
}

export function clampProgress(p: number): number {
  if (Number.isNaN(p) || !Number.isFinite(p)) return 0;
  return Math.max(0, Math.min(1, p));
}

export function easedProgress(p: number, easing: BlurTransitionDefinition['easing']): number {
  const clampedP = clampProgress(p);
  switch (easing) {
    case 'linear':
      return clampedP;
    case 'ease-in-out':
      return clampedP < 0.5
        ? 2 * clampedP * clampedP
        : 1 - Math.pow(-2 * clampedP + 2, 2) / 2;
    case 'ease-out':
      return 1 - Math.pow(1 - clampedP, 3);
    case 'cubic-bezier':
    default:
      return clampedP * clampedP * (3 - 2 * clampedP);
  }
}

/**
 * Calculates current frame blur radius in pixels deterministically.
 * Uses a sine bell curve over progress [0, 1] so progress=0 and progress=1 yield 0px blur.
 */
export function calculateBlurAmount(
  maxRadiusPx: number,
  progress: number,
  intensity: number = 1.0
): number {
  const p = clampProgress(progress);
  const clampedIntensity = Math.max(0, Math.min(1.0, intensity));
  const bellCurve = Math.sin(p * Math.PI);
  return bellCurve * maxRadiusPx * clampedIntensity;
}

/**
 * Computes deterministic Blur transition state for rendering.
 * NEVER accumulates blur across frames.
 */
export function computeBlurState(
  def: BlurTransitionDefinition,
  rawProgress: number,
  intensity: number = 1.0
): BlurTransitionState {
  const p = clampProgress(rawProgress);
  const pEased = easedProgress(p, def.easing);

  const blurRadius = calculateBlurAmount(def.maxRadiusPx, pEased, intensity);
  const blurPx = blurRadius.toFixed(1);
  const hasBlur = parseFloat(blurPx) > 0.1;

  let outgoingOpacity = 1 - pEased;
  let incomingOpacity = pEased;
  let outgoingFilter = '';
  let incomingFilter = '';
  let outgoingTransform = '';
  let incomingTransform = '';
  let outgoingTransformOrigin = 'center center';
  let incomingTransformOrigin = 'center center';
  let overlayColor: string | undefined = undefined;
  let overlayOpacity: number | undefined = undefined;

  switch (def.mode) {
    case 'motion-blur': {
      if (hasBlur) {
        outgoingFilter = `blur(${blurPx}px)`;
        incomingFilter = `blur(${blurPx}px)`;
      }
      // Velocity motion stretch along direction
      const stretch = (1.0 + 0.18 * Math.sin(pEased * Math.PI)).toFixed(4);
      outgoingTransform = `scaleX(${stretch})`;
      incomingTransform = `scaleX(${stretch})`;
      break;
    }

    case 'gaussian-blur': {
      if (hasBlur) {
        outgoingFilter = `blur(${blurPx}px)`;
        incomingFilter = `blur(${blurPx}px)`;
      }
      break;
    }

    case 'directional-blur': {
      if (hasBlur) {
        outgoingFilter = `blur(${blurPx}px)`;
        incomingFilter = `blur(${blurPx}px)`;
      }
      const dirDeg = def.directionDeg || 45;
      const shiftX = (Math.cos((dirDeg * Math.PI) / 180) * blurRadius * 0.4).toFixed(2);
      const shiftY = (Math.sin((dirDeg * Math.PI) / 180) * blurRadius * 0.4).toFixed(2);
      if (Math.abs(parseFloat(shiftX)) > 0.1 || Math.abs(parseFloat(shiftY)) > 0.1) {
        outgoingTransform = `translate(${shiftX}px, ${shiftY}px)`;
        incomingTransform = `translate(${-parseFloat(shiftX)}px, ${-parseFloat(shiftY)}px)`;
      }
      break;
    }

    case 'radial-blur': {
      if (hasBlur) {
        outgoingFilter = `blur(${blurPx}px)`;
        incomingFilter = `blur(${blurPx}px)`;
      }
      const radialScaleOut = (1.0 + 0.12 * Math.sin(pEased * Math.PI)).toFixed(4);
      outgoingTransform = `scale(${radialScaleOut})`;
      incomingTransform = `scale(${radialScaleOut})`;
      const fx = ((def.focalPointX || 0.5) * 100).toFixed(1);
      const fy = ((def.focalPointY || 0.5) * 100).toFixed(1);
      outgoingTransformOrigin = `${fx}% ${fy}%`;
      incomingTransformOrigin = `${fx}% ${fy}%`;
      break;
    }

    case 'lens-blur': {
      if (hasBlur) {
        outgoingFilter = `blur(${blurPx}px) contrast(110%)`;
        incomingFilter = `blur(${blurPx}px) contrast(110%)`;
      }
      break;
    }

    case 'broken-blur': {
      if (hasBlur) {
        outgoingFilter = `blur(${blurPx}px) contrast(125%) brightness(110%)`;
        incomingFilter = `blur(${blurPx}px) contrast(125%) brightness(110%)`;
      }
      break;
    }

    case 'blur-flash': {
      if (hasBlur) {
        outgoingFilter = `blur(${blurPx}px) brightness(115%)`;
        incomingFilter = `blur(${blurPx}px) brightness(115%)`;
      }
      const flashPeak = (def.flashIntensity || 0.85) * Math.sin(pEased * Math.PI);
      if (flashPeak > 0.05) {
        overlayColor = '#ffffff';
        overlayOpacity = flashPeak;
      }
      break;
    }

    case 'blur-stretch': {
      if (hasBlur) {
        outgoingFilter = `blur(${blurPx}px)`;
        incomingFilter = `blur(${blurPx}px)`;
      }
      const stretchFactor = (1.0 + ((def.stretchScale || 1.45) - 1.0) * Math.sin(pEased * Math.PI)).toFixed(4);
      outgoingTransform = `scaleX(${stretchFactor})`;
      incomingTransform = `scaleX(${stretchFactor})`;
      break;
    }

    case 'blur-tunnel': {
      if (hasBlur) {
        outgoingFilter = `blur(${blurPx}px)`;
        incomingFilter = `blur(${blurPx}px)`;
      }
      const tunnelZoomFactor = def.tunnelZoom || 2.2;
      const zoomOut = (1.0 + (tunnelZoomFactor - 1.0) * pEased).toFixed(4);
      const zoomIn = (0.5 + 0.5 * pEased).toFixed(4);
      outgoingTransform = `scale(${zoomOut})`;
      incomingTransform = `scale(${zoomIn})`;
      break;
    }

    case 'cinematic-blur': {
      if (hasBlur) {
        outgoingFilter = `blur(${blurPx}px) brightness(105%)`;
        incomingFilter = `blur(${blurPx}px) brightness(105%)`;
      }
      const bloomPeak = (def.flashIntensity || 0.25) * Math.sin(pEased * Math.PI);
      if (bloomPeak > 0.05) {
        overlayColor = '#fff6e5'; // Subtle warm cinematic bloom glow
        overlayOpacity = bloomPeak;
      }
      break;
    }
  }

  return {
    outgoingOpacity,
    incomingOpacity,
    outgoingFilter,
    incomingFilter,
    outgoingTransform,
    incomingTransform,
    outgoingTransformOrigin,
    incomingTransformOrigin,
    overlayColor,
    overlayOpacity,
    renderMode: def.mode,
  };
}
