import React, { useRef } from 'react';
import { Video, Image as ImageIcon, Loader2 } from 'lucide-react';

interface UploadTabsProps {
  activeTab: 'video' | 'image';
  onChangeTab: (tab: 'video' | 'image') => void;
  onFilesSelected?: (files: FileList | null) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function UploadTabs({
  activeTab,
  onChangeTab,
  onFilesSelected,
  isLoading = false,
  disabled = false,
}: UploadTabsProps) {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Shared identical design configuration for both buttons
  const sharedButtonClasses =
    "flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 h-11 min-w-[160px] px-6 py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all duration-200 ease-in-out cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#3B6CE7]/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none text-center shadow-sm";

  const getStyleClasses = (tab: 'video' | 'image') => {
    const isActive = activeTab === tab;
    if (isActive) {
      return "bg-[#3B6CE7] border-[#3B6CE7] text-white shadow-[0_4px_14px_rgba(59,108,231,0.35)] hover:bg-[#2555CC] hover:border-[#2555CC]";
    }
    return "bg-white border-[#1D2B64]/10 text-[#1D2B64]/70 hover:text-[#1D2B64] hover:bg-[#F4F8FA] hover:border-[#1D2B64]/20 shadow-sm";
  };

  const handleButtonClick = (tab: 'video' | 'image') => {
    if (disabled || isLoading) return;
    onChangeTab(tab);
    if (tab === 'video') {
      videoInputRef.current?.click();
    } else {
      imageInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-row justify-center items-center gap-3 select-none mb-6 w-full max-w-md mx-auto">
      {/* Hidden Video Input */}
      <input
        type="file"
        ref={videoInputRef}
        multiple
        accept="video/*"
        disabled={disabled || isLoading}
        onChange={(e) => {
          if (onFilesSelected) onFilesSelected(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Hidden Image Input */}
      <input
        type="file"
        ref={imageInputRef}
        multiple
        accept="image/*"
        disabled={disabled || isLoading}
        onChange={(e) => {
          if (onFilesSelected) onFilesSelected(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Upload Video Button */}
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => handleButtonClick('video')}
        className={`${sharedButtonClasses} ${getStyleClasses('video')}`}
        aria-label="Upload Video files"
      >
        {isLoading && activeTab === 'video' ? (
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        ) : (
          <Video className="w-4 h-4 flex-shrink-0" />
        )}
        <span>Upload Video</span>
      </button>

      {/* Upload Images Button */}
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => handleButtonClick('image')}
        className={`${sharedButtonClasses} ${getStyleClasses('image')}`}
        aria-label="Upload Image files"
      >
        {isLoading && activeTab === 'image' ? (
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        ) : (
          <ImageIcon className="w-4 h-4 flex-shrink-0" />
        )}
        <span>Upload Images</span>
      </button>
    </div>
  );
}

export default UploadTabs;
