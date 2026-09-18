import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VeytrixLogo } from '../components/VeytrixLogo';

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isSignedIn, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <VeytrixLogo className="h-10 w-10 animate-pulse mb-4" />
        <Loader2 className="h-5 w-5 text-[#3B6CE7] animate-spin" />
      </div>
    );
  }

  if (!isSignedIn && !import.meta.env.DEV) {
    return <Navigate to="/login" replace />;
  }

  // Controller should not be in normal user routes — send them to Command Centre
  if (role === 'controller') {
    return <Navigate to="/command-centre" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
