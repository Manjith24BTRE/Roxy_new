export function getSpeedFactor(speed?: number): number {
  return (speed ?? 50) / 50;
}

export function getIntensityFactor(intensity?: number): number {
  return (intensity ?? 100) / 100;
}

export function generateRGBSplitFilter(splitPx: number, opacity = 0.7): string {
  return `drop-shadow(${splitPx}px 0 0 rgba(239,68,68,${opacity})) drop-shadow(${-splitPx}px 0 0 rgba(14,165,233,${opacity}))`;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
