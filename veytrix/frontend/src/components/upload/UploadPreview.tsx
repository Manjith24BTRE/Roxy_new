import React from 'react';
import { Trash2, Film } from 'lucide-react';

interface UploadPreviewProps {
  mediaFiles: any[];
  onRemoveFile: (id: string) => void;
}

export function UploadPreview({ mediaFiles, onRemoveFile }: UploadPreviewProps) {
  if (mediaFiles.length === 0) return null;

  return (
    <div className="space-y-2 mt-4 select-none">
      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#1D2B64]/40 uppercase tracking-wider">
        <span>Selected Assets ({mediaFiles.length})</span>
        <span>Ready for timeline</span>
      </div>

      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
        {mediaFiles.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl bg-white border border-[#1D2B64]/5 p-2 shadow-sm"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-8 w-12 rounded-lg bg-black/5 overflow-hidden relative flex-shrink-0 flex items-center justify-center border border-[#1D2B64]/5">
                {item.thumbnails[0] ? (
                  <img src={item.thumbnails[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Film size={12} className="text-[#3B6CE7]" />
                )}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-[#1D2B64] truncate">{item.name}</p>
                <p className="text-[9px] font-mono text-[#1D2B64]/40 font-bold uppercase tracking-wider">
                  {item.size} · {item.durationFormatted}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFile(item.id);
              }}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#1D2B64]/40 hover:text-red-500 transition-colors focus:outline-none"
              aria-label="Remove item"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default UploadPreview;
