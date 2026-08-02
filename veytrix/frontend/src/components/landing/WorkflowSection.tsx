import React from 'react';
import { DownloadCloud, Scissors, SlidersHorizontal, ArrowDownToLine, ArrowRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { SectionTitle } from './SectionTitle';

export function WorkflowSection() {
  const steps = [
    { num: "01", title: "Import Media", desc: "Drag & drop files", icon: DownloadCloud },
    { num: "02", title: "Timeline Edit", desc: "Instant cuts", icon: Scissors },
    { num: "03", title: "Refine Shaders", desc: "FX & Color LUTs", icon: SlidersHorizontal },
    { num: "04", title: "Export Render", desc: "4K local output", icon: ArrowDownToLine },
  ];

  return (
    <section className="relative py-28 bg-[#E6F2F8]/30 z-10">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Reusable Section Title */}
        <div className="reveal-on-scroll">
          <SectionTitle 
            badge="Process"
            title="From raw footage to final cut."
            subtitle="Four optimized modules built directly into the browser shell to keep your editing workflow frictionless."
          />
        </div>

        <div className="relative mt-16">
          {/* Connecting line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-px bg-[#1D2B64]/5 -translate-y-12" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="reveal-on-scroll flex flex-col items-center text-center group" style={{ transitionDelay: `${i * 100}ms` }}>
                <GlassCard className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center mb-6 relative group-hover:border-[#3B6CE7]/40">
                  <step.icon size={26} className="text-[#3B6CE7] mb-1 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-[9px] font-mono font-bold tracking-tight text-[#1D2B64]/40 uppercase">
                    {step.desc}
                  </div>
                  
                  {/* Connecting indicator arrow for next node */}
                  {i !== steps.length - 1 && (
                    <div className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 text-[#1D2B64]/10">
                      <ArrowRight size={14} />
                    </div>
                  )}

                  {/* Connecting line (Mobile) */}
                  {i !== steps.length - 1 && (
                    <div className="md:hidden absolute -bottom-8 left-1/2 w-px h-8 bg-[#1D2B64]/5" />
                  )}
                </GlassCard>
                
                <div className="text-[#3B6CE7] font-mono text-[10px] font-bold mb-1 tracking-widest">{step.num}</div>
                <h3 className="text-base font-bold text-[#1D2B64]">{step.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
