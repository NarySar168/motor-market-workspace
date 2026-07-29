"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LISTINGS_URL } from "@/lib/api";

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

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
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
    
    const matchesType = typeFilter === "All" || 
      (vehicle.vehicle_type && vehicle.vehicle_type.toLowerCase() === typeFilter.toLowerCase());
      
    const vehiclePriceDollars = vehicle.price / 100;
    const matchesPrice = maxPrice === "" || vehiclePriceDollars <= parseFloat(maxPrice);

    return matchesSearch && matchesType && matchesPrice;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* --- BIG HERO SECTION --- */}
      <div className="relative w-full h-[50vh] min-h-[400px] bg-gray-900 flex flex-col items-center justify-center">
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1562426509-5044a121aa49?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto transform -translate-y-4">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-4 uppercase tracking-tighter drop-shadow-xl">
            Drive Your <span className="text-red-500">Dream</span>
          </h2>
          <p className="text-lg md:text-2xl text-gray-200 font-medium drop-shadow-md">
            Unbeatable prices on premium pre-owned vehicles.
          </p>
        </div>
      </div>

      {/* --- MAIN INVENTORY SECTION --- */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
        
        {/* Filter Bar */}
        <div className="bg-white p-6 rounded-xl mb-12 flex flex-col md:flex-row gap-4 border border-gray-200 shadow-xl relative z-20 -mt-12">
          <div className="flex-1">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Search Vehicles</label>
            <input
              type="text"
              placeholder="Make, model, or year..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-56">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Category</label>
            <select
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all font-medium"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Inventory</option>
              <option value="Car">Cars</option>
              <option value="Motorcycle">Motorcycles</option>
            </select>
          </div>
          <div className="w-full md:w-56">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Max Price</label>
            <input
              type="number"
              placeholder="$ Any"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all font-medium"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Vehicle Grid */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">No vehicles found</h3>
            <p className="text-gray-500 mb-6 font-medium">We couldn't find any matches for your current filters.</p>
            <button 
              onClick={() => { setSearchQuery(""); setTypeFilter("All"); setMaxPrice(""); }}
              className="text-red-600 font-black hover:text-red-700 bg-red-50 px-8 py-4 rounded uppercase tracking-widest transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((vehicle) => (
              <div key={vehicle.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col group">
                {/* Image */}
                <div className="h-56 bg-gray-100 relative overflow-hidden">
                  {vehicle.image_urls && vehicle.image_urls.length > 0 ? (
                    <img src={vehicle.image_urls[0]} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest">No Photo</div>
                  )}
                  {vehicle.vehicle_type && (
                    <span className="absolute top-4 right-4 bg-red-600 text-white text-[10px] px-3 py-1.5 rounded font-black shadow-lg tracking-widest uppercase">{vehicle.vehicle_type}</span>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-black text-gray-900 leading-tight mb-1 uppercase">
                    {vehicle.year} {vehicle.make} 
                    <span className="block text-gray-500 text-lg mt-1">{vehicle.model}</span>
                  </h2>
                  <div className="text-3xl font-black text-red-600 my-4">
                    ${(vehicle.price / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  {vehicle.description && (
                    <p className="text-gray-500 mb-6 line-clamp-2 text-sm font-medium leading-relaxed">{vehicle.description}</p>
                  )}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
                    <Link href={`/listing/${vehicle.id}`} className="flex-1 bg-gray-100 text-gray-800 text-center px-4 py-3.5 rounded font-black hover:bg-gray-200 transition-colors uppercase tracking-wider text-sm">Details</Link>
                    <a href={`mailto:${vehicle.seller_email}`} className="flex-1 bg-gray-900 text-white text-center px-4 py-3.5 rounded font-black hover:bg-gray-800 transition-colors shadow-md uppercase tracking-wider text-sm">Contact</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}