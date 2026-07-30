export interface AudioAsset {
  id: string;
  name: string;
  url: string;
  file?: File;
  duration: number;
  format: string;
  sampleRate?: number;
  channels?: number;
  waveformData?: number[];
  icon?: string;
  size?: number;
  createdAt: number;
}

export interface AudioClipRef {
  id: string;
  name: string;
  url: string;
  timelineStart: number;
  duration: number;
  startOffset: number;
  baseDuration?: number;
  playbackRate?: number;
  speed?: number;
  volume?: number;
  fadeIn?: number;
  fadeOut?: number;
  isMuted?: boolean;
  isLocked?: boolean;
  trackId: string;
  type: 'audio';
  mediaType: 'audio';
  mediaId?: string;
  [key: string]: any;
}

export interface AudioValidationResult {
  isValid: boolean;
  reason?: string;
}

export interface ImportAudioOptions {
  showToast?: (message: string) => void;
}

export interface IAudioImporter {
  importAudioFile(file: File, options?: ImportAudioOptions): Promise<AudioAsset | null>;
}

export interface IAudioLibrary {
  getAssets(): AudioAsset[];
  getAssetById(id: string): AudioAsset | null;
  addAsset(asset: AudioAsset): void;
  removeAsset(id: string): boolean;
  clear(): void;
}

export interface IAudioTrackManager {
  createAudioClipFromAsset(asset: AudioAsset, playheadTime: number): AudioClipRef;
  addClipToTimeline<T extends AudioClipRef>(
    clips: T[],
    asset: AudioAsset,
    playheadTime: number
  ): { updatedClips: T[]; createdClip: T };
}

export interface IWaveformGenerator {
  generateWaveform(fileOrUrl: File | Blob | string, numPeaks?: number): Promise<number[]>;
}

export interface IAudioManager {
  importAudioFile(file: File, options?: ImportAudioOptions): Promise<AudioAsset | null>;
  addAudioToTimeline<T extends AudioClipRef>(
    clips: T[],
    assetId: string,
    playheadTime: number
  ): { updatedClips: T[]; createdClip: T | null };
  getLibraryAssets(): AudioAsset[];
  removeLibraryAsset(id: string): boolean;
}
