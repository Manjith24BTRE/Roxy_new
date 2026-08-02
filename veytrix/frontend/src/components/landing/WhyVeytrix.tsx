import React from 'react';
import { Zap, Cpu, Sparkles, Cloud } from 'lucide-react';
import { GlassCard } from './GlassCard';

export function WhyVeytrix() {
  const features = [
    { icon: Zap, title: "Zero-Latency Engine", desc: "Local canvas frame scrub with immediate feedback." },
    { icon: Cpu, title: "WASM Architecture", desc: "Native audio-video codecs compiled directly for web shells." },
    { icon: Sparkles, title: "Intentional Design", desc: "Clean UI boundaries, balanced typography, modern contrast." },
    { icon: Cloud, title: "Secure Local Cache", desc: "Your footage stays in browser cache. Sync projects optionally." }
  ];

  return (
    <section className="relative py-28 bg-[#FFFFFF] z-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          <div className="reveal-on-scroll">
            <span className="font-mono text-xs font-bold text-[#3B6CE7] tracking-widest uppercase mb-4 block">
              Why VEYTRIX
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-[#1D2B64] mb-6">
              Built to keep up<br />
              <span className="text-[#3B6CE7]">with your ideas.</span>
            </h2>
            <p className="text-[#1D2B64]/70 text-lg leading-relaxed mb-8 max-w-md">
              We did not build another slow container editor. We engineered a fast web-native rendering surface that aligns precisely with your creative impulse.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <GlassCard 
                key={i} 
                className="reveal-on-scroll p-6 group hover:border-[#3B6CE7]/30" 
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-[#E6F2F8] flex items-center justify-center text-[#3B6CE7] mb-4 group-hover:bg-[#3B6CE7] group-hover:text-white transition-colors duration-200">
                  <f.icon size={18} />
                </div>
                <h3 className="font-bold text-[#1D2B64] mb-1.5">{f.title}</h3>
                <p className="text-xs text-[#1D2B64]/60 leading-relaxed">{f.desc}</p>
              </GlassCard>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
