import { useState, useRef, useCallback, useEffect } from 'react';

export interface TrimClipSnapshot {
  id: string;
  timelineStart: number;
  startOffset: number;
  duration: number;
  keyframes?: any[];
}

export interface UseTrimModeOptions {
  timelineClips: any[];
  mediaFiles: any[];
  setTimelineClips: React.Dispatch<React.SetStateAction<any[]>>;
  recalculateSequence: (clips: any[]) => any[];
  getProjectTotalDuration: (clips: any[]) => number;
  setDuration: (duration: number) => void;
  handleSeek: (time: number, force?: boolean) => void;
  setZoomLevel?: React.Dispatch<React.SetStateAction<number>>;
  beginTransaction: (description: string, initialState: any) => void;
  commitTransaction: (finalState: any) => void;
  getProjectState: () => any;
  showToast: (msg: string) => void;
}

export function useTrimMode({
  timelineClips,
  mediaFiles,
  setTimelineClips,
  recalculateSequence,
  getProjectTotalDuration,
  setDuration,
  handleSeek,
  setZoomLevel,
  beginTransaction,
  commitTransaction,
  getProjectState,
  showToast,
}: UseTrimModeOptions) {
  const [isTrimModeActive, setIsTrimModeActive] = useState(false);
  const [trimmingClipId, setTrimmingClipId] = useState<string | null>(null);
  const initialSnapshotRef = useRef<TrimClipSnapshot | null>(null);

  // Enter Trim Mode for a targeted clip
  const enterTrimMode = useCallback(
    (clipId: string, currentZoom?: number) => {
      const clip = timelineClips.find((c) => c.id === clipId || c.mediaId === clipId);
      if (!clip) {
        showToast('Select a valid clip to trim');
        return;
      }

      // Save initial snapshot for Cancel/Revert capability
      initialSnapshotRef.current = {
        id: clip.id,
        timelineStart: clip.timelineStart ?? clip.start ?? 0,
        startOffset: clip.startOffset ?? 0,
        duration: clip.duration,
        keyframes: clip.keyframes ? JSON.parse(JSON.stringify(clip.keyframes)) : [],
      };

      setTrimmingClipId(clip.id);
      setIsTrimModeActive(true);

      // Seek playhead to clip start
      handleSeek(clip.timelineStart ?? clip.start ?? 0, true);

      showToast(`Entered Trim Mode for "${clip.name}"`);
    },
    [timelineClips, handleSeek, showToast]
  );

  // Apply (Commit) Trim Changes
  const applyTrim = useCallback(() => {
    if (!trimmingClipId || !initialSnapshotRef.current) {
      setIsTrimModeActive(false);
      setTrimmingClipId(null);
      return;
    }

    const currentClip = timelineClips.find((c) => c.id === trimmingClipId);
    if (currentClip) {
      beginTransaction(`Trim clip "${currentClip.name}"`, getProjectState());
      commitTransaction(getProjectState());
      showToast(`Applied trim for "${currentClip.name}"`);
    }

    initialSnapshotRef.current = null;
    setTrimmingClipId(null);
    setIsTrimModeActive(false);
  }, [trimmingClipId, timelineClips, beginTransaction, commitTransaction, getProjectState, showToast]);

  // Cancel Trim Changes & Revert to Initial Snapshot
  const cancelTrim = useCallback(() => {
    if (!trimmingClipId || !initialSnapshotRef.current) {
      setIsTrimModeActive(false);
      setTrimmingClipId(null);
      return;
    }

    const snap = initialSnapshotRef.current;
    setTimelineClips((prev) => {
      const updated = prev.map((c) => {
        if (c.id === snap.id) {
          return {
            ...c,
            timelineStart: snap.timelineStart,
            start: snap.timelineStart,
            startOffset: snap.startOffset,
            duration: snap.duration,
            keyframes: snap.keyframes || [],
          };
        }
        return c;
      });
      const recalculated = recalculateSequence(updated);
      setDuration(getProjectTotalDuration(recalculated));
      return recalculated;
    });

    showToast('Trim changes discarded');

    initialSnapshotRef.current = null;
    setTrimmingClipId(null);
    setIsTrimModeActive(false);
  }, [
    trimmingClipId,
    setTimelineClips,
    recalculateSequence,
    getProjectTotalDuration,
    setDuration,
    showToast,
  ]);

  // Reset Trim to full source length
  const resetTrim = useCallback(() => {
    if (!trimmingClipId) return;

    const clip = timelineClips.find((c) => c.id === trimmingClipId);
    if (!clip) return;

    const media = mediaFiles.find((m) => m.id === clip.mediaId);
    const maxDur = media?.duration || clip.duration || 10;

    setTimelineClips((prev) => {
      const updated = prev.map((c) => {
        if (c.id === trimmingClipId) {
          return {
            ...c,
            startOffset: 0,
            duration: maxDur,
          };
        }
        return c;
      });
      const recalculated = recalculateSequence(updated);
      setDuration(getProjectTotalDuration(recalculated));
      return recalculated;
    });

    showToast(`Reset "${clip.name}" to full duration`);
  }, [
    trimmingClipId,
    timelineClips,
    mediaFiles,
    setTimelineClips,
    recalculateSequence,
    getProjectTotalDuration,
    setDuration,
    showToast,
  ]);

  // Keyboard shortcut listener (Escape to cancel, Enter to apply)
  useEffect(() => {
    if (!isTrimModeActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        applyTrim();
      } else if (e.key === 'Escape') {
        cancelTrim();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTrimModeActive, applyTrim, cancelTrim]);

  return {
    isTrimModeActive,
    trimmingClipId,
    enterTrimMode,
    applyTrim,
    cancelTrim,
    resetTrim,
  };
}
