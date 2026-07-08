"use client";

import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const res = await fetch("http://localhost:8080/api/listings");
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

  // --- EDIT LOGIC ---
  const openEditModal = (car: any) => {
    setEditingListing(car);
    setEditMake(car.make);
    setEditModel(car.model);
    setEditYear(car.year.toString());
    setEditPrice((car.price / 100).toString()); // Convert cents to dollars for the input
    setEditDescription(car.description || "");
    setEditVehicleType(car.vehicle_type || "Car");
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch(`http://localhost:8080/api/listings/${editingListing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: editMake,
          model: editModel,
          year: parseInt(editYear),
          price: Math.round(parseFloat(editPrice) * 100), // Convert dollars back to cents for DB
          description: editDescription,
          vehicle_type: editVehicleType.toLowerCase(),
        }),
      });

      if (!res.ok) throw new Error("Failed to update on server");
      
      setEditingListing(null);
      fetchListings(); // Refresh the table
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

    setListings((current) => current.filter((car) => car.id !== id)); // Optimistic UI
    try {
      const res = await fetch(`http://localhost:8080/api/listings/${id}`, { method: 'DELETE' });
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
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage your active vehicle inventory.</p>
      </header>

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
                      className="w-16 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 cursor-pointer border border-slate-200"
                      onClick={() => car.image_urls?.length && setZoomedImage(car.image_urls[0])}
                    >
                      {car.image_urls?.length ? (
                        <img src={car.image_urls[0]} alt="car" className="w-full h-full object-cover" />
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