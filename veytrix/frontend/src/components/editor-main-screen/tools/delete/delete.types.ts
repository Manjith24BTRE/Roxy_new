// src/components/editor-main-screen/tools/delete/delete.types.ts

export interface DeleteValidationResult {
  canDelete: boolean;
  reason?: string;
}

export interface DeleteResult<T = any> {
  success: boolean;
  deletedClipId?: string;
  updatedTimelineClips?: T[];
  nextSelectedClip?: T | null;
  message?: string;
}

export interface DeleteOptions {
  isRipple?: boolean;
  lockedTracks?: Record<string, boolean>;
  lockedClips?: Record<string, boolean>;
}
