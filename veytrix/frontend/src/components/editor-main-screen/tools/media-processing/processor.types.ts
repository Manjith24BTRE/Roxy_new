export interface MediaSourceInput {
  id: string;
  url?: string;
  file?: File | Blob;
  name?: string;
  type?: 'video' | 'audio' | 'image' | string;
  duration?: number;
}

export interface ProcessingProgress {
  ratio: number; // 0 to 1
  message?: string;
  time?: number;
}

export interface MediaProcessingResult {
  success: boolean;
  outputUrl?: string;
  outputBlob?: Blob;
  mimeType?: string;
  duration?: number;
  error?: string;
  cached?: boolean;
}

export interface VideoProcessOptions {
  speed?: number; // 0.25 to 4.0
  isReversed?: boolean;
  reverseAudio?: boolean;
  trimStart?: number;
  trimEnd?: number;
  freezeTime?: number;
  freezeDuration?: number;
  width?: number;
  height?: number;
  onProgress?: (progress: ProcessingProgress) => void;
}

export interface AudioProcessOptions {
  speed?: number;
  isReversed?: boolean;
  format?: 'mp3' | 'wav' | 'aac';
  volume?: number;
  bitrate?: string; // e.g. '192k'
  onProgress?: (progress: ProcessingProgress) => void;
}

export interface CacheItem {
  key: string;
  blob: Blob;
  url: string;
  timestamp: number;
  mimeType: string;
  size: number;
}

export interface FFmpegCommand {
  args: string[];
  inputFileName: string;
  outputFileName: string;
}

export interface ICacheManager {
  get(key: string): CacheItem | null;
  set(key: string, blob: Blob, mimeType?: string): CacheItem;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
}

export interface IFFmpegLoader {
  isLoaded(): boolean;
  isLoading(): boolean;
  load(onProgress?: (progress: ProcessingProgress) => void): Promise<boolean>;
  getFFmpegInstance(): any;
}

export interface IFFmpegWorker {
  runCommand(
    inputFile: File | Blob | Uint8Array,
    inputFileName: string,
    args: string[],
    outputFileName: string,
    outputMimeType: string,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<MediaProcessingResult>;
}

export interface IFFmpegManager {
  initialize(onProgress?: (progress: ProcessingProgress) => void): Promise<boolean>;
  isReady(): boolean;
  executeCommand(
    inputFile: File | Blob | Uint8Array,
    inputName: string,
    args: string[],
    outputName: string,
    outputMime: string,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<MediaProcessingResult>;
}

export interface IMediaProcessor {
  reverseVideo(input: MediaSourceInput, options?: VideoProcessOptions): Promise<MediaProcessingResult>;
  adjustSpeed(input: MediaSourceInput, speed: number, options?: VideoProcessOptions): Promise<MediaProcessingResult>;
  freezeFrame(input: MediaSourceInput, freezeTime: number, freezeDuration?: number): Promise<MediaProcessingResult>;
  extractAudio(input: MediaSourceInput, options?: AudioProcessOptions): Promise<MediaProcessingResult>;
  trimMedia(input: MediaSourceInput, startSec: number, endSec: number): Promise<MediaProcessingResult>;
  splitMedia(input: MediaSourceInput, splitSec: number): Promise<{ partA: MediaProcessingResult; partB: MediaProcessingResult }>;
}
