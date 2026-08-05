// src/components/editor-main-screen/tools/project-save/SaveModal.tsx
import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, Database, Download, Clock, HardDrive, X, Film, Music, Type } from 'lucide-react';
import { ProjectSavePayload } from './projectSave.types';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  getPayload: () => ProjectSavePayload;
  onSave: () => Promise<boolean>;
  isSaving: boolean;
  lastSavedTime: number | null;
}

export const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  getPayload,
  onSave,
  isSaving,
  lastSavedTime,
}) => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const payload = isOpen ? getPayload() : null;

  useEffect(() => {
    if (!isOpen) {
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen || !payload) return null;

  const handleManualSave = async () => {
    const success = await onSave();
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleExportProjectFile = () => {
    try {
      const jsonString = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${payload.name || 'project'}.vxp`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export project file:', e);
    }
  };

  const videoClipsCount = payload.timelineClips?.filter(c => c.trackId !== 'audio' && c.trackId !== 'music' && c.type !== 'audio')?.length || 0;
  const audioClipsCount = payload.timelineClips?.filter(c => c.trackId === 'audio' || c.trackId === 'music' || c.type === 'audio')?.length || 0;
  const textCount = payload.textOverlays?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-hover/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Save className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Save Project Options</h3>
              <p className="text-[11px] text-muted-foreground">IndexedDB & LocalStorage Project State</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-surface-hover transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status Alert */}
          {saveSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>Project Saved Successfully!</span>
            </div>
          )}

          {/* Project Details Box */}
          <div className="p-3.5 rounded-lg bg-background border border-border space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5 text-primary" /> Project Name:</span>
              <span className="font-semibold text-foreground truncate max-w-[180px]">{payload.name}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-400" /> Last Saved:</span>
              <span className="font-mono text-foreground">{lastSavedTime ? new Date(lastSavedTime).toLocaleTimeString() : 'Not saved yet'}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-sky-400" /> Storage Engine:</span>
              <span className="font-mono text-emerald-400">IndexedDB (Active)</span>
            </div>
          </div>

          {/* Project Breakdown Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-surface-hover/40 border border-border flex flex-col items-center gap-1">
              <Film className="h-4 w-4 text-sky-400" />
              <span className="font-bold text-foreground">{videoClipsCount}</span>
              <span className="text-[10px] text-muted-foreground">Video Clips</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-hover/40 border border-border flex flex-col items-center gap-1">
              <Music className="h-4 w-4 text-emerald-400" />
              <span className="font-bold text-foreground">{audioClipsCount}</span>
              <span className="text-[10px] text-muted-foreground">Audio Clips</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-hover/40 border border-border flex flex-col items-center gap-1">
              <Type className="h-4 w-4 text-amber-400" />
              <span className="font-bold text-foreground">{textCount}</span>
              <span className="text-[10px] text-muted-foreground">Text & Captions</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-t border-border bg-surface-hover/20">
          <button
            type="button"
            onClick={handleExportProjectFile}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-border hover:bg-surface-hover text-foreground transition font-medium"
            title="Download editable project backup file"
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            <span>Export File (.vxp)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs rounded-lg border border-border hover:bg-surface-hover text-muted-foreground hover:text-foreground transition font-medium"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleManualSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg bg-gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-95 transition disabled:opacity-50"
            >
              <Save className={`h-3.5 w-3.5 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Saving...' : 'Save Project Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
