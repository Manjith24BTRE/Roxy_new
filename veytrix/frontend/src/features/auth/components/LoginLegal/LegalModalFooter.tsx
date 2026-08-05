import React from 'react';

interface LegalModalFooterProps {
  onClose: () => void;
}

export function LegalModalFooter({ onClose }: LegalModalFooterProps) {
  return (
    <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-4 pb-6 border-t border-[#1D2B64]/5 z-20 flex justify-between items-center select-none">
      <div className="flex flex-col gap-0.5 text-[9px] text-[#1D2B64]/40 font-mono">
        <span>Last Updated: August 2026</span>
        <span>Version 1.0</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="bg-[#1D2B64] text-white px-5 py-2 rounded-full font-medium text-xs hover:bg-[#3B6CE7] transition shadow-[0_4px_12px_rgba(29,43,100,0.15)] cursor-pointer"
      >
        Close
      </button>
    </div>
  );
}
