// src/components/editor-main-screen/tools/transitions/engines/camera/cameraTransitionUtils.ts

/**
 * Clamps progress strictly within [0.0, 1.0].
 * Prevents NaN, Infinity, and out-of-bound overflow.
 */
export function clampProgress(progress: number): number {
  if (isNaN(progress) || !isFinite(progress)) return 0;
  return Math.max(0, Math.min(1, progress));
}

/**
 * Computes eased progress based on curve type.
 */
export function easedProgress(progress: number, easingType: string = 'linear'): number {
  const p = clampProgress(progress);

  switch (easingType) {
    case 'smoothstep':
      return p * p * (3 - 2 * p);
    case 'sine':
      return 0.5 - 0.5 * Math.cos(p * Math.PI);
    case 'bounce': {
      // Bounded spring bounce curve
      if (p < 0.5) {
        return Math.sin((p / 0.5) * Math.PI * 0.75) * 1.2;
      }
      return 1.0 + Math.sin(((p - 0.5) / 0.5) * Math.PI * 2) * 0.15 * (1 - p);
    }
    case 'linear':
    default:
      return p;
  }
}

/**
 * Deterministic pseudo-random noise generator using sine waves and fixed phase offset.
 * NEVER uses Math.random() to guarantee timeline seeking determinism.
 */
export function deterministicNoise(t: number, phaseOffset: number = 0): number {
  return (
    Math.sin(t * 12.9898 + phaseOffset * 78.233) * 0.5 +
    Math.sin(t * 43.1415 - phaseOffset * 23.414) * 0.3 +
    Math.sin(t * 115.723 + phaseOffset * 91.171) * 0.2
  );
}

/**
 * Computes organic handheld wobble for translation and rotation.
 */
export function deterministicHandheld(
  progress: number,
  amplitude: number = 15.0,
  frequency: number = 8.0
): { dx: number; dy: number; drot: number } {
  const p = clampProgress(progress);
  const t = p * frequency;

  const dx = deterministicNoise(t, 1.0) * amplitude;
  const dy = deterministicNoise(t, 2.0) * amplitude;
  const drot = deterministicNoise(t, 3.0) * 2.5;

  return { dx, dy, drot };
}

/**
 * Computes intense camera vibration shake with exponential decay towards bounds.
 * Envelope is exactly 0 at progress = 0 and progress = 1.
 */
export function deterministicShake(
  progress: number,
  amplitude: number = 28.0,
  frequency: number = 24.0,
  decayFactor: number = 2.5
): { dx: number; dy: number; drot: number; intensityPeak: number } {
  const p = clampProgress(progress);
  const mid = 0.5;

  // Envelope peaking at mid-point (0.5) with exact 0 at boundaries (0.0 and 1.0)
  const distFromMid = Math.abs(p - mid) * 2; // 0 at mid, 1 at ends
  const rawEnv = Math.exp(-distFromMid * decayFactor);
  const minEnv = Math.exp(-decayFactor);
  const envelope = Math.max(0, (rawEnv - minEnv) / (1 - minEnv));

  const t = p * frequency;
  const dx = Math.sin(t * Math.PI * 2) * amplitude * envelope;
  const dy = Math.cos(t * Math.PI * 2.3 + 1.2) * amplitude * envelope;
  const drot = Math.sin(t * Math.PI * 1.7 + 2.1) * 4.0 * envelope;

  return { dx, dy, drot, intensityPeak: envelope };
}

/**
 * Composes a clean 2D/3D CSS transform string.
 */
export function composeTransform(
  txPx: number,
  tyPx: number,
  scaleVal: number,
  rotDeg: number,
  rotYDeg: number = 0,
  perspectivePx?: number
): string {
  const parts: string[] = [];
  if (perspectivePx && perspectivePx > 0) {
    parts.push(`perspective(${perspectivePx.toFixed(0)}px)`);
  }
  if (Math.abs(txPx) > 0.01 || Math.abs(tyPx) > 0.01) {
    parts.push(`translate(${txPx.toFixed(2)}px, ${tyPx.toFixed(2)}px)`);
  }
  // Include scale whenever scaleVal differs from 1.0
  if (Math.abs(scaleVal - 1.0) > 0.0001) {
    parts.push(`scale(${scaleVal.toFixed(4)})`);
  }
  if (Math.abs(rotDeg) > 0.01) {
    parts.push(`rotate(${rotDeg.toFixed(2)}deg)`);
  }
  if (Math.abs(rotYDeg) > 0.01) {
    parts.push(`rotateY(${rotYDeg.toFixed(2)}deg)`);
  }
  return parts.join(' ');
}

export interface CameraTransitionState {
  outgoingOpacity: number;
  incomingOpacity: number;
  outgoingFilter: string;
  incomingFilter: string;
  outgoingTransform: string;
  incomingTransform: string;
  overlayColor?: string;
  overlayOpacity?: number;
  renderMode: string;
}

