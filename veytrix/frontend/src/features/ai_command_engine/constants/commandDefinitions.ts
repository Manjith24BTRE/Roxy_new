import { CommandAction } from '../types/commands';

export interface CommandDefinition {
  action: CommandAction;
  aliases: string[];
  description: string;
}

export const SUPPORTED_ACTIONS: CommandAction[] = [
  'trim',
  'split',
  'delete',
  'speed',
  'mute',
  'volume',
  'rotate',
  'crop',
  'zoom',
  'effect',
];

export const COMMAND_DEFINITIONS: Record<string, CommandDefinition> = {
  trim: {
    action: 'trim',
    aliases: ['trim', 'trim clip', 'shorten clip', 'cut beginning', 'cut'],
    description: 'Trim or shorten the beginning of a clip',
  },
  speed: {
    action: 'speed',
    aliases: ['speed', 'speed up', 'make faster'],
    description: 'Adjust playback speed rate',
  },
  mute: {
    action: 'mute',
    aliases: ['mute', 'mute audio', 'silence', 'turn off sound'],
    description: 'Mute audio on clip',
  },
  split: {
    action: 'split',
    aliases: [
      'split',
      'split clip',
      'split video',
      'cut here',
      'cut clip here',
      'split at playhead',
      'split at current position',
      'cut at current position',
      'split at 5 seconds',
      'split at 10s',
      'split at 00:00:05',
      'split at 1 minute',
      'split at 50%',
      'split in half',
      'split in middle',
      'split at midpoint',
    ],
    description: 'Split clip at playhead, timestamp, or midpoint',
  },
  delete: {
    action: 'delete',
    aliases: ['delete', 'remove clip', 'trash'],
    description: 'Remove selected clip from timeline',
  },
  volume: {
    action: 'volume',
    aliases: ['volume', 'set volume', 'change volume'],
    description: 'Set volume level',
  },
  rotate: {
    action: 'rotate',
    aliases: ['rotate', 'turn', 'rotate video'],
    description: 'Rotate clip orientation',
  },
  crop: {
    action: 'crop',
    aliases: ['crop', 'crop frame'],
    description: 'Crop video frame boundary',
  },
  zoom: {
    action: 'zoom',
    aliases: ['zoom', 'zoom in', 'zoom out'],
    description: 'Adjust visual zoom level',
  },
  effect: {
    action: 'effect',
    aliases: ['effect', 'apply effect', 'add filter'],
    description: 'Apply visual effect or filter',
  },
};

export const PARSER_MAPPINGS = {
  trim: {
    intentPatterns: [
      /\btrim\b/i,
      /\bcut\b/i,
      /\bshorten\b/i,
      /\bremove\s+beginning\b/i,
      /\bcut\s+beginning\b/i,
    ],
  },
  speed: {
    intentPattern: /\bspeed\s+(\d+(?:\.\d+)?)x?\b/i,
  },
  mute: {
    intentPattern: /\bmute(\s+audio)?\b/i,
  },
  split: {
    middlePatterns: [
      /\bsplit\s+(in\s+)?(half|middle|midpoint)\b/i,
      /\bsplit\s+at\s+(the\s+)?(middle|midpoint|50%)\b/i,
      /\bcut\s+(in\s+)?(half|middle|midpoint)\b/i,
    ],
    timestampPattern: /\b(?:split|cut)\s+at\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\b/i,
    timeDurationPattern: /\b(?:split|cut)\s+at\s+(\d+(?:\.\d+)?)\s*(seconds?|sec|s|minutes?|min|m)\b/i,
    playheadPatterns: [
      /\bsplit\s+at\s+(the\s+)?(playhead|current\s+position)\b/i,
      /\bcut\s+at\s+(the\s+)?(playhead|current\s+position)\b/i,
      /\bcut\s+(clip\s+)?here\b/i,
      /^\s*split(\s+clip|\s+video)?\s*$/i,
    ],
  },
};
