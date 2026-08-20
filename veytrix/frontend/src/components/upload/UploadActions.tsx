import React from 'react';
import { ArrowRight } from 'lucide-react';

interface UploadActionsProps {
  isDisabled: boolean;
  onContinue: () => void;
}

export function UploadActions({ isDisabled, onContinue }: UploadActionsProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isDisabled) {
      onContinue();
    }
  };

  return (
    <div className="flex justify-end w-full select-none shrink-0 mt-2">
      <button
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 border focus:outline-none ${
          !isDisabled
            ? 'bg-[#3B6CE7] border-[#3B6CE7]/20 text-white shadow-md hover:bg-[#2555CC] hover:scale-[1.02]'
            : 'bg-white border-[#1D2B64]/5 text-[#1D2B64]/30 cursor-not-allowed'
        }`}
      >
        <span>Continue to Editor</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
export default UploadActions;
