import React from 'react';
import { SectionTitle } from './SectionTitle';

export function MissionSection() {
  return (
    <section className="relative py-12 z-10 text-left max-w-4xl mx-auto">
      <SectionTitle title="Our Mission" badge="Mission" center={false} />
      
      <div className="flex flex-col md:flex-row gap-8 items-start mt-6">
        <div className="flex-1">
          <p className="text-xl md:text-2xl font-display font-medium text-[#1D2B64] leading-relaxed">
            Empower creators with high-performance browser editing blocks. We reduce repetitive timeline cuts and optimize export pipelines so you spend time only on creative decisions.
          </p>
        </div>
        
        {/* Timeline accent line */}
        <div className="w-full md:w-56 shrink-0 relative flex flex-col pl-6 border-l border-[#3B6CE7]/20">
          <span className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-[#3B6CE7]" />
          <h4 className="text-xs font-mono font-bold text-[#3B6CE7] uppercase tracking-wider">CREATOR LIBERATION</h4>
          <p className="text-[10px] text-[#1D2B64]/50 leading-relaxed font-semibold mt-1">Freeing developers and agencies from heavy native desktop editor installations.</p>
        </div>
      </div>
    </section>
  );
}
export default MissionSection;
