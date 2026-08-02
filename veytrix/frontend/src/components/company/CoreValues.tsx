import React from 'react';
import { Sparkles, Lock, Zap, Heart, ShieldAlert, CheckCircle } from 'lucide-react';
import { SectionTitle } from './SectionTitle';

export function CoreValues() {
  const values = [
    { title: "Innovation", desc: "Pushing non-linear browser boundaries.", icon: Sparkles },
    { title: "Privacy", desc: "Your video files stay in your browser.", icon: Lock },
    { title: "Speed", desc: "WASM compilation for zero rendering wait.", icon: Zap },
    { title: "Creator First", desc: "Every shortcut maps precisely.", icon: Heart },
    { title: "Performance", desc: "Accelerated GPU shader tracks.", icon: ShieldAlert },
    { title: "Reliability", desc: "Local drafts persist through crash loops.", icon: CheckCircle }
  ];

  return (
    <section className="relative py-12 z-10">
      <SectionTitle title="Core Values" badge="Beliefs" center={true} />
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
        {values.map((v, i) => (
          <div 
            key={i} 
            className="p-6 rounded-[24px] bg-white/70 backdrop-blur-md border border-[#1D2B64]/5 shadow-[0_8px_30px_rgba(29,43,100,0.01)] text-left group hover:border-[#3B6CE7]/20 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(29,43,100,0.03)] transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E6F2F8] text-[#3B6CE7] flex items-center justify-center mb-5 group-hover:bg-[#3B6CE7] group-hover:text-white transition-all duration-300">
              <v.icon size={16} />
            </div>
            <h3 className="text-sm font-bold text-[#1D2B64] mb-1.5">{v.title}</h3>
            <p className="text-[11px] text-[#1D2B64]/50 leading-relaxed font-semibold">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
export default CoreValues;
