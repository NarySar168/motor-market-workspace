"use client";

import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- CONFIGURATION ---
  const CLOUD_NAME = "dozcgwtqo"; 
  const UPLOAD_PRESET = "motor_market_cars";
  const RUST_API_URL = "http://localhost:8080/api/listings"; // Use your IP (e.g., 192.168.0.34) if testing on LAN

  // --- ADD LISTING STATES ---
  const [newMake, setNewMake] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newType, setNewType] = useState("car");
  const [newDescription, setNewDescription] = useState("");
  const [newSellerEmail, setNewSellerEmail] = useState("");
  
  // Image Upload States
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  // --- MODAL STATES ---
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [editMake, setEditMake] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVehicleType, setEditVehicleType] = useState("Car");
  const [isSaving, setIsSaving] = useState(false);

  const fetchListings = async () => {
    try {
      const res = await fetch(RUST_API_URL);
      const data = await res.json();
      setListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // --- LOCAL IMAGE PREVIEW LOGIC ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(filesArray);
      
      // Use FileReader instead of URL.createObjectURL to prevent Next.js crashes
      const previewPromises = filesArray.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      const previews = await Promise.all(previewPromises);
      setPreviewUrls(previews);
    }
  };

  // --- CREATE LOGIC (DATA + MULTIPLE IMAGES) ---
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadStatus("Uploading photos to Cloudinary...");

    try {
      // 1. Upload all images to Cloudinary simultaneously
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
          return data.secure_url; // Return the permanent URL
        })
      );

      setUploadStatus("Saving to Rust Database...");

      // 2. Prepare payload
      const payload = {
        make: newMake,
        model: newModel,
        year: parseInt(newYear),
        price: Math.round(parseFloat(newPrice) * 100), 
        vehicle_type: newType,
        description: newDescription,
        seller_email: newSellerEmail,
        image_urls: uploadedUrls.length > 0 ? uploadedUrls : [],
      };

      // 3. Send to Rust Backend
      const res = await fetch(RUST_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Clear form entirely
        setNewMake(""); setNewModel(""); setNewYear(""); setNewPrice("");
        setNewDescription(""); setNewSellerEmail(""); 
        setImages([]); setPreviewUrls([]);
        fetchListings(); 
      } else {
        alert("Failed to create listing.");
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Error connecting to server or Cloudinary.");
    } finally {
      setIsSubmitting(false);
      setUploadStatus("");
    }
  };

  // --- EDIT LOGIC ---
  const openEditModal = (car: any) => {
    setEditingListing(car);
    setEditMake(car.make);
    setEditModel(car.model);
    setEditYear(car.year.toString());
    setEditPrice((car.price / 100).toString());
    setEditDescription(car.description || "");
    setEditVehicleType(car.vehicle_type || "Car");
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch(`${RUST_API_URL}/${editingListing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: editMake,
          model: editModel,
          year: parseInt(editYear),
          price: Math.round(parseFloat(editPrice) * 100), 
          description: editDescription,
          vehicle_type: editVehicleType.toLowerCase(),
        }),
      });

      if (!res.ok) throw new Error("Failed to update on server");
      
      setEditingListing(null);
      fetchListings(); 
    } catch (error) {
      console.error("Edit failed:", error);
      alert("Failed to update the vehicle.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- DELETE LOGIC ---
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this vehicle? This cannot be undone.")) return;

    setListings((current) => current.filter((car) => car.id !== id)); 
    try {
      const res = await fetch(`${RUST_API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete on server");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete the vehicle.");
      fetchListings();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">NR MotorMarket Admin</h1>
        <p className="text-slate-500 mt-1">Manage your active vehicle inventory.</p>
      </header>

      {/* --- POST NEW VEHICLE FORM --- */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-5 border-b border-slate-100 pb-2">
          + Post New Vehicle
        </h2>
        <form onSubmit={handleCreateListing} className="flex flex-col gap-4">
          
          {/* Row 1: Core Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Year</label>
              <input required type="number" placeholder="e.g. 2024" value={newYear} onChange={e => setNewYear(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Make</label>
              <input required type="text" placeholder="e.g. Audi" value={newMake} onChange={e => setNewMake(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Model</label>
              <input required type="text" placeholder="e.g. Q7" value={newModel} onChange={e => setNewModel(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price ($)</label>
              <input required type="number" step="0.01" placeholder="e.g. 45000" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
            </div>
          </div>

          {/* Row 2: Meta Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
              <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-red-500 outline-none">
                <option value="car">🚗 Car</option>
                <option value="motorcycle">🏍️ Motorcycle</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Seller Email</label>
              <input required type="email" placeholder="seller@example.com" value={newSellerEmail} onChange={e => setNewSellerEmail(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
            </div>
          </div>

          {/* Row 3: MULTIPLE PHOTO UPLOAD */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vehicle Photos (Select Multiple)</label>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleFileChange} 
              disabled={isSubmitting}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer disabled:opacity-50" 
            />
            
            {/* Image Preview Strip */}
            {previewUrls.length > 0 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                {previewUrls.map((url, idx) => (
                  <img key={idx} src={url} alt={`preview-${idx}`} className="w-24 h-24 object-cover rounded-lg border border-slate-300 flex-shrink-0 shadow-sm" />
                ))}
              </div>
            )}
          </div>

          {/* Row 4: Description & Submit */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
            <textarea placeholder="Vehicle Description..." value={newDescription} onChange={e => setNewDescription(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-red-500 outline-none min-h-[80px] resize-none"></textarea>
          </div>
          
          {uploadStatus && <p className="text-center font-bold text-slate-600 text-sm animate-pulse">{uploadStatus}</p>}
          
          <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white font-bold uppercase tracking-wider py-3.5 rounded-lg hover:bg-red-700 transition-colors mt-2 disabled:opacity-50 shadow-md">
            {isSubmitting ? "Processing..." : "Publish Listing"}
          </button>
          
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading inventory...</div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No vehicles in inventory.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Vehicle</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Price</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings.map((car) => (
                <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 flex items-center gap-4">
                    <div 
                      className="w-16 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 cursor-pointer border border-slate-200 relative group"
                      onClick={() => car.image_urls?.length && setZoomedImage(car.image_urls[0])}
                    >
                      {car.image_urls?.length ? (
                        <>
                          <img src={car.image_urls[0]} alt="car" className="w-full h-full object-cover" />
                          {car.image_urls.length > 1 && (
                            <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tl-lg">
                              +{car.image_urls.length - 1}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">No Pic</div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{car.year} {car.make} {car.model}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {car.id.split('-')[0]}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md capitalize">
                      {car.vehicle_type || "Car"}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-green-600">
                    ${(car.price / 100).toLocaleString()}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEditModal(car)} className="text-sm font-bold text-blue-600 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(car.id)} className="text-sm font-bold text-red-600 px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Edit Listing</h2>
              <button onClick={() => setEditingListing(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={submitEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Make</label>
                  <input type="text" value={editMake} onChange={(e) => setEditMake(e.target.value)} required className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Model</label>
                  <input type="text" value={editModel} onChange={(e) => setEditModel(e.target.value)} required className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Year</label>
                  <input type="number" value={editYear} onChange={(e) => setEditYear(e.target.value)} required className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price (USD)</label>
                  <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vehicle Type</label>
                <select value={editVehicleType} onChange={(e) => setEditVehicleType(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingListing(null)} className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL SCREEN ZOOM MODAL */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setZoomedImage(null)}>
          <button className="absolute top-6 right-6 text-white font-bold text-xl hover:text-gray-300">&times; Close</button>
          <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}