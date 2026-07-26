import React from 'react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        
        <div className="text-sm font-medium text-[#1D2B64]/60">
          Workspace <span className="mx-2 text-[#1D2B64]/30">/</span> <span className="text-[#1D2B64]">Home</span>
        </div>
      </div>

      <Link
        to="/editor"
        className="hidden sm:inline-flex items-center justify-center rounded-lg bg-white border border-[#1D2B64]/10 px-4 py-2 text-xs font-semibold text-[#1D2B64] shadow-sm hover:bg-[#F8FBFD] hover:border-[#3B6CE7]/30 transition-all duration-200"
      >
        Launch Editor
      </Link>
      
    </header>
  );
}
