import { MediaSourceInput } from './processor.types';
import { validateMediaInput } from './validation';
import { cacheManager } from './CacheManager';

export class ThumbnailGenerator {
  /**
   * Generates filmstrip thumbnails for a video file.
   */
  async generateThumbnails(input: MediaSourceInput, count: number = 8): Promise<string[]> {
    const validation = validateMediaInput(input);
    if (!validation.valid || !input.url) return [];

    const cacheKey = `thumbnails_${input.id}_${count}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(await cached.blob.text());
      } catch {
        // Fallback
      }
    }

    if (typeof window === 'undefined') return [];

    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.src = input.url!;

      const thumbnails: string[] = [];
      const duration = input.duration || 10;
      const step = duration / Math.max(1, count);
      let currentFrame = 0;

      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');

      const captureFrame = () => {
        if (!ctx) {
          resolve(thumbnails);
          return;
        }
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          thumbnails.push(dataUrl);
        } catch {
          // Cross-origin fallback
        }

        currentFrame++;
        if (currentFrame < count) {
          video.currentTime = currentFrame * step;
        } else {
          // Cache results
          const blob = new Blob([JSON.stringify(thumbnails)], { type: 'application/json' });
          cacheManager.set(cacheKey, blob, 'application/json');
          resolve(thumbnails);
        }
      };

      video.onloadeddata = () => {
        video.currentTime = 0;
      };

      video.onseeked = () => {
        captureFrame();
      };

      video.onerror = () => {
        resolve(thumbnails);
      };
    });
  }
}

export const thumbnailGenerator = new ThumbnailGenerator();
