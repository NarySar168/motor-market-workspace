"use client";

import React, { useEffect, useState } from "react";
import { LISTINGS_URL } from "@/lib/api";
import type { Vehicle } from "@/lib/types";
import HeroCarousel from "@/components/HeroCarousel";
import TrustStrip from "@/components/TrustStrip";
import ValueProps from "@/components/ValueProps";
import InventoryCard from "@/components/InventoryCard";
import FinancingBand from "@/components/FinancingBand";
import TradeIn from "@/components/TradeIn";
import BrandStrip from "@/components/BrandStrip";

const CATEGORY_FILTERS = ["All", "Car", "Motorcycle"] as const;

export default function Storefront() {
  const [listings, setListings] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof CATEGORY_FILTERS)[number]>("All");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(LISTINGS_URL);
        const data = await res.json();
        setListings(data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const filteredListings = listings.filter((vehicle) => {
    const searchString = `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === "All" || (vehicle.vehicle_type && vehicle.vehicle_type.toLowerCase() === typeFilter.toLowerCase());

    const vehiclePriceDollars = vehicle.price / 100;
    const matchesPrice = maxPrice === "" || vehiclePriceDollars <= parseFloat(maxPrice);

    return matchesSearch && matchesType && matchesPrice;
  });

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-200 border-t-red-600"></div>
          <p className="font-medium text-slate-500 dark:text-slate-400">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950">
      {/* Hero carousel — built from the first 3 real listings */}
      <HeroCarousel vehicles={listings} />

      {/* Trust promise strip */}
      <TrustStrip />

      {/* Value props */}
      <ValueProps />

      {/* Inventory */}
      <section id="inventory" className="py-4">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-red-600 dark:text-red-500">
                <span className="h-[2px] w-[22px] bg-red-600 dark:bg-red-500" />
                Latest Arrivals
              </span>
              <h2 className="mt-2 text-[clamp(1.6rem,3.4vw,2.4rem)] font-black uppercase leading-tight tracking-tight text-slate-900 dark:text-slate-50">
                Featured inventory
              </h2>
            </div>
          </div>

          {/* Search + price controls */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Search make, model, or year..."
              className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-500/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max price ($)"
              className="w-full rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-500/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 sm:w-44"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          {/* Category filter pills */}
          <div className="mt-4 flex flex-wrap gap-2.5">
            {CATEGORY_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setTypeFilter(filter)}
                className={`rounded-full border px-4.5 py-2 text-[0.74rem] font-extrabold uppercase tracking-wider transition-colors ${
                  typeFilter === filter
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-slate-200 bg-white text-slate-500 hover:border-red-500 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-red-500"
                }`}
              >
                {filter === "All" ? "All" : `${filter}s`}
              </button>
            ))}
          </div>

          {/* Vehicle grid */}
          {filteredListings.length === 0 ? (
            <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-24 text-center dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-2 text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-50">
                No vehicles found
              </h3>
              <p className="mb-6 font-medium text-slate-500 dark:text-slate-400">
                We couldn&apos;t find any matches for your current filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("All");
                  setMaxPrice("");
                }}
                className="rounded-full bg-red-50 px-8 py-4 font-black uppercase tracking-widest text-red-600 transition-colors hover:text-red-700 dark:bg-red-950 dark:text-red-400"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredListings.map((vehicle) => (
                <InventoryCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Financing band */}
      <FinancingBand />

      {/* Trade-in */}
      <TradeIn />

      {/* Brand strip */}
      <BrandStrip />
    </div>
  );
}
