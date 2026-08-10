import { CropData } from './overlap.types';

export interface TimelineClip {
  id: string;
  name: string;
  mediaId?: string;
  url?: string;
  src?: string;
  trackId?: string;
  type?: string;
  assetType?: string;
  timelineStart: number;
  start?: number;
  duration: number;
  startOffset?: number;
  playbackRate?: number;
  speed?: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
  crop?: CropData;
  isMuted?: boolean;
  isLocked?: boolean;
  isFreezeFrame?: boolean;
  isReversed?: boolean;
  keyframes?: any[];
  [key: string]: any;
}
