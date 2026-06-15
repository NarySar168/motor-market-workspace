"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@repo/ui";

// --- INTERFACES ---
interface User {
  id: string;
  email: string;
  status: string;
}

interface FeedItem {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number; 
  description: string | null;
  seller_email: string;
  image_urls: string[]; // UPDATED: Now expects an array of strings!
}

export default function Home() {
  const [backendMessage, setBackendMessage] = useState("Loading...");
  
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [insertStatus, setInsertStatus] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  
  // UPDATED: Now holds a list of photo links
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const [listingStatus, setListingStatus] = useState("");
  const [feed, setFeed] = useState<FeedItem[]>([]);

  // --- FETCH FUNCTIONS ---
  const fetchStatus = () => {
    fetch("http://127.0.0.1:8080/api/hello")
      .then((res) => res.json())
      .then((data) => setBackendMessage(data.message))
      .catch(() => setBackendMessage("API disconnected"));
  };

  const fetchUsers = () => {
    fetch("http://127.0.0.1:8080/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Failed to fetch users", err));
  };

  const fetchFeed = () => {
    fetch("http://127.0.0.1:8080/api/listings")
      .then((res) => res.json())
      .then((data) => setFeed(data))
      .catch((err) => console.error("Failed to fetch feed", err));
  };

  useEffect(() => {
    fetchStatus();
    fetchUsers();
    fetchFeed();
  }, []);

  // --- UPDATED: BATCH CLOUDINARY UPLOAD HANDLER ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setListingStatus(`Uploading ${files.length} photo(s) to Cloudinary...`);

    try {
      // Create an array of upload tasks
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error?.message || "Upload failed");
        return data.secure_url;
      });

      // Fire all uploads simultaneously!
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Add the new photos to our existing list
      setImageUrls((prev) => [...prev, ...uploadedUrls]);
      setListingStatus(`✅ ${uploadedUrls.length} photo(s) uploaded successfully!`);
      
    } catch (error) {
      console.error(error);
      setListingStatus("❌ Error: Cloudinary rejected one or more uploads.");
    } finally {
      setIsUploading(false);
      // Clear the file input so they can add more photos if they want
      e.target.value = ''; 
    }
  };

  // Remove a photo if they uploaded the wrong one
  const removePhoto = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- SUBMISSION HANDLERS ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInsertStatus("Creating user...");
    try {
      const res = await fetch("http://127.0.0.1:8080/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, first_name: firstName, last_name: lastName }),
      });
      if (!res.ok) {
        setInsertStatus(`❌ Error: Database rejected this (Duplicate email?)`);
        return;
      }
      const data = await res.json();
      setInsertStatus(`✅ Success! New database UUID: ${data.id}`);
      setEmail(""); setFirstName(""); setLastName("");
      fetchUsers(); 
    } catch (error) {
      setInsertStatus("❌ Network error connecting to Rust.");
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setListingStatus("⚠️ Please select a user to post this car.");
      return;
    }
    setListingStatus("Posting vehicle to database...");
    try {
      const res = await fetch("http://127.0.0.1:8080/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedUserId,
          make,
          model,
          year: parseInt(year),
          price: Math.round(parseFloat(price) * 100), 
          description: description || null,
          image_urls: imageUrls.length > 0 ? imageUrls : null, // Send the full array!
        }),
      });
      
      if (!res.ok) {
        setListingStatus(`❌ Error: Failed to insert vehicle.`);
        return;
      }
      
      const data = await res.json();
      setListingStatus(`✅ Success! Vehicle Posted: ${data.make} ${data.model}`);
      
      // Clear form completely
      setMake(""); setModel(""); setYear(""); setPrice(""); setDescription(""); setImageUrls([]);
      
      fetchFeed(); 
      
    } catch (error) {
      setListingStatus("❌ Network error connecting to Rust.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-8 bg-slate-50 pt-16">
      <h1 className="text-4xl font-bold mb-4 text-slate-900 text-center">
        Motor Market Workspace
      </h1>
      
      <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg mb-8 w-full max-w-5xl text-center shadow-sm">
        <strong>Backend Status: </strong> {backendMessage}
      </div>

      {/* Row 1: Users & Directory */}
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center items-stretch mb-8">
        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 w-full md:w-1/2">
          <h2 className="text-2xl font-semibold mb-6 text-slate-800">Create New User</h2>
          <form onSubmit={handleCreateUser} className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="user@example.com" />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="John" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="Doe" />
              </div>
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-lg mt-4">Insert User</button>
          </form>
          {insertStatus && (
            <div className={`mt-6 p-4 rounded-lg text-sm text-center font-mono break-all border ${insertStatus.includes('Error') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              {insertStatus}
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 w-full md:w-1/2 flex flex-col">
          <h2 className="text-2xl font-semibold mb-6 text-slate-800">Database Directory</h2>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 max-h-[300px]">
            {users.length === 0 ? (
              <p className="text-slate-500 italic">No users found.</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                  <p className="font-semibold text-slate-800">{user.email}</p>
                  <p className="text-xs text-slate-500 font-mono truncate">{user.id}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Post a Vehicle */}
      <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 w-full max-w-5xl mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-slate-800 text-center">Post a Vehicle for Sale</h2>
        <form onSubmit={handleCreateListing} className="flex flex-col space-y-4">
          
          {/* UPDATED: Image Gallery Upload Section */}
          <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 text-center">
            <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Photos</label>
            <input 
              type="file" 
              accept="image/*" 
              multiple // Enables selecting multiple files!
              onChange={handleImageUpload} 
              disabled={isUploading}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
            />
            
            {/* Gallery Preview Grid */}
            {imageUrls.length > 0 && (
               <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img src={url} alt={`Preview ${idx + 1}`} className="h-24 w-full object-cover rounded-md border border-slate-200 shadow-sm" />
                      <button 
                        type="button" 
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
               </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Who is posting this car?</label>
            <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="" disabled>Select a user from the database...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.email}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Make</label>
              <input type="text" value={make} onChange={(e) => setMake(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="Honda" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="Civic" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="2018" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Price (USD)</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="15000" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="Runs great, single owner..." />
          </div>
          
          <button type="submit" disabled={isUploading} className={`w-full text-white font-bold py-3 px-4 rounded-lg mt-4 transition-colors ${isUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            Post Vehicle to Market
          </button>
        </form>
        {listingStatus && (
          <div className={`mt-6 p-4 rounded-lg text-sm text-center font-mono border ${listingStatus.includes('Error') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-800 border-green-200'}`}>
            {listingStatus}
          </div>
        )}
      </div>

      {/* --- THE SHOPPING FEED --- */}
      <div className="w-full max-w-5xl mb-12">
        <h2 className="text-3xl font-bold mb-8 text-slate-900 border-b border-slate-300 pb-2">
          Live Marketplace Feed
        </h2>
        
        {feed.length === 0 ? (
          <p className="text-slate-500 italic text-center py-8">No vehicles currently listed for sale.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feed.map((car) => (
              <div key={car.id} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                
                {/* UPDATED: Show the first image as the cover, and badge if there are more */}
                {car.image_urls && car.image_urls.length > 0 ? (
                  <div className="relative w-full h-48 bg-slate-100 border-b border-slate-200">
                    <img src={car.image_urls[0]} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
                    {car.image_urls.length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md">
                        + {car.image_urls.length - 1} Photos
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-100 w-full h-48 flex flex-col items-center justify-center border-b border-slate-200">
                    <span className="text-4xl mb-2">🚙</span>
                    <span className="text-slate-400 font-semibold text-sm uppercase tracking-wider">No Photo Provided</span>
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">
                        {car.year} {car.make} <br/><span className="text-blue-600">{car.model}</span>
                      </h3>
                      <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full text-sm">
                        ${(car.price / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                      {car.description || "No description provided."}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 mt-auto">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Seller Contact</p>
                    <p className="text-slate-800 text-sm font-medium truncate">{car.seller_email}</p>
                    
                    {/* NEW BUTTON HERE */}
                    <Link href={`/listing/${car.id}`} className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-center font-semibold py-2 px-4 rounded-lg transition-colors">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}