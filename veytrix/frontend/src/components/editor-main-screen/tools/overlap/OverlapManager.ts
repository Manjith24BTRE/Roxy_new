import { CropData } from './overlap.types';

export class OverlapManager {
  /**
   * Check if the crop data is within valid bounds (0 to 100)
   */
  public static isValidCrop(crop: CropData | undefined): boolean {
    if (!crop) return true;
    const { left, right, top, bottom } = crop;
    if (left < 0 || left > 100) return false;
    if (right < 0 || right > 100) return false;
    if (top < 0 || top > 100) return false;
    if (bottom < 0 || bottom > 100) return false;
    if (left + right >= 100) return false;
    if (top + bottom >= 100) return false;
    return true;
  }

  /**
   * Safely clamp crop values
   */
  public static clampCrop(crop: Partial<CropData>): CropData {
    const left = Math.max(0, Math.min(99, crop.left ?? 0));
    const right = Math.max(0, Math.min(99 - left, crop.right ?? 0));
    const top = Math.max(0, Math.min(99, crop.top ?? 0));
    const bottom = Math.max(0, Math.min(99 - top, crop.bottom ?? 0));
    return { left, right, top, bottom };
  }
}
