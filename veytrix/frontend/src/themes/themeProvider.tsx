import React, { createContext, useContext, useState } from 'react';
import { ThemeName, ThemeTokens } from './themeTypes';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

export interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  tokens: ThemeTokens;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('veytrix_theme');
    return (saved === 'Dark' ? 'Dark' : 'Light') as ThemeName;
  });

  const currentTheme = theme === 'Dark' ? darkTheme : lightTheme;

  const setTheme = (nextTheme: ThemeName) => {
    setThemeState(nextTheme);
    localStorage.setItem('veytrix_theme', nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, tokens: currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
