import React from 'react';
import { Menu } from 'lucide-react';


interface HomeTopbarProps {
  onMobileMenuClick: () => void;
}

export function HomeTopbar({ onMobileMenuClick }: HomeTopbarProps) {
  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 md:px-6 bg-[#FAFAFC] border-b border-[#1D2B64]/[0.03]">
      
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onMobileMenuClick}
          className="md:hidden p-1.5 -ml-1.5 rounded-md text-[#1D2B64]/70 hover:bg-[#1D2B64]/5 transition-colors focus:outline-none"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>


      
    </header>
  );
}
