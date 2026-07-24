import React, { useState } from 'react';
import { Languages, Play, Trash2, Plus, Download, Globe } from 'lucide-react';

export interface CaptionItem {
  id: string;
  text: string;
  start: number; // in seconds
  end: number; // in seconds
  translations?: Record<string, string>;
}

interface CaptionsProps {
  captions: CaptionItem[];
  onAddCaption: (cap: Omit<CaptionItem, 'id'>) => void;
  onRemoveCaption: (id: string) => void;
  onUpdateCaption: (id: string, updates: Partial<CaptionItem>) => void;
  onSeek: (time: number) => void;
  onBatchCaptions: (caps: CaptionItem[]) => void;
  captionStyle: {
    font: string;
    size: number;
    color: string;
    bgOpacity: number;
    bgColor: string;
    position: string;
  };
  setCaptionStyle: React.Dispatch<React.SetStateAction<{
    font: string;
    size: number;
    color: string;
    bgOpacity: number;
    bgColor: string;
    position: string;
  }>>;
}

export function Captions({
  captions,
  onAddCaption,
  onRemoveCaption,
  onUpdateCaption,
  onSeek,
  onBatchCaptions,
  captionStyle,
  setCaptionStyle
}: CaptionsProps) {
  const [targetLang, setTargetLang] = useState('original');
  const fonts = ['Inter', 'Roboto', 'Outfit', 'Montserrat', 'Bebas Neue'];

  const handleAddManual = () => {
    const lastCap = captions[captions.length - 1];
    const newStart = lastCap ? lastCap.end + 0.5 : 0;
    onAddCaption({
      text: 'New manual subtitle cue text',
      start: newStart,
      end: newStart + 3,
      translations: {
        spanish: 'Nuevo subtítulo manual',
        french: 'Nouveau sous-titre manuel',
        german: 'Neuer manueller Untertitel',
        japanese: '新しい手動字幕'
      }
    });
  };

  const exportSRT = () => {
    let srtText = '';
    captions.forEach((cap, idx) => {
      const formatTime = (timeInSecs: number) => {
        const hrs = Math.floor(timeInSecs / 3600);
        const mins = Math.floor((timeInSecs % 3600) / 60);
        const secs = Math.floor(timeInSecs % 60);
        const ms = Math.floor((timeInSecs % 1) * 1000);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
      };

      const displayText = targetLang === 'original' ? cap.text : (cap.translations?.[targetLang as any] || cap.text);

      srtText += `${idx + 1}\n`;
      srtText += `${formatTime(cap.start)} --> ${formatTime(cap.end)}\n`;
      srtText += `${displayText}\n\n`;
    });

    const blob = new Blob([srtText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subtitles-${targetLang}.srt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#090d16] text-slate-100 select-none">
      <div className="p-4 border-b border-white/10 bg-[#0c101d] flex-shrink-0 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Manual Captions</h3>
          <p className="text-[10px] text-slate-500 mt-1">Create, position, and translate subtitle cues manually.</p>
        </div>
        {captions.length > 0 && (
          <button
            type="button"
            onClick={exportSRT}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-white/10 rounded-md text-[10px] text-slate-400 hover:text-white cursor-pointer transition"
            title="Download Subtitle SRT file"
          >
            <Download className="h-3 w-3" />
            <span>Export SRT</span>
          </button>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Manual Subtitles Editor */}
        {captions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-6 text-center bg-slate-900/20 space-y-4">
            <div className="h-12 w-12 rounded-full bg-sky-500/10 border border-sky-500/25 flex items-center justify-center mx-auto text-sky-400">
              <Languages className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-slate-200">No Captions Added</h4>
              <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                Start creating manually synced subtitle overlays for your video timeline tracks.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddManual}
              className="w-full py-2 bg-gradient-primary text-slate-950 font-bold rounded-lg hover:opacity-95 transition cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-glow"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Subtitle Cue</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Subtitle Cues</label>
              <button
                type="button"
                onClick={handleAddManual}
                className="px-2 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded text-[9px] hover:bg-sky-500/20 cursor-pointer transition flex items-center gap-1 font-bold"
              >
                <Plus className="h-2.5 w-2.5" /> Add Cue
              </button>
            </div>

            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {captions.map((cap) => (
                <div
                  key={cap.id}
                  className="bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 rounded-xl p-2.5 space-y-2 transition group"
                >
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        value={cap.start}
                        onChange={(e) => onUpdateCaption(cap.id, { start: Number(e.target.value) })}
                        className="w-10 rounded bg-slate-950 border border-white/5 text-center text-slate-300 focus:outline-none"
                      />
                      <span>→</span>
                      <input
                        type="number"
                        step="0.1"
                        value={cap.end}
                        onChange={(e) => onUpdateCaption(cap.id, { end: Number(e.target.value) })}
                        className="w-10 rounded bg-slate-950 border border-white/5 text-center text-slate-300 focus:outline-none"
                      />
                      <span>sec</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSeek(cap.start)}
                        className="h-5 w-5 rounded bg-slate-950 hover:bg-sky-500/20 text-slate-400 hover:text-sky-400 flex items-center justify-center cursor-pointer transition"
                        title="Jump Playhead Here"
                      >
                        <Play className="h-2.5 w-2.5 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveCaption(cap.id)}
                        className="h-5 w-5 rounded bg-slate-950 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center cursor-pointer transition"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={targetLang === 'original' ? cap.text : (cap.translations?.[targetLang as any] || cap.text)}
                    onChange={(e) => {
                      if (targetLang === 'original') {
                        onUpdateCaption(cap.id, { text: e.target.value });
                      } else {
                        const existingTranslations = cap.translations || {};
                        onUpdateCaption(cap.id, {
                          translations: { ...existingTranslations, [targetLang]: e.target.value }
                        });
                      }
                    }}
                    className="w-full rounded-md bg-slate-950/80 border border-white/5 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500/40"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRANSLATE PANEL */}
        {captions.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Globe className="h-3 w-3 text-sky-400" /> Language Translation
            </span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full rounded-md bg-slate-900 border border-white/10 px-2 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer font-medium"
            >
              <option value="original">Original (English)</option>
              <option value="spanish">Translate to Spanish (Español)</option>
              <option value="french">Translate to French (Français)</option>
              <option value="german">Translate to German (Deutsch)</option>
              <option value="japanese">Translate to Japanese (日本語)</option>
            </select>
          </div>
        )}

        {/* Captions Style Settings */}
        <div className="border-t border-white/5 pt-4 space-y-3.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Caption Style</div>

          {/* Font & Size */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500">Font Family</span>
              <select
                value={captionStyle.font}
                onChange={(e) => setCaptionStyle({ ...captionStyle, font: e.target.value })}
                className="w-full rounded-md bg-slate-900 border border-white/10 px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                {fonts.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500">Font Size ({captionStyle.size}px)</span>
              <input
                type="number"
                min="12"
                max="72"
                value={captionStyle.size}
                onChange={(e) => setCaptionStyle({ ...captionStyle, size: Math.max(12, Number(e.target.value)) })}
                className="w-full rounded-md bg-slate-900 border border-white/10 px-2 py-1.5 text-xs text-slate-200 focus:outline-none text-center"
              />
            </div>
          </div>

          {/* Text Color & Background Opacity */}
          <div className="flex items-center justify-between gap-3 bg-slate-950/20 p-2.5 border border-white/5 rounded-xl">
            {/* Color */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-slate-500">Text Color</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={captionStyle.color}
                  onChange={(e) => setCaptionStyle({ ...captionStyle, color: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-white/10 bg-transparent flex-shrink-0"
                />
                <span className="text-[9px] font-mono text-slate-400">{captionStyle.color}</span>
              </div>
            </div>

            {/* Background color & Opacity */}
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>Box Opacity</span>
                <span>{captionStyle.bgOpacity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={captionStyle.bgColor}
                  onChange={(e) => setCaptionStyle({ ...captionStyle, bgColor: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer border border-white/10 bg-transparent flex-shrink-0"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={captionStyle.bgOpacity}
                  onChange={(e) => setCaptionStyle({ ...captionStyle, bgOpacity: Number(e.target.value) })}
                  className="flex-1 accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Position Selector */}
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500">Vertical Alignment</span>
            <div className="flex rounded-lg bg-slate-900 border border-white/10 p-0.5">
              {['top', 'middle', 'bottom'].map((pos) => {
                const isActive = captionStyle.position === pos;
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setCaptionStyle({ ...captionStyle, position: pos })}
                    className={`flex-1 py-1 text-[10px] rounded font-semibold capitalize cursor-pointer transition ${
                      isActive ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
