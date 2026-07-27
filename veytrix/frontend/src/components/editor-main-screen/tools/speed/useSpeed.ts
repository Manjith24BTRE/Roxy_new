// useSpeed.ts
// Purpose: Custom React hook for managing active clip speed state & history for undo/redo.

import { useState, useCallback, useMemo, useEffect } from 'react';
import { DEFAULT_SPEED } from './speedConstants';
import { clampSpeed, calculateEffectiveDuration } from './speedUtils';

interface UseSpeedProps {
  clipId: string | null;
  currentSpeed?: number;
  duration?: number;
  baseDuration?: number;
  onUpdateClipSpeed?: (clipId: string, speed: number) => void;
}

export function useSpeed({
  clipId,
  currentSpeed = DEFAULT_SPEED,
  duration = 0,
  baseDuration,
  onUpdateClipSpeed
}: UseSpeedProps) {
  const [speed, setSpeedState] = useState<number>(currentSpeed);
  const [history, setHistory] = useState<number[]>([currentSpeed]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Sync internal state when clip or external currentSpeed changes
  useEffect(() => {
    const validSpeed = clampSpeed(currentSpeed);
    setSpeedState(validSpeed);
    setHistory([validSpeed]);
    setHistoryIndex(0);
  }, [clipId, currentSpeed]);

  const effectiveBaseDuration = useMemo(() => {
    if (baseDuration && baseDuration > 0) return baseDuration;
    return duration * currentSpeed || 5;
  }, [baseDuration, duration, currentSpeed]);

  const effectiveDuration = useMemo(() => {
    return calculateEffectiveDuration(effectiveBaseDuration, speed);
  }, [effectiveBaseDuration, speed]);

  const applySpeed = useCallback(
    (newSpeed: number) => {
      if (!clipId) return;
      const clamped = clampSpeed(newSpeed);
      setSpeedState(clamped);

      // Add to local undo history
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, clamped];
      });
      setHistoryIndex((prev) => prev + 1);

      if (onUpdateClipSpeed) {
        onUpdateClipSpeed(clipId, clamped);
      }
    },
    [clipId, historyIndex, onUpdateClipSpeed]
  );

  const resetSpeed = useCallback(() => {
    applySpeed(DEFAULT_SPEED);
  }, [applySpeed]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback(() => {
    if (!canUndo || !clipId) return;
    const prevIndex = historyIndex - 1;
    const targetSpeed = history[prevIndex];
    setHistoryIndex(prevIndex);
    setSpeedState(targetSpeed);
    if (onUpdateClipSpeed) {
      onUpdateClipSpeed(clipId, targetSpeed);
    }
  }, [canUndo, clipId, history, historyIndex, onUpdateClipSpeed]);

  const redo = useCallback(() => {
    if (!canRedo || !clipId) return;
    const nextIndex = historyIndex + 1;
    const targetSpeed = history[nextIndex];
    setHistoryIndex(nextIndex);
    setSpeedState(targetSpeed);
    if (onUpdateClipSpeed) {
      onUpdateClipSpeed(clipId, targetSpeed);
    }
  }, [canRedo, clipId, history, historyIndex, onUpdateClipSpeed]);

  return {
    speed,
    effectiveBaseDuration,
    effectiveDuration,
    applySpeed,
    resetSpeed,
    undo,
    redo,
    canUndo,
    canRedo
  };
}
