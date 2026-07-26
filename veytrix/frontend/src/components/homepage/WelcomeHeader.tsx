import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function WelcomeHeader() {
  const { user } = useAuth();
  const displayName = user?.displayName?.split(' ')[0] || 'Creator'; // Just first name if available

  return (
    <div className="flex-shrink-0 py-4 md:py-6">
      <h1 className="text-2xl md:text-[32px] font-display font-bold tracking-tight text-[#1D2B64] leading-tight">
        Welcome back, <span className="text-[#3B6CE7]">{displayName}</span>.
      </h1>
      <p className="text-sm text-[#1D2B64]/60 mt-1 font-medium">
        Ready to create something amazing.
      </p>
    </div>
  );
}
