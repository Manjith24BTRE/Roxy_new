import React from 'react';
import { Zap, Cpu, Sparkles, Cloud } from 'lucide-react';

export function WhyVeytrix() {
  const features = [
    { icon: Zap, title: "Instantaneous", desc: "Zero-latency preview. Every scrub is real." },
    { icon: Cpu, title: "Engineered", desc: "Enterprise architecture. Modular by design." },
    { icon: Sparkles, title: "Delightful", desc: "Tuned motion, tuned typography, tuned taste." },
    { icon: Cloud, title: "Cloud-ready", desc: "Projects sync when you're ready. Local first." }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground mb-6">
              Built to keep up<br />
              <span className="text-primary">with your ideas.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              We didn't rebuild a video editor. We rethought the surface between you and your footage — every gesture, every glance, every render. 
              Built on WebGL and WebCodecs for native performance in the browser.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/50 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <f.icon size={20} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
