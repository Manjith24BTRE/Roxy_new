import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { LegalPortal } from './LegalPortal';

interface LegalModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: string;
  children: React.ReactNode;
  version?: string;
}

export function LegalModalWrapper({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  version = "Version 1.0"
}: LegalModalWrapperProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Esc Key, focus trapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      if (modalRef.current) {
        const closeBtn = modalRef.current.querySelector('button');
        if (closeBtn) closeBtn.focus();
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <LegalPortal>
      {styleTag}
      {/* Frosted Glass Backdrop Overlay */}
      <div 
        className="absolute inset-0 bg-white/10 backdrop-blur-[18px] transition-all duration-300 pointer-events-auto"
        onClick={onClose}
      />

      {/* Centered Modal Content Card */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div 
          ref={modalRef}
          className="relative w-full max-w-[760px] md:max-w-[680px] bg-white/82 backdrop-blur-[28px] border border-white/70 rounded-[28px] shadow-[0_40px_120px_rgba(28,45,90,0.12)] pointer-events-auto animate-modal-in flex flex-col max-h-[85vh] text-left overflow-hidden"
        >
          {/* Header Section */}
          <div className="sticky top-0 bg-white/60 backdrop-blur-md border-b border-[#1D2B64]/5 px-8 py-6 flex items-start justify-between z-10 shrink-0">
            <div className="flex gap-3.5 items-start">
              <span className="text-3xl filter drop-shadow-sm select-none">{icon}</span>
              <div>
                <h2 className="text-2xl md:text-[34px] font-display font-bold text-[#1D2B64] leading-tight select-none">{title}</h2>
                {subtitle && <p className="text-xs md:text-sm text-[#1D2B64]/50 font-semibold mt-1 select-none">{subtitle}</p>}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-[#1D2B64]/5 bg-white/80 hover:bg-[#3B6CE7] hover:text-white hover:border-[#3B6CE7]/20 hover:shadow-[0_0_12px_rgba(59,108,231,0.25)] text-[#1D2B64]/50 flex items-center justify-center transition-all duration-200 focus:outline-none"
              aria-label="Close modal"
            >
              <X size={15} />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 text-[#1D2B64]/70 leading-[1.8] font-semibold text-[15px]">
            {children}
          </div>

          {/* Bottom Bar Footer */}
          <div className="sticky bottom-0 bg-white/60 backdrop-blur-md border-t border-[#1D2B64]/5 px-8 py-5 flex items-center justify-between z-10 shrink-0 select-none">
            <div className="flex flex-col text-[10px] text-[#1D2B64]/40 font-mono font-bold uppercase tracking-wider">
              <span>Last Updated</span>
              <span>{version}</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] text-[#1D2B64]/30 font-mono font-bold uppercase tracking-wider hidden sm:inline">ESC to close</span>
              <button 
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#3B6CE7] hover:bg-[#2555CC] hover:scale-[1.03] text-white text-xs font-semibold shadow-md transition-all duration-200 focus:outline-none"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      </div>
    </LegalPortal>
  );
}

const styleTag = (
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes modalIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    .animate-modal-in {
      animation: modalIn 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `}} />
);

export default LegalModalWrapper;
