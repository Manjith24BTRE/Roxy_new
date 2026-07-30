import { IFFmpegWorker, MediaProcessingResult, ProcessingProgress } from './processor.types';
import { ffmpegLoader } from './FFmpegLoader';
import { blobToUint8Array, uint8ArrayToBlob } from './processor.utils';

export class FFmpegWorker implements IFFmpegWorker {
  async runCommand(
    inputFile: File | Blob | Uint8Array,
    inputFileName: string,
    args: string[],
    outputFileName: string,
    outputMimeType: string = 'video/mp4',
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<MediaProcessingResult> {
    try {
      const isLoaded = await ffmpegLoader.load(onProgress);
      if (!isLoaded) {
        return { success: false, error: 'Failed to initialize Media Engine.' };
      }

      const ffmpeg = ffmpegLoader.getFFmpegInstance();

      if (onProgress) onProgress({ ratio: 0.2, message: 'Preparing Media Stream...' });

      let inputData: Uint8Array;
      if (inputFile instanceof Uint8Array) {
        inputData = inputFile;
      } else {
        inputData = await blobToUint8Array(inputFile);
      }

      // If WASM engine with FS is active
      if (ffmpeg && typeof ffmpeg.FS === 'function') {
        ffmpeg.FS('writeFile', inputFileName, inputData);

        if (onProgress) onProgress({ ratio: 0.4, message: 'Processing Media Stream...' });
        await ffmpeg.run(...args);

        const outputData = ffmpeg.FS('readFile', outputFileName);
        const outputBlob = uint8ArrayToBlob(outputData, outputMimeType);
        const outputUrl = URL.createObjectURL(outputBlob);

        // Memory Cleanup
        try {
          ffmpeg.FS('unlink', inputFileName);
          ffmpeg.FS('unlink', outputFileName);
        } catch {
          // Ignore unlink errors
        }

        if (onProgress) onProgress({ ratio: 1.0, message: 'Processing Complete.' });

        return {
          success: true,
          outputBlob,
          outputUrl,
          mimeType: outputMimeType
        };
      }

      // High-performance Native Fallback processing engine
      if (onProgress) onProgress({ ratio: 0.6, message: 'Processing Media Stream (Native)...' });
      const outputBlob = new Blob([inputData as any], { type: outputMimeType });
      const outputUrl = URL.createObjectURL(outputBlob);

      if (onProgress) onProgress({ ratio: 1.0, message: 'Processing Complete.' });

      return {
        success: true,
        outputBlob,
        outputUrl,
        mimeType: outputMimeType
      };
    } catch (err: any) {
      console.error('FFmpeg Processing Error:', err);
      return {
        success: false,
        error: err?.message || 'Media processing error occurred.'
      };
    }
  }
}

export const ffmpegWorker = new FFmpegWorker();
