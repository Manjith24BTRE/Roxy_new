import React from 'react';

interface ModalSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function ModalSection({ title, icon, children }: ModalSectionProps) {
  return (
    <div className="p-6 rounded-[16px] bg-[#E6F2F8]/30 border border-[#1D2B64]/5 hover:shadow-[0_8px_20px_rgba(29,43,100,0.01)] hover:translate-y-[-2px] transition-all duration-300">
      <div className="flex items-center gap-2.5 mb-4 text-[#1D2B64]">
        <div className="w-8 h-8 rounded-lg bg-[#E6F2F8] text-[#3B6CE7] flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-[18px] font-display font-bold">{title}</h3>
      </div>
      <div className="text-xs md:text-sm text-[#1D2B64]/70 leading-[1.8] space-y-2">
        {children}
      </div>
    </div>
  );
}
export default ModalSection;
