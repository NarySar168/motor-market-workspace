"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Vehicle } from "@/lib/types";

const SLIDE_MS = 5000;

export default function HeroCarousel({ vehicles }: { vehicles: Vehicle[] }) {
  const slides = vehicles.slice(0, 3);
  const hasListings = slides.length > 0;
  const multiSlide = slides.length > 1;

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  // Auto-rotate every 5s while playing, unless the visitor prefers reduced motion.
  useEffect(() => {
    if (!multiSlide || !playing) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => clearInterval(timer);
  }, [multiSlide, playing, slides.length]);

  const goTo = (n: number) => {
    setIndex((n + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[70vh] max-h-[640px] min-h-[460px] overflow-hidden bg-slate-950 text-slate-50">
      {hasListings ? (
        slides.map((vehicle, i) => (
          <div
            key={vehicle.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
          >
            {vehicle.image_urls?.[0] ? (
              <img
                src={vehicle.image_urls[0]}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black" />
            )}
            {/* Darkening scrim so white text stays readable over any photo */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(8,9,12,.92) 0%, rgba(8,9,12,.72) 34%, rgba(8,9,12,.25) 62%, rgba(8,9,12,.05) 100%), linear-gradient(0deg, rgba(8,9,12,.85) 0%, transparent 45%)",
              }}
            />
            <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 md:px-8">
              <div className="max-w-[560px]">
                <span className="inline-flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-slate-300">
                  <span className="h-[2px] w-[22px] bg-slate-300" />
                  Featured Inventory
                </span>
                <h2 className="mt-4 text-[clamp(2rem,5.2vw,3.5rem)] font-black uppercase leading-[0.98] tracking-tight text-balance">
                  {vehicle.make} <span className="text-red-500">{vehicle.model}</span>
                </h2>
                <p className="mt-3 text-[clamp(1rem,2vw,1.25rem)] font-medium text-slate-300">
                  {vehicle.year} {vehicle.make} {vehicle.model} — ready to drive today.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <span className="text-3xl font-black tracking-tight tabular-nums text-red-500">
                    ${(vehicle.price / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-3.5 py-1.5 text-[0.74rem] font-bold text-slate-100">
                    Financing Available
                  </span>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/listing/${vehicle.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-red-700"
                  >
                    View Details →
                  </Link>
                  <a
                    href={`mailto:${vehicle.seller_email}?subject=${encodeURIComponent(
                      `Test drive request: ${vehicle.year} ${vehicle.make} ${vehicle.model}`
                    )}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/35 px-6 py-3.5 text-sm font-extrabold text-white transition-colors hover:border-white hover:bg-white/10"
                  >
                    Book a Test Drive
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black" />
          <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center md:px-8">
            <h2 className="text-[clamp(2rem,6vw,4rem)] font-black uppercase leading-[0.98] tracking-tight text-balance">
              Drive Your <span className="text-red-500">Dream</span>
            </h2>
            <p className="mt-4 max-w-xl text-lg font-medium text-slate-300">
              Unbeatable prices on premium pre-owned vehicles.
            </p>
          </div>
        </div>
      )}

      {multiSlide && (
        <>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause slideshow" : "Play slideshow"}
            className="absolute bottom-5 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white transition-colors hover:border-white md:left-6"
          >
            {playing ? "❚❚" : "▶"}
          </button>

          <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center gap-2.5">
            {slides.map((vehicle, n) => (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => goTo(n)}
                aria-label={`Go to slide ${n + 1}`}
                className="relative h-1 w-8 overflow-hidden rounded-full bg-white/30"
              >
                {n === index && playing && (
                  <span
                    key={`${index}-fill`}
                    className="absolute inset-0 origin-left bg-red-600"
                    style={{ animation: `fillbar ${SLIDE_MS}ms linear` }}
                  />
                )}
                {n === index && !playing && <span className="absolute inset-0 bg-white/60" />}
              </button>
            ))}
          </div>

          <div className="absolute bottom-5 right-4 z-20 hidden gap-2 md:right-6 md:flex">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/35 text-lg text-white transition-colors hover:border-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/35 text-lg text-white transition-colors hover:border-white"
            >
              ›
            </button>
          </div>
        </>
      )}
    </section>
  );
}
