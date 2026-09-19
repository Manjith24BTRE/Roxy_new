// src/services/tests/FilterRendererArchitecture.test.ts
import { describe, it, expect, vi } from 'vitest';
import { filterRenderer } from '../FilterRenderer';
import { getDefaultClipFilterSpec, getDefaultClipAdjustments } from '../../types/assetInteraction';

describe('FilterRenderer Architecture & Single Source of Truth', () => {
  it('should instantiate FilterRenderer singleton instance', () => {
    expect(filterRenderer).toBeDefined();
    expect(typeof filterRenderer.renderFilterFrame).toBe('function');
    expect(typeof filterRenderer.getFFmpegFilterGraphString).toBe('function');
  });

  it('should store filter specs cleanly inside clip.filters array without mutating clip identity', () => {
    interface TimelineClip {
      id: string;
      mediaId: string;
      filters: Array<{
        filterId: string | null;
        intensity: number;
        opacity: number;
        blendMode: string;
      }>;
    }

    const clip: TimelineClip = {
      id: 'clip_video_001',
      mediaId: 'media_v1',
      filters: [],
    };

    // Apply filter: Hollywood Gold
    const spec = getDefaultClipFilterSpec('hollywood_gold');
    clip.filters = [spec];

    expect(clip.id).toBe('clip_video_001'); // Clip ID must remain 100% stable
    expect(clip.filters).toHaveLength(1);
    expect(clip.filters[0].filterId).toBe('hollywood_gold');
    expect(clip.filters[0].intensity).toBe(1.0);
    expect(clip.filters[0].opacity).toBe(100);
    expect(clip.filters[0].blendMode).toBe('normal');
  });

  it('should generate identical FFmpeg export filter string from clip filter spec & adjustments', () => {
    const spec = getDefaultClipFilterSpec('hollywood_gold');
    const adjustments = {
      ...getDefaultClipAdjustments(),
      brightness: 20,
      contrast: 10,
    };

    const filterGraph = filterRenderer.getFFmpegFilterGraphString(spec, adjustments);
    expect(filterGraph).toContain('eq=brightness=0.10:contrast=1.22');
    expect(filterGraph).toContain('colorbalance=');
  });

  it('should return default copy for empty filter specs and default adjustments', () => {
    const filterGraph = filterRenderer.getFFmpegFilterGraphString(null, getDefaultClipAdjustments());
    expect(filterGraph).toBe('copy');
  });
});
