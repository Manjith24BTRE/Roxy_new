import React from 'react';
import { SectionTitle } from './SectionTitle';

export function VisionSection() {
  return (
    <section className="relative py-12 z-10 text-left max-w-4xl mx-auto">
      <SectionTitle title="Our Vision" badge="Vision" center={false} />
      
      <div className="flex flex-col md:flex-row gap-8 items-start mt-6">
        <div className="flex-1">
          <p className="text-xl md:text-2xl font-display font-medium text-[#1D2B64] leading-relaxed">
            To establish VEYTRIX as a trusted AI-first workspace where story generation, automated cut syncs, and multiplayer cloud assets integrate seamlessly in real time.
          </p>
        </div>
        
        {/* Detail accent */}
        <div className="w-full md:w-56 shrink-0 relative flex flex-col pl-6 border-l border-[#8CC8E8]/40">
          <span className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-[#8CC8E8]" />
          <h4 className="text-xs font-mono font-bold text-[#8CC8E8] uppercase tracking-wider">AI FIRST SYSTEM</h4>
          <p className="text-[10px] text-[#1D2B64]/50 leading-relaxed font-semibold mt-1">Video templates, rendering loops, and subtitle overlays sync instantly.</p>
        </div>
      </div>
    </section>
  );
}
export default VisionSection;
