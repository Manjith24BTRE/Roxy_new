import React, { useState } from 'react';
import { Shield, EyeOff, BarChart2, ShieldCheck, Download, Trash2, RotateCcw } from 'lucide-react';

export function PrivacyPanel() {
  const [formData, setFormData] = useState({
    analytics: true,
    crashReports: true,
    anonymousStats: false,
    cookies: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    console.log("Privacy saved:", formData);
  };

  const handleReset = () => {
    setFormData({
      analytics: true,
      crashReports: true,
      anonymousStats: false,
      cookies: true
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Privacy Policy & Control</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Manage cookies consent, usage telemetry, and download/delete requests.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Telemetry settings */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-3 p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
            <input
              type="checkbox"
              name="analytics"
              checked={formData.analytics}
              onChange={handleChange}
              className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Shield size={12} /> Usage Analytics</span>
              <span className="text-[9px] text-[#1D2B64]/50 font-medium">Allow sharing UI interactions to improve feature flows</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
            <input
              type="checkbox"
              name="crashReports"
              checked={formData.crashReports}
              onChange={handleChange}
              className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><EyeOff size={12} /> Crash Reporting</span>
              <span className="text-[9px] text-[#1D2B64]/50 font-medium">Send stack trace info automatically upon application crash</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
            <input
              type="checkbox"
              name="anonymousStats"
              checked={formData.anonymousStats}
              onChange={handleChange}
              className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><BarChart2 size={12} /> Anonymous Statistics</span>
              <span className="text-[9px] text-[#1D2B64]/50 font-medium">Gather diagnostic hardware specs for layout benchmarks</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
            <input
              type="checkbox"
              name="cookies"
              checked={formData.cookies}
              onChange={handleChange}
              className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><ShieldCheck size={12} /> Cookies Consent</span>
              <span className="text-[9px] text-[#1D2B64]/50 font-medium">Store cookies to retain layout configurations & auth states</span>
            </div>
          </label>
        </div>

        {/* Data administration buttons */}
        <h4 className="text-xs font-bold text-[#1D2B64] border-b border-[#1D2B64]/5 pb-1 mt-2">Data Administration</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
          <button 
            type="button"
            className="flex items-center justify-center gap-2 p-3 border border-[#1D2B64]/10 hover:border-[#3B6CE7]/20 hover:bg-[#E6F2F8]/20 rounded-xl transition text-xs font-bold text-[#1D2B64]/80 cursor-pointer"
          >
            <Download size={14} className="text-[#3B6CE7]" /> Download My Data
          </button>

          <button 
            type="button"
            className="flex items-center justify-center gap-2 p-3 border border-red-200 hover:bg-red-50 rounded-xl transition text-xs font-bold text-red-600 cursor-pointer"
          >
            <Trash2 size={14} className="text-red-500" /> Delete Personal Data
          </button>
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
export default PrivacyPanel;
