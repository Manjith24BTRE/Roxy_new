import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { VeytrixLogo } from './VeytrixLogo';

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isSignedIn, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <VeytrixLogo className="h-10 w-10 animate-pulse mb-4" />
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export function PublicOnlyRoute({ children }: { children?: React.ReactNode }) {
  const { isSignedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <VeytrixLogo className="h-10 w-10 animate-pulse mb-4" />
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/home" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
