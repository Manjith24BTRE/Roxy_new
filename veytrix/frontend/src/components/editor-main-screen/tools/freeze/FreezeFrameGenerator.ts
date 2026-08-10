import { TimelineClipRef, IFreezeFrameGenerator } from './freeze.types';
import { DEFAULT_FREEZE_DURATION, deepCloneArray, generateFreezeClipId } from './freeze.utils';

export class FreezeFrameGenerator implements IFreezeFrameGenerator {
  /**
   * Captures the frame directly from an active HTMLVideoElement in DOM synchronously.
   * Returns a PNG data URL of the current video frame, or undefined on failure.
   */
  captureFrameFromActiveVideo(videoElement?: HTMLVideoElement | null): string | undefined {
    if (!videoElement) return undefined;
    try {
      const width = videoElement.videoWidth || 1280;
      const height = videoElement.videoHeight || 720;
      // Guard against invalid dimensions (video not yet loaded)
      if (width <= 0 || height <= 0) return undefined;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        // Clean up canvas reference
        canvas.width = 0;
        canvas.height = 0;
        return dataUrl;
      }
    } catch {
      // Fallback if cross-origin or canvas export is blocked
    }
    return undefined;
  }

  /**
   * Captures the exact still video frame image at frameTime as a PNG data URL.
   * Creates a temporary offscreen video element, seeks to frameTime, and captures.
   */
  async captureStillFrame(clipUrl?: string, frameTime: number = 0): Promise<string | undefined> {
    if (!clipUrl || typeof window === 'undefined') return undefined;

    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      video.src = clipUrl;

      const cleanup = () => {
        video.onloadeddata = null;
        video.onseeked = null;
        video.onerror = null;
        video.src = '';
        video.load(); // Release media resources
      };

      const timeoutId = setTimeout(() => {
        cleanup();
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
            canvas.width = 0;
            canvas.height = 0;
            cleanup();
            resolve(dataUrl);
          } else {
            cleanup();
            resolve(undefined);
          }
        } catch {
          cleanup();
          resolve(undefined);
        }
      };

      video.onerror = () => {
        clearTimeout(timeoutId);
        cleanup();
        resolve(undefined);
      };
    });
  }

  /**
   * Creates an independent still-frame timeline clip object.
   *
   * The freeze clip is typed as 'image' for rendering compatibility (the editor
   * renders `<img>` for image-type clips). It carries `isFreezeFrame: true` and
   * `sourceClipId` for export pipeline tracing and undo/redo identification.
   */
  createFreezeClip<T extends TimelineClipRef>(
    sourceClip: T,
    frameTime: number,
    freezeDuration: number = DEFAULT_FREEZE_DURATION,
    frameDataUrl?: string
  ): T {
    const freezeId = generateFreezeClipId(sourceClip.id);
    const stillImage = frameDataUrl || sourceClip.thumbnails?.[0] || sourceClip.url || '';

    // Ensure thumbnails is always a valid non-empty array (prevents crash in timeline rendering
    // where clip.thumbnails[idx % clip.thumbnails.length] is used)
    const thumbnailsArray: string[] = stillImage ? [stillImage] : (sourceClip.thumbnails || []);

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
      playbackRate: 1,
      speed: 1,
      url: stillImage,
      thumbnails: thumbnailsArray,
      isFreezeFrame: true,
      freezeSourceTime: frameTime,
      sourceClipId: sourceClip.id,
      isLocked: false,
      isMuted: true, // Freeze clips should not produce audio
      isReversed: false,
      // Don't carry over effects/filters/keyframes from source — freeze is a clean still image
      appliedEffects: [],
      filters: [],
      keyframes: [],
      transitions: [],
      transforms: undefined
    };

    return freezeClip;
  }
}

export const freezeFrameGenerator = new FreezeFrameGenerator();

