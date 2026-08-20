import { IFFmpegManager, MediaProcessingResult, ProcessingProgress } from './processor.types';
import { ffmpegLoader } from './FFmpegLoader';
import { ffmpegWorker } from './FFmpegWorker';

export class FFmpegManager implements IFFmpegManager {
  private processingQueue: Promise<any> = Promise.resolve();

  async initialize(onProgress?: (progress: ProcessingProgress) => void): Promise<boolean> {
    return ffmpegLoader.load(onProgress);
  }

  isReady(): boolean {
    return ffmpegLoader.isLoaded();
  }

  async executeCommand(
    inputFile: File | Blob | Uint8Array,
    inputName: string,
    args: string[],
    outputName: string,
    outputMime: string = 'video/mp4',
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<MediaProcessingResult> {
    // Queue execution sequentially to prevent concurrent memory allocation limits
    return new Promise((resolve) => {
      this.processingQueue = this.processingQueue
        .then(async () => {
          const result = await ffmpegWorker.runCommand(
            inputFile,
            inputName,
            args,
            outputName,
            outputMime,
            onProgress
          );
          resolve(result);
        })
        .catch((err) => {
          resolve({
            success: false,
            error: err?.message || 'Processing failed in queue.'
          });
        });
    });
  }
}

export const ffmpegManager = new FFmpegManager();
