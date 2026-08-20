export interface TimelineClipRef {
  id: string;
  name: string;
  start?: number;
  timelineStart?: number;
  duration: number;
  baseDuration?: number;
  startOffset?: number;
  playbackRate?: number;
  speed?: number;
  trackId?: string;
  type?: 'video' | 'audio' | 'image' | string;
  mediaType?: 'video' | 'audio' | 'image' | string;
  mediaId?: string;
  url?: string;
  color?: string;
  volume?: number;
  isMuted?: boolean;
  hasAudio?: boolean;
  isLocked?: boolean;
  appliedEffects?: any[];
  filters?: any[];
  keyframes?: any[];
  transitions?: any[];
  [key: string]: any;
}

export interface LockValidationResult {
  canLock: boolean;
  canUnlock: boolean;
  isLocked: boolean;
  reason?: string;
}

export interface EditValidationResult {
  allowed: boolean;
  message?: string;
}

export interface LockOptions {
  showToast?: (message: string) => void;
  forceState?: boolean;
  silent?: boolean;
}

export interface LockOperationResult<T = TimelineClipRef> {
  updatedClips: T[];
  updatedLockedMap: Record<string, boolean>;
  affectedClipIds: string[];
  isLockedNow: boolean;
}

export interface IClipLockService {
  lockClip<T extends TimelineClipRef>(clip: T): T;
  unlockClip<T extends TimelineClipRef>(clip: T): T;
  toggleClipLock<T extends TimelineClipRef>(clip: T): T;
  batchLockClips<T extends TimelineClipRef>(clips: T[], targetIds: string[]): T[];
  batchUnlockClips<T extends TimelineClipRef>(clips: T[], targetIds: string[]): T[];
}

export interface ITimelineLockManager {
  applyLockState<T extends TimelineClipRef>(
    clips: T[],
    targetIds: string[],
    lockedState: boolean,
    currentLockedMap?: Record<string, boolean>
  ): LockOperationResult<T>;

  toggleLockState<T extends TimelineClipRef>(
    clips: T[],
    targetIds: string[],
    currentLockedMap?: Record<string, boolean>
  ): LockOperationResult<T>;
}

export interface ILockManager {
  validateLockState(
    clip: TimelineClipRef | null | undefined,
    lockedMap?: Record<string, boolean>
  ): LockValidationResult;

  validateCanEdit(
    clip: TimelineClipRef | null | undefined,
    actionName?: string,
    lockedMap?: Record<string, boolean>
  ): EditValidationResult;

  toggleLock<T extends TimelineClipRef>(
    clips: T[],
    targetIdOrIds: string | string[],
    options?: LockOptions,
    currentLockedMap?: Record<string, boolean>
  ): LockOperationResult<T>;

  lockClips<T extends TimelineClipRef>(
    clips: T[],
    targetIdOrIds: string | string[],
    options?: LockOptions,
    currentLockedMap?: Record<string, boolean>
  ): LockOperationResult<T>;

  unlockClips<T extends TimelineClipRef>(
    clips: T[],
    targetIdOrIds: string | string[],
    options?: LockOptions,
    currentLockedMap?: Record<string, boolean>
  ): LockOperationResult<T>;
}
