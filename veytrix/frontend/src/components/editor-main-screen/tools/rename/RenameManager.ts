import { RenameOptions, RenameResult } from './rename.types';
import { validateClipName } from './validation';
import { applyClipRename } from './rename.utils';

export class RenameManager {
  private static instance: RenameManager;

  private constructor() {}

  public static getInstance(): RenameManager {
    if (!RenameManager.instance) {
      RenameManager.instance = new RenameManager();
    }
    return RenameManager.instance;
  }

  public renameClip<T extends { id: string; name: string }>(
    clips: T[],
    clipId: string,
    proposedName: string,
    options: RenameOptions = {}
  ): RenameResult<T> {
    const validation = validateClipName(proposedName);

    if (!validation.isValid) {
      if (options.showToast && validation.error) {
        options.showToast(validation.error);
      }
      return {
        success: false,
        updatedClips: clips,
        message: validation.error,
      };
    }

    const { updatedClips, targetClip } = applyClipRename(
      clips,
      clipId,
      validation.sanitizedName
    );

    if (!targetClip) {
      return {
        success: false,
        updatedClips: clips,
        message: 'Target clip not found',
      };
    }

    const message = `Renamed clip to: "${validation.sanitizedName}"`;
    if (options.showToast) {
      options.showToast(message);
    }

    return {
      success: true,
      updatedClips,
      newName: validation.sanitizedName,
      message,
    };
  }
}

export const renameManager = RenameManager.getInstance();
