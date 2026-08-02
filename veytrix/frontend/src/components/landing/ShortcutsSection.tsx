import React from 'react';

export function ShortcutsSection() {
  const shortcuts = [
    { key: "SPACE", label: "Play / Pause" },
    { key: "C", label: "Razor Tool" },
    { key: "V", label: "Select Mode" },
    { key: "⌘ K", label: "Command Menu" },
    { key: "⌘ Z", label: "Undo Step" },
  ];

  return (
    <section className="relative py-20 bg-[#FFFFFF] border-t border-[#1D2B64]/5 z-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="reveal-on-scroll flex flex-col lg:flex-row items-center justify-between gap-12 bg-[#E6F2F8]/30 rounded-3xl p-8 md:p-12 border border-[#1D2B64]/5 shadow-[0_4px_24px_rgba(29,43,100,0.02)]">
          
          <div className="text-center lg:text-left max-w-md">
            <span className="font-mono text-xs font-bold text-[#3B6CE7] tracking-widest uppercase mb-3 block">
              Speed
            </span>
            <h2 className="text-3xl font-display font-bold text-[#1D2B64] mb-3">Stay in the flow.</h2>
            <p className="text-[#1D2B64]/70 text-sm leading-relaxed">
              VEYTRIX is fully mapped to industry-standard keyboard shortcuts so you never have to reach for your mouse or break your editing momentum.
            </p>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-end gap-6">
            {shortcuts.map((sc, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="h-12 min-w-[3.5rem] px-4 rounded-xl bg-white border border-[#1D2B64]/10 border-b-[4px] border-b-[#1D2B64]/20 flex items-center justify-center font-mono font-bold text-[#1D2B64] shadow-sm transform transition-all active:translate-y-[2px] active:border-b-[2px] hover:border-[#3B6CE7]/40 cursor-default select-none">
                  {sc.key}
                </div>
                <span className="text-[9px] text-[#1D2B64]/40 uppercase tracking-wider font-mono font-bold">
                  {sc.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
