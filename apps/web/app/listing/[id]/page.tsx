"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LISTINGS_URL } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function ListingDetail() {
  const { t } = useLanguage();
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
        
        const res = await fetch(`${LISTINGS_URL}/${id}`);
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t("listing.vehicleNotFound")}</h1>
        <Link href="/" className="text-blue-600 hover:underline">← {t("listing.backToInventory")}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-2">
            <span>←</span> {t("listing.backToInventory")}
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
              className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden h-[400px] sm:h-[500px] flex items-center justify-center relative group ${listing.image_urls?.length ? 'cursor-zoom-in' : ''}`}
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
                      {t("listing.clickToZoom")}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-slate-400 dark:text-slate-400 font-medium">{t("listing.noPhotosAvailable")}</div>
              )}

              {/* Vehicle Type Badge overlay */}
              {listing.vehicle_type && (
                <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                  {listing.vehicle_type.toLowerCase() === "car"
                    ? t("inventory.type.car")
                    : listing.vehicle_type.toLowerCase() === "motorcycle"
                    ? t("inventory.type.motorcycle")
                    : listing.vehicle_type}
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
                    <img src={url} className="w-full h-full object-cover" alt={`${t("listing.thumbnail")} ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Key Details & Action Buttons */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sticky top-24 shadow-sm">
              <div className="mb-6">
                <p className="text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase text-sm mb-1">
                  {listing.year} • {t("listing.condition")}
                </p>
                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 leading-tight mb-4">
                  {listing.make} {listing.model}
                </h1>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-green-600 dark:text-green-400">
                    ${(listing.price / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </span>
                  <span className="text-slate-400 dark:text-slate-400 font-medium mb-1 line-through">{t("listing.msrp")}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t("listing.status")}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {t("listing.inStock")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t("listing.seller")}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-50">{listing.seller_email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t("listing.stockNumber")}</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">{listing.id.split('-')[0].toUpperCase()}</span>
                </div>
              </div>

              {/* Dealership Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-md shadow-blue-600/20">
                  {t("listing.contactSeller")}
                </button>
                <div className="flex gap-3">
                  <button className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-3 rounded-xl transition-colors">
                    {t("listing.makeOffer")}
                  </button>
                  <button className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-3 rounded-xl transition-colors">
                    {t("listing.testRide")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Tabbed Information */}
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">

          {/* Tab Headers */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-8 py-5 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {t("listing.tabs.overview")}
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-8 py-5 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                activeTab === 'specs' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {t("listing.tabs.specs")}
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-8 py-5 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                activeTab === 'features' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {t("listing.tabs.features")}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8 lg:p-12">
            
            {/* 1. Overview Tab */}
            {activeTab === 'overview' && (
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">{t("listing.vehicleDescription")}</h2>
                <div className="prose prose-slate dark:prose-invert prose-lg text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {listing.description || t("listing.noDescription")}
                </div>
              </div>
            )}

            {/* 2. Specifications Tab (Mock Data representing future DB columns) */}
            {activeTab === 'specs' && (
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">{t("listing.technicalSpecs")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* Spec Block */}
                  <div>
                    <h3 className="text-sm font-bold uppercase text-slate-400 dark:text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">{t("listing.engine.heading")}</h3>
                    <dl className="space-y-3">
                      <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">{t("listing.engine.type.label")}</dt><dd className="font-medium text-slate-900 dark:text-slate-50 text-right w-1/2">{t("listing.engine.type.value")}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">{t("listing.engine.displacement.label")}</dt><dd className="font-medium text-slate-900 dark:text-slate-50">{t("listing.engine.displacement.value")}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">{t("listing.engine.transmission.label")}</dt><dd className="font-medium text-slate-900 dark:text-slate-50">{t("listing.engine.transmission.value")}</dd></div>
                    </dl>
                  </div>

                  {/* Spec Block */}
                  <div>
                    <h3 className="text-sm font-bold uppercase text-slate-400 dark:text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">{t("listing.dimensions.heading")}</h3>
                    <dl className="space-y-3">
                      <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">{t("listing.dimensions.seatHeight.label")}</dt><dd className="font-medium text-slate-900 dark:text-slate-50">{t("listing.dimensions.seatHeight.value")}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">{t("listing.dimensions.fuelCapacity.label")}</dt><dd className="font-medium text-slate-900 dark:text-slate-50">{t("listing.dimensions.fuelCapacity.value")}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">{t("listing.dimensions.curbWeight.label")}</dt><dd className="font-medium text-slate-900 dark:text-slate-50">{t("listing.dimensions.curbWeight.value")}</dd></div>
                    </dl>
                  </div>

                </div>
                <p className="text-xs text-slate-400 dark:text-slate-400 mt-8 italic">{t("listing.specsDisclaimer")}</p>
              </div>
            )}

            {/* 3. Features Tab */}
            {activeTab === 'features' && (
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">{t("listing.highlightedFeatures")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                        <h4 className="font-bold text-slate-900 dark:text-slate-50 mb-2">{t("listing.feature1.title")}</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{t("listing.feature1.body")}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-900 dark:text-slate-50 mb-2">{t("listing.feature2.title")}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{t("listing.feature2.body")}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-900 dark:text-slate-50 mb-2">{t("listing.feature3.title")}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{t("listing.feature3.body")}</p>
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
            &times; {t("listing.close")}
          </button>
          <img
            src={zoomedImage}
            alt={t("listing.zoomedImageAlt")}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}