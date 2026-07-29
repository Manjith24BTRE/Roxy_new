import { ClipboardClipItem, PasteOptions, PasteResult } from './clipboard.types';
import { clipboardManager } from './ClipboardManager';
import { validateClipboardPayload, detectCircularReferences } from './clipboard.validation';
import { deepCloneClipWithNewIDs, calculatePlacementTime } from './clipboard.utils';

export class PasteManager {
  private static instance: PasteManager;

  private constructor() {}

  public static getInstance(): PasteManager {
    if (!PasteManager.instance) {
      PasteManager.instance = new PasteManager();
    }
    return PasteManager.instance;
  }

  /**
   * Process and execute paste operation on a sequence-based array of clips (EditorMainScreen).
   */
  public pasteSequenceClips<T extends Record<string, any>>(
    existingClips: T[],
    options: PasteOptions = {}
  ): PasteResult<T> {
    const rawPayload = clipboardManager.getPayload();
    const validation = validateClipboardPayload(rawPayload);
    if (!validation.isValid || !validation.payload) {
      return {
        success: false,
        updatedClips: existingClips,
        pastedClips: [],
        message: validation.reason || 'Clipboard is empty',
      };
    }

    if (detectCircularReferences(validation.payload)) {
      return {
        success: false,
        updatedClips: existingClips,
        pastedClips: [],
        message: 'Circular references detected in clipboard payload',
      };
    }

    const { clips } = validation.payload;
    const idRemapMap = new Map<string, string>();

    // Deep clone each clip with brand new unique IDs
    const newClipsToInsert: T[] = clips.map((clip) =>
      deepCloneClipWithNewIDs(clip as ClipboardClipItem, idRemapMap) as unknown as T
    );

    // Determine sequence insertion index
    const targetIndex = options.selectedClipId
      ? existingClips.findIndex(
          (c) => c.id === options.selectedClipId || c.mediaId === options.selectedClipId
        )
      : -1;

    const insertIndex = targetIndex !== -1 ? targetIndex + 1 : existingClips.length;

    const updatedClips = [...existingClips];
    updatedClips.splice(insertIndex, 0, ...newClipsToInsert);

    const finalClips = options.recalculateSequence
      ? options.recalculateSequence(updatedClips)
      : updatedClips;

    return {
      success: true,
      updatedClips: finalClips,
      pastedClips: newClipsToInsert,
      message: `Pasted ${newClipsToInsert.length} clip(s)`,
    };
  }

  /**
   * Process and execute paste operation on a multi-track timeline array of clips (Timeline).
   */
  public pasteTimelineClips<T extends Record<string, any>>(
    existingClips: T[],
    options: PasteOptions = {}
  ): PasteResult<T> {
    const rawPayload = clipboardManager.getPayload();
    const validation = validateClipboardPayload(rawPayload);
    if (!validation.isValid || !validation.payload) {
      return {
        success: false,
        updatedClips: existingClips,
        pastedClips: [],
        message: validation.reason || 'Clipboard is empty',
      };
    }

    if (detectCircularReferences(validation.payload)) {
      return {
        success: false,
        updatedClips: existingClips,
        pastedClips: [],
        message: 'Circular reference error in clipboard payload',
      };
    }

    const { clips } = validation.payload;
    const idRemapMap = new Map<string, string>();

    // Primary clip start time reference for relative multi-clip offset preservation
    const primaryStart = clips[0]?.start ?? 0;

    const newClipsToInsert: T[] = clips.map((clipPayload) => {
      const cloned = deepCloneClipWithNewIDs(clipPayload, idRemapMap);
      const trackId = cloned.trackId || 'video';
      const duration = cloned.duration || 5;

      const basePlacement = calculatePlacementTime(
        existingClips,
        duration,
        trackId,
        options
      );

      const offsetFromPrimary = (cloned.start ?? 0) - primaryStart;
      cloned.start = basePlacement + Math.max(0, offsetFromPrimary);

      return cloned as unknown as T;
    });

    const updatedClips = [...existingClips, ...newClipsToInsert];

    return {
      success: true,
      updatedClips,
      pastedClips: newClipsToInsert,
      message: `Pasted ${newClipsToInsert.length} clip(s)`,
    };
  }
}

export const pasteManager = PasteManager.getInstance();
