// src/components/editor-main-screen/tools/transitions/engines/slide/slideTransitionUtils.ts

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
    case 'linear':
    default:
      return p;
  }
}

/**
 * Generates translation transform for standard slide movement.
 */
export function computeSlideTransform(
  dirX: number,
  dirY: number,
  progress: number,
  isIncoming: boolean,
  distancePct: number = 100.0
): string {
  const p = clampProgress(progress);

  let txPct = 0;
  let tyPct = 0;

  if (!isIncoming) {
    // Outgoing clip moves from (0, 0) to (dirX * distancePct, dirY * distancePct)
    txPct = dirX * distancePct * p;
    tyPct = dirY * distancePct * p;
  } else {
    // Incoming clip moves from (-dirX * distancePct, -dirY * distancePct) to (0, 0)
    txPct = -dirX * distancePct * (1 - p);
    tyPct = -dirY * distancePct * (1 - p);
  }

  if (Math.abs(txPct) < 0.01 && Math.abs(tyPct) < 0.01) {
    return '';
  }

  return `translate(${txPct.toFixed(2)}%, ${tyPct.toFixed(2)}%)`;
}

/**
 * Generates translation transform for Push interaction (contiguous block motion with zero gap).
 */
export function computePushTransform(
  dirX: number,
  dirY: number,
  progress: number,
  isIncoming: boolean,
  distancePct: number = 100.0
): string {
  const p = clampProgress(progress);

  let txPct = 0;
  let tyPct = 0;

  if (!isIncoming) {
    // Outgoing clip is pushed out
    txPct = dirX * distancePct * p;
    tyPct = dirY * distancePct * p;
  } else {
    // Incoming clip pushes in synchronously
    txPct = -dirX * distancePct * (1 - p);
    tyPct = -dirY * distancePct * (1 - p);
  }

  if (Math.abs(txPct) < 0.01 && Math.abs(tyPct) < 0.01) {
    return '';
  }

  return `translate(${txPct.toFixed(2)}%, ${tyPct.toFixed(2)}%)`;
}

/**
 * Generates 3D perspective push transform with depth scaling and tilt.
 */
export function computePerspectivePushTransform(
  progress: number,
  isIncoming: boolean,
  perspectivePx = 800
): string {
  const p = clampProgress(progress);

  if (!isIncoming) {
    const tx = -100 * p;
    const scale = 1.0 - 0.15 * p; // Scale down 1.0 -> 0.85
    const rotY = -15 * p;
    return `perspective(${perspectivePx}px) translate(${tx.toFixed(2)}%, 0) scale(${scale.toFixed(4)}) rotateY(${rotY.toFixed(2)}deg)`;
  } else {
    const tx = 100 * (1 - p);
    const scale = 0.85 + 0.15 * p; // Scale up 0.85 -> 1.0
    const rotY = 15 * (1 - p);
    return `perspective(${perspectivePx}px) translate(${tx.toFixed(2)}%, 0) scale(${scale.toFixed(4)}) rotateY(${rotY.toFixed(2)}deg)`;
  }
}

export interface SlideTransitionState {
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
