import React from 'react';
import { Shield, Sparkles, Zap, HardDrive } from 'lucide-react';

export function SettingsContent() {
  return (
    <div className="flex flex-col gap-6 select-none animate-fade-in">
      {/* Banner Card */}
      <div className="p-5 bg-[#E6F2F8]/30 border border-[#1D2B64]/5 rounded-2xl flex flex-col gap-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Sparkles size={120} className="text-[#3B6CE7]" />
        </div>
        
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#3B6CE7] flex items-center gap-1">
          <Zap size={10} className="animate-pulse" /> Advanced Configuration
        </span>
        <h2 className="text-sm font-bold text-[#1D2B64]">Welcome to the VEYTRIX Settings Center</h2>
        <p className="text-[11px] text-[#1D2B64]/70 leading-relaxed font-medium max-w-md">
          Explore and modify low-level video encoding pipelines, customizable keyboard shortcut keys, and workspace sync nodes. Click any option in the sidebar to open its configuration popup.
        </p>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Storage stats panel */}
        <div className="p-4 bg-white border border-[#1D2B64]/5 shadow-sm rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1D2B64]">
            <HardDrive size={14} className="text-[#3B6CE7]" />
            <span>Storage Allocation</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10px] text-[#1D2B64]/60 font-semibold">
              <span>Cloud Storage Used</span>
              <span>6.0 GB / 10 GB</span>
            </div>
            <div className="w-full bg-[#1D2B64]/5 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#3B6CE7] h-full rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        </div>

        {/* Security status panel */}
        <div className="p-4 bg-white border border-[#1D2B64]/5 shadow-sm rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1D2B64]">
            <Shield size={14} className="text-[#22C55E]" />
            <span>Security Operations</span>
          </div>
          <div className="flex flex-col gap-1 text-[10px] text-[#1D2B64]/70 font-semibold">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
              <span>Two-Factor Authentication: Enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
              <span>Active Sessions: 1 Device connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
