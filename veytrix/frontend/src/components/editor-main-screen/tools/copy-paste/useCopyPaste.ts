import { useState, useEffect, useCallback } from 'react';
import { clipboardManager } from './ClipboardManager';
import { copyManager } from './CopyManager';
import { pasteManager } from './PasteManager';
import { ClipboardClipItem, PasteOptions } from './clipboard.types';

export interface UseCopyPasteParams {
  getSelectedClip?: () => ClipboardClipItem | ClipboardClipItem[] | null;
  onPasteSequence?: (updatedClips: any[], pastedClips: any[]) => void;
  onPasteTimeline?: (updatedClips: any[], pastedClips: any[]) => void;
  getClips?: () => any[];
  currentTime?: number;
  showToast?: (message: string) => void;
}

export function useCopyPaste(params: UseCopyPasteParams = {}) {
  const {
    getSelectedClip,
    onPasteSequence,
    onPasteTimeline,
    getClips,
    currentTime,
    showToast,
  } = params;

  const [hasClipboardPayload, setHasClipboardPayload] = useState<boolean>(() =>
    clipboardManager.hasPayload()
  );

  useEffect(() => {
    const unsubscribe = clipboardManager.subscribe((state) => {
      setHasClipboardPayload(state.payload !== null && state.payload.clips.length > 0);
    });
    return unsubscribe;
  }, []);

  const copy = useCallback((): boolean => {
    if (!getSelectedClip) return false;
    const clip = getSelectedClip();
    if (!clip) return false;

    return copyManager.copy(clip, { showToast });
  }, [getSelectedClip, showToast]);

  const paste = useCallback(
    (options: PasteOptions = {}): boolean => {
      if (!clipboardManager.hasPayload()) return false;
      const currentClips = getClips ? getClips() : [];

      const combinedOptions: PasteOptions = {
        currentTime,
        ...options,
      };

      if (onPasteSequence) {
        const result = pasteManager.pasteSequenceClips(currentClips, combinedOptions);
        if (result.success) {
          onPasteSequence(result.updatedClips, result.pastedClips);
          if (showToast && result.message) {
            showToast(result.message);
          }
          return true;
        } else if (showToast && result.message) {
          showToast(result.message);
        }
        return false;
      }

      if (onPasteTimeline) {
        const result = pasteManager.pasteTimelineClips(currentClips, combinedOptions);
        if (result.success) {
          onPasteTimeline(result.updatedClips, result.pastedClips);
          if (showToast && result.message) {
            showToast(result.message);
          }
          return true;
        } else if (showToast && result.message) {
          showToast(result.message);
        }
        return false;
      }

      return false;
    },
    [getClips, onPasteSequence, onPasteTimeline, currentTime, showToast]
  );

  return {
    copy,
    paste,
    hasClipboardPayload,
    getPayload: () => clipboardManager.getPayload(),
  };
}
