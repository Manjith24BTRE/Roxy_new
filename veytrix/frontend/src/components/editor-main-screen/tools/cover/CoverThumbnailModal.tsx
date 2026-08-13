import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Upload, Image as ImageIcon, Trash2, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { captureVideoFrame } from './frameCapture';
import { uploadAsset } from '../../../../services/asset.service';

interface CoverThumbnailModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  projectId: string;
  currentCoverUrl?: string;
  onCoverSet: (coverUrl: string) => Promise<void>;
  onCoverRemove: () => Promise<void>;
  aspectRatio?: string; // e.g. "16:9", "9:16", "1:1"
}

export function CoverThumbnailModal({
  isOpen,
  onClose,
  videoUrl,
  projectId,
  currentCoverUrl,
  onCoverSet,
  onCoverRemove,
  aspectRatio = '16:9',
}: CoverThumbnailModalProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'upload'>('video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Status states
  const [statusText, setStatusText] = useState<string>('');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error' | 'loading' | ''>('');
  
  // Selected/captured/uploaded preview cover
  const [selectedPreviewBlob, setSelectedPreviewBlob] = useState<Blob | null>(null);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize values when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedPreviewBlob(null);
      setSelectedPreviewUrl(currentCoverUrl || '');
      setStatusText('');
      setStatusType('');
      setIsPlaying(false);
      setCurrentTime(0);
      if (videoUrl) {
        setActiveTab('video');
      } else {
        setActiveTab('upload');
      }
    }
  }, [isOpen, currentCoverUrl, videoUrl]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((e) => console.warn('Video play failed:', e));
    }
  };

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Seek video
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Format time (MM:SS.CC)
  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00.00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const hundredths = Math.floor((time % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  };

  // Capture current frame
  const handleCaptureFrame = async () => {
    if (!videoUrl) return;
    
    // Temporarily pause if playing
    if (isPlaying && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }

    setStatusType('loading');
    setStatusText('Preparing cover...');

    try {
      const blob = await captureVideoFrame(videoUrl, currentTime, {
        mimeType: 'image/webp',
        quality: 0.9,
      });

      const blobUrl = URL.createObjectURL(blob);
      setSelectedPreviewBlob(blob);
      setSelectedPreviewUrl(blobUrl);
      setStatusType('');
      setStatusText('');
    } catch (err: any) {
      console.error('Frame capture failed:', err);
      setStatusType('error');
      setStatusText(err.message || 'Unable to capture this frame. Please try another timestamp.');
    }
  };

  // Handle file select (Option B: Upload)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Process and validate file
  const processSelectedFile = (file: File) => {
    // Validate type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setStatusType('error');
      setStatusText('Unsupported image format. Use PNG, JPG, JPEG, or WEBP.');
      return;
    }

    // Validate size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setStatusType('error');
      setStatusText('File size exceeds maximum limit of 10 MB.');
      return;
    }

    setStatusType('');
    setStatusText('');

    // Convert file to blob and generate preview
    const blobUrl = URL.createObjectURL(file);
    setSelectedPreviewBlob(file); // File inherits from Blob
    setSelectedPreviewUrl(blobUrl);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Set cover (save to Supabase/project)
  const handleSetCover = async () => {
    if (!selectedPreviewBlob) return;

    setStatusType('loading');
    setStatusText('Uploading and saving cover...');

    try {
      // Determine file extension
      const extension = selectedPreviewBlob.type === 'image/webp' ? '.webp' : 
                        selectedPreviewBlob.type === 'image/png' ? '.png' : '.jpg';
      
      const file = new File(
        [selectedPreviewBlob], 
        `project_cover_${projectId}${extension}`, 
        { type: selectedPreviewBlob.type }
      );

      // Upload via backend asset service under THUMBNAIL category
      const uploadResult = await uploadAsset(file, 'THUMBNAIL');
      
      if (!uploadResult.file_url) {
        throw new Error('Upload succeeded but no public URL returned.');
      }

      // Persist url on project DB
      await onCoverSet(uploadResult.file_url);

      setStatusType('success');
      setStatusText('Cover updated successfully');

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Save cover failed:', err);
      setStatusType('error');
      setStatusText(err.message || 'Thumbnail upload failed. Please try again.');
    }
  };

  // Remove cover
  const handleRemoveCover = async () => {
    const confirmRemove = window.confirm('Are you sure you want to remove this project cover?');
    if (!confirmRemove) return;

    setStatusType('loading');
    setStatusText('Removing cover...');

    try {
      await onCoverRemove();
      setSelectedPreviewBlob(null);
      setSelectedPreviewUrl('');
      setStatusType('success');
      setStatusText('Cover removed successfully');
      
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Remove cover failed:', err);
      setStatusType('error');
      setStatusText(err.message || 'Failed to remove cover. Please try again.');
    }
  };

  // Replace current selection
  const handleReplaceSelection = () => {
    setSelectedPreviewBlob(null);
    setSelectedPreviewUrl(currentCoverUrl || '');
    setStatusText('');
    setStatusType('');
  };

  if (!isOpen) return null;

  // Determine standard aspect-ratio css class for preview box
  let aspectClass = 'aspect-video';
  if (aspectRatio === '9:16') aspectClass = 'aspect-[9/16] max-h-[300px]';
  else if (aspectRatio === '1:1') aspectClass = 'aspect-square max-h-[300px]';
  else if (aspectRatio === '4:5') aspectClass = 'aspect-[4/5] max-h-[300px]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-[#121620] border border-[#1E2538] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2538]">
          <div>
            <h2 id="modal-title" className="text-base font-bold text-slate-100">Set Cover</h2>
            <p className="text-xs text-slate-400 mt-0.5">Choose a frame from your video or upload a custom thumbnail.</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Area */}
        {statusText && (
          <div className={`px-6 py-2.5 text-xs flex items-center gap-2 border-b ${
            statusType === 'loading' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
            statusType === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            statusType === 'error' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
            'bg-slate-800/50 text-slate-300 border-slate-700/50'
          }`}>
            {statusType === 'loading' && <Loader2 size={14} className="animate-spin" />}
            {statusType === 'success' && <CheckCircle2 size={14} />}
            {statusType === 'error' && <AlertCircle size={14} />}
            <span>{statusText}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col">
          {selectedPreviewUrl ? (
            /* Selected / Confirmed Cover Preview Panel */
            <div className="flex flex-col items-center justify-center flex-1 py-4">
              <span className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Selected Cover Preview</span>
              <div className={`relative ${aspectClass} w-full max-w-md bg-slate-950 rounded-lg overflow-hidden border border-[#2A344D] flex items-center justify-center`}>
                <img 
                  src={selectedPreviewUrl} 
                  alt="Project Cover Preview" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleReplaceSelection}
                  disabled={statusType === 'loading'}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
                >
                  Replace
                </button>
                {selectedPreviewBlob && (
                  <button
                    type="button"
                    onClick={handleSetCover}
                    disabled={statusType === 'loading'}
                    className="px-5 py-2 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-600 text-white transition shadow-lg shadow-sky-500/10 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {statusType === 'loading' ? 'Saving...' : currentCoverUrl ? 'Replace Cover' : 'Set Cover'}
                  </button>
                )}
                {currentCoverUrl && !selectedPreviewBlob && (
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    disabled={statusType === 'loading'}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-rose-900/50 text-rose-400 hover:bg-rose-950/30 transition flex items-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    Remove Cover
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Choose Source Screen */
            <>
              {/* Tab Selector */}
              <div className="flex bg-[#181E2E] p-1 rounded-xl mb-6 border border-[#212A3F] self-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('video')}
                  disabled={!videoUrl}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'video' 
                      ? 'bg-sky-500 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200 disabled:opacity-30'
                  }`}
                >
                  From Video
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'upload' 
                      ? 'bg-sky-500 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Upload Image
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 flex flex-col justify-center min-h-[250px]">
                {activeTab === 'video' && videoUrl && (
                  <div className="flex flex-col items-center">
                    {/* Video Player */}
                    <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden border border-[#212A3F]">
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        crossOrigin="anonymous"
                        className="w-full h-full object-contain"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                      
                      {/* Video Center Play Overlay */}
                      {!isPlaying && (
                        <button
                          type="button"
                          onClick={togglePlay}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition text-white"
                          aria-label="Play video"
                        >
                          <Play size={40} className="fill-white" />
                        </button>
                      )}
                    </div>

                    {/* Timeline Controls */}
                    <div className="w-full max-w-md mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={togglePlay}
                        className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white transition"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-slate-300" />}
                      </button>
                      
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        step={0.05}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 accent-sky-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                      
                      <span className="text-[10px] font-mono font-bold text-slate-400 whitespace-nowrap">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    {/* Capture button */}
                    <button
                      type="button"
                      onClick={handleCaptureFrame}
                      disabled={statusType === 'loading'}
                      className="mt-6 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg border border-slate-700 transition flex items-center gap-1.5"
                    >
                      Use This Frame
                    </button>
                  </div>
                )}

                {activeTab === 'upload' && (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#242F47] hover:border-sky-500/50 bg-[#151B29] hover:bg-sky-500/[0.02] transition rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px]"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".png,.jpg,.jpeg,.webp"
                      className="hidden"
                    />
                    <div className="p-3.5 bg-slate-800/60 rounded-xl text-slate-300 mb-4 border border-slate-700/50">
                      <Upload size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-200 mb-1">Drag & drop your cover here, or <span className="text-sky-400 hover:underline">browse</span></span>
                    <span className="text-[10px] text-slate-500 font-medium">Supports PNG, JPG, JPEG, or WEBP (Max 10 MB)</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1E2538] flex items-center justify-between bg-[#151A26]">
          <span className="text-[10px] font-medium text-slate-500">VEYTRIX Cover Editor</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
