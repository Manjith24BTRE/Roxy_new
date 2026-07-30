import {
  MediaSourceInput,
  VideoProcessOptions,
  AudioProcessOptions,
  MediaProcessingResult,
  IMediaProcessor
} from './processor.types';
import { videoProcessor } from './VideoProcessor';
import { audioProcessor } from './AudioProcessor';
import { thumbnailGenerator } from './ThumbnailGenerator';
import { cacheManager } from './CacheManager';

export class MediaProcessor implements IMediaProcessor {
  async reverseVideo(input: MediaSourceInput, options?: VideoProcessOptions): Promise<MediaProcessingResult> {
    return videoProcessor.reverseVideo(input, options);
  }

  async adjustSpeed(input: MediaSourceInput, speed: number, options?: VideoProcessOptions): Promise<MediaProcessingResult> {
    return videoProcessor.adjustSpeed(input, speed, options);
  }

  async freezeFrame(input: MediaSourceInput, freezeTime: number, freezeDuration?: number): Promise<MediaProcessingResult> {
    return videoProcessor.generateFreezeFrame(input, freezeTime);
  }

  async extractAudio(input: MediaSourceInput, options?: AudioProcessOptions): Promise<MediaProcessingResult> {
    return audioProcessor.extractAudio(input, options);
  }

  async detachAudio(input: MediaSourceInput): Promise<MediaProcessingResult> {
    return audioProcessor.detachAudio(input);
  }

  async trimMedia(input: MediaSourceInput, startSec: number, endSec: number): Promise<MediaProcessingResult> {
    return videoProcessor.trimVideo(input, startSec, endSec);
  }

  async splitMedia(
    input: MediaSourceInput,
    splitSec: number
  ): Promise<{ partA: MediaProcessingResult; partB: MediaProcessingResult }> {
    return videoProcessor.splitVideo(input, splitSec);
  }

  async generateThumbnails(input: MediaSourceInput, count?: number): Promise<string[]> {
    return thumbnailGenerator.generateThumbnails(input, count);
  }

  clearCache(): void {
    cacheManager.clear();
  }
}

export const mediaProcessor = new MediaProcessor();
