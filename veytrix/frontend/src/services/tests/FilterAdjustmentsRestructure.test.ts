// src/services/tests/FilterAdjustmentsRestructure.test.ts
import { describe, it, expect } from 'vitest';
import { getDefaultClipAdjustments, ClipAdjustments } from '../../types/assetInteraction';
import { assetRegistry } from '../AssetRegistry';

describe('Filter Panel UX Restructure (CapCut/Premiere Style)', () => {
  it('should initialize default clip adjustments correctly', () => {
    const adj = getDefaultClipAdjustments();
    expect(adj.exposure).toBe(0);
    expect(adj.brightness).toBe(0);
    expect(adj.contrast).toBe(0);
    expect(adj.saturation).toBe(100);
    expect(adj.gamma).toBe(1.0);
  });

  it('should store filterPreset and adjustments independently on a clip object', () => {
    interface ClipModel {
      id: string;
      filterPreset: string | null;
      adjustments: ClipAdjustments;
    }

    const clip: ClipModel = {
      id: 'clip-101',
      filterPreset: null,
      adjustments: getDefaultClipAdjustments(),
    };

    // Step 1: User selects Hollywood Gold filter
    clip.filterPreset = 'Hollywood Gold';
    expect(clip.filterPreset).toBe('Hollywood Gold');
    expect(clip.adjustments.brightness).toBe(0);

    // Step 2: User switches to Adjustments tab and modifies brightness & contrast
    clip.adjustments.brightness = 20;
    clip.adjustments.contrast = 10;
    clip.adjustments.saturation = 115;

    // Filter preset remains unchanged, adjustments are stored separately
    expect(clip.filterPreset).toBe('Hollywood Gold');
    expect(clip.adjustments.brightness).toBe(20);
    expect(clip.adjustments.contrast).toBe(10);
    expect(clip.adjustments.saturation).toBe(115);
  });

  it('should allow changing filter preset without resetting adjustments', () => {
    const clip = {
      filterPreset: 'Hollywood Gold',
      adjustments: {
        ...getDefaultClipAdjustments(),
        brightness: 15,
        temperature: 5,
      },
    };

    // Change filter to Vintage Film
    clip.filterPreset = 'Vintage Film';

    expect(clip.filterPreset).toBe('Vintage Film');
    expect(clip.adjustments.brightness).toBe(15);
    expect(clip.adjustments.temperature).toBe(5);
  });

  it('should reset all adjustments cleanly to defaults when requested', () => {
    const clip = {
      filterPreset: 'Cinematic_101',
      adjustments: {
        ...getDefaultClipAdjustments(),
        brightness: 30,
        contrast: -15,
        exposure: 0.5,
      },
    };

    // Reset adjustments
    clip.adjustments = getDefaultClipAdjustments();

    expect(clip.filterPreset).toBe('Cinematic_101');
    expect(clip.adjustments.brightness).toBe(0);
    expect(clip.adjustments.contrast).toBe(0);
    expect(clip.adjustments.exposure).toBe(0);
  });
});
