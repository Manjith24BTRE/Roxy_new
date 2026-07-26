import React from 'react';

export function ShortcutsSection() {
  const shortcuts = [
    { key: "SPACE", label: "Play / Pause" },
    { key: "C", label: "Cut" },
    { key: "V", label: "Select" },
    { key: "⌘ K", label: "Command Menu" },
    { key: "⌘ Z", label: "Undo" },
  ];

  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 bg-surface rounded-3xl p-8 md:p-12 border border-border shadow-sm">
          
          <div className="text-center lg:text-left max-w-md">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">Stay in the flow.</h2>
            <p className="text-muted-foreground">
              Built for speed. VEYTRIX is fully mapped to industry-standard keyboard shortcuts so you never have to reach for your mouse.
            </p>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-end gap-6">
            {shortcuts.map((sc, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="h-12 min-w-[3rem] px-4 rounded-xl bg-background border-b-[4px] border-border flex items-center justify-center font-mono font-bold text-foreground shadow-sm transform transition-transform active:translate-y-1 active:border-b-0">
                  {sc.key}
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
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
