export interface CropData {
  top: number;    // percentage 0-100
  bottom: number; // percentage 0-100
  left: number;   // percentage 0-100
  right: number;  // percentage 0-100
}

export interface OverlapBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
}

export type OverlapTransitionType =
  | 'crossfade'
  | 'fade'
  | 'fade-black'
  | 'fade-white'
  | 'blur'
  | 'zoom'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'none';

export type OverlapAudioMode =
  | 'crossfade'
  | 'keep-both'
  | 'mute-outgoing'
  | 'mute-incoming';

export interface OverlapData {
  id: string;
  clipAId: string;
  clipBId: string;
  overlapStart: number;
  overlapEnd: number;
  overlapDuration: number;
  transition: {
    type: OverlapTransitionType;
    easing?: string;
    direction?: string;
    intensity?: number;
  };
  audioMode: OverlapAudioMode;
}
