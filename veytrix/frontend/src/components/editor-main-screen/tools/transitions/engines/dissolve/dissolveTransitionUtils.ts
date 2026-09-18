// src/components/editor-main-screen/tools/transitions/engines/dissolve/dissolveTransitionUtils.ts

/**
 * Clamps progress value strictly within [0.0, 1.0].
 * Prevents NaN, Infinity, and out-of-bound overflow.
 */
export function clampProgress(progress: number): number {
  if (isNaN(progress) || !isFinite(progress)) return 0;
  return Math.max(0, Math.min(1, progress));
}

/**
 * Returns raw linear progress [0, 1].
 */
export function linearProgress(progress: number): number {
  return clampProgress(progress);
}

/**
 * Computes eased progress based on timing curve type.
 */
export function easedProgress(progress: number, easingType: string = 'linear'): number {
  const p = clampProgress(progress);

  switch (easingType) {
    case 'smoothstep':
    case 'ease-in-out':
      return p * p * (3 - 2 * p); // Smoothstep S-curve
    case 'sine':
      return 0.5 - 0.5 * Math.cos(p * Math.PI); // Cosine smooth ease
    case 'cut':
      return p < 0.5 ? 0 : 1;
    case 'linear':
    default:
      return p;
  }
}

export interface TransitionStateResult {
  outgoingOpacity: number;
  incomingOpacity: number;
  outgoingFilter: string;
  incomingFilter: string;
  outgoingTransform: string;
  incomingTransform: string;
  overlayColor?: string; // Optional solid background/overlay color (e.g. black, white, dip color)
  overlayOpacity?: number; // Opacity of intermediate color overlay [0, 1]
  renderMode: string;
}

/**
 * Computes standard linear cross dissolve opacity pair.
 */
export function crossDissolve(progress: number): { outgoingOpacity: number; incomingOpacity: number } {
  const p = clampProgress(progress);
  return {
    outgoingOpacity: 1 - p,
    incomingOpacity: p,
  };
}

/**
 * Computes two-stage fade to solid color (Black, White, or Dip color).
 */
export function dipToColor(color: string, progress: number, holdRatio = 0.1): {
  outgoingOpacity: number;
  incomingOpacity: number;
  overlayColor: string;
  overlayOpacity: number;
} {
  const p = clampProgress(progress);
  const mid = 0.5;

  let outgoingOpacity = 1;
  let incomingOpacity = 0;
  let overlayOpacity = 0;

  if (p < mid) {
    // Stage 1: Outgoing fades into solid color
    const stage1Progress = clampProgress(p / mid);
    outgoingOpacity = 1 - stage1Progress;
    incomingOpacity = 0;
    overlayOpacity = stage1Progress;
  } else {
    // Stage 2: Solid color fades out revealing incoming clip
    const stage2Progress = clampProgress((p - mid) / (1 - mid));
    outgoingOpacity = 0;
    incomingOpacity = stage2Progress;
    overlayOpacity = 1 - stage2Progress;
  }

  return {
    outgoingOpacity,
    incomingOpacity,
    overlayColor: color,
    overlayOpacity,
  };
}

/**
 * Fade to black helper primitive.
 */
export function fadeToColor(color: string, progress: number): {
  outgoingOpacity: number;
  incomingOpacity: number;
  overlayColor: string;
  overlayOpacity: number;
} {
  return dipToColor(color, progress);
}

/**
 * Fade from color helper primitive.
 */
export function fadeFromColor(color: string, progress: number): {
  outgoingOpacity: number;
  incomingOpacity: number;
  overlayColor: string;
  overlayOpacity: number;
} {
  const p = clampProgress(progress);
  return {
    outgoingOpacity: 0,
    incomingOpacity: p,
    overlayColor: color,
    overlayOpacity: 1 - p,
  };
}

/**
 * Performs RGBA alpha blending helper.
 */
export function alphaBlend(src: number[], dst: number[], alpha: number): number[] {
  const a = clampProgress(alpha);
  return [
    Math.round(src[0] * (1 - a) + dst[0] * a),
    Math.round(src[1] * (1 - a) + dst[1] * a),
    Math.round(src[2] * (1 - a) + dst[2] * a),
    Math.round((src[3] ?? 255) * (1 - a) + (dst[3] ?? 255) * a),
  ];
}

/**
 * Blends two RGB/RGBA color arrays based on factor [0, 1].
 */
export function colorBlend(colorA: number[], colorB: number[], factor: number): number[] {
  const f = clampProgress(factor);
  return [
    Math.round(colorA[0] + (colorB[0] - colorA[0]) * f),
    Math.round(colorA[1] + (colorB[1] - colorA[1]) * f),
    Math.round(colorA[2] + (colorB[2] - colorA[2]) * f),
    Math.round((colorA[3] ?? 255) + ((colorB[3] ?? 255) - (colorA[3] ?? 255)) * f),
  ];
}

/**
 * Samples outgoing frame helper metadata.
 */
export function sampleOutgoing(clip: any, localTime: number): { clipId: string; time: number } {
  return {
    clipId: clip?.id || 'outgoing',
    time: Math.max(0, localTime),
  };
}

/**
 * Samples incoming frame helper metadata.
 */
export function sampleIncoming(clip: any, localTime: number): { clipId: string; time: number } {
  return {
    clipId: clip?.id || 'incoming',
    time: Math.max(0, localTime),
  };
}

/**
 * Luma mask blend primitive for pixel-level CPU canvas rendering.
 */
export function lumaMaskBlend(
  outgoingImg: ImageData,
  incomingImg: ImageData,
  progress: number,
  softness = 0.1
): ImageData {
  const width = outgoingImg.width;
  const height = outgoingImg.height;
  const output = new ImageData(width, height);

  const outData = outgoingImg.data;
  const inData = incomingImg.data;
  const resData = output.data;

  const threshold = clampProgress(progress);

  for (let i = 0; i < outData.length; i += 4) {
    const r = outData[i];
    const g = outData[i + 1];
    const b = outData[i + 2];

    // Compute luminance [0, 1]
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    let blendFactor = 0;
    if (softness <= 0) {
      blendFactor = luma <= threshold ? 1 : 0;
    } else {
      const lower = threshold - softness / 2;
      const upper = threshold + softness / 2;
      blendFactor = clampProgress((threshold - luma + softness / 2) / softness);
    }

    resData[i] = Math.round(outData[i] * (1 - blendFactor) + inData[i] * blendFactor);
    resData[i + 1] = Math.round(outData[i + 1] * (1 - blendFactor) + inData[i + 1] * blendFactor);
    resData[i + 2] = Math.round(outData[i + 2] * (1 - blendFactor) + inData[i + 2] * blendFactor);
    resData[i + 3] = Math.round(outData[i + 3] * (1 - blendFactor) + inData[i + 3] * blendFactor);
  }

  return output;
}
