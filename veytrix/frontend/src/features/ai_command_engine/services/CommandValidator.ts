import { AICommand } from '../types/commands';
import { EditorContext } from '../types/context';
import { SUPPORTED_ACTIONS } from '../constants/commandDefinitions';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export class CommandValidator {
  public static validate(command: AICommand, context?: EditorContext): ValidationResult {
    if (!command || !command.action) {
      return { valid: false, error: 'Command action is required' };
    }

    if (!SUPPORTED_ACTIONS.includes(command.action)) {
      return { valid: false, error: `Unsupported action: "${command.action}"` };
    }

    switch (command.action) {
      case 'split': {
        const targetClipId = command.target || context?.selectedClipId;
        if (!targetClipId) {
          return { valid: false, error: 'No clip selected' };
        }

        const minThreshold = 0.2;
        const duration = context?.clipDuration;

        if (command.mode === 'time') {
          if (typeof command.time !== 'number') {
            return { valid: false, error: 'Time parameter is required for time-based split' };
          }
          if (command.time < 0) {
            return { valid: false, error: 'Cannot split at negative time' };
          }
          if (typeof duration === 'number' && command.time >= duration) {
            return { valid: false, error: 'Split time exceeds clip duration' };
          }
          if (
            command.time <= minThreshold ||
            (typeof duration === 'number' && command.time >= duration - minThreshold)
          ) {
            return { valid: false, error: 'Cannot split at start or end of clip' };
          }
        } else if (command.mode === 'middle') {
          if (typeof duration === 'number' && duration <= minThreshold * 2) {
            return { valid: false, error: 'Clip duration is too short to split in half' };
          }
        } else {
          // Playhead mode
          if (
            typeof context?.playheadTime === 'number' &&
            typeof context?.clipStartTime === 'number' &&
            typeof context?.clipEndTime === 'number'
          ) {
            if (
              context.playheadTime <= context.clipStartTime + minThreshold ||
              context.playheadTime >= context.clipEndTime - minThreshold
            ) {
              return { valid: false, error: 'Cannot split clip at current playhead position' };
            }
          }
        }
        break;
      }

      case 'trim': {
        if (typeof command.start !== 'number' || typeof command.end !== 'number') {
          return { valid: false, error: 'Trim command requires numeric start and end parameters' };
        }
        if (command.start < 0 || command.end < 0) {
          return { valid: false, error: 'Trim parameters must be positive numbers' };
        }
        if (command.start >= command.end) {
          return { valid: false, error: 'Trim start time must be less than end time' };
        }

        const trimAmount = command.end - command.start;
        if (context?.clipDuration && trimAmount >= context.clipDuration) {
          return { valid: false, error: 'Cannot trim beyond clip duration' };
        }
        break;
      }

      case 'speed': {
        if (typeof command.speed !== 'number') {
          return { valid: false, error: 'Speed command requires a numeric speed parameter' };
        }
        if (command.speed <= 0) {
          return { valid: false, error: 'Speed parameter must be a positive number' };
        }
        break;
      }

      case 'mute': {
        break;
      }
      default:
        break;
    }

    return { valid: true };
  }
}
