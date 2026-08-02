import { useState, useCallback, useMemo } from 'react';
import {
  KeyframePoint,
  KeyframeProperty,
  InterpolationType,
  ClipKeyframeData
} from './keyframes.types';
import { KeyframeManager } from './KeyframeManager';
import { interpolateAllProperties, InterpolatedProperties } from './interpolator';

export interface UseKeyframesOptions {
  activeClipId: string | null;
  activeClipKeyframes?: KeyframePoint[];
  playheadTimelineTime: number;
  clipTimelineStart?: number;
  onUpdateClipKeyframes: (clipId: string, updatedKeyframes: KeyframePoint[]) => void;
}

export function useKeyframes({
  activeClipId,
  activeClipKeyframes = [],
  playheadTimelineTime,
  clipTimelineStart = 0,
  onUpdateClipKeyframes
}: UseKeyframesOptions) {
  const [autoKeyframeEnabled, setAutoKeyframeEnabled] = useState(false);

  const clipRelativeTime = Math.max(0, playheadTimelineTime - clipTimelineStart);

  const toggleAutoKeyframe = useCallback(() => {
    setAutoKeyframeEnabled((prev) => !prev);
  }, []);

  const addOrUpdateKeyframe = useCallback(
    (
      property: KeyframeProperty,
      value: number,
      interpolation: InterpolationType = 'linear',
      controlPoints?: { x1: number; y1: number; x2: number; y2: number }
    ) => {
      if (!activeClipId) return;

      const updated = KeyframeManager.addOrUpdateKeyframe(
        activeClipKeyframes,
        property,
        clipRelativeTime,
        value,
        interpolation,
        controlPoints
      );

      onUpdateClipKeyframes(activeClipId, updated);
    },
    [activeClipId, activeClipKeyframes, clipRelativeTime, onUpdateClipKeyframes]
  );

  const deleteKeyframe = useCallback(
    (keyframeId: string) => {
      if (!activeClipId) return;
      const updated = KeyframeManager.deleteKeyframe(activeClipKeyframes, keyframeId);
      onUpdateClipKeyframes(activeClipId, updated);
    },
    [activeClipId, activeClipKeyframes, onUpdateClipKeyframes]
  );

  const moveKeyframe = useCallback(
    (keyframeId: string, newTime: number) => {
      if (!activeClipId) return;
      const updated = KeyframeManager.moveKeyframe(activeClipKeyframes, keyframeId, newTime);
      onUpdateClipKeyframes(activeClipId, updated);
    },
    [activeClipId, activeClipKeyframes, onUpdateClipKeyframes]
  );

  const moveMultipleKeyframes = useCallback(
    (moves: { id: string; newTime: number }[]) => {
      if (!activeClipId) return;
      const updated = KeyframeManager.moveMultipleKeyframes(activeClipKeyframes, moves);
      onUpdateClipKeyframes(activeClipId, updated);
    },
    [activeClipId, activeClipKeyframes, onUpdateClipKeyframes]
  );

  const updateInterpolation = useCallback(
    (
      keyframeId: string,
      interpolation: InterpolationType,
      controlPoints?: { x1: number; y1: number; x2: number; y2: number }
    ) => {
      if (!activeClipId) return;
      const updated = KeyframeManager.updateInterpolation(
        activeClipKeyframes,
        keyframeId,
        interpolation,
        controlPoints
      );
      onUpdateClipKeyframes(activeClipId, updated);
    },
    [activeClipId, activeClipKeyframes, onUpdateClipKeyframes]
  );

  const updateKeyframeValue = useCallback(
    (keyframeId: string, value: number) => {
      if (!activeClipId) return;
      const kf = activeClipKeyframes.find((k) => k.id === keyframeId);
      if (!kf) return;
      const updated = KeyframeManager.addOrUpdateKeyframe(
        activeClipKeyframes,
        kf.property,
        kf.time,
        value,
        kf.interpolation,
        kf.controlPoints
      );
      onUpdateClipKeyframes(activeClipId, updated);
    },
    [activeClipId, activeClipKeyframes, onUpdateClipKeyframes]
  );

  const navigateKeyframe = useCallback(
    (property: KeyframeProperty, direction: 'prev' | 'next') => {
      const propKeyframes = activeClipKeyframes
        .filter((k) => k.property === property)
        .sort((a, b) => a.time - b.time);

      if (propKeyframes.length === 0) return null;

      if (direction === 'prev') {
        const prev = propKeyframes
          .slice()
          .reverse()
          .find((k) => k.time < clipRelativeTime - 0.04);
        return prev ? prev.time : null;
      } else {
        const next = propKeyframes.find((k) => k.time > clipRelativeTime + 0.04);
        return next ? next.time : null;
      }
    },
    [activeClipKeyframes, clipRelativeTime]
  );

  const copyKeyframes = useCallback(() => {
    if (!activeClipId) return;
    KeyframeManager.copyKeyframesToClipboard(activeClipId, activeClipKeyframes);
  }, [activeClipId, activeClipKeyframes]);

  const pasteKeyframes = useCallback(() => {
    if (!activeClipId) return;
    const pasted = KeyframeManager.pasteKeyframesFromClipboard(activeClipId);
    if (pasted) {
      onUpdateClipKeyframes(activeClipId, [...activeClipKeyframes, ...pasted]);
    }
  }, [activeClipId, activeClipKeyframes, onUpdateClipKeyframes]);

  const clearAllKeyframes = useCallback(() => {
    if (!activeClipId) return;
    onUpdateClipKeyframes(activeClipId, []);
  }, [activeClipId, onUpdateClipKeyframes]);

  // Compute interpolated properties at current playhead frame
  const interpolatedProps: InterpolatedProperties = useMemo(() => {
    return interpolateAllProperties(activeClipKeyframes, clipRelativeTime);
  }, [activeClipKeyframes, clipRelativeTime]);

  return {
    clipRelativeTime,
    autoKeyframeEnabled,
    toggleAutoKeyframe,
    addOrUpdateKeyframe,
    deleteKeyframe,
    moveKeyframe,
    moveMultipleKeyframes,
    updateInterpolation,
    updateKeyframeValue,
    navigateKeyframe,
    copyKeyframes,
    pasteKeyframes,
    clearAllKeyframes,
    hasClipboardData: KeyframeManager.hasClipboardData(),
    interpolatedProps
  };
}
