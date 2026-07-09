import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: ResolvedTheme;
  /** Tema explícito elegido por el usuario, o 'system' si sigue la preferencia del SO. */
  preference: Theme | 'system';
  setTheme: (theme: Theme | 'system') => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'sivac-theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getStoredPreference = (): Theme | 'system' => {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
};

const applyTheme = (resolved: ResolvedTheme) => {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreference] = useState<Theme | 'system'>(getStoredPreference);
  const [resolved, setResolved] = useState<ResolvedTheme>(() => {
    const pref = getStoredPreference();
    return pref === 'system' ? getSystemTheme() : pref;
  });

  // Aplicar el tema al <html> y persistir la preferencia.
  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, preference);
  }, [preference]);

  // Seguir la preferencia del sistema si el usuario eligió 'system'.
  useEffect(() => {
    if (preference !== 'system') {
      setResolved(preference);
      return;
    }
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setResolved(e.matches ? 'dark' : 'light');
    setResolved(mql.matches ? 'dark' : 'light');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [preference]);

  const setTheme = useCallback((theme: Theme | 'system') => {
    setPreference(theme);
  }, []);

  const toggleTheme = useCallback(() => {
    setResolved((prev) => {
      const next: ResolvedTheme = prev === 'dark' ? 'light' : 'dark';
      // Al alternar manualmente, fijamos la preferencia explícita.
      setPreference(next);
      return next;
    });
  }, []);

  const value: ThemeContextValue = {
    theme: resolved,
    preference,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return ctx;
};

export default ThemeProvider;
