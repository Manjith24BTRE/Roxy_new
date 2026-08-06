// src/components/editor-main-screen/tools/project-save/projectSave.types.ts

export interface ProjectSavePayload {
  id: string; // Project ID or displayVideoName key
  name: string;
  updatedAt: number;
  timelineClips: any[];
  textOverlays: any[];
  captions: any[];
  aspectRatio: string;
  currentTime: number;
  activeSelectedClipId: string | null;
  activeMediaId: string | null;
  volume: number;
  isMuted: boolean;
  mutedClips: Record<string, boolean>;
  lockedClips: Record<string, boolean>;
  pxPerSec?: number;
  zoomLevel?: number;
  mediaFiles?: any[];
}

export interface ProjectSaveOptions {
  autoSaveIntervalMs?: number; // default 30000ms (30s)
  enableAutoSave?: boolean;
}

export interface ProjectRestoreResult {
  success: boolean;
  project?: ProjectSavePayload;
  message?: string;
}
