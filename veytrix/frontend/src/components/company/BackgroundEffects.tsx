import React from 'react';

export function BackgroundEffects() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Soft Base Background */}
      <div className="absolute inset-0 bg-[#FFFFFF]" />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#1D2B64_1px,transparent_1px),linear-gradient(to_bottom,#1D2B64_1px,transparent_1px)] bg-[size:64px_64px]" 
        style={{ maskImage: 'radial-gradient(ellipse at center, black, transparent 85%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 85%)' }}
      />

      {/* Dynamic Ambient Blurs / Mesh Gradients */}
      <div 
        className="absolute -top-[10%] left-1/3 w-[500px] h-[500px] rounded-full blur-[130px] opacity-[0.25] bg-[radial-gradient(circle_at_center,#8CC8E8_0%,transparent_70%)]" 
      />
      <div 
        className="absolute top-[30%] right-[-5%] w-[450px] h-[450px] rounded-full blur-[120px] opacity-[0.2] bg-[radial-gradient(circle_at_center,#3B6CE7_0%,transparent_70%)]" 
      />

      {/* Tiny Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMUQyQjY0IiBmaWxsLW9wYWNpdHk9IjAuNSIvPgo8L3N2Zz4=')] bg-repeat" />
    </div>
  );
}
