import React from 'react';
import { Layers, Sparkles, Download, Layout } from 'lucide-react';

export function CapabilityCards() {
  const cards = [
    { icon: Layers, title: "Professional Timeline", desc: "Multi-layer edits." },
    { icon: Sparkles, title: "AI-Assisted Workflow", desc: "Speed up editing." },
    { icon: Download, title: "High Quality Export", desc: "Pro-quality video." },
    { icon: Layout, title: "Modern Editing", desc: "Clean & fast UI." }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 py-4 md:py-6 flex-shrink-0">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className="bg-white rounded-[16px] border border-[#1D2B64]/[0.08] shadow-[0_2px_8px_rgba(29,43,100,0.02)] p-3 md:p-4 flex flex-col hover:border-[#3B6CE7]/30 hover:bg-[#E6F2F8]/30 transition-colors duration-200"
        >
          <div className="w-8 h-8 rounded-lg bg-[#E6F2F8] text-[#3B6CE7] flex items-center justify-center mb-3">
            <card.icon size={16} />
          </div>
          <h4 className="text-sm font-semibold text-[#1D2B64] leading-tight mb-1">{card.title}</h4>
          <p className="text-[11px] md:text-xs text-[#1D2B64]/60 leading-tight">{card.desc}</p>
        </div>
      ))}
    </div>
  );
}
