"use client";

import Eyebrow from "./Eyebrow";
import { useLanguage } from "@/context/LanguageContext";

// Trade-in promo band. "Value My Car" is a placeholder CTA —
// there's no trade-in intake flow yet, so it's a non-linking anchor.
export default function TradeIn() {
  const { t } = useLanguage();

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[20px] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 md:p-11">
          <div>
            <Eyebrow>{t("tradeIn.eyebrow")}</Eyebrow>
            <h3 className="mt-2 text-[clamp(1.3rem,2.6vw,1.8rem)] font-black uppercase tracking-tight text-slate-900 dark:text-slate-50">
              {t("tradeIn.heading")}
            </h3>
            <p className="mt-2 max-w-[48ch] text-slate-500 dark:text-slate-400">{t("tradeIn.body")}</p>
          </div>
          <a
            href="#"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-red-600 px-7 py-4 text-sm font-extrabold text-white transition-colors hover:bg-red-700"
          >
            {t("tradeIn.cta")} →
          </a>
        </div>
      </div>
    </section>
  );
}
