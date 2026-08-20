import React from 'react';
import { X } from 'lucide-react';

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

export function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(29,43,100,0.10)] shrink-0">
      <h2 className="text-lg font-semibold text-[#1D2B64]">{title}</h2>
      <button 
        onClick={onClose}
        aria-label="Close dialog"
        className="p-2 -mr-2 text-[#1D2B64]/60 hover:text-[#1D2B64] hover:bg-[#E6F2F8] rounded-full transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
}
