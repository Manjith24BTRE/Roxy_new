// src/components/editor-main-screen/tools/transitions/engines/spin/spinTransitionUtils.ts
import { SpinTransitionDefinition } from './spinTransitionPresets';

export interface SpinTransitionState {
  outgoingOpacity: number;
  incomingOpacity: number;
  outgoingFilter: string;
  incomingFilter: string;
  outgoingTransform: string;
  incomingTransform: string;
  outgoingTransformOrigin?: string;
  incomingTransformOrigin?: string;
  renderMode: string;
  overlayColor?: string;
  overlayOpacity?: number;
}

export function clampProgress(p: number): number {
  if (Number.isNaN(p) || !Number.isFinite(p)) return 0;
  return Math.max(0, Math.min(1, p));
}

export function easedProgress(p: number, easing: SpinTransitionDefinition['easing']): number {
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
 * Computes CSS transform string for 2D/3D Spin transitions deterministically.
 */
export function computeSpinTransform(
  def: SpinTransitionDefinition,
  progress: number,
  isIncoming: boolean
): string {
  const p = clampProgress(progress);
  const perspective = def.perspectivePx || 800;
  const rotStart = def.rotationStartDeg;
  const rotEnd = def.rotationEndDeg;

  let currentAngle = 0;
  let currentScale = 1.0;

  const peakScale = def.peakScale ?? 1.0;
  // Parabolic scale modulation based on sin curve (midpoint peak scale factor)
  const scaleModulation = 1.0 + (peakScale - 1.0) * Math.sin(p * Math.PI);

  if (!isIncoming) {
    currentAngle = rotStart + p * (rotEnd - rotStart);
    currentScale = Math.max(0.001, scaleModulation);
  } else {
    // Incoming rotates into view from opposite offset
    currentAngle = -rotEnd * (1 - p);
    currentScale = Math.max(0.001, scaleModulation);
  }

  const axisX = def.axisX ?? 0;
  const axisY = def.axisY ?? 0;
  const axisZ = def.axisZ ?? 1;

  if (axisX === 0 && axisY === 0) {
    // Standard Z rotation
    return `perspective(${perspective}px) rotate(${currentAngle.toFixed(2)}deg) scale(${currentScale.toFixed(4)})`;
  } else {
    // 3D axis rotation
    return `perspective(${perspective}px) rotate3d(${axisX}, ${axisY}, ${axisZ}, ${currentAngle.toFixed(2)}deg) scale(${currentScale.toFixed(4)})`;
  }
}

/**
 * Computes 3D Flip transforms around Y-axis.
 */
export function compute3DFlipTransform(
  progress: number,
  isIncoming: boolean,
  perspectivePx: number = 800
): { transform: string; opacity: number } {
  const p = clampProgress(progress);

  if (!isIncoming) {
    const rotY = p * 180;
    const opacity = p < 0.5 ? 1 : 0;
    return {
      transform: `perspective(${perspectivePx}px) rotateY(${rotY.toFixed(2)}deg)`,
      opacity,
    };
  } else {
    const rotY = -180 + p * 180;
    const opacity = p >= 0.5 ? 1 : 0;
    return {
      transform: `perspective(${perspectivePx}px) rotateY(${rotY.toFixed(2)}deg)`,
      opacity,
    };
  }
}

/**
 * Computes Page Flip transforms anchored at left center.
 */
export function computePageFlipTransform(
  progress: number,
  isIncoming: boolean,
  perspectivePx: number = 1000
): { transform: string; opacity: number; origin: string } {
  const p = clampProgress(progress);
  const origin = 'left center';

  if (!isIncoming) {
    const rotY = -p * 180;
    const opacity = p < 0.5 ? 1 : 0;
    return {
      transform: `perspective(${perspectivePx}px) rotateY(${rotY.toFixed(2)}deg)`,
      opacity,
      origin,
    };
  } else {
    const rotY = 180 - p * 180;
    const opacity = p >= 0.5 ? 1 : 0;
    return {
      transform: `perspective(${perspectivePx}px) rotateY(${rotY.toFixed(2)}deg)`,
      opacity,
      origin,
    };
  }
}

/**
 * Computes Cylinder Rotate transforms.
 */
export function computeCylinderRotateTransform(
  progress: number,
  isIncoming: boolean,
  perspectivePx: number = 1200
): { transform: string; opacity: number } {
  const p = clampProgress(progress);

  if (!isIncoming) {
    const rotY = p * 90;
    const shiftX = -p * 50;
    const scale = 1.0 - p * 0.15;
    return {
      transform: `perspective(${perspectivePx}px) translateX(${shiftX.toFixed(2)}%) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
      opacity: 1 - p,
    };
  } else {
    const rotY = -90 + p * 90;
    const shiftX = 50 - p * 50;
    const scale = 0.85 + p * 0.15;
    return {
      transform: `perspective(${perspectivePx}px) translateX(${shiftX.toFixed(2)}%) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
      opacity: p,
    };
  }
}

/**
 * Computes Portal SPin transforms (spiral collapse and expansion from center).
 */
export function computePortalSpinTransform(
  progress: number,
  isIncoming: boolean,
  perspectivePx: number = 600
): { transform: string; opacity: number } {
  const p = clampProgress(progress);

  if (!isIncoming) {
    if (p >= 0.5) {
      return {
        transform: `perspective(${perspectivePx}px) rotate(-720deg) scale(0)`,
        opacity: 0,
      };
    }
    const subP = p * 2; // 0 to 1 over first half
    const rotZ = -720 * subP;
    const scale = 1.0 - subP;
    return {
      transform: `perspective(${perspectivePx}px) rotate(${rotZ.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
      opacity: 1,
    };
  } else {
    if (p < 0.5) {
      return {
        transform: `perspective(${perspectivePx}px) rotate(-720deg) scale(0)`,
        opacity: 0,
      };
    }
    const subP = (p - 0.5) * 2; // 0 to 1 over second half
    const rotZ = -720 * (1 - subP);
    const scale = subP;
    return {
      transform: `perspective(${perspectivePx}px) rotate(${rotZ.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
      opacity: 1,
    };
  }
}
