import React, { useState } from 'react';
import { Eye, HelpCircle, Keyboard, Volume2, ArrowUpRight, RotateCcw } from 'lucide-react';

export function AccessibilityPanel() {
  const [formData, setFormData] = useState({
    reduceMotion: false,
    highContrast: false,
    keyboardNav: true,
    screenReader: false,
    largeCursor: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    console.log("Accessibility saved:", formData);
  };

  const handleReset = () => {
    setFormData({
      reduceMotion: false,
      highContrast: false,
      keyboardNav: true,
      screenReader: false,
      largeCursor: false
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Accessibility Preferences</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Configure layout scaling, motion reduction, and navigation helper tools.</p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
          <input
            type="checkbox"
            name="reduceMotion"
            checked={formData.reduceMotion}
            onChange={handleChange}
            className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Eye size={12} /> Reduce Motion</span>
            <span className="text-[10px] text-[#1D2B64]/50 font-medium">Disable hover transforms & slider animations</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
          <input
            type="checkbox"
            name="highContrast"
            checked={formData.highContrast}
            onChange={handleChange}
            className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><HelpCircle size={12} /> High Contrast UI</span>
            <span className="text-[10px] text-[#1D2B64]/50 font-medium">Maximize color contrast for structural clarity</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
          <input
            type="checkbox"
            name="keyboardNav"
            checked={formData.keyboardNav}
            onChange={handleChange}
            className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Keyboard size={12} /> Keyboard Navigation</span>
            <span className="text-[10px] text-[#1D2B64]/50 font-medium">Enable tab index markers & outline highlighting</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
          <input
            type="checkbox"
            name="screenReader"
            checked={formData.screenReader}
            onChange={handleChange}
            className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Volume2 size={12} /> Screen Reader Mode</span>
            <span className="text-[10px] text-[#1D2B64]/50 font-medium">Announce key-timeline status tags to hardware readers</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
          <input
            type="checkbox"
            name="largeCursor"
            checked={formData.largeCursor}
            onChange={handleChange}
            className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><ArrowUpRight size={12} /> Large Editor Cursor</span>
            <span className="text-[10px] text-[#1D2B64]/50 font-medium">Increase pointer visibility in timeline tracks</span>
          </div>
        </label>
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
export default AccessibilityPanel;
