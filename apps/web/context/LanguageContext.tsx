"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Lang, translations } from "@/lib/i18n";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

// Detect a sensible default language from the browser when no preference
// has been saved yet. Mirrors the THEME system's localStorage pattern
// (see components/ThemeToggle.tsx) but detects from navigator.language
// instead of prefers-color-scheme.
function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  const nav = window.navigator.language || "";
  if (nav.startsWith("km")) return "km";
  if (nav.startsWith("zh")) return "zh";
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Server render always defaults to 'en' so SSR output and the first
  // client render match exactly (no hydration mismatch). The real
  // preference (saved or detected) is applied after mount, in the effect
  // below — same approach as ThemeToggle's `mounted` gate.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("lang") as Lang | null;
      if (saved === "en" || saved === "km" || saved === "zh") {
        setLangState(saved);
      } else {
        setLangState(detectLang());
      }
    } catch {
      setLangState(detectLang());
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem("lang", next);
    } catch {
      // localStorage unavailable (private browsing, etc.) — non-fatal.
    }
  }, []);

  const t = useCallback(
    (key: string) => {
      return translations[key]?.[lang] ?? translations[key]?.en ?? key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
