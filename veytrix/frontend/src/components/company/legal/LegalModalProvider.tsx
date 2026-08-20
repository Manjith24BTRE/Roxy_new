import React, { createContext, useContext, useState, useEffect } from 'react';

export type LegalModalType = 'privacy' | 'terms' | 'cookies' | 'documentation' | null;

interface LegalModalContextType {
  activeModal: LegalModalType;
  openModal: (type: LegalModalType) => void;
  closeModal: () => void;
}

const LegalModalContext = createContext<LegalModalContextType | undefined>(undefined);

export function LegalModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);

  const openModal = (type: LegalModalType) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Enforce body scroll lock and body interaction lock via pointer-events
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
      
      const styleEl = document.createElement('style');
      styleEl.id = 'legal-global-lock';
      styleEl.innerHTML = `
        #root {
          pointer-events: none !important;
          user-select: none !important;
        }
        #root * {
          pointer-events: none !important;
        }
        body {
          pointer-events: none !important;
        }
        .legal-portal-modal {
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(styleEl);
    } else {
      document.body.style.overflow = '';
      const styleEl = document.getElementById('legal-global-lock');
      if (styleEl) styleEl.remove();
    }

    return () => {
      document.body.style.overflow = '';
      const styleEl = document.getElementById('legal-global-lock');
      if (styleEl) styleEl.remove();
    };
  }, [activeModal]);

  return (
    <LegalModalContext.Provider value={{ activeModal, openModal, closeModal }}>
      {children}
    </LegalModalContext.Provider>
  );
}

export function useLegalModal() {
  const context = useContext(LegalModalContext);
  if (!context) {
    throw new Error('useLegalModal must be used within a LegalModalProvider');
  }
  return context;
}
