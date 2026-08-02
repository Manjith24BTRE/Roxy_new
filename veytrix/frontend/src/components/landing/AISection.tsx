import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { SectionTitle } from './SectionTitle';

export function AISection() {
  const [command, setCommand] = useState("Create a smooth cinematic intro using the b-roll from folder A...");
  const [isTyping, setIsTyping] = useState(false);

  const chips = [
    "Auto Cut Clips",
    "Smart Color Match",
    "Audio Cleanup",
    "B-Roll Generator",
    "Voiceover Captions",
    "Transitions Match"
  ];

  const handleChipClick = (txt: string) => {
    setIsTyping(true);
    setCommand("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < txt.length) {
        setCommand((prev) => prev + txt.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);
  };

  return (
    <section className="relative py-28 bg-[#FFFFFF] overflow-hidden z-10">
      {/* Background soft ambient lighting matching light theme */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(140,200,232,0.15),transparent_70%)] pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-6 flex flex-col items-center">
        
        {/* Reusable Section Title */}
        <div className="reveal-on-scroll">
          <SectionTitle 
            badge="Future Engine"
            title="Editing meets intelligence."
            subtitle="The AI Command Engine is reserved for a future release. The workspace interface is configured; we are preparing model integration."
          />
        </div>

        {/* Command UI Mockup Container */}
        <div className="reveal-on-scroll w-full max-w-2xl mt-8">
          <GlassCard className="border-[#3B6CE7]/10 p-6 md:p-8 shadow-[0_20px_50px_rgba(59,108,231,0.06)] relative group">
            
            {/* Top Prompt Info bar */}
            <div className="flex items-center gap-2 text-[#3B6CE7] font-mono text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-[#1D2B64]/5 pb-4">
              <Sparkles size={13} className="animate-pulse" />
              <span>AI Command Console</span>
            </div>

            {/* Simulated Prompt Command Screen */}
            <div className="text-left mb-10 min-h-[70px]">
              <span className="text-lg md:text-xl font-display font-medium text-[#1D2B64] leading-relaxed">
                "{command}"
              </span>
              <span className="w-1.5 h-5 bg-[#3B6CE7] inline-block ml-1 align-middle animate-pulse" />
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center border-t border-[#1D2B64]/5 pt-4">
              <div className="flex gap-1 text-[10px] text-[#1D2B64]/40 font-mono">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 rounded border border-[#1D2B64]/10 bg-[#E6F2F8]/30 font-bold flex items-center gap-0.5">
                  Enter <CornerDownLeft size={8} />
                </kbd>
              </div>
              <button 
                disabled={isTyping}
                className="flex items-center gap-2 bg-[#1D2B64] text-white px-5 py-2.5 rounded-full font-medium text-xs hover:bg-[#3B6CE7] transition-all shadow-[0_4px_12px_rgba(29,43,100,0.15)] disabled:opacity-50"
              >
                Execute <ArrowRight size={14} />
              </button>
            </div>
          </GlassCard>

          {/* Interactive Feature suggestions */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {chips.map((c, i) => (
              <button
                key={i}
                onClick={() => handleChipClick(c)}
                className="bg-white border border-[#1D2B64]/5 text-[#1D2B64]/70 px-3.5 py-2 rounded-full text-xs shadow-sm hover:border-[#3B6CE7]/20 hover:text-[#3B6CE7] hover:-translate-y-0.5 transition-all cursor-pointer font-medium"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
