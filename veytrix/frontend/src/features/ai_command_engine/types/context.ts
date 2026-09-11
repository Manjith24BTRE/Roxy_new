export interface EditorContext {
  selectedClipId?: string;
  selectedTrackId?: string;
  selectedAssetType?: string;
  clipDuration?: number;
  playheadTime?: number;
  clipStartTime?: number;
  clipEndTime?: number;
  selectedClip?: any;
  activeEffects?: string[];
  activeFilter?: string;
  activeTransition?: string;
  tracksList?: Array<{ id: string; name?: string; type?: string }>;
  clipsList?: Array<{ id: string; name?: string; start: number; end: number }>;
  selectedTextId?: string;
  selectedTextContent?: string;
  totalDuration?: number;
}

