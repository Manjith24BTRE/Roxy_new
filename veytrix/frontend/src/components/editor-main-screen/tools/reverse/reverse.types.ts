export interface ReversibleClip {
  id: string;
  name: string;
  isReversed?: boolean;
  startOffset?: number;
  timelineStart?: number;
  duration: number;
  baseDuration?: number;
  speed?: number;
  [key: string]: any;
}

export interface ReverseValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ReverseResult<T = any> {
  success: boolean;
  updatedClips: T[];
  targetClip: T | null;
  isReversed: boolean;
  message?: string;
}

export interface ReverseOptions {
  showToast?: (message: string) => void;
}
