import { CacheItem, ICacheManager } from './processor.types';

export class CacheManager implements ICacheManager {
  private cache: Map<string, CacheItem> = new Map();
  private maxItems: number = 50;

  get(key: string): CacheItem | null {
    const item = this.cache.get(key);
    if (!item) return null;
    return item;
  }

  set(key: string, blob: Blob, mimeType: string = 'video/mp4'): CacheItem {
    if (this.cache.has(key)) {
      const existing = this.cache.get(key)!;
      URL.revokeObjectURL(existing.url);
      this.cache.delete(key);
    }

    if (this.cache.size >= this.maxItems) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.delete(oldestKey);
      }
    }

    const url = URL.createObjectURL(blob);
    const cacheItem: CacheItem = {
      key,
      blob,
      url,
      timestamp: Date.now(),
      mimeType,
      size: blob.size
    };

    this.cache.set(key, cacheItem);
    return cacheItem;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): void {
    const item = this.cache.get(key);
    if (item) {
      URL.revokeObjectURL(item.url);
      this.cache.delete(key);
    }
  }

  clear(): void {
    this.cache.forEach((item) => {
      URL.revokeObjectURL(item.url);
    });
    this.cache.clear();
  }
}

export const cacheManager = new CacheManager();
