import React from 'react';
import { useTheme } from '../../../themes/themeProvider';
import { ThemeName } from '../../../themes/themeTypes';

export function AppearancePanel() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Appearance Preferences</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Select your preferred user interface style.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Theme Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#1D2B64]/60 uppercase tracking-wider">Interface Theme</label>
          <div className="grid grid-cols-2 gap-4">
            {(['Light', 'Dark'] as ThemeName[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`py-8 rounded-2xl border text-sm font-bold transition flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm ${
                  theme === t 
                    ? 'border-[#3B6CE7] bg-[#E6F2F8]/30 text-[#3B6CE7]' 
                    : 'border-[#1D2B64]/5 bg-[#FAFAFC] text-[#1D2B64]/60 hover:text-[#1D2B64]'
                }`}
              >
                <span className="text-2xl">{t === 'Light' ? '☀️' : '🌙'}</span>
                <span>{t} Theme</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppearancePanel;
