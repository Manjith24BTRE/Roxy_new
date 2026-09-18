import { describe, it, expect } from 'vitest';
import {
  getTrackSpec,
  calculateCenteredClipTop,
  getTrackY,
  TIMELINE_TRACK_SPECS,
  DEFAULT_TRACK_SPEC
} from '../TimelineTrackLayoutEngine';

describe('TimelineTrackLayoutEngine', () => {
  it('should return correct track specs for all supported track types', () => {
    expect(getTrackSpec('music')).toEqual({ rowHeight: 36, clipHeight: 22 });
    expect(getTrackSpec('audio')).toEqual({ rowHeight: 36, clipHeight: 22 });
    expect(getTrackSpec('text')).toEqual({ rowHeight: 36, clipHeight: 22 });
    expect(getTrackSpec('overlay')).toEqual({ rowHeight: 36, clipHeight: 22 });
    expect(getTrackSpec('video')).toEqual({ rowHeight: 52, clipHeight: 40 });
  });

  it('should return default track spec for unknown track types', () => {
    expect(getTrackSpec('unknown')).toEqual(DEFAULT_TRACK_SPEC);
  });

  it('should accurately calculate centered top offset for clip rows', () => {
    // Row height 36px, clip height 22px -> centered top: (36 - 22) / 2 = 7px
    expect(calculateCenteredClipTop(36, 22)).toBe(7);

    // Row height 52px, clip height 40px -> centered top: (52 - 40) / 2 = 6px
    expect(calculateCenteredClipTop(52, 40)).toBe(6);

    // Edge case: clip height larger than row height
    expect(calculateCenteredClipTop(30, 40)).toBe(0);
  });

  it('should calculate cumulative track Y positions without negative margins or offsets', () => {
    const trackHeights = [36, 36, 36, 52]; // Music, Text, Overlay, Video
    const trackGap = 4;

    expect(getTrackY(0, trackHeights, trackGap)).toBe(0);
    expect(getTrackY(1, trackHeights, trackGap)).toBe(40); // 36 + 4
    expect(getTrackY(2, trackHeights, trackGap)).toBe(80); // 36 + 4 + 36 + 4
    expect(getTrackY(3, trackHeights, trackGap)).toBe(120); // 36 + 4 + 36 + 4 + 36 + 4
  });

  it('should guarantee equal top and bottom padding around centered clips', () => {
    const spec = TIMELINE_TRACK_SPECS.text;
    const top = calculateCenteredClipTop(spec.rowHeight, spec.clipHeight);
    const bottom = spec.rowHeight - (top + spec.clipHeight);

    expect(top).toBe(bottom);
    expect(top).toBeGreaterThanOrEqual(4); // Ensures selection ring (2px) never touches adjacent tracks
  });
});
