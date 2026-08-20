// -----------------------------------------------------------------------------
// export.types.ts
// -----------------------------------------------------------------------------
// TypeScript types matching backend export schemas.
// -----------------------------------------------------------------------------

/** Export job status lifecycle values */
export type ExportStatus =
  | 'pending'
  | 'queued'
  | 'rendering'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/** Video export settings matching backend ExportSettings schema */
export interface ExportSettings {
  resolution: '720p' | '1080p' | '2K' | '4K';
  fps: 24 | 30 | 60;
  aspect_ratio: '16:9' | '9:16' | '1:1' | '4:5';
  codec: 'h264' | 'hevc' | 'vp9';
  bitrate: 'standard' | 'high' | 'extreme';
  format: 'mp4' | 'webm' | 'mov';
  watermark: boolean;
}

/** Request payload to create a new export job */
export interface ExportCreatePayload {
  project_id: string;
  title?: string;
  timeline_json?: Record<string, unknown>;
  settings: ExportSettings;
}

/** Full export job response from backend */
export interface ExportJob {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  resolution: string;
  fps: number;
  format: string;
  codec: string;
  bitrate: string;
  watermark: boolean;
  status: ExportStatus;
  progress: number;
  file_url: string | null;
  storage_path: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/** Lightweight status polling response */
export interface ExportStatusResponse {
  id: string;
  status: ExportStatus;
  progress: number;
  file_url: string | null;
  error_message: string | null;
  updated_at: string;
}

/** Download URL response */
export interface ExportDownloadResponse {
  export_id: string;
  download_url: string;
  expires_in_seconds: number;
  file_name: string;
}

/** Paginated export list response */
export interface ExportListResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  exports: ExportJob[];
}
