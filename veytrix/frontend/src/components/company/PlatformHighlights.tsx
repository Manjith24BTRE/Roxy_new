import React from 'react';
import { SectionTitle } from './SectionTitle';

export function PlatformHighlights() {
  const stats = [
    { value: "60+ Shaders", label: "Lightning Fast" },
    { value: "AI Assisted", label: "Production Ready" },
    { value: "Cloud Sync Ready", label: "Creator Focused" }
  ];

  return (
    <section className="relative py-12 z-10">
      <SectionTitle title="Veytrix Statistics" badge="Metrics" center={true} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
        {stats.map((s, i) => (
          <div key={i} className="p-8 rounded-[24px] bg-white border border-[#1D2B64]/5 shadow-[0_8px_30px_rgba(29,43,100,0.01)] text-center group hover:border-[#3B6CE7]/20 transition-all duration-300">
            <div className="text-3xl font-display font-bold text-[#3B6CE7] mb-1">
              {s.value}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#1D2B64]/40 font-bold">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
export default PlatformHighlights;
