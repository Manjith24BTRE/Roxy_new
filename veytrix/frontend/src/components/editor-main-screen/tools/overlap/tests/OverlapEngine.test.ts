import { describe, it, expect } from 'vitest';
import { OverlapManager } from '../OverlapManager';
import { CropData } from '../overlap.types';
import { OverlapUtils } from '../overlapUtils';
import { ClipReorderUtils } from '../clipReorderUtils';

describe('OverlapManager', () => {
  describe('Crop Validation', () => {
    it('should identify valid crop data', () => {
      const crop: CropData = { left: 10, right: 20, top: 5, bottom: 15 };
      expect(OverlapManager.isValidCrop(crop)).toBe(true);
    });

    it('should reject crop summing to >= 100%', () => {
      const crop: CropData = { left: 50, right: 50, top: 0, bottom: 0 };
      expect(OverlapManager.isValidCrop(crop)).toBe(false);
    });

    it('should clamp crop values safely', () => {
      const raw = { left: 110, right: -10, top: 50, bottom: 60 };
      const clamped = OverlapManager.clampCrop(raw);
      expect(clamped.left).toBe(99);
      expect(clamped.right).toBe(0);
      expect(clamped.top).toBe(50);
      expect(clamped.bottom).toBe(49); // 99 - 50 = 49
    });
  });
});

describe('OverlapUtils', () => {
  it('should convert a main video clip to overlay track', () => {
    const clip = { id: 'clip-1', name: 'Clip 1', duration: 5, timelineStart: 10 };
    const overlay = OverlapUtils.convertToOverlay(clip);
    expect(overlay.trackId).toBe('overlay');
    expect(overlay.scale).toBe(0.75);
    expect(overlay.timelineStart).toBe(0);
  });

  it('should preserve scale if keyframes exist when converting to overlay track', () => {
    const clip = { 
      id: 'clip-1', 
      name: 'Clip 1', 
      duration: 5, 
      timelineStart: 10, 
      scale: 0.6,
      keyframes: [{ id: 'kf-1', property: 'scale', time: 1.0, value: 0.6 }] 
    };
    const overlay = OverlapUtils.convertToOverlay(clip);
    expect(overlay.trackId).toBe('overlay');
    expect(overlay.scale).toBe(0.6);
  });

  it('should convert an overlay clip back to main video track', () => {
    const clip = { id: 'clip-1', name: 'Clip 1', duration: 5, timelineStart: 0, trackId: 'overlay', scale: 0.75 };
    const main = OverlapUtils.convertToMain(clip);
    expect(main.trackId).toBe('video');
    expect(main.scale).toBe(1.0);
  });
});

describe('ClipReorderUtils', () => {
  it('should snap main track clips but keep overlay clips at custom timelineStart', () => {
    const clips = [
      { id: 'clip-1', name: 'Clip A', duration: 5, timelineStart: 0 },
      { id: 'clip-2', name: 'Clip B', duration: 4, timelineStart: 10, trackId: 'overlay' },
      { id: 'clip-3', name: 'Clip C', duration: 3, timelineStart: 5 }
    ];

    const reflowed = ClipReorderUtils.recalculateClipSequence(clips);
    expect(reflowed[0].timelineStart).toBe(0); // Clip A (main) starts at 0
    expect(reflowed[1].timelineStart).toBe(10); // Clip B (overlay) preserves custom start of 10
    expect(reflowed[2].timelineStart).toBe(5); // Clip C (main) snaps to A's end: 0 + 5 = 5
  });
});
