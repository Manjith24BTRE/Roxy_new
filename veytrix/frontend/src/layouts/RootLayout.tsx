import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { AuthModal } from '../components/auth/AuthModal';
import { useTheme } from '../themes/themeProvider';
import { lightTheme } from '../themes/lightTheme';
import { darkTheme } from '../themes/darkTheme';
import { ThemeTokens } from '../themes/themeTypes';
import '../styles.css';

export function RootLayout() {
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/editor');
  const { theme } = useTheme();

  const isWorkspace = ['/home', '/projects', '/profile', '/settings', '/report-problem'].includes(location.pathname) || location.pathname.startsWith('/help');
  const isCompany = location.pathname.startsWith('/company');

  const isUpload = location.pathname.startsWith('/upload');
  const isProcessing = location.pathname.startsWith('/processing');
  const isAuth = location.pathname.startsWith('/login');

  useEffect(() => {
    const root = window.document.documentElement;
    const isEditorActive = location.pathname.startsWith('/editor');

    // Force Light theme tokens when in editor so editor styles remain unaffected
    const activeThemeName = isEditorActive ? 'Light' : theme;
    const activeTheme = activeThemeName === 'Dark' ? darkTheme : lightTheme;

    if (activeThemeName === 'Dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const tokenMapping: Record<keyof ThemeTokens, string> = {
      background: '--background',
      backgroundSecondary: '--background-subtle',
      foreground: '--foreground',
      surface: '--surface',
      surfaceElevated: '--surface-elevated',
      surfaceHover: '--surface-hover',
      card: '--card',
      cardForeground: '--card-foreground',
      popover: '--popover',
      popoverForeground: '--popover-foreground',
      primary: '--primary',
      primaryHover: '--primary-hover',
      primaryActive: '--primary-active',
      primaryForeground: '--primary-foreground',
      secondary: '--secondary',
      secondaryForeground: '--secondary-foreground',
      accent: '--accent',
      accentForeground: '--accent-foreground',
      muted: '--muted',
      mutedForeground: '--muted-foreground',
      border: '--border',
      borderStrong: '--border-strong',
      input: '--input',
      ring: '--ring',
      brandNavy: '--brand-navy',
      brandBlue: '--brand-blue',
      brandSky: '--brand-sky',
      brandIce: '--brand-ice',
      backgroundPrimary: '--background-primary',
      royalBlue: '--royal-blue',
      primaryBlue: '--primary-blue',
      iceBlue: '--ice-blue',
      white: '--white',
      mutedWhite: '--muted-white',
      subtleWhite: '--subtle-white',
      activeBorder: '--active-border',
    };

    Object.entries(tokenMapping).forEach(([key, varName]) => {
      const val = activeTheme[key as keyof ThemeTokens];
      root.style.setProperty(varName, val);
    });
  }, [theme, location.pathname]);

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
