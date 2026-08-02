import React from 'react';
import { Video, Image as ImageIcon } from 'lucide-react';

interface UploadTabsProps {
  activeTab: 'video' | 'image';
  onChangeTab: (tab: 'video' | 'image') => void;
}

export function UploadTabs({ activeTab, onChangeTab }: UploadTabsProps) {
  return (
    <div className="flex justify-center gap-2 select-none mb-6">
      <button
        type="button"
        onClick={() => onChangeTab('video')}
        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border focus:outline-none ${
          activeTab === 'video'
            ? 'bg-[#3B6CE7] border-[#3B6CE7]/20 text-white shadow-md'
            : 'bg-white border-[#1D2B64]/5 text-[#1D2B64]/60 hover:text-[#1D2B64] hover:bg-[#E6F2F8]/30'
        }`}
      >
        <Video size={14} />
        <span>Upload Video</span>
      </button>

      <button
        type="button"
        onClick={() => onChangeTab('image')}
        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border focus:outline-none ${
          activeTab === 'image'
            ? 'bg-[#3B6CE7] border-[#3B6CE7]/20 text-white shadow-md'
            : 'bg-white border-[#1D2B64]/5 text-[#1D2B64]/60 hover:text-[#1D2B64] hover:bg-[#E6F2F8]/30'
        }`}
      >
        <ImageIcon size={14} />
        <span>Upload Images</span>
      </button>
    </div>
  );
}
export default UploadTabs;
