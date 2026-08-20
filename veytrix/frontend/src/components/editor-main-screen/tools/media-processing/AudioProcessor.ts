import { MediaSourceInput, AudioProcessOptions, MediaProcessingResult } from './processor.types';
import { cacheManager } from './CacheManager';
import { ffmpegManager } from './FFmpegManager';
import { generateCacheKey, buildAudioTempoFilter, getMimeTypeFromExt } from './processor.utils';
import { validateMediaInput, validateSpeedOptions } from './validation';

export class AudioProcessor {
  /**
   * Reverses an audio track using FFmpeg 'areverse' filter.
   */
  async reverseAudio(input: MediaSourceInput, options: AudioProcessOptions = {}): Promise<MediaProcessingResult> {
    const inputValidation = validateMediaInput(input);
    if (!inputValidation.valid) return { success: false, error: inputValidation.reason };

    const cacheKey = generateCacheKey(input.id, 'reverse_audio', options);
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return { success: true, outputBlob: cached.blob, outputUrl: cached.url, mimeType: cached.mimeType, cached: true };
    }

    const inputData = input.file || (input.url ? await (await fetch(input.url)).blob() : null);
    if (!inputData) return { success: false, error: 'Failed to load media file.' };

    const fmt = options.format || 'mp3';
    const mime = getMimeTypeFromExt(fmt);
    const outputName = `output_reversed.${fmt}`;

    const args = [
      '-i', 'input_audio',
      '-af', 'areverse',
      outputName
    ];

    const result = await ffmpegManager.executeCommand(
      inputData,
      'input_audio',
      args,
      outputName,
      mime,
      options.onProgress
    );

    if (result.success && result.outputBlob) {
      cacheManager.set(cacheKey, result.outputBlob, mime);
    }

    return result;
  }

  /**
   * Adjusts audio speed using atempo filter.
   */
  async adjustAudioSpeed(input: MediaSourceInput, speed: number, options: AudioProcessOptions = {}): Promise<MediaProcessingResult> {
    const inputValidation = validateMediaInput(input);
    if (!inputValidation.valid) return { success: false, error: inputValidation.reason };

    const speedVal = validateSpeedOptions(speed);
    if (!speedVal.valid) return { success: false, error: speedVal.reason };

    const speedFactor = speedVal.clampedSpeed;
    const cacheKey = generateCacheKey(input.id, 'audio_speed', { speed: speedFactor, ...options });
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return { success: true, outputBlob: cached.blob, outputUrl: cached.url, mimeType: cached.mimeType, cached: true };
    }

    const inputData = input.file || (input.url ? await (await fetch(input.url)).blob() : null);
    if (!inputData) return { success: false, error: 'Failed to load media file.' };

    const fmt = options.format || 'mp3';
    const mime = getMimeTypeFromExt(fmt);
    const outputName = `output_speed.${fmt}`;
    const tempoFilter = buildAudioTempoFilter(speedFactor);

    const args = [
      '-i', 'input_audio',
      '-af', tempoFilter,
      outputName
    ];

    const result = await ffmpegManager.executeCommand(
      inputData,
      'input_audio',
      args,
      outputName,
      mime,
      options.onProgress
    );

    if (result.success && result.outputBlob) {
      cacheManager.set(cacheKey, result.outputBlob, mime);
    }

    return result;
  }

  /**
   * Extracts audio stream from video container into MP3, WAV, or AAC format.
   */
  async extractAudio(input: MediaSourceInput, options: AudioProcessOptions = {}): Promise<MediaProcessingResult> {
    const inputValidation = validateMediaInput(input);
    if (!inputValidation.valid) return { success: false, error: inputValidation.reason };

    const fmt = options.format || 'mp3';
    const mime = getMimeTypeFromExt(fmt);

    const cacheKey = generateCacheKey(input.id, 'extract_audio', { format: fmt, ...options });
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return { success: true, outputBlob: cached.blob, outputUrl: cached.url, mimeType: cached.mimeType, cached: true };
    }

    const inputData = input.file || (input.url ? await (await fetch(input.url)).blob() : null);
    if (!inputData) return { success: false, error: 'Failed to load video file.' };

    const outputName = `extracted_audio.${fmt}`;
    let codecArgs: string[] = [];

    if (fmt === 'mp3') {
      codecArgs = ['-vn', '-acodec', 'libmp3lame', '-q:a', '2'];
    } else if (fmt === 'wav') {
      codecArgs = ['-vn', '-acodec', 'pcm_s16le'];
    } else if (fmt === 'aac') {
      codecArgs = ['-vn', '-acodec', 'aac'];
    }

    const args = [
      '-i', 'input_video.mp4',
      ...codecArgs,
      outputName
    ];

    const result = await ffmpegManager.executeCommand(
      inputData,
      'input_video.mp4',
      args,
      outputName,
      mime,
      options.onProgress
    );

    if (result.success && result.outputBlob) {
      cacheManager.set(cacheKey, result.outputBlob, mime);
    }

    return result;
  }

  /**
   * Detaches embedded audio from a video clip to create an independent audio clip.
   */
  async detachAudio(input: MediaSourceInput): Promise<MediaProcessingResult> {
    return this.extractAudio(input, { format: 'mp3' });
  }
}

export const audioProcessor = new AudioProcessor();
