import React, { useState, useEffect } from 'react';
import { Play, Pause, Layers, Type, AudioWaveform, Sliders, Sparkles, RefreshCw } from 'lucide-react';

export function HeroPreview() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(35);
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'effects'>('video');

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="relative w-full rounded-2xl border border-[#1D2B64]/5 bg-white/80 backdrop-blur-md shadow-[0_20px_50px_rgba(29,43,100,0.06)] overflow-hidden flex flex-col group transition-transform duration-500 hover:scale-[1.01] max-w-4xl mx-auto z-10">
      {/* Glow highlight top boundary */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3B6CE7]/20 to-transparent" />

      {/* App Header */}
      <div className="h-12 bg-[#E6F2F8]/40 border-b border-[#1D2B64]/5 flex items-center justify-between px-5">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1D2B64]/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#1D2B64]/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#1D2B64]/10" />
        </div>
        <div className="text-[11px] font-mono font-medium tracking-wide text-[#1D2B64]/60">
          VEYTRIX // Cinematic_Intro_4K.mov
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-[#1D2B64]/70 uppercase tracking-widest">Render Ready</span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex flex-col md:flex-row h-[360px]">
        {/* Left Interactive Toolbar */}
        <div className="hidden md:flex flex-col gap-3 p-3 border-r border-[#1D2B64]/5 bg-white/40 text-[#1D2B64]/50">
          <button 
            onClick={() => setActiveTab('video')} 
            className={`p-2.5 rounded-xl transition-all ${activeTab === 'video' ? 'bg-[#3B6CE7] text-white shadow-sm' : 'hover:bg-[#E6F2F8]/60 hover:text-[#1D2B64]'}`}
          >
            <Layers size={16} />
          </button>
          <button 
            onClick={() => setActiveTab('audio')} 
            className={`p-2.5 rounded-xl transition-all ${activeTab === 'audio' ? 'bg-[#3B6CE7] text-white shadow-sm' : 'hover:bg-[#E6F2F8]/60 hover:text-[#1D2B64]'}`}
          >
            <AudioWaveform size={16} />
          </button>
          <button 
            onClick={() => setActiveTab('effects')} 
            className={`p-2.5 rounded-xl transition-all ${activeTab === 'effects' ? 'bg-[#3B6CE7] text-white shadow-sm' : 'hover:bg-[#E6F2F8]/60 hover:text-[#1D2B64]'}`}
          >
            <Sliders size={16} />
          </button>
        </div>

        {/* Dynamic Video Canvas */}
        <div className="flex-1 bg-[#E6F2F8]/10 relative flex items-center justify-center p-6 min-h-[220px]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(29,43,100,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(29,43,100,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <div className="relative aspect-video w-full max-w-md bg-white border border-[#1D2B64]/5 rounded-xl overflow-hidden shadow-lg group-hover:shadow-[0_8px_30px_rgba(59,108,231,0.08)] transition-all duration-500">
            {/* Visual gradient screen simulation */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1D2B64]/5 to-white" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,108,231,0.08),transparent_70%)]" />
            
            {/* Minimalist Graphic Simulation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-24 h-24 rounded-full border border-[#3B6CE7]/15 flex items-center justify-center transition-transform duration-[4000ms] ease-out"
                style={{ transform: isPlaying ? 'rotate(360deg)' : 'rotate(0deg)' }}
              >
                <div className="w-16 h-16 rounded-full border border-dashed border-[#8CC8E8]/40 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-[#3B6CE7]/80" />
                </div>
              </div>
            </div>

            {/* Playback Control Center Overlay */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#1D2B64]/5 shadow-sm flex items-center gap-3 z-10">
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className="text-[#1D2B64] hover:text-[#3B6CE7] transition-colors"
              >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
              </button>
              <div className="w-px h-3 bg-[#1D2B64]/10" />
              <span className="text-[10px] font-mono font-bold text-[#1D2B64]/80">
                {Math.floor((progress / 100) * 8).toString().padStart(2, '0')}:{(Math.floor((progress % 25) * 2.4)).toString().padStart(2, '0')}s
              </span>
            </div>
          </div>

          {/* Floating AI Engine Badge */}
          <div className="absolute right-4 top-4 bg-[#1D2B64] text-white text-[10px] font-mono font-bold py-1.5 px-3 rounded-full border border-[#3B6CE7]/20 shadow-md flex items-center gap-1.5 select-none animate-bounce">
            <Sparkles size={11} className="text-[#8CC8E8]" />
            <span>AI MATCHING</span>
          </div>
        </div>

        {/* Right Sidebar Inspectors */}
        <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-[#1D2B64]/5 bg-white/40 p-4 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1D2B64]/40 mb-3">Parameters</div>
            
            {activeTab === 'video' && (
              <div className="space-y-3">
                {[
                  { label: "Zoom Factor", value: "115%" },
                  { label: "Position X", value: "12.4" },
                  { label: "Rotation", value: "0.2°" },
                  { label: "Opacity", value: "100%" }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px]">
                    <span className="text-[#1D2B64]/60">{item.label}</span>
                    <span className="font-mono font-semibold bg-white border border-[#1D2B64]/5 px-2 py-0.5 rounded text-[#1D2B64]">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-3">
                {[
                  { label: "Volume db", value: "0.0" },
                  { label: "Noise Reduct", value: "85%" },
                  { label: "Stereo Width", value: "1.2" },
                  { label: "BGM Ducking", value: "Enabled" }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px]">
                    <span className="text-[#1D2B64]/60">{item.label}</span>
                    <span className="font-mono font-semibold bg-white border border-[#1D2B64]/5 px-2 py-0.5 rounded text-[#1D2B64]">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'effects' && (
              <div className="space-y-3">
                {[
                  { label: "Active LUT", value: "Linear v3" },
                  { label: "Vignette", value: "0.15" },
                  { label: "Grain Level", value: "2%" },
                  { label: "Edge Blur", value: "Off" }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px]">
                    <span className="text-[#1D2B64]/60">{item.label}</span>
                    <span className="font-mono font-semibold bg-white border border-[#1D2B64]/5 px-2 py-0.5 rounded text-[#1D2B64]">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-[#1D2B64]/5 flex items-center justify-between text-[10px] text-[#1D2B64]/40 font-mono">
            <span>DISK SPACE</span>
            <span className="font-bold">2.4 GB</span>
          </div>
        </div>
      </div>

      {/* App Timeline Mockup */}
      <div className="h-40 border-t border-[#1D2B64]/5 bg-white/50 flex flex-col relative overflow-hidden">
        {/* Ruler bar */}
        <div className="h-7 border-b border-[#1D2B64]/5 flex items-center justify-between px-4 bg-[#E6F2F8]/20">
          <div className="flex gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B6CE7]/80" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D2B64]/20" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D2B64]/20" />
          </div>
          <div className="text-[9px] font-mono font-bold tracking-wider text-[#1D2B64]/50">
            00:00 - 00:10 MINS
          </div>
        </div>

        {/* Tracks List */}
        <div className="flex-1 p-2 space-y-1 relative">
          {/* Active playhead tracker */}
          <div 
            className="absolute top-0 bottom-0 w-px bg-[#3B6CE7] z-20 pointer-events-none"
            style={{ left: `${15 + (progress * 0.7)}%` }}
          >
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-[#3B6CE7] rounded-full border border-white" />
          </div>

          {[
            { name: 'Video 1', color: 'bg-[#3B6CE7]', w: 'w-[75%]', l: 'left-[10%]' },
            { name: 'Audio 1', color: 'bg-[#8CC8E8]', w: 'w-[65%]', l: 'left-[10%]' },
            { name: 'Overlay', color: 'bg-[#1D2B64]/80', w: 'w-[30%]', l: 'left-[35%]' }
          ].map((track, i) => (
            <div key={i} className="flex items-center gap-2 h-9 bg-white/70 rounded-lg px-3 border border-[#1D2B64]/5">
              <span className="text-[9px] font-mono font-bold text-[#1D2B64]/40 w-12">{track.name}</span>
              <div className="flex-1 h-full py-1 relative">
                <div className={`absolute h-6 rounded-md ${track.color} ${track.w} ${track.l} border border-white/20 opacity-90 shadow-sm`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
