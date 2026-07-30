import { AudioAsset, IAudioLibrary } from './Audio.types';

export class AudioLibrary implements IAudioLibrary {
  private assets: Map<string, AudioAsset> = new Map();

  getAssets(): AudioAsset[] {
    return Array.from(this.assets.values());
  }

  getAssetById(id: string): AudioAsset | null {
    return this.assets.get(id) || null;
  }

  addAsset(asset: AudioAsset): void {
    this.assets.set(asset.id, asset);
  }

  removeAsset(id: string): boolean {
    const asset = this.assets.get(id);
    if (asset) {
      if (asset.url && asset.url.startsWith('blob:')) {
        URL.revokeObjectURL(asset.url);
      }
      return this.assets.delete(id);
    }
    return false;
  }

  clear(): void {
    this.assets.forEach((asset) => {
      if (asset.url && asset.url.startsWith('blob:')) {
        URL.revokeObjectURL(asset.url);
      }
    });
    this.assets.clear();
  }
}

export const audioLibrary = new AudioLibrary();
