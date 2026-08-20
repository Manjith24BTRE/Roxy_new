export interface DuplicateClipResult<T = any> {
  duplicatedClip: T;
  updatedClips: T[];
}

export interface DuplicateTimelineClipOptions {
  lockedTracks?: Record<string, boolean>;
  lockedClips?: Record<string, boolean>;
  showToast?: (message: string) => void;
}

export interface DuplicateEffectCheckResult {
  canDuplicate: boolean;
  message?: string;
}
