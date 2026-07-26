import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Video, Image as ImageIcon, FolderOpen, ArrowRight, Trash2, Film, FileCheck } from 'lucide-react';
import { useProjectMedia } from '../../../contexts/ProjectMediaContext';

export function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mediaFiles, addMediaFiles, removeMediaFile } = useProjectMedia();
  const [activeTab, setActiveTab] = useState<'video' | 'image'>('video');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessingFiles(true);
    const fileArray = Array.from(files);
    await addMediaFiles(fileArray);
    setIsProcessingFiles(false);
  };

  const hasVideo = mediaFiles.some((item) => item.type === 'video');

  const handleContinue = () => {
    if (hasVideo || mediaFiles.length > 0) {
      navigate('/processing');
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-90 pointer-events-none" />
      <div className="absolute inset-0 grid-lines opacity-[0.06] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 h-[450px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[130px] pointer-events-none" />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept={activeTab === 'video' ? 'video/*' : 'image/*'}
        onChange={(e) => handleFilesSelected(e.target.files)}
        className="hidden"
      />

      <div className="relative w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs mb-4">
            <span className="text-primary font-medium">Step 1 of 2</span>
            <span className="text-muted-foreground">· Import Media</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Import <span className="text-gradient">Project Media</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            Select or drag video clips and assets to load into your editing timeline
          </p>
        </div>

        {/* Media Type Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs md:text-sm font-medium transition ${
              activeTab === 'video'
                ? 'bg-primary text-primary-foreground shadow-glow'
                : 'glass text-muted-foreground hover:text-foreground'
            }`}
          >
            <Video className="h-4 w-4" />
            <span>Upload Video</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs md:text-sm font-medium transition ${
              activeTab === 'image'
                ? 'bg-primary text-primary-foreground shadow-glow'
                : 'glass text-muted-foreground hover:text-foreground'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Upload Images</span>
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFilesSelected(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-3xl glass p-8 md:p-10 text-center cursor-pointer border-2 border-dashed transition duration-300 ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-border-strong/80 hover:border-primary/50 hover:bg-surface-2/50'
          }`}
        >
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-4 shadow-glow">
            <Upload className="h-7 w-7" />
          </div>

          <h2 className="font-display text-lg md:text-xl font-bold text-foreground">
            Drag & Drop {activeTab === 'video' ? 'Video Clips' : 'Images'} Here
          </h2>
          <p className="mt-1.5 text-xs md:text-sm text-muted-foreground">
            Supports MP4, MOV, ProRes, WebM, PNG, JPG (Up to 4K resolution)
          </p>

          <div className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-xs md:text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition">
            <FolderOpen className="h-4 w-4" />
            <span>Browse System Files</span>
          </div>
        </div>

        {/* Uploaded File List */}
        {mediaFiles.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>SELECTED ASSETS ({mediaFiles.length})</span>
              <span>READY FOR WORKSPACE</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {mediaFiles.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl glass p-3 border border-border"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-10 w-14 rounded-lg bg-black/60 overflow-hidden relative flex-shrink-0 flex items-center justify-center border border-border">
                      {item.thumbnails[0] ? (
                        <img src={item.thumbnails[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Film className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {item.size} · {item.durationFormatted}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMediaFile(item.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue Action Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            disabled={!hasVideo && mediaFiles.length === 0}
            onClick={handleContinue}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition ${
              hasVideo || mediaFiles.length > 0
                ? 'bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95'
                : 'bg-surface-hover text-muted-foreground cursor-not-allowed'
            }`}
          >
            <span>Continue to Editor</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
