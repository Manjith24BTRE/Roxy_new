import React from 'react';
import { DownloadCloud, Scissors, SlidersHorizontal, ArrowDownToLine } from 'lucide-react';

export function WorkflowSection() {
  const steps = [
    { num: "01", title: "Import", desc: "+ Drop media", icon: DownloadCloud },
    { num: "02", title: "Edit", desc: "Timeline slice", icon: Scissors },
    { num: "03", title: "Refine", desc: "FX & Color", icon: SlidersHorizontal },
    { num: "04", title: "Export", desc: "4K Render", icon: ArrowDownToLine },
  ];

  return (
    <section className="py-24 bg-background-subtle">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            From raw footage<br />
            <span className="text-muted-foreground">to final cut.</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line (Desktop) */}
          <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-px bg-border-strong" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl bg-surface border border-border shadow-sm flex flex-col items-center justify-center mb-6 relative group-hover:-translate-y-2 group-hover:border-primary/50 transition-all duration-300">
                  <step.icon size={28} className="text-primary mb-2" />
                  <div className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-background border border-border rounded text-foreground">
                    {step.desc}
                  </div>
                  
                  {/* Connecting line (Mobile) */}
                  {i !== steps.length - 1 && (
                    <div className="md:hidden absolute -bottom-12 left-1/2 w-px h-12 bg-border-strong" />
                  )}
                </div>
                
                <div className="text-primary font-mono text-xs font-bold mb-2 tracking-widest">{step.num}</div>
                <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
