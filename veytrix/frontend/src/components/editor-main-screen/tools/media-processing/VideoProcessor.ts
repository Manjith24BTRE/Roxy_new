import { MediaSourceInput, VideoProcessOptions, MediaProcessingResult } from './processor.types';
import { cacheManager } from './CacheManager';
import { ffmpegManager } from './FFmpegManager';
import { generateCacheKey, buildAudioTempoFilter, formatTimeForFFmpeg } from './processor.utils';
import { validateMediaInput, validateSpeedOptions, validateTimeRange } from './validation';

export class VideoProcessor {
  /**
   * Reverses video and audio streams simultaneously using FFmpeg 'reverse' and 'areverse' filters.
   */
  async reverseVideo(input: MediaSourceInput, options: VideoProcessOptions = {}): Promise<MediaProcessingResult> {
    const inputValidation = validateMediaInput(input);
    if (!inputValidation.valid) {
      return { success: false, error: inputValidation.reason };
    }

    const cacheKey = generateCacheKey(input.id, 'reverse_video', options);
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return {
        success: true,
        outputBlob: cached.blob,
        outputUrl: cached.url,
        mimeType: cached.mimeType,
        cached: true
      };
    }

    const inputData = input.file || (input.url ? await (await fetch(input.url)).blob() : null);
    if (!inputData) {
      return { success: false, error: 'Failed to fetch input media file.' };
    }

    const args = [
      '-i', 'input.mp4',
      '-vf', 'reverse',
      '-af', 'areverse',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      'output_reversed.mp4'
    ];

    let result = await ffmpegManager.executeCommand(
      inputData,
      'input.mp4',
      args,
      'output_reversed.mp4',
      'video/mp4',
      options.onProgress
    );

    // If FFmpeg WASM was not available, run Native Canvas Video Reverser
    if (!result.isReversedFile) {
      const nativeResult = await this.reverseVideoNative(inputData, options.onProgress);
      if (nativeResult.success) {
        result = nativeResult;
      }
    }

    if (result.success && result.outputBlob) {
      cacheManager.set(cacheKey, result.outputBlob, result.mimeType || 'video/mp4');
    }

