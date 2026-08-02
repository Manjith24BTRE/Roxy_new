import { useState, useCallback } from 'react';
import { AudioAsset, AudioClipRef, ImportAudioOptions } from './Audio.types';
import { audioManager } from './AudioManager';
import { validateAudioFile as validateAudio } from './validation';

export interface UseAudioParams<T extends AudioClipRef = any> {
  getClips?: () => T[];
  getPlayheadTime?: () => number;
  getSelectedClipId?: () => string | undefined;
  onUpdateClips?: (updatedClips: T[], createdClipId?: string) => void;
  showToast?: (message: string) => void;
}

export function useAudio<T extends AudioClipRef = any>(params: UseAudioParams<T> = {}) {
  const { getClips, getPlayheadTime, getSelectedClipId, onUpdateClips, showToast } = params;
  const [libraryAssets, setLibraryAssets] = useState<AudioAsset[]>(() => audioManager.getLibraryAssets());

  const refreshAssets = useCallback(() => {
    setLibraryAssets([...audioManager.getLibraryAssets()]);
  }, []);

  const importAudioFile = useCallback(
    async (file: File, options: ImportAudioOptions = {}): Promise<AudioAsset | null> => {
      const asset = await audioManager.importAudioFile(file, {
        showToast,
        ...options
      });

      if (asset) {
        refreshAssets();
      }

      return asset;
    },
    [showToast, refreshAssets]
  );

  const addAudioToTimeline = useCallback(
    (assetId: string, customPlayheadTime?: number, targetSelectedClipId?: string): T | null => {
      const clips = getClips ? getClips() : [];
      const playheadTime = customPlayheadTime ?? (getPlayheadTime ? getPlayheadTime() : 0);
      const selectedClipId = targetSelectedClipId ?? (getSelectedClipId ? getSelectedClipId() : undefined);

      const { updatedClips, createdClip } = audioManager.addAudioToTimeline(clips, assetId, playheadTime, selectedClipId);

      if (createdClip && onUpdateClips) {
        onUpdateClips(updatedClips, createdClip.id);
        if (showToast) {
          showToast(`Added "${createdClip.name}" to timeline`);
        }
      }

      return createdClip;
    },
    [getClips, getPlayheadTime, getSelectedClipId, onUpdateClips, showToast]
  );

  const removeLibraryAsset = useCallback(
    (id: string) => {
      const success = audioManager.removeLibraryAsset(id);
      if (success) {
        refreshAssets();
      }
      return success;
    },
    [refreshAssets]
  );

  return {
    libraryAssets,
    importAudioFile,
    addAudioToTimeline,
    removeLibraryAsset,
    validateAudioFile: validateAudio,
    refreshAssets
  };
}
