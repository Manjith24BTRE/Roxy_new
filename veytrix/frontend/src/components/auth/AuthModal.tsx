import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPassword } from './ForgotPassword';
import { VeytrixLogo } from '../VeytrixLogo';
import { LoginLegalModal } from '../../features/auth/components/LoginLegal';

export function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal } = useAuth();
  const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Esc Key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeLegalModal) {
          setActiveLegalModal(null);
        } else {
          closeAuthModal();
        }
      }
    };
    if (isAuthModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isAuthModalOpen, activeLegalModal, closeAuthModal]);

  // Reset legal view if auth modal closes
  useEffect(() => {
    if (!isAuthModalOpen) {
      setActiveLegalModal(null);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  if (activeLegalModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark Backdrop overlay with blur */}
        <div 
          className="absolute inset-0 bg-[#1D2B64]/40 backdrop-blur-sm transition-all duration-300"
          onClick={closeAuthModal}
        />
        
        <LoginLegalModal 
          type={activeLegalModal} 
          onClose={() => setActiveLegalModal(null)} 
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Backdrop overlay with blur */}
      <div 
        className="absolute inset-0 bg-[#1D2B64]/40 backdrop-blur-sm transition-all duration-300"
        onClick={closeAuthModal}
      />

      {/* Main Glass Modal Panel */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-md bg-white border border-[#1D2B64]/5 rounded-3xl p-8 shadow-[0_24px_50px_rgba(29,43,100,0.12)] z-10 transform scale-100 transition-all duration-200"
      >
        {/* Close Button */}
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-[#1D2B64]/40 hover:text-[#1D2B64] transition rounded-full p-1 cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <VeytrixLogo className="h-7 w-7 text-[#1D2B64]" />
            <span className="font-display text-lg font-bold tracking-tight text-[#1D2B64]">VEYTRIX</span>
          </div>
        </div>

        {/* Render correct Mode Form */}
        {authModalMode === 'signin' && <LoginForm />}
        {authModalMode === 'signup' && <SignupForm />}
        {authModalMode === 'forgot' && <ForgotPassword />}

        {/* Modal Footer Terms */}
        <div className="mt-6 pt-4 border-t border-[#1D2B64]/5 text-center text-[10px] text-[#1D2B64]/40 leading-relaxed font-semibold">
          By signing in, you agree to our{' '}
          <button
            type="button"
            onClick={() => setActiveLegalModal('terms')}
            className="hover:underline text-[#3B6CE7] font-semibold cursor-pointer"
          >
            Terms of Service
          </button>{' '}
          and{' '}
          <button
            type="button"
            onClick={() => setActiveLegalModal('privacy')}
            className="hover:underline text-[#3B6CE7] font-semibold cursor-pointer"
          >
            Privacy Policy
          </button>.
        </div>
      </div>
    </div>
  );
}
