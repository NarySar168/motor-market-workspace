"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostVehicle() {
  const router = useRouter();

  // --- CONFIGURATION ---
  const HARDCODED_USER_ID = "9b9a712f-205a-43d1-82e8-8dcf57071923"; 
  const CLOUD_NAME = "dozcgwtqo"; 
  const UPLOAD_PRESET = "motor_market_cars";
  const RUST_API_URL = "http://localhost:8080/api/listings";

  // --- STATE ---
  const [vehicleType, setVehicleType] = useState<'car' | 'motorcycle'>('car');
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("");

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(filesArray);
      
      // Create local preview URLs for the UI
      const previews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(previews);
    }
  };

  const submitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!make || !model || !year || !price) {
      setStatus("⚠️ Please fill out all required fields.");
      return;
    }
    
    setIsUploading(true);
    setStatus("Uploading photos to Cloudinary...");

    try {
      // 1. Upload each image to Cloudinary (Web Version)
      const uploadedUrls = await Promise.all(
        images.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', UPLOAD_PRESET);

          const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData,
          });
          
          const data = await response.json();
          if (!response.ok) throw new Error(data.error?.message);
          return data.secure_url;
        })
      );

      setStatus("Saving to Rust Database...");

      // 2. Save data to Rust API
      const response = await fetch(RUST_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: HARDCODED_USER_ID,
          make, model, year: parseInt(year),
          price: Math.round(parseFloat(price) * 100),
          description,
          image_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
          vehicle_type: vehicleType,
        }),
      });

      if (!response.ok) throw new Error("Failed to save to database");

      setStatus("✅ Vehicle posted successfully!");
      
      // Redirect to the live feed after 1.5 seconds
      setTimeout(() => {
        router.push('/');
      }, 1500);

    } catch (error) {
      console.error(error);
      setStatus("❌ Error uploading vehicle.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900 mb-6">Post a Vehicle</h1>
        
        <form onSubmit={submitListing} className="space-y-6">
          
          {/* Vehicle Type Toggle */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Vehicle Type</label>
            <div className="flex gap-4">
              <button type="button" onClick={() => setVehicleType('car')} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-colors ${vehicleType === 'car' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>🚗 Car</button>
              <button type="button" onClick={() => setVehicleType('motorcycle')} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-colors ${vehicleType === 'motorcycle' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>🏍️ Motorcycle</button>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Photos</label>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
            
            {previewUrls.length > 0 && (
              <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                {previewUrls.map((url, idx) => (
                  <img key={idx} src={url} alt="preview" className="w-24 h-24 object-cover rounded-xl border border-slate-200 flex-shrink-0" />
                ))}
              </div>
            )}
          </div>

          {/* Details Form */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Make</label>
              <input type="text" required placeholder="e.g. Honda" value={make} onChange={(e) => setMake(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Model</label>
              <input type="text" required placeholder="e.g. Civic" value={model} onChange={(e) => setModel(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Year</label>
              <input type="number" required placeholder="e.g. 2024" value={year} onChange={(e) => setYear(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Price (USD)</label>
              <input type="number" required placeholder="e.g. 25000" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea placeholder="Tell buyers about this vehicle..." rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
          </div>

          {/* Submit */}
          {status && <p className="text-center font-bold text-slate-600">{status}</p>}
          <button type="submit" disabled={isUploading} className={`w-full py-4 rounded-xl font-bold text-white transition-all ${isUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20'}`}>
            {isUploading ? "Uploading..." : "Post to Marketplace"}
          </button>
        </form>

      </div>
    </main>
  );
}