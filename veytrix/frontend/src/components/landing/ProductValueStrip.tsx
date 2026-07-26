import React from 'react';

export function ProductValueStrip() {
  const claims = [
    { title: "FRAME ACCURATE", desc: "Timeline precision" },
    { title: "FAST PREVIEW", desc: "Responsive editing" },
    { title: "4K", desc: "Export support" },
    { title: "60+", desc: "Built-in effects" }
  ];

  return (
    <section className="w-full border-y border-border bg-surface-hover/30 py-6">
      <div className="mx-auto max-w-5xl px-6 flex flex-wrap justify-between items-center gap-8 md:gap-4">
        {claims.map((claim, idx) => (
          <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="font-display font-bold text-foreground text-lg sm:text-xl tracking-tight">
              {claim.title}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest font-mono mt-1">
              {claim.desc}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
