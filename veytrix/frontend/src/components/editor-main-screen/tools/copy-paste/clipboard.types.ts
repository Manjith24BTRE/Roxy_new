export interface ClipboardClipItem {
  id: string;
  name: string;
  mediaId?: string;
  type?: string;
  url?: string;
  start?: number;
  timelineStart?: number;
  duration: number;
  sourceStart?: number;
  sourceEnd?: number;
  trimIn?: number;
  trimOut?: number;
  playbackRate?: number;
  speed?: number;
  trackId?: string;
  color?: string;
  volume?: number;
  isMuted?: boolean;
  isLocked?: boolean;
  transform?: {
    x?: number;
    y?: number;
    scale?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    opacity?: number;
    crop?: any;
    fit?: string;
  };
  appliedEffects?: Array<{
    id: string;
    name?: string;
    presetId?: string;
    [key: string]: any;
  }>;
  effects?: any[];
  filters?: any[];
  keyframes?: Array<{
    id: string;
    time?: number;
    [key: string]: any;
  }>;
  animations?: any[];
  transitions?: any[];
  linkedClipId?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface ClipboardPayload {
  clips: ClipboardClipItem[];
  copiedAt: number;
}

export interface CopyOptions {
  showToast?: (message: string) => void;
}

export interface PasteOptions {
  currentTime?: number;
  selectedClipId?: string | null;
  targetTrackId?: string;
  recalculateSequence?: (clips: any[]) => any[];
}

export interface PasteResult<T = any> {
  success: boolean;
  updatedClips: T[];
  pastedClips: T[];
  message?: string;
}

export interface ClipboardState {
  payload: ClipboardPayload | null;
  timestamp: number | null;
}
