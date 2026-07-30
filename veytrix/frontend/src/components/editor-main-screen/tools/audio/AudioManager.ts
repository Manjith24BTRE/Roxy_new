import { AudioAsset, AudioClipRef, IAudioManager, ImportAudioOptions } from './Audio.types';
import { audioImporter } from './AudioImporter';
import { audioLibrary } from './AudioLibrary';
import { audioTrackManager } from './AudioTrackManager';

export class AudioManager implements IAudioManager {
  private static instance: AudioManager;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async importAudioFile(file: File, options: ImportAudioOptions = {}): Promise<AudioAsset | null> {
    const asset = await audioImporter.importAudioFile(file, options);
    if (asset) {
      audioLibrary.addAsset(asset);
    }
    return asset;
  }

  addAudioToTimeline<T extends AudioClipRef>(
    clips: T[],
    assetId: string,
    playheadTime: number = 0
  ): { updatedClips: T[]; createdClip: T | null } {
    const asset = audioLibrary.getAssetById(assetId);
    if (!asset) {
      return { updatedClips: clips, createdClip: null };
    }

    const { updatedClips, createdClip } = audioTrackManager.addClipToTimeline(clips, asset, playheadTime);
    return { updatedClips, createdClip };
  }

  getLibraryAssets(): AudioAsset[] {
    return audioLibrary.getAssets();
  }

  removeLibraryAsset(id: string): boolean {
    return audioLibrary.removeAsset(id);
  }
}

export const audioManager = AudioManager.getInstance();
