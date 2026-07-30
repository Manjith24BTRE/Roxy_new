import { ReversibleClip, ReverseOptions, ReverseResult } from './reverse.types';
import { isClipReversible } from './validation';
import { toggleClipReverseState } from './reverse.utils';
import { reversedAudioEngine } from './reversedAudio';

export class ReverseManager {
  private static instance: ReverseManager;

  private constructor() {}

  public static getInstance(): ReverseManager {
    if (!ReverseManager.instance) {
      ReverseManager.instance = new ReverseManager();
    }
    return ReverseManager.instance;
  }

  public toggleReverse<T extends ReversibleClip>(
    clips: T[],
    clipId: string,
    options: ReverseOptions = {},
    mediaSource?: File | Blob | string
  ): ReverseResult<T> {
    const target = clips.find((c) => c.id === clipId) || null;
    const validation = isClipReversible(target);

    if (!validation.isValid) {
      if (options.showToast && validation.error) {
        options.showToast(validation.error);
      }
      return {
        success: false,
        updatedClips: clips,
        targetClip: target,
        isReversed: false,
        message: validation.error,
      };
    }

    const { updatedClips, targetClip, nextIsReversed } = toggleClipReverseState(clips, clipId);

    const sourceToUse = mediaSource || targetClip?.url || '';
    if (nextIsReversed && targetClip && sourceToUse) {
      reversedAudioEngine.loadAndReverseAudio(targetClip.id || clipId, sourceToUse).catch(() => {});
    } else if (!nextIsReversed && targetClip) {
      reversedAudioEngine.stopReversedAudio();
    }

    const message = nextIsReversed
      ? `Reversed playback for clip "${targetClip?.name || 'clip'}"`
      : `Restored forward playback for clip "${targetClip?.name || 'clip'}"`;

    if (options.showToast) {
      options.showToast(message);
    }

    return {
      success: true,
      updatedClips,
      targetClip,
      isReversed: nextIsReversed,
      message,
    };
  }
}

export const reverseManager = ReverseManager.getInstance();
