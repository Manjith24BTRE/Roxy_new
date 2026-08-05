// src/components/editor-main-screen/tools/project-save/useProjectSave.ts
import { useEffect, useCallback, useRef, useState } from 'react';
import { ProjectDB } from './ProjectDB';
import { ProjectSavePayload, ProjectSaveOptions } from './projectSave.types';

export function useProjectSave(
  getProjectPayload: () => ProjectSavePayload,
  showToast?: (message: string) => void,
  options: ProjectSaveOptions = {}
) {
  const [isSaving, setIsSaving] = useState(false);
  const getPayloadRef = useRef(getProjectPayload);
  getPayloadRef.current = getProjectPayload;

  const performSave = useCallback(async (isSilent: boolean = false) => {
    if (!isSilent && showToast) {
      showToast('Saving...');
    }

    setIsSaving(true);
    try {
      const payload = getPayloadRef.current();
      const success = await ProjectDB.saveProject(payload);
      setIsSaving(false);

      if (success) {
        if (!isSilent && showToast) {
          showToast('Project Saved Successfully');
        }
        return true;
      } else {
        if (!isSilent && showToast) {
          showToast('Unable to Save Project');
        }
        return false;
      }
    } catch (err) {
      setIsSaving(false);
      if (!isSilent && showToast) {
        showToast('Unable to Save Project');
      }
      return false;
    }
  }, [showToast]);

  // Auto-save interval (default 30s)
  useEffect(() => {
    const enableAutoSave = options.enableAutoSave ?? true;
    const intervalMs = options.autoSaveIntervalMs ?? 30000;

    if (!enableAutoSave) return;

    const intervalId = setInterval(() => {
      performSave(true);
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [options.enableAutoSave, options.autoSaveIntervalMs, performSave]);

  // Window unload / close listener
  useEffect(() => {
    const handleBeforeUnload = () => {
      const payload = getPayloadRef.current();
      ProjectDB.saveProject(payload);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return {
    performSave,
    isSaving,
  };
}
