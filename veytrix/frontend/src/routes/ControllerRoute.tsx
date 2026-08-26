import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VeytrixLogo } from '../components/VeytrixLogo';

/**
 * Route guard for Command Centre pages.
 * Only allows access if the user is authenticated AND has the 'controller' role.
 * All other users (including normal authenticated users) are redirected to /login.
 */
export function ControllerRoute({ children }: { children?: React.ReactNode }) {
  const { isSignedIn, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <VeytrixLogo className="h-10 w-10 animate-pulse mb-4" />
        <Loader2 className="h-5 w-5 text-[#3B6CE7] animate-spin" />
      </div>
    );
  }

  if (!isSignedIn || role !== 'controller') {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
