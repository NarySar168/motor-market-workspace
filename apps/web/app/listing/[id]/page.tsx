"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ListingDetail() {
  const params = useParams();
  const id = params?.id as string;

  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Interactive States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'features'>('overview');
  
  // NEW: Zoom Modal State
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        // Fallback for preview/testing environments
        if (!id || id === 'page.tsx' || id === 'preview') {
            setIsLoading(false);
            return;
        }
        
        const res = await fetch(`http://localhost:8080/api/listings/${id}`);
        if (!res.ok) throw new Error("Listing not found");
        const data = await res.json();
        setListing(data);
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Vehicle Not Found</h1>
        <Link href="/" className="text-blue-600 hover:underline">← Back to Inventory</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-2">
            <span>←</span> Back to Inventory
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* TOP SECTION: Gallery & Action Panel */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Interactive Image Gallery */}
          <div className="w-full lg:w-2/3">
            {/* Main Hero Image - UPDATED with Zoom Click and Hover */}
            <div 
              className={`bg-white rounded-2xl border border-slate-200 overflow-hidden h-[400px] sm:h-[500px] flex items-center justify-center relative group ${listing.image_urls?.length ? 'cursor-zoom-in' : ''}`}
              onClick={() => listing.image_urls?.length && setZoomedImage(listing.image_urls[activeImageIndex])}
            >
              {listing.image_urls && listing.image_urls.length > 0 ? (
                <>
                  <img 
                    src={listing.image_urls[activeImageIndex]} 
                    alt={`${listing.year} ${listing.make} ${listing.model}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Overlay for Zoom indication */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-black/60 text-white text-sm font-bold py-2 px-4 rounded-full backdrop-blur-sm transition-opacity">
                      Click to Zoom
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-slate-400 font-medium">No Photos Available</div>
              )}
              
              {/* Vehicle Type Badge overlay */}
              {listing.vehicle_type && (
                <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                  {listing.vehicle_type}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {listing.image_urls && listing.image_urls.length > 1 && (
              <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                {listing.image_urls.map((url: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? 'border-blue-600 opacity-100 ring-2 ring-blue-600/20' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} className="w-full h-full object-cover" alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Key Details & Action Buttons */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sticky top-24 shadow-sm">
              <div className="mb-6">
                <p className="text-slate-500 font-semibold tracking-wide uppercase text-sm mb-1">
                  {listing.year} • Condition: New
                </p>
                <h1 className="text-3xl font-black text-slate-900 leading-tight mb-4">
                  {listing.make} {listing.model}
                </h1>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-green-600">
                    ${(listing.price / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </span>
                  <span className="text-slate-400 font-medium mb-1 line-through">MSRP</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> In-Stock
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Seller</span>
                  <span className="font-semibold text-slate-900">{listing.seller_email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Stock #</span>
                  <span className="font-mono text-slate-600">{listing.id.split('-')[0].toUpperCase()}</span>
                </div>
              </div>

              {/* Dealership Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-md shadow-blue-600/20">
                  Contact Seller
                </button>
                <div className="flex gap-3">
                  <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 rounded-xl transition-colors">
                    Make Offer
                  </button>
                  <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 rounded-xl transition-colors">
                    Test Ride
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Tabbed Information */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-8 py-5 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('specs')}
              className={`px-8 py-5 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                activeTab === 'specs' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Specifications
            </button>
            <button 
              onClick={() => setActiveTab('features')}
              className={`px-8 py-5 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                activeTab === 'features' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Key Features
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8 lg:p-12">
            
            {/* 1. Overview Tab */}
            {activeTab === 'overview' && (
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Vehicle Description</h2>
                <div className="prose prose-slate prose-lg text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {listing.description || "No description provided by the seller."}
                </div>
              </div>
            )}

            {/* 2. Specifications Tab (Mock Data representing future DB columns) */}
            {activeTab === 'specs' && (
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Technical Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Spec Block */}
                  <div>
                    <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-100 pb-2">Engine</h3>
                    <dl className="space-y-3">
                      <div className="flex justify-between"><dt className="text-slate-500">Type</dt><dd className="font-medium text-slate-900 text-right w-1/2">Liquid-Cooled Inline Four</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">Displacement</dt><dd className="font-medium text-slate-900">599cc</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">Transmission</dt><dd className="font-medium text-slate-900">Close-ratio 6-speed</dd></div>
                    </dl>
                  </div>

                  {/* Spec Block */}
                  <div>
                    <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-100 pb-2">Dimensions</h3>
                    <dl className="space-y-3">
                      <div className="flex justify-between"><dt className="text-slate-500">Seat Height</dt><dd className="font-medium text-slate-900">32.4 inches</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">Fuel Capacity</dt><dd className="font-medium text-slate-900">4.8 gallons</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">Curb Weight</dt><dd className="font-medium text-slate-900">419 lbs</dd></div>
                    </dl>
                  </div>
                  
                </div>
                <p className="text-xs text-slate-400 mt-8 italic">* Specifications shown are representative examples. Actual vehicle specs may vary.</p>
              </div>
            )}

            {/* 3. Features Tab */}
            {activeTab === 'features' && (
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Highlighted Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-slate-900 mb-2">Advanced Aerodynamics</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">Designed to reduce drag and increase high-speed stability on the track or the street.</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-2">Electronic Steering Damper</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">Automatically adjusts damping force based on vehicle speed for optimal handling.</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-2">Radial-Mounted Brakes</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">Provides superior feel and immense stopping power when you need it most.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* NEW: FULL SCREEN ZOOM MODAL */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out" 
          onClick={() => setZoomedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white font-bold text-xl hover:text-gray-300">
            &times; Close
          </button>
          <img 
            src={zoomedImage} 
            alt="Zoomed Vehicle" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}