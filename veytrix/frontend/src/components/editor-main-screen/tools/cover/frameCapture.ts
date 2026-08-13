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
