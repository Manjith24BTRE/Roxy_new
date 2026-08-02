import React from 'react';
import { Shield, Sparkles, Zap, Lock, Eye } from 'lucide-react';
import { LegalModalWrapper } from './LegalModalWrapper';

export function CookiesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const cookieTypes = [
    { title: "Essential Cookies", desc: "Maintains secure browser sessions and tracks workspace active edits.", icon: Lock },
    { title: "Preference Cookies", desc: "Stores custom editor theme selections and default export settings.", icon: Sparkles },
    { title: "Performance Cookies", desc: "Optimizes client-side cache and WASM preview parameters.", icon: Zap },
    { title: "Analytics Cookies", desc: "Measures anonymous feature interactions to help build clean timelines.", icon: Eye },
    { title: "Security Cookies", desc: "Protects against request forgery loops and cross-origin resource access.", icon: Shield }
  ];

  return (
    <LegalModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Cookie Policy"
      subtitle="How cookies improve your experience."
      icon="🍪"
      version="Version 1.0"
    >
      <div className="space-y-6 relative border-l border-[#1D2B64]/5 pl-6 ml-4 mt-4">
        {cookieTypes.map((cookie, i) => (
          <div key={i} className="relative text-left group">
            {/* Timeline dot */}
            <span className="absolute -left-[30px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border border-[#3B6CE7] group-hover:scale-125 transition-transform" />
            
            <div className="flex items-center gap-2 text-xs font-bold text-[#1D2B64]">
              <cookie.icon size={13} className="text-[#3B6CE7]" />
              <span>{cookie.title}</span>
            </div>
            
            <p className="text-[11px] text-[#1D2B64]/60 leading-relaxed font-semibold mt-1">
              {cookie.desc}
            </p>
          </div>
        ))}
      </div>
    </LegalModalWrapper>
  );
}
export default CookiesModal;
