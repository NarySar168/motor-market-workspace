"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

// Global site footer — always dark, rendered once in app/layout.tsx below {children}.
export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 px-4 pb-10 pt-13 text-slate-50 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <div className="text-2xl font-black uppercase tracking-tight">
            NR <span className="font-light text-slate-400">MotorMarket</span>
          </div>
          <p className="mt-3 max-w-[34ch] text-sm text-slate-400">{t("footer.tagline")}</p>
        </div>

        <div>
          <h4 className="mb-3.5 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-slate-400">
            {t("footer.shop.heading")}
          </h4>
          <Link href="/" className="block py-1 text-sm text-slate-300 hover:text-white">
            {t("footer.shop.allInventory")}
          </Link>
          <Link href="/" className="block py-1 text-sm text-slate-300 hover:text-white">
            {t("footer.shop.cars")}
          </Link>
          <Link href="/" className="block py-1 text-sm text-slate-300 hover:text-white">
            {t("footer.shop.motorcycles")}
          </Link>
          <Link href="/" className="block py-1 text-sm text-slate-300 hover:text-white">
            {t("footer.shop.newArrivals")}
          </Link>
        </div>

        <div>
          <h4 className="mb-3.5 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-slate-400">
            {t("footer.company.heading")}
          </h4>
          <a href="#" className="block py-1 text-sm text-slate-300 hover:text-white">
            {t("footer.company.aboutUs")}
          </a>
          <a href="#financing" className="block py-1 text-sm text-slate-300 hover:text-white">
            {t("footer.company.financing")}
          </a>
          <a href="#" className="block py-1 text-sm text-slate-300 hover:text-white">
            {t("footer.company.tradeIn")}
          </a>
          <a href="#" className="block py-1 text-sm text-slate-300 hover:text-white">
            {t("footer.company.contact")}
          </a>
        </div>

        <div>
          <h4 className="mb-3.5 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-slate-400">
            {t("footer.visit.heading")}
          </h4>
          <span className="block py-1 text-sm text-slate-300">📍 {t("footer.visit.location")}</span>
          <a href="tel:8881234567" className="block py-1 text-sm text-slate-300 hover:text-white">
            (888) 123-4567
          </a>
          <span className="block py-1 text-sm text-slate-300">{t("footer.visit.hours")}</span>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-7xl flex-wrap justify-between gap-3 border-t border-slate-800 pt-5 text-xs text-slate-400">
        <span>{t("footer.copyright")}</span>
        <span>{t("common.tagline")}</span>
      </div>
    </footer>
  );
}
