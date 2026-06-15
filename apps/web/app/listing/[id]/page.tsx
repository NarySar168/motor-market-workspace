"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface FeedItem {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  description: string | null;
  seller_email: string;
  image_urls: string[];
}

export default function ListingDetails() {
  const params = useParams();
  const listingId = params.id; // Grabs the ID right from the URL!

  const [car, setCar] = useState<FeedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>("");

  useEffect(() => {
    fetch(`http://127.0.0.1:8080/api/listings/${listingId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setCar(data);
        if (data.image_urls && data.image_urls.length > 0) {
          setMainImage(data.image_urls[0]); // Set the first photo as the main view
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [listingId]);

  if (loading) return <div className="p-20 text-center text-xl">Loading vehicle...</div>;
  if (!car) return <div className="p-20 text-center text-xl text-red-500">Vehicle not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-16">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-8 transition-colors">
          &larr; Back to Marketplace Feed
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Side: Interactive Photo Gallery */}
          <div className="w-full lg:w-3/5 bg-slate-100 p-6 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200">
            {mainImage ? (
              <div className="w-full aspect-[4/3] bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm mb-4 [&_[data-rmiz-wrap]]:w-full [&_[data-rmiz-wrap]]:h-full flex items-center justify-center">
                {/* WE ADDED TAILWIND MODIFIERS HERE TO STRETCH THE ZOOM WRAPPER */}
                <Zoom>
                  <img src={mainImage} alt="Main vehicle view" className="w-full h-full object-contain bg-slate-200" />
                </Zoom>
              </div>
            ) : (
              <div className="w-full aspect-[4/3] bg-slate-200 rounded-xl flex items-center justify-center mb-4">
                <span className="text-6xl">🚙</span>
              </div>
            )}
            
            {/* Thumbnails */}
            {car.image_urls.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {car.image_urls.map((url, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setMainImage(url)}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${mainImage === url ? 'border-blue-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Vehicle Details */}
          <div className="w-full lg:w-2/5 p-8 lg:p-10 flex flex-col">
            <div className="mb-6">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
                {car.year} {car.make} {car.model}
              </h1>
              <p className="text-3xl font-bold text-green-600">
                ${(car.price / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="mb-8 flex-1">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Description</h3>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {car.description || "No specific details provided by the seller."}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl mt-auto">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Seller Contact</h3>
              <p className="text-blue-900 font-medium text-lg">{car.seller_email}</p>
              <a href={`mailto:${car.seller_email}?subject=Interested in your ${car.year} ${car.make} ${car.model}`} 
                 className="mt-4 block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-3 px-4 rounded-lg transition-colors">
                Email Seller
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}