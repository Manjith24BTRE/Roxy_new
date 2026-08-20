import React, { useEffect, useRef, Suspense } from 'react';
import { LegalModalHeader } from './LegalModalHeader';
import { LegalModalFooter } from './LegalModalFooter';
import styles from './LoginLegal.module.css';

// Lazy load the body content components for better performance
const TermsOfServiceModal = React.lazy(() => import('./TermsOfServiceModal').then(module => ({ default: module.TermsOfServiceModal })));
const PrivacyPolicyModal = React.lazy(() => import('./PrivacyPolicyModal').then(module => ({ default: module.PrivacyPolicyModal })));

interface LoginLegalModalProps {
  type: 'terms' | 'privacy';
  onClose: () => void;
}

export function LoginLegalModal({ type, onClose }: LoginLegalModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Esc Key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Focus trap implementation
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

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
    };

    // Focus the first element on open
    firstElement.focus();

    window.addEventListener('keydown', handleTabKey);
    return () => {
      window.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy';
  const subtitle = type === 'terms' 
    ? 'Please read these terms carefully before using VEYTRIX.'
    : 'Your privacy is important to us.';

  return (
    <div 
      ref={modalRef}
      className="relative w-full max-w-md h-[550px] bg-white border border-[#1D2B64]/5 rounded-3xl px-8 shadow-[0_24px_50px_rgba(29,43,100,0.12)] z-10 flex flex-col transform scale-100 transition-all duration-200 outline-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      tabIndex={-1}
    >
      <LegalModalHeader 
        title={title} 
        subtitle={subtitle} 
        onClose={onClose} 
      />

      <div className={`flex-1 overflow-y-auto ${styles.scrollContainer}`}>
        <Suspense fallback={
          <div className="w-full py-12 flex items-center justify-center">
            <div className="h-5 w-5 rounded-full border-2 border-[#3B6CE7]/20 border-t-[#3B6CE7] animate-spin" />
          </div>
        }>
          {type === 'terms' ? <TermsOfServiceModal /> : <PrivacyPolicyModal />}
        </Suspense>
      </div>

      <LegalModalFooter onClose={onClose} />
    </div>
  );
}

export default LoginLegalModal;
