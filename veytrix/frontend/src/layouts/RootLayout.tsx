import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { AuthModal } from '../components/auth/AuthModal';
import '../styles.css';

export function RootLayout() {
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/editor');

  const isWorkspace = ['/home', '/projects', '/profile', '/settings', '/help', '/report-problem'].includes(location.pathname);
  const isCompany = location.pathname.startsWith('/company');

  const isUpload = location.pathname.startsWith('/upload');
  const isProcessing = location.pathname.startsWith('/processing');

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {!isEditor && !isWorkspace && !isUpload && !isProcessing && <SiteHeader />}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      {!isEditor && !isWorkspace && !isCompany && !isUpload && !isProcessing && <SiteFooter />}
      <AuthModal />
    </div>
  );
}
