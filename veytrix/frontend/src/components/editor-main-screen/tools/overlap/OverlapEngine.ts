import { OverlapData, OverlapTransitionType, OverlapAudioMode } from './overlap.types';

/**
 * Production-Grade Clip Overlap & Transition Compositing Engine
 */
export class OverlapEngine {
  /**
   * Scans timeline clips and finds all overlapping video clip pairs.
   * Merges existing user-saved transition settings with calculated overlap time bounds.
   */
  public static findTimelineOverlaps(
    allClips: any[],
    savedOverlaps: OverlapData[] = []
  ): OverlapData[] {
    const videoClips = allClips.filter(
      (c) => c.trackId !== 'audio' && c.trackId !== 'music' && c.type !== 'audio' && !c.isDetachedAudio
    );

    const detectedOverlaps: OverlapData[] = [];

    for (let i = 0; i < videoClips.length; i++) {
      for (let j = i + 1; j < videoClips.length; j++) {
        const c1 = videoClips[i];
        const c2 = videoClips[j];

        const start1 = c1.timelineStart ?? c1.start ?? 0;
        const end1 = start1 + c1.duration;
        const start2 = c2.timelineStart ?? c2.start ?? 0;
        const end2 = start2 + c2.duration;

        const overlapStart = Math.max(start1, start2);
        const overlapEnd = Math.min(end1, end2);
        const overlapDuration = Math.max(0, overlapEnd - overlapStart);

        if (overlapDuration > 0.05) {
          // Sort so clipA is the outgoing clip (earlier start) and clipB is incoming clip (later start)
          const clipA = start1 <= start2 ? c1 : c2;
          const clipB = start1 <= start2 ? c2 : c1;

          const existing = savedOverlaps.find(
            (ov) => (ov.clipAId === clipA.id && ov.clipBId === clipB.id) ||
                    (ov.clipAId === clipB.id && ov.clipBId === clipA.id)
          );

          detectedOverlaps.push({
            id: existing?.id || `overlap_${clipA.id}_${clipB.id}`,
            clipAId: clipA.id,
            clipBId: clipB.id,
            overlapStart: Math.round(overlapStart * 1000) / 1000,
            overlapEnd: Math.round(overlapEnd * 1000) / 1000,
            overlapDuration: Math.round(overlapDuration * 1000) / 1000,
            transition: existing?.transition || { type: 'crossfade' },
            audioMode: existing?.audioMode || 'crossfade',
          });
        }
      }
    }

    return detectedOverlaps;
  }

  /**
   * Returns all active overlaps at the given timeline timestamp.
   */
  public static findActiveOverlapsAtTime(
    allClips: any[],
    currentTime: number,
    savedOverlaps: OverlapData[] = []
  ): OverlapData[] {
    const overlaps = this.findTimelineOverlaps(allClips, savedOverlaps);
    return overlaps.filter(
      (ov) => currentTime >= ov.overlapStart && currentTime < ov.overlapEnd
    );
  }

