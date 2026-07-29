import { useState, useCallback } from 'react';
import { renameManager } from './RenameManager';
import { RenameOptions } from './rename.types';

export interface UseRenameParams {
  getClips?: () => any[];
  onRenameSuccess?: (updatedClips: any[], targetClipId: string, newName: string) => void;
  showToast?: (message: string) => void;
}

export function useRename(params: UseRenameParams = {}) {
  const { getClips, onRenameSuccess, showToast } = params;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [targetClipId, setTargetClipId] = useState<string | null>(null);
  const [currentName, setCurrentName] = useState<string>('');

  const openRename = useCallback(
    (clipId: string | null | undefined, name?: string) => {
      if (!clipId) {
        if (showToast) showToast('Please select a clip to rename');
        return;
      }
      setTargetClipId(clipId);
      setCurrentName(name || '');
      setIsOpen(true);
    },
    [showToast]
  );

  const closeRename = useCallback(() => {
    setIsOpen(false);
    setTargetClipId(null);
    setCurrentName('');
  }, []);

  const confirmRename = useCallback(
    (newName: string): boolean => {
      if (!targetClipId || !getClips || !onRenameSuccess) {
        closeRename();
        return false;
      }

      const clips = getClips();
      const result = renameManager.renameClip(clips, targetClipId, newName, {
        showToast,
      });

      if (result.success && result.newName) {
        onRenameSuccess(result.updatedClips, targetClipId, result.newName);
        closeRename();
        return true;
      }

      return false;
    },
    [targetClipId, getClips, onRenameSuccess, showToast, closeRename]
  );

  return {
    isOpen,
    targetClipId,
    currentName,
    openRename,
    closeRename,
    confirmRename,
  };
}
