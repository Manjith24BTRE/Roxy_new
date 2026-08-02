import React from 'react';
import { SectionTitle } from './SectionTitle';

export function TechnologyStack() {
  const stack = [
    { name: "React Shell", desc: "Modular, component-driven framework." },
    { name: "TypeScript Core", desc: "Type-safe configurations." },
    { name: "AI Pipeline Hooks", desc: "WASM interfaces for model weights." },
    { name: "Cloud Sync Ready", desc: "Frictionless project backup loops." },
    { name: "GPU Shader Paths", desc: "WebGL video canvas render." },
    { name: "Local Sandbox Cache", desc: "Privacy-first browser directory storage." }
  ];

  return (
    <section className="relative py-12 z-10">
      <SectionTitle title="Technology Stack" badge="Stack" center={true} />
      
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
        {stack.map((s, i) => (
          <div 
            key={i} 
            className="p-6 rounded-[24px] bg-white border border-[#1D2B64]/5 shadow-[0_8px_30px_rgba(29,43,100,0.01)] text-left flex flex-col justify-between group hover:border-[#3B6CE7]/20 transition-all duration-300"
          >
            <div>
              <h3 className="text-xs font-bold text-[#1D2B64] mb-1">{s.name}</h3>
              <p className="text-[10px] text-[#1D2B64]/50 leading-relaxed font-semibold">{s.desc}</p>
            </div>
            
            {/* Small active indicator line */}
            <div className="h-0.5 w-8 bg-[#3B6CE7]/20 mt-6 group-hover:bg-[#3B6CE7] group-hover:w-12 transition-all duration-300" />
          </div>
        ))}
      </div>
    </section>
  );
}
export default TechnologyStack;
