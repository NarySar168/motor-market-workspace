"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

// Define the shape of our vehicle data
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number; 
  description?: string;
  vehicle_type?: string;
  seller_email: string;
  image_urls: string[];
}

export default function Storefront() {
  const [listings, setListings] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Search & Filter State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/listings");
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

  // --- The Filtering Engine ---
  const filteredListings = listings.filter((vehicle) => {
    const searchString = `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "All" || 
      (vehicle.vehicle_type && vehicle.vehicle_type.toLowerCase() === typeFilter.toLowerCase());
    
    const vehiclePriceUsd = vehicle.price / 100;
    const matchesPrice = maxPrice ? vehiclePriceUsd <= parseFloat(maxPrice) : true;

    return matchesSearch && matchesType && matchesPrice;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("All");
    setMaxPrice("");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Motor Market</h1>
            <p className="text-slate-500 mt-2 text-lg">Find your perfect ride, instantly.</p>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT SIDEBAR: Filters */}
          <aside className="w-full lg:w-1/4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filter Inventory
              </h2>

              {/* Search Input */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Search Make/Model</label>
                <input 
                  type="text" 
                  placeholder="e.g. Honda Civic" 
                  className="w-full border border-slate-300 rounded-xl p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Vehicle Type Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Vehicle Type</label>
                <select 
                  className="w-full border border-slate-300 rounded-xl p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All">All Vehicles</option>
                  <option value="car">Cars</option>
                  <option value="motorcycle">Motorcycles</option>
                </select>
              </div>

              {/* Max Price Input */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Max Price ($)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 25000" 
                  className="w-full border border-slate-300 rounded-xl p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              {/* Clear Filters Button */}
              {(searchQuery || typeFilter !== "All" || maxPrice) && (
                <button 
                  onClick={clearFilters}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* RIGHT SIDE: Live Feed */}
          <main className="w-full lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm flex flex-col items-center">
                <p className="text-slate-500 text-lg font-medium">No vehicles match your current filters.</p>
                <button onClick={clearFilters} className="mt-4 text-blue-600 font-bold hover:underline">Reset Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredListings.map((vehicle) => (
                  <div key={vehicle.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group">
                    
                    {/* Image Container */}
                    <div className="h-56 bg-slate-100 overflow-hidden relative">
                      {vehicle.image_urls && vehicle.image_urls.length > 0 ? (
                        <img 
                          src={vehicle.image_urls[0]} 
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium bg-slate-200">
                          No Photo Available
                        </div>
                      )}
                      
                      {/* Top Right Badge (Vehicle Type) */}
                      {vehicle.vehicle_type && (
                        <span className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-sm uppercase tracking-wider">
                          {vehicle.vehicle_type}
                        </span>
                      )}

                      {/* Bottom Left Badge (Year) */}
                      <span className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-slate-800 text-sm px-3 py-1.5 rounded-lg font-black shadow-sm">
                        {vehicle.year}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      
                      <div className="text-2xl font-black text-green-600 mb-4">
                        ${(vehicle.price / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>

                      {vehicle.description && (
                        <p className="text-slate-500 mb-6 line-clamp-2 text-sm leading-relaxed">
                          {vehicle.description}
                        </p>
                      )}

                      {/* Clean Action Buttons (No Edit Button Here!) */}
                      <div className="mt-auto pt-5 border-t border-slate-100 flex gap-3">
                        <Link 
                          href={`/listing/${vehicle.id}`}
                          className="flex-1 bg-slate-100 text-slate-800 text-center px-4 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                          Details
                        </Link>
                        <a 
                          href={`mailto:${vehicle.seller_email}`} 
                          className="flex-1 bg-blue-600 text-white text-center px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
                        >
                          Contact
                        </a>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </main>
          
        </div>
      </div>
    </div>
  );
}