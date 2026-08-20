import React, { useState, useRef, useCallback, useEffect } from 'react';
import { KeyframePoint, KeyframeProperty } from './keyframes.types';

export interface KeyframeTimelineOverlayProps {
  clipId: string;
  clipTimelineStart: number;
  clipDuration: number;
  keyframes: KeyframePoint[];
  pixelsPerSecond: number;
  playheadTimelineTime: number;
  isSelectedClip: boolean;
  onMoveKeyframe: (keyframeId: string, newTime: number) => void;
  onMoveMultipleKeyframes?: (moves: { id: string; newTime: number }[]) => void;
  onSelectKeyframes?: (keyframeIds: string[]) => void;
  onDeleteKeyframe: (keyframeId: string) => void;
  onDeleteMultipleKeyframes?: (keyframeIds: string[]) => void;
  onKeyframeMarkerClick?: (keyframe: KeyframePoint) => void;
}

export const KeyframeTimelineOverlay: React.FC<KeyframeTimelineOverlayProps> = ({
  clipId,
  clipTimelineStart,
  clipDuration,
  keyframes,
  pixelsPerSecond,
  playheadTimelineTime,
  isSelectedClip,
  onMoveKeyframe,
  onMoveMultipleKeyframes,
  onSelectKeyframes,
  onDeleteKeyframe,
  onDeleteMultipleKeyframes,
  onKeyframeMarkerClick
}) => {
  const [selectedKeyframeIds, setSelectedKeyframeIds] = useState<string[]>([]);
  const [draggingKeyframeId, setDraggingKeyframeId] = useState<string | null>(null);
  const dragStartPosRef = useRef<{ clientX: number; keyframeTimes: Record<string, number> } | null>(null);

  if (!keyframes || keyframes.length === 0) {
    return null;
  }

  // Handle single / toggle keyframe selection
  const handleKeyframeClick = (e: React.MouseEvent, keyframe: KeyframePoint) => {
    e.stopPropagation();

    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      setSelectedKeyframeIds((prev) =>
        prev.includes(keyframe.id) ? prev.filter((id) => id !== keyframe.id) : [...prev, keyframe.id]
      );
    } else {
      setSelectedKeyframeIds([keyframe.id]);
    }

    if (onKeyframeMarkerClick) {
      onKeyframeMarkerClick(keyframe);
    }
  };

  // Drag-to-move keyframe marker pointer handlers with snapping
  const handlePointerDown = (e: React.PointerEvent, keyframeId: string) => {
    e.preventDefault();
    e.stopPropagation();

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingKeyframeId(keyframeId);

    const activeIds = selectedKeyframeIds.includes(keyframeId) ? selectedKeyframeIds : [keyframeId];
    if (!selectedKeyframeIds.includes(keyframeId)) {
      setSelectedKeyframeIds([keyframeId]);
    }

    const times: Record<string, number> = {};
    keyframes.forEach((k) => {
      if (activeIds.includes(k.id)) {
        times[k.id] = k.time;
      }
    });

    dragStartPosRef.current = {
      clientX: e.clientX,
      keyframeTimes: times
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingKeyframeId || !dragStartPosRef.current) return;
    e.stopPropagation();

    const deltaPx = e.clientX - dragStartPosRef.current.clientX;
    const deltaTime = deltaPx / pixelsPerSecond;

    const playheadClipRelative = playheadTimelineTime - clipTimelineStart;
    const moves: { id: string; newTime: number }[] = [];

    Object.entries(dragStartPosRef.current.keyframeTimes).forEach(([id, origTime]) => {
      let rawTime = origTime + deltaTime;

      // Snap to playhead position (within 0.1s snap threshold)
      if (Math.abs(rawTime - playheadClipRelative) < 0.1) {
        rawTime = playheadClipRelative;
      }

      // Snap to other keyframes outside current selection
      keyframes.forEach((otherKf) => {
        if (!dragStartPosRef.current?.keyframeTimes[otherKf.id]) {
          if (Math.abs(rawTime - otherKf.time) < 0.08) {
            rawTime = otherKf.time;
          }
        }
      });

      // Clamp time inside visible clip bounds
      const clampedTime = Math.max(0, Math.min(clipDuration, rawTime));
      moves.push({ id, newTime: clampedTime });
    });

    if (moves.length > 1 && onMoveMultipleKeyframes) {
      onMoveMultipleKeyframes(moves);
    } else if (moves.length === 1) {
      onMoveKeyframe(moves[0].id, moves[0].newTime);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingKeyframeId) {
      e.stopPropagation();
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingKeyframeId(null);
      dragStartPosRef.current = null;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {keyframes.map((kf) => {
        // Compute horizontal pixel offset relative to clip card
        const leftPx = kf.time * pixelsPerSecond;
        const isSelected = selectedKeyframeIds.includes(kf.id);

        return (
          <div
            key={kf.id}
            onClick={(e) => handleKeyframeClick(e, kf)}
            onPointerDown={(e) => handlePointerDown(e, kf.id)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border cursor-grab active:cursor-grabbing pointer-events-auto transition-transform hover:scale-125 z-40 ${
              isSelected
                ? 'bg-emerald-400 border-white ring-2 ring-emerald-400/80 shadow-glow'
                : 'bg-emerald-500 border-emerald-300 opacity-90'
            }`}
            style={{ left: `${leftPx}px` }}
            title={`${kf.property}: ${kf.value.toFixed(1)} @${kf.time.toFixed(2)}s (${kf.interpolation})`}
          />
        );
      })}
    </div>
  );
};
