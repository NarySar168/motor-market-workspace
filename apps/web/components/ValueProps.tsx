"use client";

import Eyebrow from "./Eyebrow";
import { useLanguage } from "@/context/LanguageContext";

// Three-card value-prop section. Icons match the approved mockup; copy
// comes from the translation dictionary (lib/i18n.ts).
const PROPS = [
  {
    titleKey: "valueProps.search.title",
    bodyKey: "valueProps.search.body",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    titleKey: "valueProps.visit.title",
    bodyKey: "valueProps.visit.body",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    titleKey: "valueProps.testDrive.title",
    bodyKey: "valueProps.testDrive.body",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3V9l3-4h9l4 4h1a2 2 0 0 1 2 2v6h-3" />
        <circle cx="7.5" cy="17" r="1.6" />
        <circle cx="17.5" cy="17" r="1.6" />
      </svg>
    ),
  },
];

export default function ValueProps() {
  const { t } = useLanguage();

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <Eyebrow>{t("valueProps.eyebrow")}</Eyebrow>
        <h2 className="mt-2 text-[clamp(1.6rem,3.4vw,2.4rem)] font-black uppercase leading-tight tracking-tight text-slate-900 dark:text-slate-50">
          {t("valueProps.heading")}
        </h2>
      </div>
      <div className="mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-4 px-4 md:grid-cols-3 md:px-8">
        {PROPS.map((prop) => (
          <div
            key={prop.titleKey}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
          >
            <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/10 text-red-600 dark:bg-red-500/15 dark:text-red-500">
              {prop.icon}
            </div>
            <h3 className="mb-1.5 text-[1.1rem] font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              {t(prop.titleKey)}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t(prop.bodyKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
