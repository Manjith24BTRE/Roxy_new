import React, { useState, useEffect } from 'react';
import { Video, Film, Volume2, FolderOpen, RotateCcw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  fetchExportPreferences,
  updateExportPreferences,
  DEFAULT_EXPORT_PREFERENCES,
} from '../services/settings.service';
import { ExportPreferencesData } from '../types/settings.types';

export function ExportPanel() {
  const [formData, setFormData] = useState<ExportPreferencesData>(DEFAULT_EXPORT_PREFERENCES);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadPreferences = async () => {
      setLoading(true);
      try {
        const prefs = await fetchExportPreferences();
        if (isMounted) {
          setFormData(prefs);
        }
      } catch (err) {
        console.warn('Could not load export preferences:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPreferences();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFeedback(null);
  };

  const handleSave = async () => {
    if (saving) return;

    // Basic Validation
    if (!formData.exportFolder.trim()) {
      setFeedback({ type: 'error', message: 'Export destination folder cannot be empty.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const res = await updateExportPreferences(formData);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message || 'Export preferences saved successfully.' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to save export preferences.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'An error occurred while saving.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setFormData(DEFAULT_EXPORT_PREFERENCES);
    setFeedback(null);
    setSaving(true);
    try {
      const res = await updateExportPreferences(DEFAULT_EXPORT_PREFERENCES);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Export preferences reset to defaults.' });
      }
    } catch (err: any) {
      console.warn('Reset error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Export Preferences</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Configure video default dimensions, codecs, frame rates, and export folders.</p>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in duration-150 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[#1D2B64]/50" size={24} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Default Resolution</label>
            <div className="relative">
              <Video size={14} className="absolute left-3 top-3.5 text-[#1D2B64]/40" />
              <select
                name="resolution"
                value={formData.resolution}
                onChange={handleChange}
                disabled={saving}
                className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] appearance-none disabled:opacity-60"
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
                disabled={saving}
                className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] appearance-none disabled:opacity-60"
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
              disabled={saving}
              className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl px-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] disabled:opacity-60"
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
              disabled={saving}
              className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl px-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] disabled:opacity-60"
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
                disabled={saving}
                className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] appearance-none disabled:opacity-60"
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
                disabled={saving}
                className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] disabled:opacity-60"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center border-t border-[#1D2B64]/5 pt-4 mt-4 select-none">
        <button
          type="button"
          onClick={handleReset}
          disabled={loading || saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1D2B64]/10 text-xs text-[#1D2B64]/60 hover:text-[#1D2B64] hover:bg-[#FAFAFC] transition cursor-pointer font-medium disabled:opacity-50"
        >
          <RotateCcw size={12} /> Reset to Default
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || saving}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#1D2B64] text-white text-xs font-semibold hover:bg-[#3B6CE7] transition shadow-[0_4px_12px_rgba(29,43,100,0.15)] cursor-pointer disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin text-white" />}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
}
export default ExportPanel;
