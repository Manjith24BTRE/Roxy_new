import {
  TimelineClipRef,
  FreezeOptions,
  FreezeValidationResult,
  FreezeOperationResult,
  IFreezeManager
} from './freeze.types';
import { validateFreeze } from './validation';
import { timelineFreezeManager } from './TimelineFreezeManager';

export class FreezeManager implements IFreezeManager {
  /**
   * Validates whether a freeze frame can be created at the given playhead time.
   */
  validate(clip: TimelineClipRef | null | undefined, playheadTime: number): FreezeValidationResult {
    return validateFreeze(clip, playheadTime);
  }

  /**
   * Creates a freeze frame for the specified video clip at playhead time.
   */
  freezeFrame<T extends TimelineClipRef>(
    clips: T[],
    sourceClipId: string,
    playheadTime: number,
    options: FreezeOptions = {}
  ): FreezeOperationResult<T> | null {
    return timelineFreezeManager.applyFreezeFrame(clips, sourceClipId, playheadTime, options);
  }
}

export const freezeManager = new FreezeManager();
