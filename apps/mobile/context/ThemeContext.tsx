import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, lightColors, darkColors } from '../constants/theme';

const THEME_STORAGE_KEY = 'theme';

type Scheme = 'light' | 'dark';

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  scheme: Scheme;
  toggle: () => void;
  setScheme: (scheme: Scheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<Scheme | null>(null);

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (isMounted && (stored === 'light' || stored === 'dark')) {
        setOverride(stored);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const scheme: Scheme = override ?? (systemScheme === 'dark' ? 'dark' : 'light');

  const setScheme = useCallback((next: Scheme) => {
    setOverride(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setScheme(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme, setScheme]);

  const value = useMemo<ThemeContextValue>(() => ({
    colors: scheme === 'dark' ? darkColors : lightColors,
    isDark: scheme === 'dark',
    scheme,
    toggle,
    setScheme,
  }), [scheme, toggle, setScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
