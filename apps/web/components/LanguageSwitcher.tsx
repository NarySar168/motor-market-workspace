"use client";

import { LANGS } from "@/lib/i18n";
import { useLanguage } from "@/context/LanguageContext";

// Compact segmented control for EN / ខ្មែរ / 中文, styled to sit next to
// ThemeToggle in the header. Mirrors ThemeToggle's focus-ring and dark-mode
// conventions.
export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Select language"
      className="flex items-center gap-0.5 rounded-full border border-gray-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900"
    >
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          aria-label={`Switch to ${l.label}`}
          aria-pressed={lang === l.code}
          className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
            lang === l.code
              ? "bg-red-600 text-white"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
