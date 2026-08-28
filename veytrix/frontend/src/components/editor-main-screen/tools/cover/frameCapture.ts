/**
 * Frame capture utility for video cover/thumbnail generation.
 * Handles seeking the video source to a specific timestamp, waiting for seeked event,
 * and rendering the frame to a canvas.
 */

export interface CaptureFrameOptions {
  width?: number;
  height?: number;
  quality?: number;
  mimeType?: string;
}

/**
 * Seeks a video element to the target timestamp and captures the frame as a Blob.
 * 
 * @param videoUrl The URL of the video source.
 * @param timestamp The time in seconds to seek to.
 * @param options Capture settings (dimensions, quality, mime type).
 */
export async function captureVideoFrame(
  videoUrl: string,
  timestamp: number,
  options: CaptureFrameOptions = {}
): Promise<Blob> {
  const {
    quality = 0.9,
    mimeType = 'image/jpeg',
  } = options;

  return new Promise<Blob>((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.src = videoUrl;

    // Timeout safety
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Video frame capture timed out (seeking took too long).'));
    }, 15000);

    const cleanup = () => {
      clearTimeout(timeoutId);
      video.onseeked = null;
      video.onloadeddata = null;
      video.onerror = null;
      video.src = '';
      video.load();
    };

    video.onloadedmetadata = () => {
      // Seek to target timestamp within video bounds
      const targetTime = Math.max(0, Math.min(timestamp, video.duration));
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        
        // Dynamically compute size keeping original aspect ratio
        const originalWidth = video.videoWidth || 640;
        const originalHeight = video.videoHeight || 360;
        
        canvas.width = options.width || originalWidth;
        canvas.height = options.height || originalHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get 2D canvas context.');
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas toBlob returned null.'));
            }
          },
          mimeType,
          quality
        );
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = (e) => {
      cleanup();
      reject(new Error(video.error?.message || 'Error loading video source.'));
    };

    // Trigger load
    video.load();
  });
}

export interface FilmstripThumbnail {
  time: number;
  dataUrl: string;
}

const filmstripCache = new Map<string, FilmstripThumbnail[]>();

/**
 * Generates an array of thumbnail frames across the video duration for the cover filmstrip.
 * Uses in-memory caching to avoid redundant seeking.
 */
export async function generateFilmstripThumbnails(
  videoUrl: string,
  duration: number,
  count = 10
): Promise<FilmstripThumbnail[]> {
  const cacheKey = `${videoUrl}_${duration}_${count}`;
  if (filmstripCache.has(cacheKey)) {
    return filmstripCache.get(cacheKey)!;
  }

  return new Promise((resolve) => {
    const thumbnails: FilmstripThumbnail[] = [];
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.src = videoUrl;

    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 90;
    const ctx = canvas.getContext('2d');

    const times: number[] = [];
    const step = duration / Math.max(1, count);
    for (let i = 0; i < count; i++) {
      times.push(Math.min(duration, i * step + step / 2));
    }

    let currentIndex = 0;

    const cleanup = () => {
      video.onseeked = null;
      video.onloadedmetadata = null;
      video.onerror = null;
      video.src = '';
      video.load();
    };

    video.onloadedmetadata = () => {
      seekNext();
    };

    const seekNext = () => {
      if (currentIndex >= times.length) {
        cleanup();
        filmstripCache.set(cacheKey, thumbnails);
        resolve(thumbnails);
        return;
      }
      video.currentTime = times[currentIndex];
    };

    video.onseeked = () => {
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        thumbnails.push({ time: times[currentIndex], dataUrl });
      }
      currentIndex++;
      seekNext();
    };

    video.onerror = () => {
      cleanup();
      resolve(thumbnails);
    };

    video.load();
  });
}

export interface CoverTextElement {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number; // px
  fontFamily: string;
  fontWeight: string;
  color: string;
  backgroundColor?: string;
  align: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  rotation?: number;
}

export interface CoverOverlayElement {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
}

export interface CoverAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  opacity: number;
}

export interface CoverState {
  sourceType: 'video-frame' | 'custom-image';
  videoTime: number;
  customImageUrl?: string;
  textElements: CoverTextElement[];
  overlays: CoverOverlayElement[];
  adjustments: CoverAdjustments;
}

/**
 * Bakes the base frame, CSS filters, overlays, and text elements into a high-res cover image Blob.
 */
export async function renderFinalCoverImage(
  baseImageUrl: string,
  textElements: CoverTextElement[],
  overlays: CoverOverlayElement[],
  adjustments: CoverAdjustments,
  canvasWidth = 1280,
  canvasHeight = 720
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Canvas 2D context not available'));

    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    baseImg.src = baseImageUrl;

    baseImg.onload = async () => {
      // 1. Draw base image with adjustments filter
      ctx.save();
      const b = adjustments.brightness ?? 100;
      const c = adjustments.contrast ?? 100;
      const s = adjustments.saturation ?? 100;
      const blur = adjustments.blur ?? 0;
      const opacity = (adjustments.opacity ?? 100) / 100;

      ctx.globalAlpha = opacity;
      ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) blur(${blur}px)`;
      ctx.drawImage(baseImg, 0, 0, canvasWidth, canvasHeight);
      ctx.restore();

      // 2. Draw overlays
      for (const ov of overlays) {
        if (!ov.url) continue;
        try {
          const ovImg = new Image();
          ovImg.crossOrigin = 'anonymous';
          ovImg.src = ov.url;
          await new Promise<void>((r) => {
            ovImg.onload = () => r();
            ovImg.onerror = () => r();
          });
          ctx.save();
          const x = (ov.x / 100) * canvasWidth;
          const y = (ov.y / 100) * canvasHeight;
          const w = (ov.width / 100) * canvasWidth;
          const h = (ov.height / 100) * canvasHeight;
          ctx.globalAlpha = (ov.opacity ?? 100) / 100;
          ctx.translate(x + w / 2, y + h / 2);
          if (ov.rotation) ctx.rotate((ov.rotation * Math.PI) / 180);
          ctx.drawImage(ovImg, -w / 2, -h / 2, w, h);
          ctx.restore();
        } catch { }
      }

      // 3. Draw text elements
      for (const t of textElements) {
        if (!t.text) continue;
        ctx.save();
        const fontPx = (t.fontSize / 1000) * canvasHeight * 1.5;
        const fontStyle = `${t.fontWeight || 'normal'} ${fontPx}px ${t.fontFamily || 'Inter'}, sans-serif`;
        ctx.font = fontStyle;

        const x = (t.x / 100) * canvasWidth;
        const y = (t.y / 100) * canvasHeight;

        ctx.translate(x, y);
        if (t.rotation) ctx.rotate((t.rotation * Math.PI) / 180);

        ctx.textAlign = t.align || 'center';
        ctx.textBaseline = 'middle';

        if (t.backgroundColor && t.backgroundColor !== 'transparent') {
          const metrics = ctx.measureText(t.text);
          const bgW = metrics.width + fontPx * 0.8;
          const bgH = fontPx * 1.3;
          let bgX = -bgW / 2;
          if (t.align === 'left') bgX = -fontPx * 0.4;
          if (t.align === 'right') bgX = -metrics.width - fontPx * 0.4;

          ctx.fillStyle = t.backgroundColor;
          ctx.fillRect(bgX, -bgH / 2, bgW, bgH);
        }

        ctx.fillStyle = t.color || '#ffffff';
        ctx.fillText(t.text, 0, 0);
        ctx.restore();
      }

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        'image/webp',
        0.95
      );
    };

    baseImg.onerror = () => reject(new Error('Failed to load base cover image for rendering.'));
  });
}
