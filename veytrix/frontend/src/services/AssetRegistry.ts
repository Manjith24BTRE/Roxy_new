// src/services/AssetRegistry.ts
import rawAssetCatalog from '../data/asset_catalog.json';

export interface AssetRecord {
  id: number;
  name: string;
  type: 'Filters' | 'Effects' | 'Transitions' | string;
  category: string;
  plan: string;
  engineKey: string | null;
  enabled: boolean;
  version: string;
}

export class AssetRegistry {
  private static instance: AssetRegistry;
  private assets: AssetRecord[] = [];

  private constructor() {
    this.assets = rawAssetCatalog as AssetRecord[];
    this.validateCatalog();
  }

  public static getInstance(): AssetRegistry {
    if (!AssetRegistry.instance) {
      AssetRegistry.instance = new AssetRegistry();
    }
    return AssetRegistry.instance;
  }

  /**
   * Validates the asset catalog against strict integrity constraints.
   */
  public validateCatalog(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const seenMap = new Map<string, Set<number>>();

    this.assets.forEach((asset, idx) => {
      if (!asset.id) {
        errors.push(`Record index ${idx}: Missing ID`);
      }
      if (!asset.name || asset.name.trim() === '') {
        errors.push(`Record ID ${asset.id}: Missing or empty NAME`);
      }
      if (!asset.type || asset.type.trim() === '') {
        errors.push(`Record ID ${asset.id}: Missing or empty TYPE`);
      }

      if (asset.type && asset.id) {
        if (!seenMap.has(asset.type)) {
          seenMap.set(asset.type, new Set());
        }
        const set = seenMap.get(asset.type)!;
        if (set.has(asset.id)) {
          errors.push(`Duplicate ID ${asset.id} for asset type ${asset.type}`);
        }
        set.add(asset.id);
      }
    });

    if (errors.length > 0) {
      console.error('[AssetRegistry Validation Error]', errors);
    } else {
      console.log(`[AssetRegistry] Successfully loaded and validated ${this.assets.length} assets from Assest.xlsx source of truth.`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get all registered assets (enabled only by default).
   */
  public getAllAssets(includeDisabled = false): AssetRecord[] {
    if (includeDisabled) return [...this.assets];
    return this.assets.filter((a) => a.enabled);
  }

  /**
   * Get assets filtered by type (e.g., 'Filters', 'Effects', 'Transitions').
   */
  public getAssetsByType(type: string, includeDisabled = false): AssetRecord[] {
    const normalizedType = type.toLowerCase();
    return this.getAllAssets(includeDisabled).filter(
      (a) => a.type.toLowerCase() === normalizedType
    );
  }

  /**
   * Get assets filtered by type and category.
   */
  public getAssetsByCategory(type: string, category: string, includeDisabled = false): AssetRecord[] {
    const normalizedCat = category.toLowerCase();
    return this.getAssetsByType(type, includeDisabled).filter(
      (a) => a.category.toLowerCase() === normalizedCat
    );
  }

  /**
   * Get unique categories for a given asset type.
   */
  public getCategories(type: string): string[] {
    const assets = this.getAssetsByType(type);
    const categorySet = new Set<string>();
    assets.forEach((a) => {
      if (a.category) categorySet.add(a.category);
    });
    return Array.from(categorySet);
  }

  /**
   * Find an asset by type and ID.
   */
  public getAssetById(type: string, id: number): AssetRecord | undefined {
    return this.getAssetsByType(type, true).find((a) => a.id === id);
  }

  /**
   * Find an asset by exact name.
   */
  public getAssetByName(name: string): AssetRecord | undefined {
    return this.assets.find((a) => a.name === name);
  }
}

export const assetRegistry = AssetRegistry.getInstance();
