"use client";

import Link from "next/link";
import type { Vehicle } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

export default function InventoryCard({ vehicle }: { vehicle: Vehicle }) {
  const { t } = useLanguage();

  const normalizedType = vehicle.vehicle_type?.toLowerCase();
  const label =
    normalizedType === "car"
      ? t("inventory.type.car")
      : normalizedType === "motorcycle"
      ? t("inventory.type.motorcycle")
      : vehicle.vehicle_type
      ? vehicle.vehicle_type.charAt(0).toUpperCase() + vehicle.vehicle_type.slice(1).toLowerCase()
      : null;
  const hasImage = vehicle.image_urls && vehicle.image_urls.length > 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-900/15 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 dark:hover:shadow-black/40">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
        {hasImage ? (
          <img
            src={vehicle.image_urls[0]}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-700 text-xs font-bold uppercase tracking-widest text-slate-400 dark:bg-slate-800">
            {t("inventory.noPhoto")}
          </div>
        )}
        {label && (
          <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2.5 py-1.5 text-[0.58rem] font-black uppercase tracking-widest text-white shadow-lg">
            {label}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="text-[1.05rem] font-black uppercase leading-tight tracking-tight text-slate-900 dark:text-slate-50">
          {vehicle.year} {vehicle.make}{" "}
          <span className="font-medium normal-case text-slate-500 dark:text-slate-400">{vehicle.model}</span>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-3.5 border-t border-slate-200 pt-2.5 dark:border-slate-800">
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.56rem] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {t("inventory.year")}
            </span>
            <span className="text-[0.82rem] font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {vehicle.year}
            </span>
          </div>
          {label && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.56rem] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {t("inventory.type")}
              </span>
              <span className="text-[0.82rem] font-bold text-slate-900 dark:text-slate-50">{label}</span>
            </div>
          )}
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-3">
          <span className="text-2xl font-black tabular-nums tracking-tight text-red-600 dark:text-red-500">
            ${(vehicle.price / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </span>
          <div className="flex gap-2">
            <Link
              href={`/listing/${vehicle.id}`}
              className="rounded-lg bg-slate-100 px-3.5 py-2 text-[0.68rem] font-black uppercase tracking-wider text-slate-900 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              {t("inventory.view")}
            </Link>
            <a
              href={`mailto:${vehicle.seller_email}`}
              className="rounded-lg bg-red-600 px-3.5 py-2 text-[0.68rem] font-black uppercase tracking-wider text-white transition-colors hover:bg-red-700"
            >
              {t("inventory.contact")}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
