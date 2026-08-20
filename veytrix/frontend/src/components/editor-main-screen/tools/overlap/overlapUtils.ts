import { TimelineClip } from './timelineTypes';

export class OverlapUtils {
  /**
   * Convert a Main Video clip to an Overlay clip.
   * Sets initial scale to 0.75 (unless scale keyframes exist) and start position to 0.
   */
  public static convertToOverlay(clip: TimelineClip): TimelineClip {
    const hasKfScale = Array.isArray(clip.keyframes) && clip.keyframes.some((kf: any) => kf.property === 'scale');
    const targetScale = hasKfScale ? (clip.scale ?? 1.0) : 0.75;

    return {
      ...clip,
      trackId: 'overlay',
      scale: targetScale,
      timelineStart: 0,
      start: 0,
      position: clip.position || { x: 0, y: 0 },
      posX: clip.posX ?? 0,
      posY: clip.posY ?? 0,
    };
  }

  /**
   * Convert an Overlay clip back to a Main Video clip.
   * Resets scale back to 1.0.
   */
  public static convertToMain(clip: TimelineClip): TimelineClip {
    return {
      ...clip,
      trackId: 'video',
      scale: 1.0,
      position: { x: 0, y: 0 },
      posX: 0,
      posY: 0,
    };
  }
}
