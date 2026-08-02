import React from 'react';

export function CompanyHero() {
  return (
    <section className="relative text-center py-16 md:py-24 z-10 flex flex-col items-center select-none">
      {/* Soft floating background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[140px] opacity-[0.25] bg-[radial-gradient(circle_at_center,#3B6CE7_0%,transparent_70%)] pointer-events-none" />

      {/* Trust badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-[#1D2B64]/5 bg-white/70 backdrop-blur-md px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#3B6CE7] font-bold shadow-[0_2px_12px_rgba(29,43,100,0.01)] mb-8">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B6CE7] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3B6CE7]" />
        </span>
        <span>VEYTRIX Studio</span>
      </div>

      {/* Large Premium Typography */}
      <h1 className="font-display text-4xl sm:text-6xl md:text-8xl leading-[1.05] font-bold tracking-tight text-[#1D2B64] max-w-5xl">
        The Future of <br />
        <span className="bg-gradient-to-r from-[#3B6CE7] via-[#8CC8E8] to-[#1D2B64] text-transparent bg-clip-text animate-gradient bg-[length:200%_auto]">
          Intelligent Video Editing.
        </span>
      </h1>

      {/* Small introduction paragraph */}
      <p className="mt-8 max-w-xl text-[#1D2B64]/60 text-sm md:text-base leading-relaxed font-semibold">
        VEYTRIX is developing a lightweight browser-native creative platform. We compile desktop timelines and AI pipeline modules directly to standard browser environments.
      </p>

      {/* Floating abstract decorative shape mockup */}
      <div className="mt-16 w-full max-w-3xl aspect-[21/9] rounded-3xl border border-[#1D2B64]/5 bg-gradient-to-tr from-[#E6F2F8]/30 via-white to-white p-4 shadow-[0_12px_40px_rgba(29,43,100,0.02)] overflow-hidden relative flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,108,231,0.04),transparent_70%)] pointer-events-none" />
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-xl bg-white border border-[#1D2B64]/5 shadow-sm text-[10px] font-mono text-[#1D2B64]/40 font-bold uppercase tracking-widest">TIMELINE COMPILER</div>
          <div className="px-4 py-2 rounded-xl bg-[#3B6CE7] text-white shadow-md text-[10px] font-mono font-bold uppercase tracking-widest">AI WEIGHTS ON-DEVICE</div>
        </div>
      </div>
    </section>
  );
}
export default CompanyHero;
