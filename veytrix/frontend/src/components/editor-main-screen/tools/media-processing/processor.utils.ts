export async function blobToUint8Array(blob: Blob | File): Promise<Uint8Array> {
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

export function uint8ArrayToBlob(data: Uint8Array, mimeType: string = 'video/mp4'): Blob {
  return new Blob([data as any], { type: mimeType });
}

export function generateCacheKey(sourceId: string, operation: string, params: Record<string, any> = {}): string {
  const paramStr = JSON.stringify(params);
  return `${sourceId}_${operation}_${paramStr}`;
}

export function formatTimeForFFmpeg(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = (seconds % 60).toFixed(3);

  const hh = hrs.toString().padStart(2, '0');
  const mm = mins.toString().padStart(2, '0');
  const ss = secs.padStart(6, '0');

  return `${hh}:${mm}:${ss}`;
}

/**
 * Builds FFmpeg audio tempo filter chain for speed multiplier (>2.0 or <0.5 chained).
 * atempo filter strictly supports values between 0.5 and 2.0.
 */
export function buildAudioTempoFilter(speed: number): string {
  if (speed <= 0) return 'atempo=1.0';
  let s = speed;
  const filters: string[] = [];

  while (s > 2.0) {
    filters.push('atempo=2.0');
    s /= 2.0;
  }
  while (s < 0.5) {
    filters.push('atempo=0.5');
    s /= 0.5;
  }
  filters.push(`atempo=${s.toFixed(3)}`);

  return filters.join(',');
}

export function getFileExtension(filename?: string, defaultExt: string = 'mp4'): string {
  if (!filename) return defaultExt;
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop()?.toLowerCase() || defaultExt;
  }
  return defaultExt;
}

export function getMimeTypeFromExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'aac':
      return 'audio/aac';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    default:
      return 'video/mp4';
  }
}
