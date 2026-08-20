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

    const result = await ffmpegManager.executeCommand(
      inputData,
      'input.mp4',
      args,
      'output_reversed.mp4',
      'video/mp4',
      options.onProgress
    );

    if (result.success && result.outputBlob) {
      cacheManager.set(cacheKey, result.outputBlob, 'video/mp4');
    }

    return result;
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
