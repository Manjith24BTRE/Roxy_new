import React, { useEffect, useRef } from 'react';

interface LandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function LandingModal({ isOpen, onClose, children }: LandingModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Basic focus trapping for accessibility
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[rgba(15,25,60,0.35)] animate-in fade-in duration-150"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div 
        ref={modalRef}
        className="w-full sm:w-[min(720px,calc(100vw-48px))] max-h-[90dvh] sm:max-h-[min(80dvh,760px)] bg-[#FFFFFF] sm:rounded-[18px] rounded-t-[16px] shadow-sm border border-[rgba(29,43,100,0.10)] flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-2 duration-150"
      >
        {children}
      </div>
    </div>
  );
}
