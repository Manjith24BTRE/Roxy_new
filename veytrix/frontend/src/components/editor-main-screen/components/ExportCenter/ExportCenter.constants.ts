// ExportCenter.constants.ts
// Default export settings and option lists for the ExportCenter modal.

import type { ExportSettings } from '../../../../types/export.types';

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  resolution: '1080p',
  fps: 30,
  aspect_ratio: '16:9',
  codec: 'h264',
  bitrate: 'standard',
  format: 'mp4',
  watermark: true,
};

export const RESOLUTION_OPTIONS = ['720p', '1080p', '2K', '4K'] as const;
export const FPS_OPTIONS = [24, 30, 60] as const;
export const CODEC_OPTIONS = [
  { value: 'h264', label: 'H.264 (Best compatibility)' },
  { value: 'hevc', label: 'HEVC / H.265 (Smaller size)' },
  { value: 'vp9', label: 'VP9 (WebM)' },
] as const;
export const BITRATE_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High' },
  { value: 'extreme', label: 'Extreme' },
] as const;
export const FORMAT_OPTIONS = [
  { value: 'mp4', label: 'MP4' },
  { value: 'webm', label: 'WebM' },
  { value: 'mov', label: 'MOV' },
] as const;
export const ASPECT_RATIO_OPTIONS = ['16:9', '9:16', '1:1', '4:5'] as const;

export const POLL_INTERVAL_MS = 1500;
