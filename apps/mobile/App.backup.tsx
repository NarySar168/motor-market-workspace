import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, FlatList, SafeAreaView, Dimensions, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function App() {
  // --- APP STATE ---
  const [activeTab, setActiveTab] = useState<'post' | 'feed'>('post');
  const [selectedListing, setSelectedListing] = useState<any | null>(null); 
  const [zoomedImage, setZoomedImage] = useState<string | null>(null); 

  // --- CONFIGURATION ---
  const HARDCODED_USER_ID = "9b9a712f-205a-43d1-82e8-8dcf57071923"; 
  const CLOUD_NAME = "dozcgwtqo"; 
  const UPLOAD_PRESET = "motor_market_cars";
  const RUST_API_URL = "http://192.168.0.28:8080/api/listings";

  // ==========================================
  // TAB 1: POST VEHICLE LOGIC
  // ==========================================
  const [vehicleType, setVehicleType] = useState<'car' | 'motorcycle'>('car');
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("");

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uris = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...uris]);
    }
  };

  const submitListing = async () => {
    if (!make || !model || !year || !price) {
      setStatus("⚠️ Please fill out all required fields.");
      return;
    }
    setIsUploading(true);
    setStatus("Uploading photos...");

    try {
      const uploadedUrls = await Promise.all(
        images.map(async (uri) => {
          const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
          const response = await FileSystem.uploadAsync(uploadUrl, uri, {
            httpMethod: 'POST',
            uploadType: 1, 
            fieldName: 'file',
            parameters: { upload_preset: UPLOAD_PRESET },
          });
          const data = JSON.parse(response.body);
          if (response.status !== 200) throw new Error(data.error?.message);
          return data.secure_url;
        })
      );

      setStatus("Saving to database...");

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
      setMake(""); setModel(""); setYear(""); setPrice(""); setDescription(""); setImages([]);
      
      setTimeout(() => {
        setStatus("");
        setSelectedListing(null); 
        setActiveTab('feed');
      }, 1500);

    } catch (error) {
      console.error(error);
      setStatus("❌ Error uploading vehicle.");
    } finally {
      setIsUploading(false);
    }
  };

  // ==========================================
  // TAB 2: MARKETPLACE FEED LOGIC
  // ==========================================
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  // NEW: Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "car" | "motorcycle">("All");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchFeed = async () => {
    setIsLoadingFeed(true);
    try {
      const res = await fetch(RUST_API_URL);
      const data = await res.json();
      setFeed(data);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'feed' && !selectedListing) {
      fetchFeed();
    }
  }, [activeTab, selectedListing]);

  // NEW: The Filtering Engine for Mobile
  const filteredFeed = feed.filter((vehicle) => {
    const searchString = `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "All" || 
      (vehicle.vehicle_type && vehicle.vehicle_type.toLowerCase() === typeFilter.toLowerCase());
    
    const vehiclePriceUsd = vehicle.price / 100;
    const matchesPrice = maxPrice ? vehiclePriceUsd <= parseFloat(maxPrice) : true;

    return matchesSearch && matchesType && matchesPrice;
  });

  const renderFeedItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.7} 
      onPress={() => setSelectedListing(item)}
    >
      <View style={{ position: 'relative' }}>
        {item.image_urls && item.image_urls.length > 0 ? (
          <Image source={{ uri: item.image_urls[0] }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.placeholderImage]}>
            <Text style={{ color: '#94a3b8' }}>No Photo</Text>
          </View>
        )}
        
        {item.vehicle_type && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{item.vehicle_type}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardPrice}>${(item.price / 100).toLocaleString()}</Text>
        <Text style={styles.cardTitle}>{item.year} {item.make} {item.model}</Text>
        <Text style={styles.sellerText}>Seller: {item.seller_email}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* VIEW 1: POST VEHICLE */}
        {activeTab === 'post' && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.header}>Post Vehicle</Text>
            
            <View style={styles.imageSection}>
              <TouchableOpacity style={styles.photoButton} onPress={pickImages}>
                <Text style={styles.photoButtonText}>+ Select Photos</Text>
              </TouchableOpacity>
              {images.length > 0 && (
                <ScrollView horizontal style={styles.thumbnailContainer}>
                  {images.map((uri, idx) => (
                    <Image key={idx} source={{ uri }} style={styles.thumbnail} />
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.form}>
              <View style={styles.typeSelector}>
                <TouchableOpacity 
                  style={[styles.typeButton, vehicleType === 'car' && styles.typeButtonActive]} 
                  onPress={() => setVehicleType('car')}
                >
                  <Text style={[styles.typeText, vehicleType === 'car' && styles.typeTextActive]}>🚗 Car</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeButton, vehicleType === 'motorcycle' && styles.typeButtonActive]} 
                  onPress={() => setVehicleType('motorcycle')}
                >
                  <Text style={[styles.typeText, vehicleType === 'motorcycle' && styles.typeTextActive]}>🏍️ Motorcycle</Text>
                </TouchableOpacity>
              </View>

              <TextInput style={styles.input} placeholder="Make (e.g. Honda)" value={make} onChangeText={setMake} />
              <TextInput style={styles.input} placeholder="Model (e.g. Civic)" value={model} onChangeText={setModel} />
              <View style={styles.row}>
                <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} placeholder="Year" keyboardType="numeric" value={year} onChangeText={setYear} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Price (USD)" keyboardType="numeric" value={price} onChangeText={setPrice} />
              </View>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Description" multiline numberOfLines={4} value={description} onChangeText={setDescription} />
              
              {status ? <Text style={styles.statusText}>{status}</Text> : null}
              <TouchableOpacity style={[styles.submitButton, isUploading && styles.disabledButton]} onPress={submitListing} disabled={isUploading}>
                {isUploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Post to Marketplace</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* VIEW 2: MARKETPLACE FEED & DETAILS */}
        {activeTab === 'feed' && (
          <View style={styles.feedContainer}>
            {selectedListing ? (
              // --- DETAILS VIEW ---
              <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.backButton} onPress={() => setSelectedListing(null)}>
                  <Text style={styles.backButtonText}>← Back to Feed</Text>
                </TouchableOpacity>
                
                <View style={styles.detailImageContainer}>
                  {selectedListing.image_urls && selectedListing.image_urls.length > 0 ? (
                    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                      {selectedListing.image_urls.map((url: string, idx: number) => (
                        <TouchableOpacity key={idx} activeOpacity={0.9} onPress={() => setZoomedImage(url)}>
                          <Image source={{ uri: url }} style={styles.detailImage} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={[styles.detailImage, styles.placeholderImage]}>
                      <Text style={{ color: '#94a3b8' }}>No Photos</Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailPrice}>${(selectedListing.price / 100).toLocaleString()}</Text>
                  <Text style={styles.detailTitle}>{selectedListing.year} {selectedListing.make} {selectedListing.model}</Text>
                  
                  {selectedListing.vehicle_type && (
                    <Text style={{ color: '#2563eb', fontWeight: 'bold', textTransform: 'capitalize', marginBottom: 10 }}>
                      Type: {selectedListing.vehicle_type}
                    </Text>
                  )}

                  <View style={styles.divider} />
                  <Text style={styles.detailSectionTitle}>Description</Text>
                  <Text style={styles.detailDescription}>
                    {selectedListing.description || "No description provided."}
                  </Text>
                  <View style={styles.divider} />
                  <Text style={styles.detailSectionTitle}>Seller Contact</Text>
                  <Text style={styles.detailSellerEmail}>{selectedListing.seller_email}</Text>
                </View>
              </ScrollView>
            ) : (
              // --- MAIN FEED VIEW ---
              <>
                <Text style={styles.header}>Live Inventory</Text>
                
                {/* NEW: Search and Filter Bar */}
                <View style={styles.filterContainer}>
                  <TextInput 
                    style={styles.searchInput} 
                    placeholder="Search Make or Model..." 
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <View style={styles.filterRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typePills}>
                      <TouchableOpacity onPress={() => setTypeFilter('All')} style={[styles.pill, typeFilter === 'All' && styles.pillActive]}>
                        <Text style={[styles.pillText, typeFilter === 'All' && styles.pillTextActive]}>All</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setTypeFilter('car')} style={[styles.pill, typeFilter === 'car' && styles.pillActive]}>
                        <Text style={[styles.pillText, typeFilter === 'car' && styles.pillTextActive]}>🚗 Cars</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setTypeFilter('motorcycle')} style={[styles.pill, typeFilter === 'motorcycle' && styles.pillActive]}>
                        <Text style={[styles.pillText, typeFilter === 'motorcycle' && styles.pillTextActive]}>🏍️ Bikes</Text>
                      </TouchableOpacity>
                    </ScrollView>
                    <TextInput 
                      style={styles.priceInput} 
                      placeholder="Max $" 
                      keyboardType="numeric"
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                    />
                  </View>
                </View>

                {isLoadingFeed ? (
                  <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 50 }} />
                ) : filteredFeed.length === 0 ? (
                  <View style={{ marginTop: 50, alignItems: 'center' }}>
                     <Text style={{ color: '#64748b', fontSize: 16 }}>No vehicles match your filters.</Text>
                     <TouchableOpacity onPress={() => { setSearchQuery(""); setTypeFilter("All"); setMaxPrice(""); }} style={{ marginTop: 15 }}>
                        <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Reset Filters</Text>
                     </TouchableOpacity>
                  </View>
                ) : (
                  <FlatList
                    data={filteredFeed}
                    keyExtractor={(item) => item.id}
                    renderItem={renderFeedItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    refreshing={isLoadingFeed}
                    onRefresh={fetchFeed}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </>
            )}
          </View>
        )}

      </View>

      {/* BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => { setActiveTab('post'); setSelectedListing(null); }}>
          <Text style={[styles.navText, activeTab === 'post' && styles.navTextActive]}>📷 Post</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => { setActiveTab('feed'); setSelectedListing(null); }}>
          <Text style={[styles.navText, activeTab === 'feed' && styles.navTextActive]}>🚗 Feed</Text>
        </TouchableOpacity>
      </View>

      {/* FULL SCREEN ZOOM MODAL */}
      <Modal visible={!!zoomedImage} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setZoomedImage(null)}>
            <Text style={styles.modalCloseText}>✕ Close</Text>
          </TouchableOpacity>
          {zoomedImage && (
            <ScrollView 
              contentContainerStyle={styles.modalScrollContent}
              maximumZoomScale={3} 
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              <Image source={{ uri: zoomedImage }} style={styles.modalImage} resizeMode="contain" />
            </ScrollView>
          )}
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingTop: 20, paddingBottom: 40 },
  feedContainer: { flex: 1, paddingTop: 10 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', marginBottom: 15 },
  
  // Filtering Styles
  filterContainer: { marginBottom: 20 },
  searchInput: { backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10, fontSize: 16 },
  filterRow: { flexDirection: 'row', alignItems: 'center' },
  typePills: { flex: 1, marginRight: 10 },
  pill: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  pillActive: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  pillText: { color: '#64748b', fontWeight: '600', fontSize: 14 },
  pillTextActive: { color: '#2563eb' },
  priceInput: { width: 90, backgroundColor: '#fff', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 14, textAlign: 'center' },

  // Vehicle Type Toggle Styles
  typeSelector: { flexDirection: 'row', gap: 10 },
  typeButton: { flex: 1, paddingVertical: 15, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center', backgroundColor: '#fff' },
  typeButtonActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff', borderWidth: 2 },
  typeText: { fontSize: 16, color: '#64748b', fontWeight: '600' },
  typeTextActive: { color: '#2563eb', fontWeight: 'bold' },

  // Form Styles 
  imageSection: { marginBottom: 20 },
  photoButton: { backgroundColor: '#e2e8f0', padding: 15, borderRadius: 10, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1' },
  photoButtonText: { color: '#475569', fontWeight: 'bold' },
  thumbnailContainer: { flexDirection: 'row', marginTop: 15 },
  thumbnail: { width: 80, height: 80, borderRadius: 10, marginRight: 10 },
  form: { gap: 15 },
  row: { flexDirection: 'row' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', padding: 15, borderRadius: 10, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#2563eb', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  disabledButton: { backgroundColor: '#94a3b8' },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  statusText: { textAlign: 'center', fontWeight: 'bold', color: '#334155', marginTop: 10 },

  // Feed Card Styles
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardImage: { width: '100%', height: 200, backgroundColor: '#f1f5f9' },
  placeholderImage: { alignItems: 'center', justifyContent: 'center' },
  typeBadge: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(37, 99, 235, 0.9)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  typeBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
  cardContent: { padding: 15 },
  cardPrice: { fontSize: 22, fontWeight: 'bold', color: '#16a34a', marginBottom: 4 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#0f172a', marginBottom: 8 },
  sellerText: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },

  // Details View Styles
  backButton: { paddingVertical: 10, marginBottom: 10 },
  backButtonText: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  detailImageContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  detailImage: { width: SCREEN_WIDTH - 40, height: 280, resizeMode: 'cover' },
  detailContent: { backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  detailPrice: { fontSize: 32, fontWeight: 'bold', color: '#16a34a', marginBottom: 5 },
  detailTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 15 },
  detailSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  detailDescription: { fontSize: 16, color: '#334155', lineHeight: 24 },
  detailSellerEmail: { fontSize: 16, color: '#2563eb', fontWeight: '500' },

  // Navigation Styles
  bottomNav: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', paddingBottom: 10 },
  navButton: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  navText: { fontSize: 16, color: '#94a3b8', fontWeight: '600' },
  navTextActive: { color: '#2563eb' },

  // Full Screen Zoom Modal Styles
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  modalCloseButton: { position: 'absolute', top: 60, right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  modalCloseText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalScrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: SCREEN_WIDTH, height: '100%' },
});