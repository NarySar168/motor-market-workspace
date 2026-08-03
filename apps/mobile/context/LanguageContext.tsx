import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lang, translations } from '../constants/i18n';

const LANG_STORAGE_KEY = 'lang';

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(LANG_STORAGE_KEY).then((stored) => {
      if (isMounted && (stored === 'en' || stored === 'km' || stored === 'zh')) {
        setLangState(stored);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    AsyncStorage.setItem(LANG_STORAGE_KEY, next).catch(() => {});
  }, []);

  const t = useCallback(
    (key: string) => translations[key]?.[lang] ?? translations[key]?.en ?? key,
    [lang]
  );

  const value = useMemo<LanguageContextValue>(() => ({
    lang,
    setLang,
    t,
  }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
