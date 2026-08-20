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
  isAudioDetached?: boolean;
  detachedAudioId?: string;
  sourceVideoId?: string;
  isDetachedAudio?: boolean;
  appliedEffects?: any[];
  filters?: any[];
  keyframes?: any[];
  [key: string]: any;
}

export interface DetachValidationResult {
  canDetach: boolean;
  reason?: string;
  isNoAudioTrack?: boolean;
}

export interface DetachOptions {
  showToast?: (message: string) => void;
  clipId?: string;
  customAudioTrackId?: string;
  customName?: string;
}

export interface DetachedAudioResult<T = TimelineClipRef> {
  updatedClips: T[];
  detachedClip: T;
  sourceClip: T;
}

export interface IAudioDetachService {
  checkAudioPresence(clip: TimelineClipRef, mediaUrl?: string): Promise<boolean>;
  createAudioClipFromVideo<T extends TimelineClipRef>(
    videoClip: T,
    options?: DetachOptions
  ): T;
}

export interface ITimelineAudioManager {
  findNearestAudioTrack<T extends TimelineClipRef>(
    clips: T[],
    sourceVideoClip: T
  ): string;
  placeAudioClip<T extends TimelineClipRef>(
    clips: T[],
    audioClip: T,
    sourceVideoClipId: string
  ): T[];
}

export interface IDetachManager {
  validate(clip: TimelineClipRef | null | undefined, clips?: TimelineClipRef[]): DetachValidationResult;
  detachAudio<T extends TimelineClipRef>(
    clips: T[],
    clipId: string,
    options?: DetachOptions
  ): DetachedAudioResult<T> | null;
  undoDetach<T extends TimelineClipRef>(
    clips: T[],
    detachedClipId: string
  ): T[];
}
