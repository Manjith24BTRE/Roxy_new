import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { VeytrixLogo } from '../components/VeytrixLogo';

export function GuestRoute({ children }: { children?: React.ReactNode }) {
  const { isSignedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <VeytrixLogo className="h-10 w-10 animate-pulse mb-4" />
        <Loader2 className="h-5 w-5 text-[#3B6CE7] animate-spin" />
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/home" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
