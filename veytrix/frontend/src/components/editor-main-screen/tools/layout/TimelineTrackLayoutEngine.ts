export interface TrackSpec {
  rowHeight: number;
  clipHeight: number;
}

export const TIMELINE_TRACK_SPECS: Record<string, TrackSpec> = {
  music: { rowHeight: 36, clipHeight: 22 },
  audio: { rowHeight: 36, clipHeight: 22 },
  text: { rowHeight: 36, clipHeight: 22 },
  overlay: { rowHeight: 36, clipHeight: 22 },
  video: { rowHeight: 52, clipHeight: 40 },
};

export const DEFAULT_TRACK_SPEC: TrackSpec = {
  rowHeight: 36,
  clipHeight: 22,
};

/**
 * Returns the track layout specification (row height, clip height) for a track key.
 */
export function getTrackSpec(trackKey: string): TrackSpec {
  return TIMELINE_TRACK_SPECS[trackKey] || DEFAULT_TRACK_SPEC;
}

/**
 * Calculates the exact top offset (in pixels) required to vertically center
 * a clip element inside its track row container.
 */
export function calculateCenteredClipTop(rowHeight: number, clipHeight: number): number {
  return Math.max(0, Math.round((rowHeight - clipHeight) / 2));
}

/**
 * Single source of truth calculation for track vertical position Y given track index and track heights.
 */
export function getTrackY(trackIndex: number, trackHeights: number[], trackGap: number = 0): number {
  let y = 0;
  for (let i = 0; i < Math.min(trackIndex, trackHeights.length); i++) {
    y += trackHeights[i] + trackGap;
  }
  return y;
}
