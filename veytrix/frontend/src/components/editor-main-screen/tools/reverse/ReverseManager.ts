import { ReversibleClip, ReverseOptions, ReverseResult } from './reverse.types';
import { isClipReversible } from './validation';
import { toggleClipReverseState } from './reverse.utils';
import { reversedAudioEngine } from './reversedAudio';
import { mediaProcessor } from '../media-processing';

export class ReverseManager {
  private static instance: ReverseManager;

  private constructor() {}

  public static getInstance(): ReverseManager {
    if (!ReverseManager.instance) {
      ReverseManager.instance = new ReverseManager();
    }
    return ReverseManager.instance;
  }

  public async toggleReverse<T extends ReversibleClip>(
    clips: T[],
    clipId: string,
    options: ReverseOptions = {},
    mediaSource?: File | Blob | string
  ): Promise<ReverseResult<T>> {
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

    const nextIsReversed = !target?.isReversed;
    const sourceToUse = mediaSource || target?.url || '';
    let newUrl = '';

    if (nextIsReversed && target) {
      if (options.showToast) {
        options.showToast('Reversing media stream... Please wait.');
      }

      try {
        const input: any = {
          id: target.id,
          url: typeof sourceToUse === 'string' ? sourceToUse : undefined,
          file: sourceToUse instanceof File || sourceToUse instanceof Blob ? sourceToUse : undefined,
        };

        const processResult = await mediaProcessor.reverseVideo(input, {
          onProgress: (p) => {
            if (options.showToast && p.message) {
              options.showToast(`Reverse progress: ${Math.round(p.ratio * 100)}% - ${p.message}`);
            }
          }
        });

        if (!processResult.success || !processResult.outputUrl) {
          throw new Error(processResult.error || 'Video reverse failed.');
        }

        newUrl = processResult.outputUrl;
        
        // Also reverse PCM audio samples fallback
        reversedAudioEngine.loadAndReverseAudio(target.id, sourceToUse).catch(() => {});
      } catch (err: any) {
        console.error('Reverse video failed:', err);
        const errorMsg = err.message || 'Unable to reverse this clip. Please try again.';
        if (options.showToast) {
          options.showToast(errorMsg);
        }
        return {
          success: false,
          updatedClips: clips,
          targetClip: target,
          isReversed: false,
          message: errorMsg,
        };
      }
    } else if (target) {
      reversedAudioEngine.stopReversedAudio();
      newUrl = target.originalUrl || target.url || '';
    }

    // Immutably update the target clip with reversed media URLs and flags
    const updatedClips = clips.map((c) => {
      if (c.id === clipId) {
        return {
          ...c,
          isReversed: nextIsReversed,
          isReversedFile: nextIsReversed, // prevent double playhead mapping
          originalUrl: c.originalUrl || c.url || c.media_url || c.src,
          url: newUrl,
          media_url: newUrl,
          src: newUrl,
        };
      }
      return c;
    });

    const updatedTarget = updatedClips.find((c) => c.id === clipId) || null;

    const message = nextIsReversed
      ? `Reversed playback for clip "${target?.name || 'clip'}"`
      : `Restored forward playback for clip "${target?.name || 'clip'}"`;

    if (options.showToast) {
      options.showToast(message);
    }

    return {
      success: true,
      updatedClips,
      targetClip: updatedTarget as any,
      isReversed: nextIsReversed,
      message,
    };
  }
}

export const reverseManager = ReverseManager.getInstance();