    return result;
  }

  /**
   * Native Canvas + MediaRecorder pure JavaScript video reverser fallback.
   * Renders frames backwards onto Canvas and encodes them into a physically reversed MediaStream Blob.
   */
  private async reverseVideoNative(
    inputBlob: Blob | File,
    onProgress?: (progress: { ratio: number; message?: string }) => void
  ): Promise<MediaProcessingResult> {
    return new Promise(async (resolve) => {
      try {
        if (onProgress) onProgress({ ratio: 0.05, message: 'Initializing Native Video Engine...' });

        const mediaUrl = URL.createObjectURL(inputBlob);
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        video.src = mediaUrl;

        await new Promise<void>((res, rej) => {
          video.onloadedmetadata = () => res();
          video.onerror = () => rej(new Error('Failed to load video metadata.'));
        });

        const duration = video.duration || 5;
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 360;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas context not available.');
        }

        const fps = 30;
        const canvasStream = canvas.captureStream(fps);

        // Decode & reverse audio stream via Web Audio API
        let audioTrack: MediaStreamTrack | null = null;
        try {
          const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioCtxClass();
          const ab = await inputBlob.arrayBuffer();
          const decoded = await audioCtx.decodeAudioData(ab.slice(0));

          if (decoded && decoded.numberOfChannels > 0) {
            const reversedBuffer = audioCtx.createBuffer(
              decoded.numberOfChannels,
              decoded.length,
              decoded.sampleRate
            );
            for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
              const inp = decoded.getChannelData(channel);
              const out = reversedBuffer.getChannelData(channel);
              const len = inp.length;
              for (let i = 0; i < len; i++) {
                out[i] = inp[len - 1 - i];
              }
            }

            const dest = audioCtx.createMediaStreamDestination();
            const sourceNode = audioCtx.createBufferSource();
            sourceNode.buffer = reversedBuffer;
            sourceNode.connect(dest);
            sourceNode.start(0);

            const tracks = dest.stream.getAudioTracks();
            if (tracks.length > 0) {
              audioTrack = tracks[0];
            }
          }
        } catch (e) {
          console.warn('Could not extract reversed audio for canvas stream:', e);
        }

        // Combine video track and reversed audio track into single stream
        const streamTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
        if (audioTrack) {
          streamTracks.push(audioTrack);
        }
        const combinedStream = new MediaStream(streamTracks);

        let mimeType = 'video/webm';
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('video/mp4')) {
            mimeType = 'video/mp4';
          } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            mimeType = 'video/webm;codecs=vp9';
          } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
            mimeType = 'video/webm;codecs=vp8';
          }
        }

        const recorder = new MediaRecorder(combinedStream, { mimeType });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.start();

        const totalFrames = Math.max(1, Math.floor(duration * fps));
        const frameDuration = duration / totalFrames;

        for (let i = 0; i <= totalFrames; i++) {
          const targetTime = Math.max(0, duration - i * frameDuration);

          await new Promise<void>((seekRes) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              seekRes();
            };
            video.addEventListener('seeked', onSeeked);
            video.currentTime = targetTime;
          });

          ctx.drawImage(video, 0, 0, width, height);

          if (onProgress && i % 4 === 0) {
            const ratio = 0.1 + 0.85 * (i / totalFrames);
            onProgress({ ratio, message: `Reversing video frames (${Math.round((i / totalFrames) * 100)}%)...` });
          }
        }

        recorder.stop();

        await new Promise<void>((recRes) => {
          recorder.onstop = () => recRes();
        });

        URL.revokeObjectURL(mediaUrl);

        const outputBlob = new Blob(chunks, { type: mimeType });
        const outputUrl = URL.createObjectURL(outputBlob);

        if (onProgress) onProgress({ ratio: 1.0, message: 'Reverse video complete.' });

        resolve({
          success: true,
          outputBlob,
          outputUrl,
          mimeType,
          isReversedFile: true
        });
      } catch (err: any) {
        console.warn('Native video reversal error:', err);
        resolve({
          success: false,
          error: err?.message || 'Native video reversal failed.'
        });
      }
    });
  }

  /**
   * Adjusts video and audio playback speed using setpts and atempo filters.
   */
  async adjustSpeed(input: MediaSourceInput, speed: number, options: VideoProcessOptions = {}): Promise<MediaProcessingResult> {
    const inputValidation = validateMediaInput(input);
    if (!inputValidation.valid) return { success: false, error: inputValidation.reason };

    const speedVal = validateSpeedOptions(speed);
    if (!speedVal.valid) return { success: false, error: speedVal.reason };

    const speedFactor = speedVal.clampedSpeed;
    const cacheKey = generateCacheKey(input.id, 'speed', { speed: speedFactor, ...options });
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return { success: true, outputBlob: cached.blob, outputUrl: cached.url, mimeType: cached.mimeType, cached: true };
    }

    const inputData = input.file || (input.url ? await (await fetch(input.url)).blob() : null);
    if (!inputData) return { success: false, error: 'Failed to load media file.' };

    const ptsFactor = (1 / speedFactor).toFixed(4);
    const audioTempo = buildAudioTempoFilter(speedFactor);

    const filterComplex = `[0:v]setpts=${ptsFactor}*PTS[v];[0:a]${audioTempo}[a]`;
    const args = [
      '-i', 'input.mp4',
      '-filter_complex', filterComplex,
      '-map', '[v]',
      '-map', '[a]',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      'output_speed.mp4'
    ];

    const result = await ffmpegManager.executeCommand(
      inputData,
      'input.mp4',
      args,
      'output_speed.mp4',
      'video/mp4',
      options.onProgress
    );

    if (result.success && result.outputBlob) {
      cacheManager.set(cacheKey, result.outputBlob, 'video/mp4');
    }

    return result;
  }

  /**
   * Generates a still image frame PNG from the video at freezeTime.
   */
  async generateFreezeFrame(input: MediaSourceInput, freezeTime: number): Promise<MediaProcessingResult> {
    const inputValidation = validateMediaInput(input);
    if (!inputValidation.valid) return { success: false, error: inputValidation.reason };

    const cacheKey = generateCacheKey(input.id, 'freeze', { freezeTime });
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return { success: true, outputBlob: cached.blob, outputUrl: cached.url, mimeType: cached.mimeType, cached: true };
    }

    const inputData = input.file || (input.url ? await (await fetch(input.url)).blob() : null);
    if (!inputData) return { success: false, error: 'Failed to load media file.' };

    const timeStr = formatTimeForFFmpeg(freezeTime);
    const args = [
      '-ss', timeStr,
      '-i', 'input.mp4',
      '-vframes', '1',
      '-q:v', '2',
      'output_freeze.png'
    ];

    const result = await ffmpegManager.executeCommand(
      inputData,
      'input.mp4',
      args,
      'output_freeze.png',
      'image/png'
    );

    if (result.success && result.outputBlob) {
      cacheManager.set(cacheKey, result.outputBlob, 'image/png');
    }

    return result;
  }

  /**
   * Performs precise trimming without re-encoding when possible.
   */
  async trimVideo(input: MediaSourceInput, startSec: number, endSec: number): Promise<MediaProcessingResult> {
    const inputValidation = validateMediaInput(input);
    if (!inputValidation.valid) return { success: false, error: inputValidation.reason };

    const timeVal = validateTimeRange(startSec, endSec, input.duration);
    if (!timeVal.valid) return { success: false, error: timeVal.reason };

    const cacheKey = generateCacheKey(input.id, 'trim', { startSec, endSec });
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return { success: true, outputBlob: cached.blob, outputUrl: cached.url, mimeType: cached.mimeType, cached: true };
    }

    const inputData = input.file || (input.url ? await (await fetch(input.url)).blob() : null);
    if (!inputData) return { success: false, error: 'Failed to load media file.' };

    const startStr = formatTimeForFFmpeg(startSec);
    const endStr = formatTimeForFFmpeg(endSec);

    const args = [
      '-ss', startStr,
      '-to', endStr,
      '-i', 'input.mp4',
      '-c', 'copy',
      'output_trim.mp4'
    ];

    const result = await ffmpegManager.executeCommand(
      inputData,
      'input.mp4',
      args,
      'output_trim.mp4',
      'video/mp4'
    );

    if (result.success && result.outputBlob) {
      cacheManager.set(cacheKey, result.outputBlob, 'video/mp4');
    }

    return result;
  }

  /**
   * Splits a video into Part A (0 to splitSec) and Part B (splitSec to end).
   */
  async splitVideo(
    input: MediaSourceInput,
    splitSec: number
  ): Promise<{ partA: MediaProcessingResult; partB: MediaProcessingResult }> {
    const totalDuration = input.duration || 10;
    const partA = await this.trimVideo(input, 0, splitSec);
    const partB = await this.trimVideo(input, splitSec, totalDuration);

    return { partA, partB };
  }
}

export const videoProcessor = new VideoProcessor();
