import React from 'react';
import { useLegalModal } from './legal/LegalModalProvider';

export function CompanyFooter() {
  const { openModal, activeModal } = useLegalModal();
  const isDisabled = activeModal !== null;

  return (
    <footer className="border-t border-[#1D2B64]/5 bg-white py-12 mt-16 relative z-10">
      <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-left">
          <p className="text-[10px] text-[#1D2B64]/40 font-mono font-bold uppercase tracking-wider mb-1">VEYTRIX v1.0</p>
          <p className="text-[10px] text-[#1D2B64]/50 font-medium">
            © {new Date().getFullYear()} Veytrix. All rights reserved. Associated Product of Mavros Tech Pvt Ltd.
          </p>
        </div>

        <div className="flex gap-5">
          <button 
            disabled={isDisabled}
            onClick={() => openModal('privacy')}
            className="text-[10px] text-[#1D2B64]/60 hover:text-[#3B6CE7] transition font-bold uppercase tracking-wider focus:outline-none disabled:opacity-30 disabled:pointer-events-none"
          >
            Privacy
          </button>
          <button 
            disabled={isDisabled}
            onClick={() => openModal('terms')}
            className="text-[10px] text-[#1D2B64]/60 hover:text-[#3B6CE7] transition font-bold uppercase tracking-wider focus:outline-none disabled:opacity-30 disabled:pointer-events-none"
          >
            Terms
          </button>
          <button 
            disabled={isDisabled}
            onClick={() => openModal('cookies')}
            className="text-[10px] text-[#1D2B64]/60 hover:text-[#3B6CE7] transition font-bold uppercase tracking-wider focus:outline-none disabled:opacity-30 disabled:pointer-events-none"
          >
            Cookies
          </button>
          <button 
            disabled={isDisabled}
            onClick={() => openModal('documentation')}
            className="text-[10px] text-[#1D2B64]/60 hover:text-[#3B6CE7] transition font-bold uppercase tracking-wider focus:outline-none disabled:opacity-30 disabled:pointer-events-none"
          >
            Documentation
          </button>
        </div>
      </div>
    </footer>
  );
}
export default CompanyFooter;
