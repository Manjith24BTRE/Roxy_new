export interface TimelineClipRef {
  id: string;
  name: string;
  url?: string;
  start?: number;
  timelineStart?: number;
  duration: number;
  baseDuration?: number;
  startOffset?: number;
  playbackRate?: number;
  speed?: number;
  trackId?: string;
  type?: string;
  mediaType?: string;
  mediaId?: string;
  thumbnails?: string[];
  isLocked?: boolean;
  isMuted?: boolean;
  isReversed?: boolean;
  isFreezeFrame?: boolean;
  freezeSourceTime?: number;
  appliedEffects?: any[];
  filters?: any[];
  keyframes?: any[];
  transitions?: any[];
  transforms?: Record<string, any>;
  [key: string]: any;
}

export interface FreezeOptions {
  duration?: number;
  silent?: boolean;
  showToast?: (message: string) => void;
  targetClipId?: string;
  playheadTime?: number;
  videoElement?: HTMLVideoElement | null;
}

export interface FreezeValidationResult {
  canFreeze: boolean;
  reason?: string;
}

export interface FreezeOperationResult<T extends TimelineClipRef = TimelineClipRef> {
  updatedClips: T[];
  videoAPart: T;
  freezeClip: T;
  videoBPart: T;
  createdFreezeClipId: string;
}

export interface IFreezeFrameGenerator {
  captureStillFrame(clipUrl?: string, frameTime?: number): Promise<string | undefined>;
  createFreezeClip<T extends TimelineClipRef>(
    sourceClip: T,
    frameTime: number,
    freezeDuration?: number,
    frameDataUrl?: string
  ): T;
}

export interface ITimelineFreezeManager {
  applyFreezeFrame<T extends TimelineClipRef>(
    clips: T[],
    sourceClipId: string,
    playheadTime: number,
    options?: FreezeOptions
  ): FreezeOperationResult<T> | null;
}

export interface IFreezeManager {
  validate(clip: TimelineClipRef | null | undefined, playheadTime: number): FreezeValidationResult;
  freezeFrame<T extends TimelineClipRef>(
    clips: T[],
    sourceClipId: string,
    playheadTime: number,
    options?: FreezeOptions
  ): FreezeOperationResult<T> | null;
}
