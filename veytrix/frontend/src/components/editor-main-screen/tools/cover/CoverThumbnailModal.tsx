import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Play, Pause, Upload, Image as ImageIcon, Trash2, Loader2, 
  CheckCircle2, AlertCircle, Plus, Type, Sliders, RotateCcw, 
  Move, AlignLeft, AlignCenter, AlignRight, Bold, Sparkles 
} from 'lucide-react';
import { 
  captureVideoFrame, generateFilmstripThumbnails, renderFinalCoverImage, 
  FilmstripThumbnail, CoverTextElement, CoverOverlayElement, CoverAdjustments, CoverState 
} from './frameCapture';
import { uploadAsset } from '../../../../services/asset.service';

interface CoverThumbnailModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  projectId: string;
  currentCoverUrl?: string;
  savedCoverState?: CoverState;
  onCoverSet: (coverUrl: string, coverState?: CoverState) => Promise<void>;
  onCoverRemove: () => Promise<void>;
  aspectRatio?: string;
}

const DEFAULT_ADJUSTMENTS: CoverAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  opacity: 100,
};

const FONT_FAMILIES = [
  { label: 'Inter (Sans)', value: 'Inter' },
  { label: 'Outfit (Modern)', value: 'Outfit' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Impact (Bold)', value: 'Impact' },
  { label: 'Serif (Classic)', value: 'Georgia' },
  { label: 'Monospace', value: 'Courier New' },
];

const PRESET_COLORS = [
  '#FFFFFF', '#FFD700', '#00FFFF', '#FF007F', '#FF3333', 
  '#00FF66', '#9933FF', '#000000', '#1E293B', '#38BDF8'
];

export function CoverThumbnailModal({
  isOpen,
  onClose,
  videoUrl,
  projectId,
  currentCoverUrl,
  savedCoverState,
  onCoverSet,
  onCoverRemove,
  aspectRatio = '16:9',
}: CoverThumbnailModalProps) {
  // Core mode states
  const [sourceType, setSourceType] = useState<'video-frame' | 'custom-image'>('video-frame');
  const [videoTime, setVideoTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  
  // Base extracted frame URL
  const [baseFrameUrl, setBaseFrameUrl] = useState<string>('');

  // Customization elements
  const [textElements, setTextElements] = useState<CoverTextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<CoverAdjustments>(DEFAULT_ADJUSTMENTS);

  // Sidebar tab
  const [activeTab, setActiveTab] = useState<'text' | 'adjustments' | 'upload'>('text');

  // Filmstrip thumbnails
  const [filmstrip, setFilmstrip] = useState<FilmstripThumbnail[]>([]);
  const [isGeneratingFilmstrip, setIsGeneratingFilmstrip] = useState(false);

  // Status & loading
  const [statusText, setStatusText] = useState<string>('');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error' | 'loading' | ''>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize or restore state when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setStatusText('');
    setStatusType('');
    setIsPlaying(false);

    if (savedCoverState) {
      setSourceType(savedCoverState.sourceType || 'video-frame');
      setVideoTime(savedCoverState.videoTime || 0);
      setCustomImageUrl(savedCoverState.customImageUrl || '');
      setTextElements(savedCoverState.textElements || []);
      setAdjustments(savedCoverState.adjustments || DEFAULT_ADJUSTMENTS);
    } else {
      setSourceType(videoUrl ? 'video-frame' : 'custom-image');
      setVideoTime(0);
      setCustomImageUrl('');
      setTextElements([]);
      setAdjustments(DEFAULT_ADJUSTMENTS);
    }

    if (currentCoverUrl && !videoUrl && !savedCoverState) {
      setCustomImageUrl(currentCoverUrl);
      setSourceType('custom-image');
    }
  }, [isOpen, savedCoverState, videoUrl, currentCoverUrl]);

  // Extract frame whenever videoTime or videoUrl changes in video-frame mode
  const extractFrame = useCallback(async (time: number) => {
    if (!videoUrl) return;
    try {
      setStatusType('loading');
      setStatusText('Extracting frame...');
      const blob = await captureVideoFrame(videoUrl, time, { quality: 0.9, mimeType: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setBaseFrameUrl(url);
      setStatusType('');
      setStatusText('');
    } catch (err: any) {
      console.warn('Frame extraction warning:', err);
      setStatusType('error');
      setStatusText('Failed to extract frame at this timestamp.');
    }
  }, [videoUrl]);

  useEffect(() => {
    if (isOpen && sourceType === 'video-frame' && videoUrl) {
      extractFrame(videoTime);
    }
  }, [isOpen, sourceType, videoTime, videoUrl, extractFrame]);

  // Generate filmstrip thumbnails
  useEffect(() => {
    if (isOpen && videoUrl && duration > 0 && filmstrip.length === 0) {
      setIsGeneratingFilmstrip(true);
      generateFilmstripThumbnails(videoUrl, duration, 10)
        .then((thumbs) => {
          setFilmstrip(thumbs);
        })
        .catch((e) => console.warn('Filmstrip error:', e))
        .finally(() => setIsGeneratingFilmstrip(false));
    }
  }, [isOpen, videoUrl, duration, filmstrip.length]);

  // Video player handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const t = videoRef.current.currentTime;
      setVideoTime(t);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (time: number) => {
    setVideoTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Add new text element
  const handleAddText = () => {
    const newText: CoverTextElement = {
      id: `text_${Date.now()}`,
      text: 'COVER TITLE',
      x: 50,
      y: 50,
      fontSize: 36,
      fontFamily: 'Inter',
      fontWeight: 'bold',
      color: '#FFFFFF',
      backgroundColor: 'transparent',
      align: 'center',
      rotation: 0,
    };
    setTextElements((prev) => [...prev, newText]);
    setSelectedTextId(newText.id);
    setActiveTab('text');
  };

  const updateSelectedText = (updates: Partial<CoverTextElement>) => {
    if (!selectedTextId) return;
    setTextElements((prev) =>
      prev.map((t) => (t.id === selectedTextId ? { ...t, ...updates } : t))
    );
  };

  const handleDeleteText = (id: string) => {
    setTextElements((prev) => prev.filter((t) => t.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  // Custom Image Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImageUrl(url);
      setSourceType('custom-image');
      setStatusType('success');
      setStatusText('Custom cover image loaded.');
    }
  };

  // Apply Cover: render final canvas composition and save
  const handleApplyCover = async () => {
    const activeBaseUrl = sourceType === 'custom-image' ? customImageUrl : baseFrameUrl;
    if (!activeBaseUrl) {
      setStatusType('error');
      setStatusText('Please select a valid video frame or upload an image.');
      return;
    }

    setStatusType('loading');
    setStatusText('Rendering high-res cover composition...');

    try {
      const coverBlob = await renderFinalCoverImage(
        activeBaseUrl,
        textElements,
        [],
        adjustments,
        1280,
        720
      );

      const file = new File(
        [coverBlob],
        `cover_${projectId}_${Date.now()}.webp`,
        { type: 'image/webp' }
      );

      setStatusText('Uploading cover to project storage...');
      const uploadResult = await uploadAsset(file, 'THUMBNAIL');

      if (!uploadResult.file_url) {
        throw new Error('Upload succeeded but no public URL was returned.');
      }

      const currentState: CoverState = {
        sourceType,
        videoTime,
        customImageUrl,
        textElements,
        overlays: [],
        adjustments,
      };

      await onCoverSet(uploadResult.file_url, currentState);

      setStatusType('success');
      setStatusText('Cover applied successfully!');

      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      console.error('Apply cover error:', err);
      setStatusType('error');
      setStatusText(err.message || 'Failed to apply cover. Please try again.');
    }
  };

  const selectedText = textElements.find((t) => t.id === selectedTextId);

  if (!isOpen) return null;

  const currentActiveBaseUrl = sourceType === 'custom-image' ? customImageUrl : baseFrameUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="bg-[#0F131C] border border-[#1E2538] w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2538] bg-[#141A26]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ImageIcon size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Cover & Thumbnail Editor</h2>
              <p className="text-xs text-slate-400">Select a video frame or upload an image, then add text and custom styling.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCover}
              disabled={statusType === 'loading'}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-white transition shadow-lg shadow-sky-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {statusType === 'loading' ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Apply Cover'
              )}
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusText && (
          <div className={`px-6 py-2 text-xs flex items-center gap-2 border-b ${
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

        {/* Main Grid Workspace */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[480px]">
          {/* Left Column: Cover Preview & Filmstrip Timeline */}
          <div className="flex-1 flex flex-col p-6 bg-[#0B0E17] border-r border-[#1E2538] overflow-y-auto">
            {/* Source Mode Selector */}
            <div className="flex bg-[#161D2B] p-1 rounded-xl mb-4 border border-[#212A3F] self-start">
              <button
                type="button"
                onClick={() => setSourceType('video-frame')}
                disabled={!videoUrl}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                  sourceType === 'video-frame' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 disabled:opacity-40'
                }`}
              >
                From Video Frame
              </button>
              <button
                type="button"
                onClick={() => setSourceType('custom-image')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                  sourceType === 'custom-image' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Custom Upload
              </button>
            </div>

            {/* Interactive Live Preview Box */}
            <div className="relative flex-1 min-h-[260px] bg-black rounded-xl border border-[#212A3F] overflow-hidden flex items-center justify-center select-none shadow-inner group">
              {currentActiveBaseUrl ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={currentActiveBaseUrl}
                    alt="Cover Base Preview"
                    className="w-full h-full object-contain pointer-events-none transition-all duration-150"
                    style={{
                      filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) blur(${adjustments.blur}px) opacity(${adjustments.opacity}%)`
                    }}
                  />
                  {/* Render Custom Text Elements */}
                  {textElements.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTextId(t.id);
                        setActiveTab('text');
                      }}
                      className={`absolute cursor-move px-3 py-1.5 rounded transition-all ${
                        selectedTextId === t.id ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/70 bg-black/30' : 'hover:bg-black/20'
                      }`}
                      style={{
                        left: `${t.x}%`,
                        top: `${t.y}%`,
                        transform: `translate(-50%, -50%) rotate(${t.rotation || 0}deg)`,
                        fontSize: `${Math.max(14, t.fontSize * 0.8)}px`,
                        fontFamily: t.fontFamily || 'Inter',
                        fontWeight: t.fontWeight || 'normal',
                        color: t.color || '#ffffff',
                        backgroundColor: t.backgroundColor || 'transparent',
                        textAlign: t.align || 'center',
                      }}
                    >
                      {t.text}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <ImageIcon size={48} className="mb-2 opacity-40" />
                  <span className="text-xs font-semibold">No base frame or cover image selected</span>
                </div>
              )}

              {/* Hidden Video element for metadata/seeking */}
              {videoUrl && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  crossOrigin="anonymous"
                  className="hidden"
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                />
              )}
            </div>

            {/* Filmstrip Timeline (Video Frame Selection Mode) */}
            {sourceType === 'video-frame' && videoUrl && (
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-sky-400" />
                    Video Frame Selector
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Timestamp: {videoTime.toFixed(2)}s / {duration.toFixed(2)}s
                  </span>
                </div>

                {/* Filmstrip Thumbnails Row */}
                <div className="relative w-full h-16 bg-[#121724] border border-[#212A3F] rounded-lg overflow-hidden flex items-center p-1 gap-1">
                  {isGeneratingFilmstrip ? (
                    <div className="w-full flex items-center justify-center gap-2 text-xs text-slate-400">
                      <Loader2 size={14} className="animate-spin text-sky-400" />
                      Building video filmstrip...
                    </div>
                  ) : (
                    filmstrip.map((thumb, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSeek(thumb.time)}
                        className={`flex-1 h-full rounded overflow-hidden relative border transition ${
                          Math.abs(videoTime - thumb.time) < (duration / 10) ? 'border-sky-400 ring-2 ring-sky-400/40' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={thumb.dataUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))
                  )}
                </div>

                {/* Timeline Scrubber Slider */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-2 rounded-lg bg-[#182030] text-slate-200 hover:bg-slate-700 transition"
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-slate-200" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.05}
                    value={videoTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className="flex-1 accent-sky-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {sourceType === 'custom-image' && (
              <div className="mt-4 flex items-center justify-between bg-[#151B29] p-3 rounded-lg border border-[#242F47]">
                <span className="text-xs text-slate-300">Using custom uploaded cover image</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-md hover:bg-sky-500/20 transition"
                >
                  Change Image
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Customization Sidebar Controls */}
          <div className="w-full md:w-80 bg-[#121622] flex flex-col border-l border-[#1E2538]">
            {/* Sidebar Navigation Tabs */}
            <div className="flex border-b border-[#1E2538] bg-[#161D2B]">
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'text' ? 'text-sky-400 border-b-2 border-sky-400 bg-sky-500/5' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Type size={14} />
                Text
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('adjustments')}
                className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'adjustments' ? 'text-sky-400 border-b-2 border-sky-400 bg-sky-500/5' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders size={14} />
                Adjust
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'upload' ? 'text-sky-400 border-b-2 border-sky-400 bg-sky-500/5' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload size={14} />
                Upload
              </button>
            </div>

            {/* Sidebar Tab Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* TAB 1: TEXT CUSTOMIZATION */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handleAddText}
                    className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Plus size={15} />
                    Add Cover Text
                  </button>

                  {/* List of text elements */}
                  {textElements.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cover Text Items</span>
                      {textElements.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTextId(t.id)}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                            selectedTextId === t.id ? 'bg-sky-500/10 border-sky-500/40 text-white' : 'bg-[#181F2E] border-[#222B3F] text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <span className="truncate font-semibold max-w-[170px]">{t.text || 'Empty Text'}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteText(t.id);
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected Text Controls */}
                  {selectedText ? (
                    <div className="space-y-4 pt-3 border-t border-[#1E2538]">
                      <span className="text-xs font-bold text-sky-400">Edit Selected Text</span>

                      {/* Text Input */}
                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">Text String</label>
                        <input
                          type="text"
                          value={selectedText.text}
                          onChange={(e) => updateSelectedText({ text: e.target.value })}
                          className="w-full bg-[#182030] border border-[#243048] rounded-lg px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                        />
                      </div>

                      {/* Font Family */}
                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">Font Family</label>
                        <select
                          value={selectedText.fontFamily}
                          onChange={(e) => updateSelectedText({ fontFamily: e.target.value })}
                          className="w-full bg-[#182030] border border-[#243048] rounded-lg px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                        >
                          {FONT_FAMILIES.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Font Size & Weight */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-slate-400 font-medium block mb-1">Size ({selectedText.fontSize}px)</label>
                          <input
                            type="range"
                            min={12}
                            max={100}
                            value={selectedText.fontSize}
                            onChange={(e) => updateSelectedText({ fontSize: parseInt(e.target.value) })}
                            className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 font-medium block mb-1">Weight</label>
                          <select
                            value={selectedText.fontWeight}
                            onChange={(e) => updateSelectedText({ fontWeight: e.target.value })}
                            className="w-full bg-[#182030] border border-[#243048] rounded-lg px-2 py-1.5 text-xs text-white focus:border-sky-500"
                          >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="900">Black Heavy</option>
                          </select>
                        </div>
                      </div>

                      {/* Color Presets */}
                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1.5">Text Color</label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {PRESET_COLORS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => updateSelectedText({ color: c })}
                              className={`w-6 h-6 rounded-full border transition ${
                                selectedText.color === c ? 'ring-2 ring-sky-400 scale-110' : 'border-slate-700'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Position Sliders (X & Y) */}
                      <div className="space-y-2">
                        <div>
                          <label className="text-[11px] text-slate-400 font-medium block mb-1">Horizontal Position ({selectedText.x}%)</label>
                          <input
                            type="range"
                            min={5}
                            max={95}
                            value={selectedText.x}
                            onChange={(e) => updateSelectedText({ x: parseInt(e.target.value) })}
                            className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 font-medium block mb-1">Vertical Position ({selectedText.y}%)</label>
                          <input
                            type="range"
                            min={5}
                            max={95}
                            value={selectedText.y}
                            onChange={(e) => updateSelectedText({ y: parseInt(e.target.value) })}
                            className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-500">
                      Click a text element or click &quot;Add Cover Text&quot; to customize.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ADJUSTMENTS */}
              {activeTab === 'adjustments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Visual Adjustments</span>
                    <button
                      type="button"
                      onClick={() => setAdjustments(DEFAULT_ADJUSTMENTS)}
                      className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw size={11} />
                      Reset
                    </button>
                  </div>

                  {/* Brightness */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Brightness</span>
                      <span>{adjustments.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={200}
                      value={adjustments.brightness}
                      onChange={(e) => setAdjustments((prev) => ({ ...prev, brightness: parseInt(e.target.value) }))}
                      className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Contrast</span>
                      <span>{adjustments.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={200}
                      value={adjustments.contrast}
                      onChange={(e) => setAdjustments((prev) => ({ ...prev, contrast: parseInt(e.target.value) }))}
                      className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Saturation</span>
                      <span>{adjustments.saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={200}
                      value={adjustments.saturation}
                      onChange={(e) => setAdjustments((prev) => ({ ...prev, saturation: parseInt(e.target.value) }))}
                      className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>

                  {/* Blur */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Blur</span>
                      <span>{adjustments.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      value={adjustments.blur}
                      onChange={(e) => setAdjustments((prev) => ({ ...prev, blur: parseInt(e.target.value) }))}
                      className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOM IMAGE UPLOAD */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-300 block">Custom Cover Image</span>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#242F47] hover:border-sky-500/50 bg-[#151B29] transition rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".png,.jpg,.jpeg,.webp"
                      className="hidden"
                    />
                    <Upload size={24} className="text-sky-400 mb-2" />
                    <span className="text-xs font-bold text-slate-200 mb-1">Click to upload cover image</span>
                    <span className="text-[10px] text-slate-500">Supports PNG, JPG, JPEG, WEBP</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
