import { useState, useCallback, useEffect, useRef } from 'react';

export interface TrimClipSnapshot {
  id: string;
  mediaId?: string;
  name: string;
  timelineStart: number;
  startOffset: number;
  duration: number;
  baseDuration?: number;
  playbackRate?: number;
}

export interface UseTrimModeOptions {
  timelineClips: any[];
  mediaFiles: any[];
  setTimelineClips: (updater: (prev: any[]) => any[]) => void;
  recalculateSequence: (clips: any[]) => any[];
  getProjectTotalDuration: (clips: any[]) => number;
  setDuration: (dur: number) => void;
  handleSeek: (time: number, force?: boolean) => void;
  setZoomLevel: (zoom: number) => void;
  beginTransaction: (label: string, state: any) => void;
  commitTransaction: (state: any) => void;
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
  const initialZoomLevelRef = useRef<number>(120);

  // Enter Trim Mode for a targeted clip
  const enterTrimMode = useCallback(
    (clipId: string, currentZoom: number = 120) => {
      const clip = timelineClips.find((c) => c.id === clipId);
      if (!clip) {
        showToast('Select a valid clip to trim');
        return;
      }

      initialZoomLevelRef.current = currentZoom;
      initialSnapshotRef.current = {
        id: clip.id,
        mediaId: clip.mediaId,
        name: clip.name,
        timelineStart: clip.timelineStart ?? clip.start ?? 0,
        startOffset: clip.startOffset ?? 0,
        duration: clip.duration,
        baseDuration: clip.baseDuration ?? clip.duration,
        playbackRate: clip.playbackRate ?? 1,
      };

      setTrimmingClipId(clip.id);
      setIsTrimModeActive(true);

      // Auto-zoom timeline for frame-accurate editing
      setZoomLevel(Math.max(160, currentZoom * 1.3));

      // Seek playhead to clip start
      handleSeek(clip.timelineStart ?? clip.start ?? 0);
      showToast(`Entered Trim Mode for "${clip.name}"`);
    },
    [timelineClips, setZoomLevel, handleSeek, showToast]
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

    // Restore user's previous timeline zoom
    setZoomLevel(initialZoomLevelRef.current);
    initialSnapshotRef.current = null;
    setTrimmingClipId(null);
    setIsTrimModeActive(false);
  }, [
    trimmingClipId,
    timelineClips,
    beginTransaction,
    commitTransaction,
    getProjectState,
    setZoomLevel,
    showToast,
  ]);

  // Cancel Trim Changes & Revert to Initial Snapshot
  const cancelTrim = useCallback(() => {
    if (initialSnapshotRef.current) {
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
              baseDuration: snap.baseDuration,
            };
          }
          return c;
        });
        const recalculated = recalculateSequence(updated);
        const newTotalDur = getProjectTotalDuration(recalculated);
        setDuration(newTotalDur);
        return recalculated;
      });

      handleSeek(snap.timelineStart);
      showToast('Trim changes discarded');
    }

    setZoomLevel(initialZoomLevelRef.current);
    initialSnapshotRef.current = null;
    setTrimmingClipId(null);
    setIsTrimModeActive(false);
  }, [
    initialSnapshotRef,
    setTimelineClips,
    recalculateSequence,
    getProjectTotalDuration,
    setDuration,
    handleSeek,
    setZoomLevel,
    showToast,
  ]);

  // Reset Clip to Full Source Duration
  const resetTrim = useCallback(() => {
    if (!trimmingClipId) return;

    const clip = timelineClips.find((c) => c.id === trimmingClipId);
    if (!clip) return;

    const mediaAsset = mediaFiles.find((m) => m.id === clip.mediaId || m.id === clip.id);
    const maxSourceDuration = mediaAsset?.duration || clip.baseDuration || clip.duration || 10;

    setTimelineClips((prev) => {
      const updated = prev.map((c) => {
        if (c.id === trimmingClipId) {
          return {
            ...c,
            startOffset: 0,
            duration: maxSourceDuration,
            baseDuration: maxSourceDuration,
          };
        }
        return c;
      });
      const recalculated = recalculateSequence(updated);
      const newTotalDur = getProjectTotalDuration(recalculated);
      setDuration(newTotalDur);
      return recalculated;
    });

    handleSeek(clip.timelineStart ?? 0);
    showToast('Reset clip to full source duration');
  }, [
    trimmingClipId,
    timelineClips,
    mediaFiles,
    setTimelineClips,
    recalculateSequence,
    getProjectTotalDuration,
    setDuration,
    handleSeek,
    showToast,
  ]);

  // Handle Keyboard Shortcuts (Enter -> Apply, Esc -> Cancel)
  useEffect(() => {
    if (!isTrimModeActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyTrim();
      } else if (e.key === 'Escape') {
        e.preventDefault();
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
