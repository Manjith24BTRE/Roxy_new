import { TimelineClipRef, IFreezeFrameGenerator } from './freeze.types';
import { DEFAULT_FREEZE_DURATION, deepCloneArray, generateFreezeClipId } from './freeze.utils';

export class FreezeFrameGenerator implements IFreezeFrameGenerator {
  /**
   * Captures the frame directly from an active HTMLVideoElement in DOM synchronously.
   */
  captureFrameFromActiveVideo(videoElement?: HTMLVideoElement | null): string | undefined {
    if (!videoElement) return undefined;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth || 1280;
      canvas.height = videoElement.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/png');
      }
    } catch {
      // Fallback if cross-origin or canvas export is blocked
    }
    return undefined;
  }

  /**
   * Captures the exact still video frame image at frameTime as a PNG data URL.
   */
  async captureStillFrame(clipUrl?: string, frameTime: number = 0): Promise<string | undefined> {
    if (!clipUrl || typeof window === 'undefined') return undefined;

    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      video.src = clipUrl;

      const timeoutId = setTimeout(() => {
        video.onloadeddata = null;
        video.onseeked = null;
        resolve(undefined);
      }, 2500);

      video.onloadeddata = () => {
        video.currentTime = Math.max(0, frameTime);
      };

      video.onseeked = () => {
        clearTimeout(timeoutId);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
          } else {
            resolve(undefined);
          }
        } catch {
          resolve(undefined);
        }
      };

      video.onerror = () => {
        clearTimeout(timeoutId);
        resolve(undefined);
      };
    });
  }

  /**
   * Creates an independent still-frame timeline clip object.
   */
  createFreezeClip<T extends TimelineClipRef>(
    sourceClip: T,
    frameTime: number,
    freezeDuration: number = DEFAULT_FREEZE_DURATION,
    frameDataUrl?: string
  ): T {
    const freezeId = generateFreezeClipId(sourceClip.id);
    const stillImage = frameDataUrl || sourceClip.thumbnails?.[0] || sourceClip.url || '';

    const freezeClip: T = {
      ...sourceClip,
      id: freezeId,
      name: `${sourceClip.name} (Freeze)`,
      type: 'image',
      mediaType: 'image',
      trackId: sourceClip.trackId || 'video',
      duration: freezeDuration,
      baseDuration: freezeDuration,
      startOffset: 0,
      url: stillImage,
      thumbnails: stillImage ? [stillImage] : [],
      isFreezeFrame: true,
      freezeSourceTime: frameTime,
      isLocked: false,
      isMuted: false,
      appliedEffects: deepCloneArray(sourceClip.appliedEffects),
      filters: deepCloneArray(sourceClip.filters),
      keyframes: deepCloneArray(sourceClip.keyframes),
      transitions: deepCloneArray(sourceClip.transitions),
      transforms: sourceClip.transforms ? JSON.parse(JSON.stringify(sourceClip.transforms)) : undefined
    };

    return freezeClip;
  }
}

export const freezeFrameGenerator = new FreezeFrameGenerator();
