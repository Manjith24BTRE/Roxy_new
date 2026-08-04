import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ExecuteButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

export function ExecuteButton({ disabled, onClick }: ExecuteButtonProps) {
  return (
    <button 
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-center gap-2 bg-[#1D2B64] text-white px-5 py-2.5 rounded-full font-medium text-xs hover:bg-[#3B6CE7] transition-all shadow-[0_4px_12px_rgba(29,43,100,0.15)] disabled:opacity-50 cursor-pointer"
    >
      Execute <ArrowRight size={14} />
    </button>
  );
}
