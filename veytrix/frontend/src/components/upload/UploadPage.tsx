import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectMedia } from '../../contexts/ProjectMediaContext';

import { UploadLayout } from './UploadLayout';
import { UploadHeader } from './UploadHeader';
import { UploadTabs } from './UploadTabs';
import { UploadDropZone } from './UploadDropZone';
import { UploadPreview } from './UploadPreview';
import { UploadActions } from './UploadActions';
import { SupportedFormats } from './SupportedFormats';

export function UploadPage() {
  const navigate = useNavigate();
  const { mediaFiles, addMediaFiles, removeMediaFile } = useProjectMedia();
  const [activeTab, setActiveTab] = useState<'video' | 'image'>('video');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    const fileArray = Array.from(files);
    await addMediaFiles(fileArray);
    setIsProcessing(false);
  };

  const hasVideo = mediaFiles.some((item) => item.type === 'video');
  const canContinue = hasVideo || mediaFiles.length > 0;

  const handleContinue = () => {
    if (canContinue) {
      navigate('/processing');
    }
  };

  return (
    <UploadLayout>
      {/* Header Bar */}
      <UploadHeader />

      {/* Center Console */}
      <div className="flex-1 flex flex-col justify-center w-full max-w-2xl mx-auto py-4">
        {/* Title */}
        <div className="text-center mb-6 select-none">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#1D2B64]/5 bg-white/70 backdrop-blur-md px-3.5 py-1 text-[9px] font-mono font-bold text-[#3B6CE7] uppercase tracking-widest shadow-sm mb-3">
            Step 1 of 2 · Import Media
          </div>
          <h1 className="font-display text-2xl md:text-4xl font-bold tracking-tight text-[#1D2B64] leading-tight">
            Import Project Assets
          </h1>
          <p className="mt-1 text-xs md:text-sm text-[#1D2B64]/50 font-medium">
            Drag files directly to populate your timeline sandbox workspace.
          </p>
        </div>

        {/* Media Tabs Selection */}
        <UploadTabs activeTab={activeTab} onChangeTab={setActiveTab} />

        {/* Interactive Drop Zone Area */}
        {isProcessing ? (
          <div className="relative rounded-[28px] border border-[#1D2B64]/5 bg-white p-10 text-center flex flex-col items-center justify-center min-h-[220px] shadow-sm select-none">
            <div className="h-6 w-6 rounded-full border-2 border-[#3B6CE7]/20 border-t-[#3B6CE7] animate-spin mb-4" />
            <h3 className="text-xs font-bold text-[#1D2B64]">Analyzing Files...</h3>
            <p className="text-[10px] text-[#1D2B64]/40 font-semibold mt-1">Generating client previews and codec details.</p>
          </div>
        ) : (
          <UploadDropZone activeTab={activeTab} onFilesSelected={handleFilesSelected} />
        )}

        {/* Selected Previews list */}
        <UploadPreview mediaFiles={mediaFiles} onRemoveFile={removeMediaFile} />

        {/* Trigger Button action */}
        <UploadActions isDisabled={!canContinue} onContinue={handleContinue} />
      </div>

      {/* Footer formats info */}
      <SupportedFormats />
    </UploadLayout>
  );
}
export default UploadPage;
