import React, { useState } from 'react';
import { Video, Film, Volume2, FolderOpen, RotateCcw } from 'lucide-react';

export function ExportPanel() {
  const [formData, setFormData] = useState({
    resolution: '1080p (1920x1080)',
    fps: '60 fps',
    codec: 'H.264 / AVC',
    bitrate: 'High (15 Mbps)',
    audioQuality: 'Stereo (320 kbps)',
    exportFolder: '/users/veytrix/exports'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Export saved:", formData);
  };

  const handleReset = () => {
    setFormData({
      resolution: '1080p (1920x1080)',
      fps: '60 fps',
      codec: 'H.264 / AVC',
      bitrate: 'High (15 Mbps)',
      audioQuality: 'Stereo (320 kbps)',
      exportFolder: '/users/veytrix/exports'
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Export Preferences</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Configure video default dimensions, codecs, frame rates, and export folders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Default Resolution</label>
          <div className="relative">
            <Video size={14} className="absolute left-3 top-3.5 text-[#1D2B64]/40" />
            <select
              name="resolution"
              value={formData.resolution}
              onChange={handleChange}
              className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] appearance-none"
            >
              <option>1080p (1920x1080)</option>
              <option>4K UHD (3840x2160)</option>
              <option>720p (1280x720)</option>
              <option>Vertical (1080x1920)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Frame Rate (FPS)</label>
          <div className="relative">
            <Film size={14} className="absolute left-3 top-3.5 text-[#1D2B64]/40" />
            <select
              name="fps"
              value={formData.fps}
              onChange={handleChange}
              className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] appearance-none"
            >
              <option>60 fps</option>
              <option>30 fps</option>
              <option>24 fps</option>
              <option>120 fps</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Video Codec</label>
          <select
            name="codec"
            value={formData.codec}
            onChange={handleChange}
            className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl px-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
          >
            <option>H.264 / AVC</option>
            <option>H.265 / HEVC</option>
            <option>ProRes 422</option>
            <option>AV1</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Target Bitrate</label>
          <select
            name="bitrate"
            value={formData.bitrate}
            onChange={handleChange}
            className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl px-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
          >
            <option>High (15 Mbps)</option>
            <option>Medium (10 Mbps)</option>
            <option>Maximum (35 Mbps)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Audio Quality Codec</label>
          <div className="relative">
            <Volume2 size={14} className="absolute left-3 top-3.5 text-[#1D2B64]/40" />
            <select
              name="audioQuality"
              value={formData.audioQuality}
              onChange={handleChange}
              className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] appearance-none"
            >
              <option>Stereo (320 kbps)</option>
              <option>Studio (448 kbps)</option>
              <option>Mono (128 kbps)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Export Destination Folder</label>
          <div className="relative">
            <FolderOpen size={14} className="absolute left-3 top-3.5 text-[#1D2B64]/40" />
            <input
              type="text"
              name="exportFolder"
              value={formData.exportFolder}
              onChange={handleChange}
              className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
            />
          </div>
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
export default ExportPanel;
