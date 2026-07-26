import React from 'react';

const FAQS = [
  { q: "Is VEYTRIX free to use?", a: "The public beta is free while we harden the core. Pricing tiers are coming with export watermark removal and cloud sync." },
  { q: "What formats and codecs are supported?", a: "The Export Center will support common resolutions up to 4K, 24–120 FPS, H.264/H.265, and ProRes. Deeper codec support is on the roadmap." },
  { q: "Does VEYTRIX include AI features?", a: "The AI Command Engine is reserved for a future release. The scaffold is in place; we're building it with the same care as the timeline." },
  { q: "Can I self-host or use it offline?", a: "The editor runs locally in your browser. Cloud sync, templates, and shared projects are optional and opt-in." },
  { q: "Do you have a keyboard-first workflow?", a: "Yes — every module is reachable from the command palette and keybindings are fully remappable." },
];

export function FAQ() {
  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-4xl px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">
            Questions,<br />
            <span className="text-muted-foreground">answered.</span>
          </h2>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {FAQS.map((f, i) => (
            <details key={i} className="group py-6">
              <summary className="flex cursor-pointer items-center justify-between list-none text-lg font-medium text-foreground hover:text-primary transition-colors">
                {f.q}
                <span className="ml-6 flex h-7 w-7 items-center justify-center rounded-full bg-surface border border-border text-foreground transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 text-muted-foreground leading-relaxed pr-12">
                {f.a}
              </p>
            </details>
          ))}
        </div>

      </div>
    </section>
  );
}
