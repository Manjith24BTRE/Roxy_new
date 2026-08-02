import React, { useRef, useState } from 'react';
import { Upload, FolderOpen } from 'lucide-react';

interface UploadDropZoneProps {
  activeTab: 'video' | 'image';
  onFilesSelected: (files: FileList | null) => void;
}

export function UploadDropZone({ activeTab, onFilesSelected }: UploadDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        onFilesSelected(e.dataTransfer.files);
      }}
      onClick={() => fileInputRef.current?.click()}
      className={`relative rounded-[28px] border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] bg-white/70 backdrop-blur-md ${
        isDragging
          ? 'border-[#3B6CE7] bg-[#3B6CE7]/5 scale-[1.01] shadow-[0_12px_30px_rgba(59,108,231,0.1)]'
          : 'border-[#1D2B64]/10 hover:border-[#3B6CE7]/50 hover:bg-white/90 shadow-[0_8px_30px_rgba(29,43,100,0.01)]'
      }`}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept={activeTab === 'video' ? 'video/*' : 'image/*'}
        onChange={(e) => onFilesSelected(e.target.files)}
        className="hidden"
      />

      <div className="w-12 h-12 rounded-xl bg-[#E6F2F8] text-[#3B6CE7] flex items-center justify-center mb-4 transition-colors">
        <Upload size={20} />
      </div>

      <h2 className="font-display text-base font-bold text-[#1D2B64]">
        Drag & Drop {activeTab === 'video' ? 'Video Clips' : 'Images'} Here
      </h2>
      <p className="mt-1 text-[11px] text-[#1D2B64]/50 leading-relaxed font-semibold">
        Supports MP4, MOV, ProRes, WebM, PNG, JPG (Up to 4K resolution)
      </p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#3B6CE7] px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#2555CC] transition">
        <FolderOpen size={14} />
        <span>Browse System Files</span>
      </div>
    </div>
  );
}
export default UploadDropZone;
