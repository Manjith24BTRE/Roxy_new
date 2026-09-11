export type CommandAction =
  | 'trim'
  | 'split'
  | 'delete'
  | 'ripple_delete'
  | 'speed'
  | 'mute'
  | 'volume'
  | 'rotate'
  | 'scale'
  | 'crop'
  | 'zoom'
  | 'effect'
  | 'aspect_ratio'
  | 'detach_audio'
  | 'move_clip'
  | 'move_playhead'
  | 'extend_clip'
  | 'shorten_clip'
  | 'select_clip'
  | 'select_track'
  | 'filter'
  | 'remove_filter'
  | 'transition'
  | 'remove_transition'
  | 'add_text'
  | 'edit_text'
  | 'delete_text'
  | 'reposition_text'
  | 'fade_in'
  | 'fade_out'
  | 'normalize_volume';


export interface AICommand {
  action: CommandAction;
  mode?: 'playhead' | 'time' | 'middle';
  time?: number;
  start?: number;
  end?: number;
  speed?: number;
  target?: string;
  value?: number | string;
  effectType?: string;
  filterName?: string;
  transitionType?: string;
  duration?: number;
  text?: string;
  trackId?: string;
  [key: string]: any;
}

export interface ParseResult {
  success: boolean;
  command?: AICommand;
  commands?: AICommand[];
  isMultiCommand?: boolean;
  error?: string;
  requiresInput?: boolean;
  missing?: string[];
  message?: string;
  normalizedPrompt?: string;
  fuzzyMatched?: boolean;
}

