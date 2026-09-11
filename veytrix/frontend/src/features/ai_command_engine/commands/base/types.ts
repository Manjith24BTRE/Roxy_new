import { CommandAction } from '../../types/commands';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';


export interface CommandMetadata {
  id: string;
  name: string;
  action: CommandAction;
  category: 'timeline' | 'audio' | 'transform' | 'effects' | 'backend';
  aliases: string[];
  description: string;
  requiredContext?: ('selectedClipId' | 'playheadTime' | 'clipDuration')[];
}

export interface CommandParseMatch {
  matched: boolean;
  confidence: number;
  extractedParams?: Record<string, any>;
  missingParams?: string[];
  message?: string;
}

export interface CommandExecutionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface EditorActionApi {
  // Timeline Operations
  splitClip?: (clipId: string, time?: number) => { success: boolean; error?: string } | void;
  trimClip?: (clipId: string, start: number, end: number) => void;
  deleteClip?: (clipId: string, ripple?: boolean) => void;
  duplicateClip?: (clipId: string) => void;
  moveClip?: (clipId: string, targetTime: number, trackId?: string) => void;
  seekPlayhead?: (time: number) => void;
  extendClip?: (clipId: string, seconds: number) => void;
  shortenClip?: (clipId: string, seconds: number) => void;
  selectClip?: (clipId: string) => void;
  selectTrack?: (trackId: string) => void;

  // Audio & Speed Operations
  setVolume?: (clipId: string, volume: number) => void;
  setMute?: (clipId: string, muted: boolean) => void;
  setSpeed?: (clipId: string, speed: number) => void;
  setAudioFade?: (clipId: string, fadeIn: number, fadeOut: number) => void;
  normalizeVolume?: (clipId: string) => void;

  // Transform & Settings
  rotateClip?: (clipId: string, angle: number) => void;
  setScale?: (clipId: string, scale: number) => void;
  setTransform?: (clipId: string, transform: { rotation?: number; scale?: number }) => void;
  setCanvasFormat?: (format: string) => void;
  detachAudio?: (clipId: string) => void;

  // Effects & Filters
  applyEffect?: (clipId: string, effectType: string, intensity?: number) => void;
  applyFilter?: (clipId: string, filterName: string) => void;
  removeFilter?: (clipId: string) => void;

  // Transitions
  addTransition?: (clipId: string, transitionType: string, duration?: number) => void;
  removeTransition?: (clipId: string) => void;

  // Text Overlay
  addText?: (text: string, style?: any) => void;
  editText?: (textId: string, newText: string) => void;
  deleteText?: (textId: string) => void;
  repositionText?: (textId: string, position: { x: number; y: number }) => void;

  // History / Transactions
  beginTransaction?: (label: string) => void;
  commitTransaction?: () => void;
  cancelTransaction?: () => void;
}

export interface ICommandModule {
  metadata: CommandMetadata;
  parse(prompt: string, context?: EditorContext): CommandParseMatch;
  validate(params: Record<string, any>, context?: EditorContext): ValidationResult;
  execute(params: Record<string, any>, editorApi?: EditorActionApi, context?: EditorContext): Promise<CommandExecutionResult> | CommandExecutionResult;
}
