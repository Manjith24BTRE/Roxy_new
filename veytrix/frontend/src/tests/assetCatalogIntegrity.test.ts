// src/tests/assetCatalogIntegrity.test.ts
import { describe, it, expect } from 'vitest';
import { assetRegistry } from '../services/AssetRegistry';
import rawAssetCatalog from '../data/asset_catalog.json';

describe('Asset Catalog Integrity Tests (Assest.xlsx Source of Truth)', () => {
  it('should successfully load the 210 assets from Assest.xlsx', () => {
    const assets = assetRegistry.getAllAssets(true);
    expect(assets.length).toBe(210);
  });

  it('should maintain exact 1:1 name parity with raw catalog metadata', () => {
    const assets = assetRegistry.getAllAssets(true);
    assets.forEach((asset, idx) => {
      const raw = rawAssetCatalog[idx];
      expect(asset.id).toBe(raw.id);
      expect(asset.name).toBe(raw.name);
      expect(asset.type).toBe(raw.type);
      expect(asset.category).toBe(raw.category);
      expect(asset.plan).toBe(raw.plan);
      expect(asset.enabled).toBe(raw.enabled);
      expect(asset.version).toBe(raw.version);
    });
  });

  it('should contain 50 Filters, 100 Effects, and 60 Transitions', () => {
    const filters = assetRegistry.getAssetsByType('Filters', true);
    const effects = assetRegistry.getAssetsByType('Effects', true);
    const transitions = assetRegistry.getAssetsByType('Transitions', true);

    expect(filters.length).toBe(50);
    expect(effects.length).toBe(100);
    expect(transitions.length).toBe(60);
  });

  it('should ensure all enabled asset names are non-empty strings', () => {
    const activeAssets = assetRegistry.getAllAssets(false);
    activeAssets.forEach((asset) => {
      expect(typeof asset.name).toBe('string');
      expect(asset.name.length).toBeGreaterThan(0);
    });
  });

  it('should pass catalog validation without any errors', () => {
    const validation = assetRegistry.validateCatalog();
    expect(validation.valid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });
});
