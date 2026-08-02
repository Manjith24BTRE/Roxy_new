import React from 'react';

export function AnnouncementBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#1D2B64]/5 bg-white/70 backdrop-blur-md px-3.5 py-1.5 text-xs shadow-[0_2px_12px_rgba(29,43,100,0.02)] mb-8 transition-all duration-300 hover:border-[#3B6CE7]/20 hover:shadow-[0_4px_20px_rgba(59,108,231,0.06)] cursor-default">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B6CE7] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3B6CE7]" />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-wider text-[#1D2B64]/80 font-bold">
        VEYTRIX — Public Beta 1.0
      </span>
    </div>
  );
}
