import React from 'react';
import { Play, PlayCircle, FastForward, Rewind, Layers, Type, AudioWaveform, MousePointer2 } from 'lucide-react';

export function EditorShowcase() {
  return (
    <section className="relative w-full overflow-hidden pb-20 pt-4 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl relative z-10">
        
        {/* Outer App Frame */}
        <div className="rounded-2xl md:rounded-[24px] bg-[#10172A] border border-[#1E293B] shadow-2xl overflow-hidden flex flex-col group transition-transform duration-500 hover:scale-[1.01]">
          
          {/* App Header */}
          <div className="h-10 bg-[#0F172A] border-b border-[#1E293B] flex items-center justify-between px-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
            </div>
            <div className="text-[10px] sm:text-xs font-mono text-[#94A3B8]">
              VEYTRIX / Untitled Project
            </div>
            <div className="bg-[#3B6CE7] text-white text-[10px] font-bold px-2 py-1 rounded">
              EXPORT
            </div>
          </div>

          {/* Main Workspace */}
          <div className="flex flex-col md:flex-row h-auto md:h-[400px]">
            {/* Left Toolbar */}
            <div className="hidden md:flex flex-col gap-4 p-3 border-r border-[#1E293B] bg-[#0B0F19] text-[#64748B]">
              <div className="p-2 rounded-lg bg-[#3B6CE7]/20 text-[#3B6CE7]"><MousePointer2 size={18} /></div>
              <div className="p-2 rounded-lg hover:bg-[#1E293B]"><Layers size={18} /></div>
              <div className="p-2 rounded-lg hover:bg-[#1E293B]"><Type size={18} /></div>
              <div className="p-2 rounded-lg hover:bg-[#1E293B]"><AudioWaveform size={18} /></div>
            </div>

            {/* Preview Canvas */}
            <div className="flex-1 bg-[#020617] relative flex items-center justify-center p-4 min-h-[250px]">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
              <div className="relative aspect-video w-full max-w-lg bg-[#0F172A] border border-[#1E293B] rounded-lg overflow-hidden flex items-center justify-center shadow-lg group-hover:shadow-[0_0_40px_rgba(59,108,231,0.15)] transition-shadow duration-500">
                {/* Abstract video representation */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] to-[#0F172A]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,108,231,0.2),transparent_70%)]" />
                <PlayCircle className="text-[#3B6CE7] w-12 h-12 relative z-10 opacity-80" />
                
                {/* Safe areas */}
                <div className="absolute inset-4 border border-[#334155]/30 rounded pointer-events-none" />
              </div>
            </div>

            {/* Right Properties */}
            <div className="hidden md:block w-64 border-l border-[#1E293B] bg-[#0B0F19] p-4">
              <div className="text-xs font-mono text-[#94A3B8] mb-4 uppercase tracking-wider">Properties</div>
              <div className="space-y-4">
                {[
                  { label: "Position", value: "0, 0" },
                  { label: "Scale", value: "100%" },
                  { label: "Opacity", value: "100%" },
                  { label: "Blend", value: "Normal" }
                ].map((prop, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-[#64748B]">{prop.label}</span>
                    <span className="text-[#E2E8F0] bg-[#1E293B] px-2 py-1 rounded font-mono">{prop.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="h-48 border-t border-[#1E293B] bg-[#0B0F19] flex flex-col relative overflow-hidden">
            {/* Timeline Header */}
            <div className="h-8 border-b border-[#1E293B] flex items-center px-4 justify-between bg-[#0F172A]">
              <div className="flex gap-3 text-[#64748B]">
                <Rewind size={14} />
                <Play size={14} className="text-[#E2E8F0]" />
                <FastForward size={14} />
              </div>
              <div className="text-[10px] font-mono text-[#64748B]">
                00:00:12:04
              </div>
            </div>
            
            {/* Tracks */}
            <div className="flex-1 p-2 space-y-1 relative">
              {/* Playhead */}
              <div className="absolute top-0 bottom-0 left-[35%] w-px bg-[#3B6CE7] z-20 group-hover:left-[45%] transition-all duration-[3000ms] ease-linear">
                <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-[#3B6CE7] rounded-sm flex items-center justify-center">
                  <div className="w-0.5 h-1.5 bg-white rounded-full" />
                </div>
              </div>

              {[
                { name: 'V2', color: 'bg-[#8CC8E8]', opacity: 'opacity-90', w: 'w-[40%]', left: 'left-[10%]' },
                { name: 'V1', color: 'bg-[#3B6CE7]', opacity: 'opacity-90', w: 'w-[70%]', left: 'left-[5%]' },
                { name: 'A1', color: 'bg-[#10B981]', opacity: 'opacity-70', w: 'w-[70%]', left: 'left-[5%]' },
              ].map((track, i) => (
                <div key={i} className="flex items-center gap-2 h-10 bg-[#0F172A] rounded px-2">
                  <span className="text-[10px] font-mono text-[#64748B] w-4">{track.name}</span>
                  <div className="flex-1 h-full py-1 relative">
                    <div className={`absolute h-8 rounded ${track.color} ${track.opacity} ${track.w} ${track.left} border border-white/10`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
