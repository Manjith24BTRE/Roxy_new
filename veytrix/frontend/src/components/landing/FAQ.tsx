import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { GlassCard } from './GlassCard';

const FAQS = [
  { q: "Is VEYTRIX free to use?", a: "The public beta is completely free to use. Advanced cloud rendering features and team libraries will be available in future premium tiers." },
  { q: "What formats and codecs are supported?", a: "We support importing MP4, MOV, WebM, and audio files like MP3 and WAV. Exports support H.264, H.265 (HEVC), and AAC audio." },
  { q: "Does VEYTRIX support AI editing features?", a: "The AI command engine structure is being ready for model integration. You will soon be able to auto-cut and color-grade via text commands." },
  { q: "Is my media uploaded to a server?", a: "No, all media processing and preview renderings happen locally in your browser memory via WebCodecs and WebAssembly." },
  { q: "Do you have a keyboard-first workflow?", a: "Yes, VEYTRIX features fully mapped shortcut presets which align with classic desktop editors like Premiere and Final Cut." },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="relative py-28 bg-[#FFFFFF] z-10">
      <div className="mx-auto max-w-3xl px-6">
        
        <div className="text-center mb-16">
          <span className="font-mono text-xs font-bold text-[#3B6CE7] tracking-widest uppercase mb-4 block">
            Support
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-[#1D2B64]">
            Questions, answered.
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <GlassCard 
                key={i} 
                hoverEffect={false}
                className={`reveal-on-scroll border ${isOpen ? 'border-[#3B6CE7]/20 bg-[#E6F2F8]/10' : 'border-[#1D2B64]/5'} overflow-hidden transition-all duration-300`}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between p-6 text-left text-[#1D2B64] hover:text-[#3B6CE7] font-semibold text-base transition-colors"
                >
                  <span>{f.q}</span>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-white border border-[#1D2B64]/5 text-[#1D2B64] transition-transform duration-300 ${isOpen ? 'rotate-45 text-[#3B6CE7]' : ''}`}>
                    <Plus size={14} />
                  </span>
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-40 border-t border-[#1D2B64]/5' : 'max-h-0'}`}
                >
                  <p className="p-6 text-sm text-[#1D2B64]/70 leading-relaxed bg-white/40">
                    {f.a}
                  </p>
                </div>
              </GlassCard>
            );
          })}
        </div>

      </div>
    </section>
  );
}
