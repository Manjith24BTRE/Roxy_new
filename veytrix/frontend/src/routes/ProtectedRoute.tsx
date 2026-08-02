import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VeytrixLogo } from '../components/VeytrixLogo';

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isSignedIn, isLoading, openAuthModal, setRedirectAfterLogin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      setRedirectAfterLogin(location.pathname);
      openAuthModal('signin');
    }
  }, [isLoading, isSignedIn, openAuthModal, setRedirectAfterLogin, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <VeytrixLogo className="h-10 w-10 animate-pulse mb-4" />
        <Loader2 className="h-5 w-5 text-[#3B6CE7] animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <div className="text-center max-w-sm flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#E6F2F8] flex items-center justify-center text-[#3B6CE7] mb-4">
            <Lock size={20} />
          </div>
          <h2 className="text-xl font-display font-bold text-[#1D2B64]">Workspace Protected</h2>
          <p className="text-xs text-[#1D2B64]/60 mt-1 leading-relaxed">
            Please log in or enter the workspace instant demo to view your project dashboard.
          </p>
          <button
            onClick={() => openAuthModal('signin')}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#1D2B64] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#3B6CE7] transition-all"
          >
            Authenticate Session
          </button>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
