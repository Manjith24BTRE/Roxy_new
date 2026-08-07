import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { AuthModal } from '../components/auth/AuthModal';
import '../styles.css';

export function RootLayout() {
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/editor');

  const isWorkspace = ['/home', '/projects', '/profile', '/settings', '/report-problem'].includes(location.pathname) || location.pathname.startsWith('/help');
  const isCompany = location.pathname.startsWith('/company');

  const isUpload = location.pathname.startsWith('/upload');
  const isProcessing = location.pathname.startsWith('/processing');
  const isAuth = location.pathname.startsWith('/login');

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {!isEditor && !isWorkspace && !isUpload && !isProcessing && !isAuth && <SiteHeader />}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      {!isEditor && !isWorkspace && !isCompany && !isUpload && !isProcessing && !isAuth && <SiteFooter />}
      <AuthModal />
    </div>
  );
}
