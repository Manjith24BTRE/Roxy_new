import React from 'react';
import ReactDOM from 'react-dom';

interface LegalPortalProps {
  children: React.ReactNode;
}

export function LegalPortal({ children }: LegalPortalProps) {
  // Mount directly to document.body
  return ReactDOM.createPortal(
    <div className="legal-portal-modal fixed inset-0 z-[999999] pointer-events-auto">
      {children}
    </div>,
    document.body
  );
}
export default LegalPortal;
