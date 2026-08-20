/**
 * Keyframe Animation System - KeyframeManager Logic Engine
 * Encapsulates all keyframe operations: CRUD, Copy/Paste, Trim, Split, Duplicate, Auto-Keyframe
 */

import {
  KeyframePoint,
  KeyframeProperty,
  InterpolationType,
  ClipboardKeyframeData,
  ALL_KEYFRAME_PROPERTIES
} from './keyframes.types';

export class KeyframeManager {
  private static clipboard: ClipboardKeyframeData | null = null;

  /**
   * Generate unique keyframe ID
   */
  public static generateId(): string {
    return 'kf_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
  }

  /**
   * Add or update keyframe for a clip property.
   * Ensures only one keyframe exists per property at the same timestamp (within 0.04s threshold).
   */
  public static addOrUpdateKeyframe(
    existingKeyframes: KeyframePoint[] | undefined,
    property: KeyframeProperty,
    time: number,
    value: number,
    interpolation: InterpolationType = 'linear',
    controlPoints?: { x1: number; y1: number; x2: number; y2: number }
  ): KeyframePoint[] {
    const list = existingKeyframes ? [...existingKeyframes] : [];
    const clampedTime = Math.max(0, time);

    // Look for existing keyframe at same frame/time
    const existingIndex = list.findIndex(
      (k) => k.property === property && Math.abs(k.time - clampedTime) < 0.04
    );

    if (existingIndex !== -1) {
      // Update existing keyframe value & interpolation
      list[existingIndex] = {
        ...list[existingIndex],
        time: clampedTime,
        value,
        interpolation,
        ...(controlPoints ? { controlPoints } : {})
      };
    } else {
      // Create new keyframe
      const newKf: KeyframePoint = {
        id: this.generateId(),
        property,
        time: clampedTime,
        value,
        interpolation,
        ...(controlPoints ? { controlPoints } : {})
      };
      list.push(newKf);
    }

    return list.sort((a, b) => a.time - b.time);
  }

  /**
   * Auto-Keyframe handler:
   * If Auto Keyframe mode is ON and playhead is on or near an existing keyframe segment,
   * automatically creates or updates keyframe when a property changes.
   */
  public static handleAutoKeyframe(
    existingKeyframes: KeyframePoint[] | undefined,
    property: KeyframeProperty,
    time: number,
    value: number,
    autoKeyframeEnabled: boolean
  ): KeyframePoint[] | null {
    if (!autoKeyframeEnabled) return null;

    const list = existingKeyframes || [];
    const propKeyframes = list.filter((k) => k.property === property);

    // If property already has keyframes or is near playhead, create/update keyframe
    if (propKeyframes.length > 0) {
      return this.addOrUpdateKeyframe(list, property, time, value);
    }

    return null;
  }

  /**
   * Delete single keyframe by ID
   */
  public static deleteKeyframe(keyframes: KeyframePoint[] | undefined, keyframeId: string): KeyframePoint[] {
    if (!keyframes) return [];
    return keyframes.filter((k) => k.id !== keyframeId);
  }

  /**
   * Delete multiple keyframes by ID array
   */
  public static deleteMultipleKeyframes(keyframes: KeyframePoint[] | undefined, keyframeIds: string[]): KeyframePoint[] {
    if (!keyframes) return [];
    const set = new Set(keyframeIds);
    return keyframes.filter((k) => !set.has(k.id));
  }

  /**
   * Move keyframe to new timestamp
   */
  public static moveKeyframe(keyframes: KeyframePoint[] | undefined, keyframeId: string, newTime: number): KeyframePoint[] {
    if (!keyframes) return [];
    const clampedTime = Math.max(0, newTime);
    return keyframes
      .map((k) => (k.id === keyframeId ? { ...k, time: clampedTime } : k))
      .sort((a, b) => a.time - b.time);
  }

  /**
   * Move multiple keyframes
   */
  public static moveMultipleKeyframes(
    keyframes: KeyframePoint[] | undefined,
    moves: { id: string; newTime: number }[]
  ): KeyframePoint[] {
    if (!keyframes) return [];
    const moveMap = new Map(moves.map((m) => [m.id, Math.max(0, m.newTime)]));
    return keyframes
      .map((k) => (moveMap.has(k.id) ? { ...k, time: moveMap.get(k.id)! } : k))
      .sort((a, b) => a.time - b.time);
  }

  /**
   * Update interpolation curve of keyframe
   */
  public static updateInterpolation(
    keyframes: KeyframePoint[] | undefined,
    keyframeId: string,
    interpolation: InterpolationType,
    controlPoints?: { x1: number; y1: number; x2: number; y2: number }
  ): KeyframePoint[] {
    if (!keyframes) return [];
    return keyframes.map((k) =>
      k.id === keyframeId ? { ...k, interpolation, ...(controlPoints ? { controlPoints } : {}) } : k
    );
  }

  /**
   * Duplicate clip keyframes with fresh unique IDs
   */
  public static duplicateClipKeyframes(keyframes: KeyframePoint[] | undefined): KeyframePoint[] {
    if (!keyframes || keyframes.length === 0) return [];
    return keyframes.map((k) => ({
      ...k,
      id: this.generateId()
    }));
  }

  /**
   * Partition keyframes when a clip is split at splitTimeRelative
   */
  public static splitClipKeyframes(
    keyframes: KeyframePoint[] | undefined,
    splitTimeRelative: number
  ): { leftKeyframes: KeyframePoint[]; rightKeyframes: KeyframePoint[] } {
    if (!keyframes || keyframes.length === 0) {
      return { leftKeyframes: [], rightKeyframes: [] };
    }

    const leftKeyframes: KeyframePoint[] = [];
    const rightKeyframes: KeyframePoint[] = [];

    keyframes.forEach((k) => {
      if (k.time <= splitTimeRelative) {
        leftKeyframes.push({ ...k, id: this.generateId() });
      } else {
        rightKeyframes.push({
          ...k,
          id: this.generateId(),
          time: k.time - splitTimeRelative // Shift time relative to new clip start
        });
      }
    });

    return { leftKeyframes, rightKeyframes };
  }

  /**
   * Filter keyframes when clip duration is trimmed
   */
  public static trimClipKeyframes(
    keyframes: KeyframePoint[] | undefined,
    newDuration: number
  ): KeyframePoint[] {
    if (!keyframes) return [];
    return keyframes.filter((k) => k.time >= 0 && k.time <= newDuration);
  }

  /**
   * Copy keyframes to system memory / clipboard
   */
  public static copyKeyframesToClipboard(clipId: string, keyframes: KeyframePoint[]): void {
    this.clipboard = {
      sourceClipId: clipId,
      keyframes: keyframes.map(({ id, ...rest }) => ({ ...rest }))
    };
  }

  /**
   * Paste keyframes from clipboard into clip
   */
  public static pasteKeyframesFromClipboard(targetClipId: string): KeyframePoint[] | null {
    if (!this.clipboard || this.clipboard.keyframes.length === 0) return null;

    return this.clipboard.keyframes.map((k) => ({
      ...k,
      id: this.generateId()
    }));
  }

  /**
   * Check if clipboard contains keyframe data
   */
  public static hasClipboardData(): boolean {
    return this.clipboard !== null && this.clipboard.keyframes.length > 0;
  }
}
