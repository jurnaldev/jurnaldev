'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'jurnal-dev-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');

  // Load persisted theme
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setThemeState(stored);
    }
  }, []);

  // Resolve theme when it or system preference changes
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const resolve = () => {
      const resolved: ResolvedTheme =
        theme === 'system' ? (mql.matches ? 'dark' : 'light') : theme;
      setResolvedTheme(resolved);

      const root = document.documentElement;
      // Disable transitions during theme switch to prevent flash
      root.classList.add('no-transitions');
      if (resolved === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
      // Re-enable after next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => root.classList.remove('no-transitions'));
      });
    };
    resolve();
    mql.addEventListener('change', resolve);
    return () => mql.removeEventListener('change', resolve);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
