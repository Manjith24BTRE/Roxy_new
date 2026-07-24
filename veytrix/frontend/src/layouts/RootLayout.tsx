import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import '../styles/styles.css';

export function RootLayout() {
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/editor');

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100 font-sans">
      {!isEditor && <SiteHeader />}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      {!isEditor && <SiteFooter />}
    </div>
  );
}
