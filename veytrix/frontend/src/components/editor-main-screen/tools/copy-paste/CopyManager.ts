import { ClipboardClipItem, CopyOptions } from './clipboard.types';
import { clipboardManager } from './ClipboardManager';

export class CopyManager {
  private static instance: CopyManager;

  private constructor() {}

  public static getInstance(): CopyManager {
    if (!CopyManager.instance) {
      CopyManager.instance = new CopyManager();
    }
    return CopyManager.instance;
  }

  /**
   * Copy target clip(s) to internal clipboard without creating an undo transaction.
   */
  public copy(
    items: ClipboardClipItem | ClipboardClipItem[] | null | undefined,
    options: CopyOptions = {}
  ): boolean {
    if (!items) return false;

    const clips = Array.isArray(items) ? items : [items];
    const validClips = clips.filter((c) => c && c.id);

    if (validClips.length === 0) return false;

    clipboardManager.setPayload({
      clips: validClips,
      copiedAt: Date.now(),
    });

    if (options.showToast) {
      const msg =
        validClips.length === 1
          ? `Copied: "${validClips[0].name}"`
          : `Copied ${validClips.length} clips`;
      options.showToast(msg);
    }

    return true;
  }
}

export const copyManager = CopyManager.getInstance();
