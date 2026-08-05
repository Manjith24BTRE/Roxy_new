import React, { useState } from 'react';
import { LayoutGrid, Eye, Sliders, Type, RotateCcw } from 'lucide-react';

export function AppearancePanel() {
  const [formData, setFormData] = useState({
    theme: 'Light',
    accentColor: '#3B6CE7',
    density: 'Comfortable',
    animations: true,
    glassEffects: true,
    blurStrength: 8,
    fontSize: 12
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSave = () => {
    console.log("Appearance saved:", formData);
  };

  const handleReset = () => {
    setFormData({
      theme: 'Light',
      accentColor: '#3B6CE7',
      density: 'Comfortable',
      animations: true,
      glassEffects: true,
      blurStrength: 8,
      fontSize: 12
    });
  };

  const accents = ['#3B6CE7', '#1D2B64', '#8CC8E8', '#22C55E', '#F59E0B', '#EF4444'];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Appearance Preferences</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Customize themes, accent colors, text scaling, and animations.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Theme Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Interface Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {['Light', 'Dark', 'System'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, theme: t }))}
                className={`py-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                  formData.theme === t 
                    ? 'border-[#3B6CE7] bg-[#E6F2F8]/30 text-[#3B6CE7]' 
                    : 'border-[#1D2B64]/5 bg-[#FAFAFC] text-[#1D2B64]/60 hover:text-[#1D2B64]'
                }`}
              >
                <span>{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Accent Color</label>
          <div className="flex gap-3">
            {accents.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, accentColor: a }))}
                className={`h-7 w-7 rounded-full transition cursor-pointer flex items-center justify-center`}
                style={{ backgroundColor: a }}
              >
                {formData.accentColor === a && (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* UI Density */}
        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">UI Density</label>
          <div className="grid grid-cols-2 gap-2">
            {['Compact', 'Comfortable'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, density: d }))}
                className={`py-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  formData.density === d 
                    ? 'border-[#3B6CE7] bg-[#E6F2F8]/30 text-[#3B6CE7]' 
                    : 'border-[#1D2B64]/5 bg-[#FAFAFC] text-[#1D2B64]/60 hover:text-[#1D2B64]'
                }`}
              >
                <LayoutGrid size={12} /> {d}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <label className="flex items-center gap-3 p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              name="animations"
              checked={formData.animations}
              onChange={handleChange}
              className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Eye size={12} /> UI Animations</span>
              <span className="text-[9px] text-[#1D2B64]/50 font-medium">Enable transition animations</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              name="glassEffects"
              checked={formData.glassEffects}
              onChange={handleChange}
              className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Sliders size={12} /> Glassmorphism</span>
              <span className="text-[9px] text-[#1D2B64]/50 font-medium">Enable transparency & blur</span>
            </div>
          </label>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-1 p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl">
            <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Blur Strength ({formData.blurStrength}px)</label>
            <input
              type="range"
              name="blurStrength"
              min="0"
              max="24"
              value={formData.blurStrength}
              onChange={handleChange}
              className="w-full mt-1.5 accent-[#3B6CE7]"
              disabled={!formData.glassEffects}
            />
          </div>

          <div className="flex flex-col gap-1 p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl">
            <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider flex items-center gap-1"><Type size={10} /> Font Size ({formData.fontSize}px)</label>
            <input
              type="range"
              name="fontSize"
              min="10"
              max="18"
              value={formData.fontSize}
              onChange={handleChange}
              className="w-full mt-1.5 accent-[#3B6CE7]"
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
export default AppearancePanel;
