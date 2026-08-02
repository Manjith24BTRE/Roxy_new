import React from 'react';
import { SectionTitle } from './SectionTitle';

export function DevelopmentPrinciples() {
  const principles = [
    { title: "Performance First", desc: "WebGL rendering must compile at 60 FPS without blocking cycles." },
    { title: "Scalable Core", desc: "Clean component logic boundaries and isolated state." },
    { title: "Modular Architecture", desc: "Easy feature toggles and modular testing loops." },
    { title: "Security by Design", desc: "Zero tracking codes or cookie leaks." }
  ];

  return (
    <section className="relative py-12 z-10">
      <SectionTitle title="Development Principles" badge="Standards" center={true} />
      
      <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8">
        {principles.map((p, i) => (
          <div key={i} className="p-6 rounded-[24px] bg-white border border-[#1D2B64]/5 shadow-[0_8px_30px_rgba(29,43,100,0.01)] text-left hover:border-[#3B6CE7]/20 transition-all duration-300">
            <h3 className="text-xs font-bold text-[#1D2B64] mb-1.5">{p.title}</h3>
            <p className="text-[10px] text-[#1D2B64]/50 leading-relaxed font-semibold">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
export default DevelopmentPrinciples;
