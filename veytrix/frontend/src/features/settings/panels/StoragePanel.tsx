import React, { useState } from 'react';
import { Database, Trash2, ShieldAlert, RotateCcw } from 'lucide-react';

export function StoragePanel() {
  const [cacheStats, setCacheStats] = useState({
    mediaCache: '4.8 GB',
    thumbnailCache: '120 MB',
    tempFiles: '1.2 GB'
  });

  const handleClearCache = (key: 'mediaCache' | 'thumbnailCache' | 'tempFiles') => {
    setCacheStats(prev => ({ ...prev, [key]: '0 B' }));
  };

  const handleSave = () => {
    console.log("Storage saved");
  };

  const handleReset = () => {
    setCacheStats({
      mediaCache: '4.8 GB',
      thumbnailCache: '120 MB',
      tempFiles: '1.2 GB'
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Storage & Cache Management</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Monitor your usage, clear active media caches, and purge temporary file exports.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Storage Bar Indicator */}
        <div className="p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-bold text-[#1D2B64]">
            <span className="flex items-center gap-1.5"><Database size={14} /> Cloud Storage Allocation</span>
            <span>6.0 GB / 10 GB (60%)</span>
          </div>
          
          <div className="w-full bg-[#1D2B64]/5 rounded-full h-2.5 overflow-hidden">
            <div className="bg-[#3B6CE7] h-full rounded-full" style={{ width: '60%' }} />
          </div>
          
          <span className="text-[9px] text-[#1D2B64]/40 font-medium">Upgrade to Premium to get up to 100 GB cloud space.</span>
        </div>

        {/* Cache items list */}
        <div className="flex flex-col gap-2 mt-2">
          <h4 className="text-xs font-bold text-[#1D2B64] border-b border-[#1D2B64]/5 pb-1 font-bold">Temporary Caches & Logs</h4>

          <div className="flex flex-col gap-2 mt-1">
            <div className="flex justify-between items-center p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl text-xs text-[#1D2B64] font-medium">
              <div className="flex flex-col gap-0.5">
                <span>Media Stream Cache</span>
                <span className="text-[9px] text-[#1D2B64]/40">Rendered timeline preview frames</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#1D2B64]/70">{cacheStats.mediaCache}</span>
                <button
                  type="button"
                  onClick={() => handleClearCache('mediaCache')}
                  className="text-red-500 hover:text-red-700 transition cursor-pointer"
                  title="Purge Media Cache"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl text-xs text-[#1D2B64] font-medium">
              <div className="flex flex-col gap-0.5">
                <span>Thumbnail Cache</span>
                <span className="text-[9px] text-[#1D2B64]/40">Saved media thumbnails</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#1D2B64]/70">{cacheStats.thumbnailCache}</span>
                <button
                  type="button"
                  onClick={() => handleClearCache('thumbnailCache')}
                  className="text-red-500 hover:text-red-700 transition cursor-pointer"
                  title="Purge Thumbnail Cache"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl text-xs text-[#1D2B64] font-medium">
              <div className="flex flex-col gap-0.5">
                <span>Temporary Exports</span>
                <span className="text-[9px] text-[#1D2B64]/40">Incomplete downloads & logs</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#1D2B64]/70">{cacheStats.tempFiles}</span>
                <button
                  type="button"
                  onClick={() => handleClearCache('tempFiles')}
                  className="text-red-500 hover:text-red-700 transition cursor-pointer"
                  title="Purge Temp Files"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Warning info */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-2 items-start text-[10px] text-yellow-800 leading-relaxed font-semibold">
          <ShieldAlert size={16} className="text-yellow-600 shrink-0" />
          <span>Purging the media stream cache will delete pre-rendered transitions. Playing the video immediately after may trigger timeline buffer delays.</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center border-t border-[#1D2B64]/5 pt-4 mt-4 select-none">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1D2B64]/10 text-xs text-[#1D2B64]/60 hover:text-[#1D2B64] hover:bg-[#FAFAFC] transition cursor-pointer font-medium"
        >
          <RotateCcw size={12} /> Reset to Default
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2 rounded-full bg-[#1D2B64] text-white text-xs font-semibold hover:bg-[#3B6CE7] transition shadow-[0_4px_12px_rgba(29,43,100,0.15)] cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
export default StoragePanel;
