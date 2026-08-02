import React from 'react';
import { Sparkles, Film, Zap, UserCheck, BarChart2, Shield, Settings, HelpCircle, FileText, Code, BellRing } from 'lucide-react';
import { LegalModalWrapper } from './LegalModalWrapper';

export function DocumentationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const topics = [
    { title: "Getting Started", desc: "Setting up your workspace timeline and configuration values.", icon: Settings },
    { title: "Timeline Editing", desc: "Utilizing tracks, cuts, position, zoom, and audio parameters.", icon: Film },
    { title: "AI Manual Edit", desc: "Automate boring cuts with on-device smart models.", icon: Sparkles },
    { title: "AI Command Engine", desc: "Write prompts to translate text lines into media edits.", icon: Code },
    { title: "Export Settings", desc: "Configuring MP4, WebM, and custom browser codecs.", icon: Zap },
    { title: "Keyboard Shortcuts", desc: "Remap classic hotkeys for lightning execution speeds.", icon: UserCheck },
    { title: "Troubleshooting", desc: "Resolving performance blocks and memory warnings.", icon: HelpCircle },
    { title: "API Reference", desc: "Integrating custom client pipelines and data structures.", icon: FileText },
    { title: "Release Notes", desc: "Exploring the latest updates and bug patch updates.", icon: BellRing }
  ];

  return (
    <LegalModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Documentation"
      subtitle="Platform Overview"
      icon="📚"
      version="Docs Version 1.0"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        {topics.map((t, i) => (
          <div 
            key={i} 
            className="p-5 rounded-[24px] bg-white border border-[#1D2B64]/5 shadow-[0_4px_12px_rgba(29,43,100,0.01)] text-left flex flex-col justify-between hover:border-[#3B6CE7]/20 hover:translate-y-[-2px] transition-all duration-300 group cursor-default"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#E6F2F8] text-[#3B6CE7] flex items-center justify-center mb-4 group-hover:bg-[#3B6CE7] group-hover:text-white transition-all duration-300">
                <t.icon size={14} />
              </div>
              <h3 className="text-xs font-bold text-[#1D2B64] mb-1">{t.title}</h3>
              <p className="text-[10px] text-[#1D2B64]/50 leading-relaxed font-semibold">{t.desc}</p>
            </div>
            
            <div className="w-full flex items-center justify-between text-[9px] font-mono font-bold text-[#1D2B64]/40 uppercase tracking-widest mt-5">
              <span>Coming Soon</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </div>
        ))}
      </div>
    </LegalModalWrapper>
  );
}
export default DocumentationModal;
