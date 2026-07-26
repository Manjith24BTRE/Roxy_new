import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import '../styles.css';

export function RootLayout() {
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/editor');

  const isWorkspace = ['/home', '/dashboard', '/projects', '/profile', '/settings', '/help', '/report-problem'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {!isEditor && !isWorkspace && <SiteHeader />}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      {!isEditor && !isWorkspace && <SiteFooter />}
    </div>
  );
}
