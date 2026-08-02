import React from 'react';

export function ProductValueStrip() {
  const claims = [
    { title: "FRAME ACCURATE", desc: "Timeline precision" },
    { title: "REAL-TIME PREVIEW", desc: "WebGL Accelerated" },
    { title: "4K RESOLUTION", desc: "Lossless Export" },
    { title: "60+ SHADERS", desc: "Cinematic presets" }
  ];

  return (
    <section className="reveal-on-scroll w-full border-y border-[#1D2B64]/5 bg-[#E6F2F8]/20 py-8 relative z-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-wrap justify-between items-center gap-8 md:gap-4">
        {claims.map((claim, idx) => (
          <div 
            key={idx} 
            className="flex flex-col items-center md:items-start text-center md:text-left group cursor-default"
          >
            <span className="font-display font-bold text-[#1D2B64] text-lg sm:text-xl tracking-tight group-hover:text-[#3B6CE7] transition-colors duration-200">
              {claim.title}
            </span>
            <span className="text-[10px] sm:text-xs text-[#1D2B64]/50 uppercase tracking-widest font-mono mt-1 font-bold">
              {claim.desc}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
