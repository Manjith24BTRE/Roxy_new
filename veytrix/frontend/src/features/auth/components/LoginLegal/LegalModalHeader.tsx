import React from 'react';
import { X } from 'lucide-react';

interface LegalModalHeaderProps {
  title: string;
  subtitle: string;
  onClose: () => void;
}

export function LegalModalHeader({ title, subtitle, onClose }: LegalModalHeaderProps) {
  return (
    <div className="sticky top-0 bg-white/95 backdrop-blur-md pt-6 pb-4 border-b border-[#1D2B64]/5 z-20 flex flex-col gap-1 select-none">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-display font-bold text-[#1D2B64] tracking-tight">{title}</h2>
        <button
          onClick={onClose}
          className="text-[#1D2B64]/40 hover:text-[#1D2B64] transition rounded-full p-1 -mt-1 -mr-1 cursor-pointer"
          aria-label="Return to login modal"
        >
          <X size={18} />
        </button>
      </div>
      <p className="text-xs text-[#1D2B64]/60">{subtitle}</p>
    </div>
  );
}
