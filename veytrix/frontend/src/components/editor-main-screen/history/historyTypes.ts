import { TextOverlay } from '../tools/text/TextPanel';
import { CaptionItem } from '../tools/captions/Captions';

export interface ProjectState {
  timelineClips: any[];
  aspectRatio: string;
  textOverlays: TextOverlay[];
  captions: CaptionItem[];
  activeFilterId: string | null;
  filterIntensity: number;
  filterOpacity: number;
  filterBlendMode: string;
  filterEnabled: boolean;
  activeEffectId: string | null;
  effectStrength: number;
  effectSpeed: number;
  volume: number;
  isMuted: boolean;
  canvasPos: { x: number; y: number };
  canvasScale: number;
  canvasRotation: number;
  lockedClips: Record<string, boolean>;
  mutedClips: Record<string, boolean>;
}

export interface HistoryEntry {
  id: string;
  type: string;
  label: string;
  timestamp: number;
  state: ProjectState;
}
