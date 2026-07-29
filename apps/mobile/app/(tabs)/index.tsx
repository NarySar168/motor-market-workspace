import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, FlatList, SafeAreaView, Dimensions, Modal, ImageBackground, Animated, Easing } from 'react-native';
import { LISTINGS_URL } from '../../constants/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(300, SCREEN_WIDTH * 0.78);
const RUST_API_URL = LISTINGS_URL;

export default function FeedScreen() {
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any | null>(null); 
  const [zoomedImage, setZoomedImage] = useState<string | null>(null); 
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setMenuOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: DRAWER_WIDTH, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setMenuOpen(false));
  };

  // Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "car" | "motorcycle">("All");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchFeed = async () => {
    setIsLoadingFeed(true);
    try {
      const res = await fetch(RUST_API_URL);
      const data = await res.json();
      
      // Safety net to prevent crashes if the API returns an error
      if (Array.isArray(data)) {
        setFeed(data);
      } else {
        setFeed([]); 
      }
    } catch (error) {
      console.error("Error fetching feed:", error);
      setFeed([]);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  useEffect(() => {
    if (!selectedListing) {
      fetchFeed();
    }
  }, [selectedListing]);

  const filteredFeed = (Array.isArray(feed) ? feed : []).filter((vehicle) => {
    const searchString = `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || (vehicle.vehicle_type && vehicle.vehicle_type.toLowerCase() === typeFilter.toLowerCase());
    const vehiclePriceUsd = vehicle.price / 100;
    const matchesPrice = maxPrice ? vehiclePriceUsd <= parseFloat(maxPrice) : true;
    return matchesSearch && matchesType && matchesPrice;
  });

  // Updated to match the Web Layout Navigation exactly
  const menuItems = [
    { label: 'Home', icon: '🏠', onPress: () => setSelectedListing(null) },
    { label: 'Inventory', icon: '🚗', onPress: () => setSelectedListing(null) },
    { label: 'Financing', icon: '💳', onPress: () => alert('Navigate to Financing') },
    { label: 'About Us', icon: 'ℹ️', onPress: () => alert('Navigate to About Us') },
    { label: 'Admin Access', icon: '⚙️', onPress: () => alert('Navigate to Admin screen') },
  ];

  const renderFeedItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => setSelectedListing(item)}>
      <View style={{ position: 'relative' }}>
        {item.image_urls && item.image_urls.length > 0 ? (
          <Image source={{ uri: item.image_urls[0] }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>No Photo</Text>
          </View>
        )}
        {item.vehicle_type && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{item.vehicle_type}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.year} {item.make} <Text style={{fontWeight: '400', color: '#64748b'}}>{item.model}</Text></Text>
        <Text style={styles.cardPrice}>${(item.price / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
        
        {/* Updated Web-Style Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.detailsBtn} 
            onPress={() => setSelectedListing(item)}
          >
            <Text style={styles.detailsBtnText}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.contactBtn} 
            onPress={() => alert(`Contacting ${item.seller_email}`)}
          >
            <Text style={styles.contactBtnText}>Contact</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* PREMIUM DEALERSHIP HEADER */}
      {!selectedListing && (
        <View style={styles.headerContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.brandTitle}>
              NR <Text style={styles.brandLight}>MotorMarket</Text>
            </Text>
            <Text style={styles.brandSubtitle}>Find your perfect ride.</Text>
          </View>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={openMenu}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.container}>
        {selectedListing ? (
          // --- DETAILS VIEW ---
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedListing(null)}>
              <Text style={styles.backButtonText}>← Back to Inventory</Text>
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
                <View style={[styles.detailImage, styles.placeholderImage]}><Text style={styles.placeholderText}>No Photos</Text></View>
              )}
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>{selectedListing.year} {selectedListing.make} {selectedListing.model}</Text>
              <Text style={styles.detailPrice}>${(selectedListing.price / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
              
              {selectedListing.vehicle_type && <Text style={styles.detailType}>Category: {selectedListing.vehicle_type}</Text>}
              
              <View style={styles.divider} />
              <Text style={styles.detailSectionTitle}>Description</Text>
              <Text style={styles.detailDescription}>{selectedListing.description || "No description provided."}</Text>
              
              <View style={styles.divider} />
              <Text style={styles.detailSectionTitle}>Seller Contact</Text>
              <Text style={styles.detailSellerEmail}>{selectedListing.seller_email}</Text>
            </View>
          </ScrollView>
        ) : (
          // --- MAIN FEED VIEW ---
          <FlatList 
            data={filteredFeed} 
            keyExtractor={(item) => item.id} 
            renderItem={renderFeedItem} 
            contentContainerStyle={{ paddingBottom: 20 }} 
            refreshing={isLoadingFeed} 
            onRefresh={fetchFeed} 
            showsVerticalScrollIndicator={false} 
            
            // Adding the Hero Banner & Filters as a FlatList Header
            ListHeaderComponent={(
              <View>
                {/* HERO BANNER */}
                <ImageBackground 
                  source={{ uri: 'https://images.unsplash.com/photo-1562426509-5044a121aa49?q=80&w=2070&auto=format&fit=crop' }} 
                  style={styles.heroBanner}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <View style={styles.heroOverlay}>
                    <Text style={styles.heroTitle}>
                      Drive Your <Text style={{ color: '#ef4444' }}>Dream</Text>
                    </Text>
                  </View>
                </ImageBackground>

                {/* SEARCH & FILTERS */}
                <View style={styles.filterContainer}>
                  <TextInput 
                    style={styles.searchInput} 
                    placeholder="Search Make or Model..." 
                    placeholderTextColor="#94a3b8"
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
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric" 
                      value={maxPrice} 
                      onChangeText={setMaxPrice}
                    />
                  </View>
                </View>
              </View>
            )}
            
            ListEmptyComponent={
              !isLoadingFeed ? (
                <View style={{ marginTop: 40, alignItems: 'center' }}>
                  <Text style={{ color: '#64748b', fontSize: 16, fontWeight: 'bold' }}>No vehicles match your filters.</Text>
                  <TouchableOpacity onPress={() => { setSearchQuery(""); setTypeFilter("All"); setMaxPrice(""); }} style={{ marginTop: 15 }}>
                    <Text style={{ color: '#dc2626', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>Clear Filters</Text>
                  </TouchableOpacity>
                </View>
              ) : null
            }
          />
        )}
      </View>

      {/* SLIDE-OUT MENU */}
      <Modal visible={menuOpen} transparent animationType="none" onRequestClose={closeMenu}>
        <View style={styles.drawerRoot}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeMenu}>
            <Animated.View style={[styles.drawerBackdrop, { opacity: fadeAnim }]} />
          </TouchableOpacity>

          <Animated.View style={[styles.drawerPanel, { width: DRAWER_WIDTH, transform: [{ translateX: slideAnim }] }]}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.drawerHeader}>
                <Image 
                  source={require('../../assets/logo.png')} 
                  style={styles.drawerLogo} 
                  resizeMode="contain"
                />
                <TouchableOpacity onPress={closeMenu} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.drawerClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.drawerItems}>
                {menuItems.map((item) => (
                  <TouchableOpacity 
                    key={item.label} 
                    style={styles.drawerItem} 
                    onPress={() => { closeMenu(); item.onPress(); }}
                  >
                    <Text style={styles.drawerItemIcon}>{item.icon}</Text>
                    <Text style={[styles.drawerItemText, item.label === 'Admin Access' && { color: '#dc2626' }]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Spacer to push contact info to the bottom */}
              <View style={{ flex: 1 }} />
              
              {/* Contact Footer pulled from Web Layout */}
              <View style={styles.drawerFooter}>
                <Text style={styles.drawerContactPhone}>(888) 123-4567</Text>
                <Text style={styles.drawerContactLocation}>📍 Phnom Penh, Cambodia</Text>
              </View>

            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>

      {/* FULL SCREEN ZOOM MODAL */}
      <Modal visible={!!zoomedImage} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setZoomedImage(null)}>
            <Text style={styles.modalCloseText}>✕ Close</Text>
          </TouchableOpacity>
          {zoomedImage && (
            <ScrollView contentContainerStyle={styles.modalScrollContent} maximumZoomScale={3} minimumZoomScale={1} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
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
  container: { flex: 1, paddingHorizontal: 16 },
  
  // --- PREMIUM HEADER ---
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    zIndex: 10,
  },
  logo: { 
    height: 84,  
    width: 90,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  brandTitle: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#0f172a', 
    letterSpacing: -0.5,
  },
  brandLight: {
    fontWeight: '300',
    color: '#64748b',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginLeft: 8,
  },
  menuBar: {
    width: 20,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#2563eb',
  },

  // --- SLIDE-OUT MENU ---
  drawerRoot: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  drawerBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15, 23, 42, 0.5)' },
  drawerPanel: { height: '100%', backgroundColor: '#ffffff', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 16 },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  drawerLogo: { width: 48, height: 48 },
  drawerClose: { fontSize: 20, color: '#64748b', fontWeight: '600' },
  drawerItems: { paddingTop: 8 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  drawerItemIcon: { fontSize: 20, marginRight: 16, width: 24, textAlign: 'center' },
  drawerItemText: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  
  // Drawer Footer
  drawerFooter: { padding: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9', alignItems: 'center', marginBottom: 20 },
  drawerContactPhone: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
  drawerContactLocation: { fontSize: 12, color: '#64748b', fontWeight: '600' },

  // --- HERO BANNER ---
  heroBanner: {
    width: '100%',
    height: 180,
    marginTop: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    textAlign: 'center',
  },

  // --- SEARCH & FILTERS (RED THEME) ---
  filterContainer: { marginBottom: 20 },
  searchInput: { backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12, fontSize: 16, fontWeight: '500' },
  filterRow: { flexDirection: 'row', alignItems: 'center' },
  typePills: { flex: 1, marginRight: 10 },
  pill: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  pillActive: { backgroundColor: '#fef2f2', borderColor: '#fca5a5' },
  pillText: { color: '#64748b', fontWeight: '700', fontSize: 14 },
  pillTextActive: { color: '#dc2626' }, 
  priceInput: { width: 90, backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  
  // --- VEHICLE CARDS ---
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
  cardImage: { width: '100%', height: 220, backgroundColor: '#f8fafc' },
  placeholderImage: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  typeBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#dc2626', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  typeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 4, textTransform: 'uppercase' },
  cardPrice: { fontSize: 26, fontWeight: '900', color: '#dc2626', marginBottom: 16 },
  
  // Action Buttons
  actionRow: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
  detailsBtn: { flex: 1, backgroundColor: '#f1f5f9', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  detailsBtnText: { color: '#334155', fontWeight: '800', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  contactBtn: { flex: 1, backgroundColor: '#111827', paddingVertical: 12, borderRadius: 10, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  contactBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 },

  // --- DETAILS VIEW ---
  backButton: { paddingVertical: 12, marginBottom: 5 },
  backButtonText: { color: '#dc2626', fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailImageContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f1f5f9' },
  detailImage: { width: SCREEN_WIDTH - 32, height: 300, resizeMode: 'cover' },
  detailContent: { backgroundColor: '#fff', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  detailTitle: { fontSize: 26, fontWeight: '900', color: '#0f172a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: -0.5 },
  detailPrice: { fontSize: 36, fontWeight: '900', color: '#dc2626', marginBottom: 12 },
  detailType: { color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 20 },
  detailSectionTitle: { fontSize: 12, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1 },
  detailDescription: { fontSize: 16, color: '#334155', lineHeight: 26, fontWeight: '500' },
  detailSellerEmail: { fontSize: 16, color: '#111827', fontWeight: '800' },
  
  // --- MODAL ---
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.98)', justifyContent: 'center' },
  modalCloseButton: { position: 'absolute', top: 60, right: 20, zIndex: 10, padding: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
  modalCloseText: { color: '#fff', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  modalScrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: SCREEN_WIDTH, height: '100%' },
});