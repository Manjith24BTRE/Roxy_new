import React, { createContext, useContext, useState } from 'react';

export type FooterModalType = 'about' | 'contact' | 'careers' | 'press' | 'help' | 'tutorials' | 'documentation' | 'report' | null;

interface FooterModalContextType {
  activeModal: FooterModalType;
  openModal: (type: FooterModalType) => void;
  closeModal: () => void;
}

const FooterModalContext = createContext<FooterModalContextType | undefined>(undefined);

export function FooterModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<FooterModalType>(null);

  const openModal = (type: FooterModalType) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  return (
    <FooterModalContext.Provider value={{ activeModal, openModal, closeModal }}>
      {children}
    </FooterModalContext.Provider>
  );
}

export function useFooterModal() {
  const context = useContext(FooterModalContext);
  if (!context) {
    throw new Error('useFooterModal must be used within a FooterModalProvider');
  }
  return context;
}
