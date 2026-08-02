import React, { useState } from 'react';
import { Film, MonitorPlay, AudioWaveform, Palette, Wand2, Download, Play, Pause, ChevronRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { SectionTitle } from './SectionTitle';

export function FeatureBento() {
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(true);
  const [activeBlur, setActiveBlur] = useState(8);
  const [activeLUT, setActiveLUT] = useState('Rec.709');

  return (
    <section id="features" className="relative py-28 bg-[#FFFFFF] z-10">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Reusable Section Title */}
        <div className="reveal-on-scroll">
          <SectionTitle 
            badge="Features"
            title="Everything you need. Nothing in your way."
            subtitle="Engineered with minimal UI overhead, allowing you to focus purely on the visual content."
          />
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[310px] mt-12">
          
          {/* Timeline - Large horizontal */}
          <GlassCard className="reveal-on-scroll md:col-span-2 flex flex-col p-8 group">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#3B6CE7]/10 flex items-center justify-center text-[#3B6CE7]">
                <Film size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[#1D2B64]">Cinematic Timeline</h3>
                <span className="text-[10px] font-mono text-[#1D2B64]/40 font-bold uppercase tracking-widest">Multi-Track Orchestration</span>
              </div>
            </div>
            <p className="text-[#1D2B64]/70 text-sm max-w-md">Multi-track layer editing with magnetic snapping, fluid ripple cuts, and precision zoom markers that react immediately.</p>
            
            {/* Interactive Timeline Visual demo */}
            <div className="mt-auto pt-6">
              <div className="flex flex-col gap-2 relative">
                <div 
                  className={`absolute top-0 bottom-0 w-0.5 bg-[#3B6CE7] z-10 transition-all duration-[6000ms] ease-linear ${isPlayingTimeline ? 'left-[80%]' : 'left-[20%]'}`} 
                  onTransitionEnd={() => setIsPlayingTimeline(!isPlayingTimeline)}
                />
                
                <div className="h-7 w-full bg-[#E6F2F8]/30 rounded-lg border border-[#1D2B64]/5 flex items-center px-2">
                   <div className="h-4 w-1/3 ml-[15%] bg-[#3B6CE7]/85 rounded-md border border-white/20 shadow-sm flex items-center px-2 justify-between">
                     <span className="text-[8px] font-mono text-white font-bold">Intro.mov</span>
                   </div>
                </div>
                <div className="h-7 w-full bg-[#E6F2F8]/30 rounded-lg border border-[#1D2B64]/5 flex items-center px-2">
                   <div className="h-4 w-[45%] ml-[35%] bg-[#8CC8E8]/90 rounded-md border border-white/20 shadow-sm flex items-center px-2 justify-between">
                     <span className="text-[8px] font-mono text-[#1D2B64] font-bold">B-Roll_A.mp4</span>
                   </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Live Preview */}
          <GlassCard className="reveal-on-scroll flex flex-col p-8 group">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#3B6CE7]/10 flex items-center justify-center text-[#3B6CE7]">
                <MonitorPlay size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[#1D2B64]">Zero-Lag Preview</h3>
                <span className="text-[10px] font-mono text-[#1D2B64]/40 font-bold uppercase tracking-widest">Canvas UI</span>
              </div>
            </div>
            
            {/* Visual demo */}
            <div className="mt-auto aspect-video bg-[#E6F2F8]/20 border border-[#1D2B64]/5 rounded-xl relative overflow-hidden flex items-center justify-center shadow-inner">
              <div className="absolute inset-3 border border-dashed border-[#3B6CE7]/20 rounded-lg opacity-40 group-hover:opacity-100 transition-opacity" />
              <button className="w-11 h-11 rounded-full bg-white border border-[#1D2B64]/5 flex items-center justify-center shadow-md text-[#3B6CE7] hover:scale-105 active:scale-95 transition-all">
                <Play size={16} className="fill-current ml-0.5" />
              </button>
            </div>
          </GlassCard>

          {/* Effects */}
          <GlassCard className="reveal-on-scroll flex flex-col p-8 group">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#3B6CE7]/10 flex items-center justify-center text-[#3B6CE7]">
                <Wand2 size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[#1D2B64]">GPU Effects</h3>
                <span className="text-[10px] font-mono text-[#1D2B64]/40 font-bold uppercase tracking-widest">Shaders</span>
              </div>
            </div>
            
            {/* Interactive sliders visual mockup */}
            <div className="mt-auto space-y-3">
              <div className="bg-[#E6F2F8]/30 border border-[#1D2B64]/5 rounded-xl p-3 flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-mono font-bold text-[#1D2B64]">
                  <span>Gaussian Blur</span>
                  <span>{activeBlur}px</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  value={activeBlur} 
                  onChange={(e) => setActiveBlur(Number(e.target.value))}
                  className="w-full h-1 bg-[#1D2B64]/10 rounded-lg appearance-none cursor-pointer accent-[#3B6CE7]"
                />
              </div>
              <div className="bg-[#E6F2F8]/30 border border-[#1D2B64]/5 rounded-xl p-3 flex justify-between items-center text-xs">
                <span className="font-mono font-bold text-[#1D2B64] text-[10px]">Filter Blend</span>
                <span className="font-mono font-bold text-[#3B6CE7] text-[10px]">Screen</span>
              </div>
            </div>
          </GlassCard>

          {/* Audio - Large horizontal */}
          <GlassCard className="reveal-on-scroll md:col-span-2 flex flex-col p-8 group">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#3B6CE7]/10 flex items-center justify-center text-[#3B6CE7]">
                <AudioWaveform size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[#1D2B64]">Waveform Analysis</h3>
                <span className="text-[10px] font-mono text-[#1D2B64]/40 font-bold uppercase tracking-widest">Audio HUD</span>
              </div>
            </div>
            <p className="text-[#1D2B64]/70 text-sm max-w-md">Synchronize audio tracks, implement ducking parameters, and apply noise gates with interactive visualizers.</p>
            
            {/* Waveform graphic */}
            <div className="mt-auto h-16 w-full flex items-end gap-1.5 overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
              {Array.from({ length: 48 }).map((_, i) => {
                const height = Math.abs(Math.sin(i * 0.2) * 80 + Math.cos(i * 0.4) * 20);
                return (
                  <div 
                    key={i} 
                    className="flex-1 bg-[#3B6CE7]/20 hover:bg-[#3B6CE7] rounded-full transition-all duration-300" 
                    style={{ height: `${Math.max(10, height)}%` }} 
                  />
                );
              })}
            </div>
          </GlassCard>

          {/* Color & Curves */}
          <GlassCard className="reveal-on-scroll md:col-span-2 flex flex-col p-8 group">
             <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#3B6CE7]/10 flex items-center justify-center text-[#3B6CE7]">
                <Palette size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[#1D2B64]">Color Grading</h3>
                <span className="text-[10px] font-mono text-[#1D2B64]/40 font-bold uppercase tracking-widest">LUT Mapping</span>
              </div>
            </div>
            
            <div className="mt-auto h-24 bg-[#E6F2F8]/10 border border-[#1D2B64]/5 rounded-xl relative overflow-hidden flex items-end p-3 gap-1">
               <div className="absolute inset-0 bg-gradient-to-t from-[#8CC8E8]/10 to-transparent" />
               <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
                 <path 
                   d="M0,50 C25,45 35,5 65,20 C80,30 90,0 100,10 L100,50 L0,50 Z" 
                   className="fill-[#3B6CE7]/5 stroke-[#3B6CE7] stroke-[0.8]" 
                 />
               </svg>
               <div className="absolute top-3 right-3 flex gap-1.5">
                 {['Rec.709', 'ACEScg', 'Film Log'].map((lut) => (
                   <button 
                     key={lut}
                     onClick={() => setActiveLUT(lut)}
                     className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold transition-all ${activeLUT === lut ? 'bg-[#1D2B64] text-white' : 'bg-white text-[#1D2B64]/60 border border-[#1D2B64]/5 hover:bg-[#E6F2F8]'}`}
                   >
                     {lut}
                   </button>
                 ))}
               </div>
            </div>
          </GlassCard>

          {/* Export */}
          <GlassCard className="reveal-on-scroll flex flex-col p-8 group">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#3B6CE7]/10 flex items-center justify-center text-[#3B6CE7]">
                <Download size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[#1D2B64]">Pro Render Export</h3>
                <span className="text-[10px] font-mono text-[#1D2B64]/40 font-bold uppercase tracking-widest">Multi-Format</span>
              </div>
            </div>
            
            {/* Formatting chips */}
            <div className="mt-auto flex gap-2 flex-wrap">
              {["4K Ultra HD", "ProRes 422", "H.265 / HEVC", "120 FPS Rendering", "Dolby Digital"].map((item, i) => (
                <span 
                  key={i} 
                  className="px-2.5 py-1.5 bg-[#E6F2F8]/40 border border-[#1D2B64]/5 rounded-xl text-[10px] font-mono text-[#1D2B64] font-bold transition-all duration-300 group-hover:border-[#3B6CE7]/20 group-hover:bg-white"
                >
                  {item}
                </span>
              ))}
            </div>
          </GlassCard>

        </div>
      </div>
    </section>
  );
}
