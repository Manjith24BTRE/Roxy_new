import React, { useState } from 'react';
import { Terminal, Cpu, RotateCcw, AlertTriangle } from 'lucide-react';

export function AdvancedPanel() {
  const [formData, setFormData] = useState({
    devMode: false,
    experimentalFeatures: false,
    hardwareAcceleration: true,
    gpuRendering: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    console.log("Advanced saved:", formData);
  };

  const handleReset = () => {
    setFormData({
      devMode: false,
      experimentalFeatures: false,
      hardwareAcceleration: true,
      gpuRendering: true
    });
  };

  const handleFactoryReset = () => {
    console.log("Factory reset triggered");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Advanced Specifications</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Modify low-level hardware encoding, developer debug consoles, and factory states.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Toggle options */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-3 p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
            <input
              type="checkbox"
              name="devMode"
              checked={formData.devMode}
              onChange={handleChange}
              className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Terminal size={12} /> Developer Debug Console</span>
              <span className="text-[9px] text-[#1D2B64]/50 font-medium">Activate inspect logging in timeline contexts</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
            <input
              type="checkbox"
              name="experimentalFeatures"
              checked={formData.experimentalFeatures}
              onChange={handleChange}
              className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Cpu size={12} /> Experimental Beta Engines</span>
              <span className="text-[9px] text-[#1D2B64]/50 font-medium">Try newly staged, non-stable video overlay filters</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
            <input
              type="checkbox"
              name="hardwareAcceleration"
              checked={formData.hardwareAcceleration}
              onChange={handleChange}
              className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Cpu size={12} /> Hardware Acceleration</span>
              <span className="text-[9px] text-[#1D2B64]/50 font-medium">Use computer's hardware encoding during exports</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl cursor-pointer hover:bg-[#E6F2F8]/30 transition">
            <input
              type="checkbox"
              name="gpuRendering"
              checked={formData.gpuRendering}
              onChange={handleChange}
              className="rounded border-[#1D2B64]/20 text-[#3B6CE7] focus:ring-[#3B6CE7] h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1D2B64] flex items-center gap-1.5"><Cpu size={12} /> WebGL GPU Rendering</span>
              <span className="text-[9px] text-[#1D2B64]/50 font-medium">Accelerate timeline visual rendering using webgl buffers</span>
            </div>
          </label>
        </div>

        {/* Danger zone */}
        <div className="p-4 border border-red-200 bg-red-50/50 rounded-2xl flex flex-col gap-3 mt-2">
          <h4 className="text-xs font-bold text-red-600 flex items-center gap-1.5 font-bold">
            <AlertTriangle size={14} className="text-red-500" /> Danger Zone
          </h4>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-medium text-red-600/80">
              <div className="flex flex-col gap-0.5">
                <span>Reset User Configuration</span>
                <span className="text-[9px] text-[#1D2B64]/50">Reset only visual preferences</span>
              </div>
              <button 
                type="button" 
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-xl text-[10px] font-bold hover:bg-red-50 transition cursor-pointer"
              >
                <RotateCcw size={10} /> Reset preferences
              </button>
            </div>

            <div className="flex justify-between items-center text-xs font-medium text-red-600/80 border-t border-red-200/50 pt-2">
              <div className="flex flex-col gap-0.5">
                <span>Hard Factory Reset</span>
                <span className="text-[9px] text-[#1D2B64]/50 font-bold">WARNING: Purges all account workspace tokens</span>
              </div>
              <button 
                type="button" 
                onClick={handleFactoryReset}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-xl text-[10px] font-bold hover:bg-red-700 transition cursor-pointer shadow-sm"
              >
                <AlertTriangle size={10} /> Factory Reset
              </button>
            </div>
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
export default AdvancedPanel;
