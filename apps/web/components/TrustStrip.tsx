"use client";

import { useLanguage } from "@/context/LanguageContext";

// Trust-promise strip shown directly under the hero carousel.
// Copy matches the approved mockup — five honest, non-numeric promises.
const KEYS = [
  "trust.inspected",
  "trust.financing",
  "trust.cashOffers",
  "trust.pricing",
  "trust.locallyOwned",
];

export default function TrustStrip() {
  const { t } = useLanguage();

  return (
    <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-around gap-4 px-4 py-4 text-center md:px-8">
        {KEYS.map((key) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <b className="text-xl font-black text-red-600 dark:text-red-500">✓</b>
            <span className="text-[0.66rem] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {t(key)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
