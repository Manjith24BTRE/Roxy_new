import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export function AISection() {
  const chips = [
    "Auto Cut",
    "Color Match",
    "Smart Motion",
    "Audio Cleanup",
    "Captions",
    "Transitions"
  ];

  return (
    <section className="relative py-28 bg-[#1D2B64] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,108,231,0.2),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20 pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-6 flex flex-col items-center text-center">
        <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-6">
          Editing meets intelligence.
        </h2>
        <p className="text-[#8CC8E8] text-lg max-w-2xl mb-16 opacity-90">
          The AI Command Engine is reserved for a future release. The scaffold is in place; we're building it with the same care as the timeline.
        </p>

        {/* Command UI Mockup */}
        <div className="w-full max-w-xl bg-[#141E46]/80 backdrop-blur-md border border-[#3B6CE7]/30 rounded-2xl p-6 shadow-2xl relative group">
          
          <div className="flex items-center gap-2 text-[#8CC8E8] font-mono text-xs uppercase tracking-widest mb-6 border-b border-[#3B6CE7]/20 pb-4">
            <Sparkles size={14} className="animate-pulse" />
            <span>Ask VEYTRIX</span>
          </div>

          <div className="text-left mb-12">
            <div className="text-xl md:text-2xl font-display font-medium text-white/90">
              "Create a smooth cinematic intro using the b-roll from folder A..."
            </div>
            <div className="w-2 h-6 bg-[#3B6CE7] inline-block mt-2 animate-pulse" />
          </div>

          <div className="flex justify-between items-center border-t border-[#3B6CE7]/20 pt-4">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded bg-[#1D2B64] border border-[#3B6CE7]/40" />
              <div className="w-8 h-8 rounded bg-[#1D2B64] border border-[#3B6CE7]/40" />
            </div>
            <button className="flex items-center gap-2 bg-[#3B6CE7] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#3B6CE7]/90 transition-colors">
              Generate <ArrowRight size={16} />
            </button>
          </div>

          {/* Floating feature chips */}
          <div className="absolute -left-12 -top-6 flex flex-col gap-3">
             {chips.slice(0, 3).map((c, i) => (
               <div key={i} className="bg-[#1D2B64] border border-[#3B6CE7]/30 text-[#E6F2F8] px-3 py-1.5 rounded-full text-xs shadow-lg backdrop-blur transform -rotate-2 hover:rotate-0 transition-transform cursor-default">
                 {c}
               </div>
             ))}
          </div>
          <div className="absolute -right-8 top-16 flex flex-col gap-3">
             {chips.slice(3, 6).map((c, i) => (
               <div key={i} className="bg-[#1D2B64] border border-[#3B6CE7]/30 text-[#E6F2F8] px-3 py-1.5 rounded-full text-xs shadow-lg backdrop-blur transform rotate-3 hover:rotate-0 transition-transform cursor-default">
                 {c}
               </div>
             ))}
          </div>

        </div>
      </div>
    </section>
  );
}
