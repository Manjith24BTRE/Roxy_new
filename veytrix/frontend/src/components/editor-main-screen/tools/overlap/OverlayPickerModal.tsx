import React, { useState } from 'react';
import { X, Layers, Film, Image as ImageIcon, Plus, Check } from 'lucide-react';

export interface OverlayPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaFiles: Array<{
    id: string;
    name: string;
    url: string;
    type?: string;
    duration?: number;
    durationFormatted?: string;
    thumbnails?: string[];
  }>;
  timelineClips: Array<{
    id: string;
    name: string;
    trackId?: string;
    url?: string;
    duration: number;
  }>;
  onAddMediaAsOverlay: (mediaId: string) => void;
  onConvertClipToOverlay: (clipId: string) => void;
  onImportFileToOverlay: () => void;
}

export function OverlayPickerModal({
  isOpen,
  onClose,
  mediaFiles,
  timelineClips,
  onAddMediaAsOverlay,
  onConvertClipToOverlay,
  onImportFileToOverlay,
}: OverlayPickerModalProps) {
  const [activeTab, setActiveTab] = useState<'gallery' | 'timeline'>('gallery');

  if (!isOpen) return null;

  const mainTimelineClips = timelineClips.filter((c) => c.trackId !== 'overlay' && c.trackId !== 'audio' && c.trackId !== 'music');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0F131C] border border-[#1E2538] rounded-2xl shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2538] bg-[#141A26]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Add Professional Overlay</h2>
              <p className="text-[11px] text-slate-400">Place an independent video, image, or GIF layer above the main video</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-[#1E2538] px-6 bg-[#0B0F17]">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'gallery'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon size={14} />
            Choose From Media Gallery ({mediaFiles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'timeline'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film size={14} />
            Convert Timeline Clip ({mainTimelineClips.length})
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[380px] overflow-y-auto">
          {activeTab === 'gallery' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Project Assets</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onImportFileToOverlay();
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-1.5 rounded-lg transition"
                >
                  <Plus size={14} />
                  Import & Add as Overlay
                </button>
              </div>

              {mediaFiles.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-[#222C42] rounded-xl text-slate-500 text-xs">
                  No media uploaded yet. Import videos or images to add as overlays.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {mediaFiles.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onAddMediaAsOverlay(item.id);
                        onClose();
                      }}
                      className="group relative aspect-video rounded-xl border border-[#222C42] bg-[#151B29] hover:border-sky-400/80 cursor-pointer overflow-hidden transition shadow-sm"
                    >
                      {item.thumbnails && item.thumbnails[0] ? (
                        <img src={item.thumbnails[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-[#1A2234]">
                          <Film size={20} className="text-slate-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="bg-sky-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
                          <Plus size={12} /> Add Overlay
                        </span>
                      </div>
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[9px] text-white font-mono bg-black/70 px-1.5 py-0.5 rounded">
                        <span className="truncate max-w-[80px]">{item.name}</span>
                        <span>{item.durationFormatted || '0:05'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-xs font-semibold text-slate-400">Select a Main Track Clip to Convert</span>

              {mainTimelineClips.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-[#222C42] rounded-xl text-slate-500 text-xs">
                  No main video clips on the timeline available for conversion.
                </div>
              ) : (
                <div className="space-y-2">
                  {mainTimelineClips.map((clip) => (
                    <div
                      key={clip.id}
                      onClick={() => {
                        onConvertClipToOverlay(clip.id);
                        onClose();
                      }}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#222C42] bg-[#151B29] hover:border-sky-400 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                          <Film size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200">{clip.name}</div>
                          <div className="text-[10px] text-slate-400">Duration: {clip.duration.toFixed(1)}s</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                      >
                        Convert to Overlay
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E2538] bg-[#141A26] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
