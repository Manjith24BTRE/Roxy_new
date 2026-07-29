import React, { useState, useRef } from 'react';
import { Replace, Film, Check, Upload, Sparkles, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';

export interface ReplaceMediaPayload {
  url: string;
  mediaId: string;
  name: string;
  thumbnails: string[];
  duration?: number;
}

interface ReplaceToolProps {
  activeClip: any | null;
  mediaFiles: any[];
  onReplaceMedia: (clipId: string, newMedia: ReplaceMediaPayload) => void;
  showToast: (msg: string) => void;
}

export function ReplaceTool({
  activeClip,
  mediaFiles,
  onReplaceMedia,
  showToast
}: ReplaceToolProps) {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [customFile, setCustomFile] = useState<ReplaceMediaPayload | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedSource = customFile || mediaFiles.find(m => m.id === selectedSourceId);

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const tempId = `custom-media-${Date.now()}`;

    // Create thumbnail preview placeholder
    const payload: ReplaceMediaPayload = {
      url: objectUrl,
      mediaId: tempId,
      name: file.name,
      thumbnails: [objectUrl],
      duration: 10
    };

    setCustomFile(payload);
    setSelectedSourceId(tempId);
    showToast(`Loaded ${file.name} for replacement`);
  };

  const handleConfirmReplace = () => {
    if (!activeClip) {
      showToast('Select a clip to replace.');
      return;
    }

    if (!selectedSource) {
      showToast('Select a new media source first.');
      return;
    }

    if (selectedSource.mediaId === activeClip.mediaId && !customFile) {
      showToast('Selected source is the same as current clip media.');
      return;
    }

    setIsReplacing(true);
    try {
      onReplaceMedia(activeClip.id, {
        url: selectedSource.url,
        mediaId: selectedSource.mediaId,
        name: selectedSource.name,
        thumbnails: selectedSource.thumbnails,
        duration: selectedSource.duration
      });
      setIsReplacing(false);
    } catch (err) {
      setIsReplacing(false);
      showToast('Failed to replace media. Original clip restored.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090d16] text-slate-100 select-none p-3 space-y-4 overflow-y-auto scrollbar-thin">
      
      {/* Header Banner */}
      <div className="p-3 rounded-xl border border-sky-500/30 bg-sky-500/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Replace className="h-4 w-4 text-sky-400" />
          <div>
            <h3 className="text-xs font-bold text-slate-100">Replace Media Source</h3>
            <p className="text-[9.5px] text-slate-400">Swaps video/image while preserving FX, trims, & timeline position</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[8px] font-mono font-bold uppercase tracking-wider border border-sky-500/30">
          Pro Feature
        </span>
      </div>

      {/* Target Clip Status */}
      {activeClip ? (
        <div className="rounded-xl border border-white/10 bg-[#0d1322] p-3 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-mono tracking-wider">
            <span>Target Clip to Replace</span>
            <span className="text-sky-400 font-bold">ID: {activeClip.id}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-950 border border-white/10 flex-shrink-0 relative">
              {activeClip.thumbnails && activeClip.thumbnails[0] ? (
                <img src={activeClip.thumbnails[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="h-4 w-4 text-slate-600" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-200 block truncate">{activeClip.name}</span>
              <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 font-mono">
                <span>Start: {activeClip.timelineStart?.toFixed(1) || 0}s</span>
                <span>•</span>
                <span>Dur: {activeClip.duration?.toFixed(1) || 0}s</span>
              </div>
            </div>
          </div>

          {/* Badges of preserved properties */}
          <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-1.5 text-[8.5px]">
            <div className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="h-3 w-3" />
              <span>Preserves FX ({activeClip.appliedEffects?.length || 0})</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="h-3 w-3" />
              <span>Preserves Keyframes</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="h-3 w-3" />
              <span>Preserves Transitions</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="h-3 w-3" />
              <span>Preserves Position</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-center gap-2 text-amber-300 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>No clip selected. Select a clip on the timeline to replace its media.</span>
        </div>
      )}

      {/* Select New Source Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-slate-400">
          <span>Choose Replacement Media</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sky-400 hover:text-sky-300 text-[9px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <Upload className="h-3 w-3" />
            <span>Upload File</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,image/*"
          onChange={handleCustomFileUpload}
          className="hidden"
        />

        {/* Media Grid Choice */}
        <div className="grid grid-cols-2 gap-2">
          {mediaFiles.map((m) => {
            const isCurrent = activeClip && m.id === activeClip.mediaId;
            const isSelected = selectedSourceId === m.id;

            return (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedSourceId(m.id);
                  setCustomFile(null);
                }}
                className={`p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition relative overflow-hidden ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500/15 ring-1 ring-sky-500/50 shadow-md'
                    : 'border-white/5 bg-[#0c111e] hover:border-white/15'
                } ${isCurrent ? 'opacity-60' : ''}`}
              >
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-950 border border-white/10 mb-1 flex-shrink-0">
                  {m.thumbnails && m.thumbnails[0] ? (
                    <img src={m.thumbnails[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="h-4 w-4 text-slate-600" />
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-sky-500 text-slate-950 p-0.5 rounded-full z-10 shadow">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}

                  {isCurrent && (
                    <span className="absolute bottom-1 left-1 bg-slate-950/80 text-slate-400 text-[7px] font-bold px-1 rounded">
                      Current
                    </span>
                  )}
                </div>

                <span className="text-[9px] font-bold text-slate-200 block truncate leading-tight">
                  {m.name}
                </span>
              </div>
            );
          })}

          {customFile && (
            <div
              onClick={() => setSelectedSourceId(customFile.mediaId)}
              className="p-2 rounded-xl border border-sky-500 bg-sky-500/15 ring-1 ring-sky-500/50 shadow-md flex flex-col justify-between cursor-pointer transition relative overflow-hidden"
            >
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-950 border border-white/10 mb-1 flex-shrink-0">
                <img src={customFile.url} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-1 right-1 bg-sky-500 text-slate-950 p-0.5 rounded-full z-10 shadow">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span className="absolute bottom-1 left-1 bg-sky-500 text-slate-950 text-[7px] font-extrabold px-1 rounded">
                  Uploaded
                </span>
              </div>
              <span className="text-[9px] font-bold text-slate-200 block truncate leading-tight">
                {customFile.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Area */}
      {selectedSource && activeClip && (
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 text-[9.5px] space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>New Source:</span>
              <span className="text-slate-200 font-bold truncate max-w-[140px]">{selectedSource.name}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Preserved Properties:</span>
              <span className="text-emerald-400 font-bold">100% Preserved</span>
            </div>
          </div>

          <button
            type="button"
            disabled={isReplacing}
            onClick={handleConfirmReplace}
            className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-md"
          >
            {isReplacing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Replacing Media...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 fill-current" />
                <span>Confirm Replace Media</span>
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
export default ReplaceTool;