  /**
   * Computes the visual transition interpolation state (opacity, transform, blur, scale, zIndex)
   * for a clip during an overlap period at currentTime.
   */
  public static getOverlapTransitionState(
    clip: any,
    allClips: any[],
    currentTime: number,
    savedOverlaps: OverlapData[] = []
  ): {
    opacityMultiplier: number;
    transformOffsetX: number;
    transformOffsetY: number;
    scaleMultiplier: number;
    blurPx: number;
    zIndexOverride?: number;
  } {
    const defaultResult = {
      opacityMultiplier: 1.0,
      transformOffsetX: 0,
      transformOffsetY: 0,
      scaleMultiplier: 1.0,
      blurPx: 0,
    };

    if (!clip) return defaultResult;

    const activeOverlaps = this.findActiveOverlapsAtTime(allClips, currentTime, savedOverlaps);
    const relevantOverlap = activeOverlaps.find(
      (ov) => ov.clipAId === clip.id || ov.clipBId === clip.id
    );

    if (!relevantOverlap) return defaultResult;

    const { overlapStart, overlapDuration, transition, clipAId, clipBId } = relevantOverlap;
    if (overlapDuration <= 0) return defaultResult;

    const progress = Math.max(0, Math.min(1, (currentTime - overlapStart) / overlapDuration));
    const isOutgoing = clip.id === clipAId; // Clip A (outgoing)
    const isIncoming = clip.id === clipBId; // Clip B (incoming)

    const transitionType = transition.type || 'crossfade';

    let opacityMultiplier = 1.0;
    let transformOffsetX = 0;
    let transformOffsetY = 0;
    let scaleMultiplier = 1.0;
    let blurPx = 0;
    let zIndexOverride: number | undefined = undefined;

    switch (transitionType) {
      case 'crossfade':
      case 'fade':
        opacityMultiplier = isOutgoing ? (1 - progress) : progress;
        break;

      case 'fade-black':
        if (isOutgoing) {
          opacityMultiplier = progress < 0.5 ? 1 - progress * 2 : 0;
        } else {
          opacityMultiplier = progress >= 0.5 ? (progress - 0.5) * 2 : 0;
        }
        break;

      case 'fade-white':
        if (isOutgoing) {
          opacityMultiplier = progress < 0.5 ? 1 - progress * 2 : 0;
        } else {
          opacityMultiplier = progress >= 0.5 ? (progress - 0.5) * 2 : 0;
        }
        break;

      case 'slide-left':
        if (isIncoming) {
          transformOffsetX = (1 - progress) * 100;
          zIndexOverride = 30;
        }
        break;

      case 'slide-right':
        if (isIncoming) {
          transformOffsetX = -(1 - progress) * 100;
          zIndexOverride = 30;
        }
        break;

      case 'slide-up':
        if (isIncoming) {
          transformOffsetY = (1 - progress) * 100;
          zIndexOverride = 30;
        }
        break;

      case 'slide-down':
        if (isIncoming) {
          transformOffsetY = -(1 - progress) * 100;
          zIndexOverride = 30;
        }
        break;

      case 'zoom':
        if (isIncoming) {
          scaleMultiplier = 0.2 + progress * 0.8;
          opacityMultiplier = progress;
          zIndexOverride = 30;
        } else {
          opacityMultiplier = 1 - progress;
        }
        break;

      case 'blur':
        if (isOutgoing) {
          blurPx = progress * 12;
          opacityMultiplier = 1 - progress;
        } else {
          blurPx = (1 - progress) * 12;
          opacityMultiplier = progress;
        }
        break;

      case 'none':
      default:
        opacityMultiplier = isOutgoing ? 1.0 : 1.0;
        break;
    }

    return {
      opacityMultiplier,
      transformOffsetX,
      transformOffsetY,
      scaleMultiplier,
      blurPx,
      zIndexOverride,
    };
  }

  /**
   * Computes the audio volume multiplier (0.0 to 1.0) for a clip during an overlap.
   */
  public static getOverlapAudioVolumeMultiplier(
    clipId: string,
    allClips: any[],
    currentTime: number,
    savedOverlaps: OverlapData[] = []
  ): number {
    const activeOverlaps = this.findActiveOverlapsAtTime(allClips, currentTime, savedOverlaps);
    const relevantOverlap = activeOverlaps.find(
      (ov) => ov.clipAId === clipId || ov.clipBId === clipId
    );

    if (!relevantOverlap) return 1.0;

    const { overlapStart, overlapDuration, clipAId, clipBId, audioMode } = relevantOverlap;
    if (overlapDuration <= 0) return 1.0;

    const progress = Math.max(0, Math.min(1, (currentTime - overlapStart) / overlapDuration));
    const isOutgoing = clipId === clipAId;

    if (audioMode === 'keep-both') return 1.0;
    if (audioMode === 'mute-outgoing') return isOutgoing ? 0.0 : 1.0;
    if (audioMode === 'mute-incoming') return isOutgoing ? 1.0 : 0.0;

    // Equal-Power audio crossfade curve
    if (isOutgoing) {
      return Math.cos(progress * 0.5 * Math.PI);
    } else {
      return Math.sin(progress * 0.5 * Math.PI);
    }
  }

  /**
   * Purges orphaned overlap records if a clip was deleted.
   */
  public static cleanOrphanedOverlaps(
    allClips: any[],
    savedOverlaps: OverlapData[]
  ): OverlapData[] {
    const validClipIds = new Set(allClips.map((c) => c.id));
    return savedOverlaps.filter(
      (ov) => validClipIds.has(ov.clipAId) && validClipIds.has(ov.clipBId)
    );
  }
}
