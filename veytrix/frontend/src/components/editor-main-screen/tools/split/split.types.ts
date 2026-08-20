// src/components/editor-main-screen/tools/split/split.types.ts

export interface SplitValidationResult {
  canSplit: boolean;
  reason?: string;
}

export interface SplitResult<T = any> {
  success: boolean;
  leftClip?: T;
  rightClip?: T;
  updatedTimelineClips?: T[];
  message?: string;
}

export interface SplitOptions {
  minEdgeThreshold?: number; // default 0.2s
}
