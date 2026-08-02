import React from 'react';
import { Sparkles, Film, Zap, UserCheck, BarChart2, Shield } from 'lucide-react';
import { SectionTitle } from './SectionTitle';

export function WhyChooseVeytrix() {
  const points = [
    { title: "Faster Editing", desc: "Native WASM loops scrub instantly without reload delays.", icon: Zap },
    { title: "AI Assistance", desc: "Automate boring caption cuts and color grades.", icon: Sparkles },
    { title: "Professional Timeline", desc: "Snapping tracks that feel fluid.", icon: Film },
    { title: "Creator Workflow", desc: "Remap classic hotkeys for lightning speed.", icon: UserCheck },
    { title: "High Performance", desc: "WebGL acceleration handles large files locally.", icon: BarChart2 },
    { title: "Production Ready", desc: "Thoroughly tested modular architecture.", icon: Shield }
  ];

  return (
    <section className="relative py-12 bg-[#E6F2F8]/20 rounded-[24px] border border-[#1D2B64]/5 p-8 md:p-12 z-10 max-w-4xl mx-auto">
      <SectionTitle title="Why Creators Choose VEYTRIX" badge="Benefits" center={true} />
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        {points.map((p, i) => (
          <div key={i} className="p-6 rounded-[24px] bg-white border border-[#1D2B64]/5 shadow-[0_4px_12px_rgba(29,43,100,0.01)] text-left group hover:border-[#3B6CE7]/20 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg bg-[#E6F2F8] text-[#3B6CE7] flex items-center justify-center mb-4 group-hover:bg-[#3B6CE7] group-hover:text-white transition-all duration-300">
              <p.icon size={15} />
            </div>
            <h3 className="text-xs font-bold text-[#1D2B64] mb-1">{p.title}</h3>
            <p className="text-[10px] text-[#1D2B64]/50 leading-relaxed font-semibold">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
export default WhyChooseVeytrix;
