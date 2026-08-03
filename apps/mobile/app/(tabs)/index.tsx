import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, FlatList, SafeAreaView, Dimensions, Modal, Animated, Easing } from 'react-native';
import { LISTINGS_URL } from '../../constants/api';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { LANGS } from '../../constants/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(300, SCREEN_WIDTH * 0.78);
const RUST_API_URL = LISTINGS_URL;

// Homepage concept content — kept generic/honest, no fabricated APR numbers,
// star ratings, or "X sold" style claims. See scratchpad/homepage.html source.
// Text below is resolved via translation keys (constants/i18n.ts) at render
// time so it stays in sync with the active language.
const TRUST_ITEM_KEYS = [
  'trust.inspected',
  'trust.financing',
  'trust.cashOffers',
  'trust.pricing',
  'trust.locallyOwned',
];

const VALUE_PROP_KEYS = [
  {
    icon: '🔍',
    titleKey: 'valueProps.search.title',
    bodyKey: 'valueProps.search.body',
  },
  {
    icon: '🏬',
    titleKey: 'valueProps.visit.title',
    bodyKey: 'valueProps.visit.body',
  },
  {
    icon: '🔑',
    titleKey: 'valueProps.testDrive.title',
    bodyKey: 'valueProps.testDrive.body',
  },
];

const FINANCE_POINT_KEYS = [
  'financing.point.allCredit',
  'financing.point.softCheck',
  'financing.point.quickDecision',
];

// Proper nouns — never translated.
const BRANDS = ['Toyota', 'Honda', 'BMW', 'Lexus', 'Ford', 'Audi', 'Hyundai'];

function Eyebrow({ children, styles }: { children: React.ReactNode; styles: any }) {
  return (
    <View style={styles.eyebrowRow}>
      <View style={styles.eyebrowLine} />
      <Text style={styles.eyebrowText}>{children}</Text>
    </View>
  );
}

// Auto-rotating hero built from the first 3 real listings. Always renders on a
// dark scrim (matches the approved concept) regardless of light/dark theme.
function HeroCarousel({
  listings,
  colors,
  styles,
  onSelect,
}: {
  listings: any[];
  colors: ThemeColors;
  styles: any;
  onSelect: (item: any) => void;
}) {
  const { t } = useLanguage();
  const slides = (Array.isArray(listings) ? listings : []).slice(0, 3);
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (index >= slides.length) {
      setIndex(0);
    }
  }, [slides.length, index]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setIndex((prev) => (prev + 1) % slides.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, fadeAnim]);

  if (slides.length === 0) {
    return (
      <View style={styles.heroWrap}>
        <View style={[styles.heroSlide, styles.heroFallback]}>
          <Text style={styles.heroFallbackBrand}>
            NR <Text style={{ fontWeight: '300', color: 'rgba(255,255,255,0.7)' }}>MotorMarket</Text>
          </Text>
          <Text style={styles.heroFallbackTag}>{t('common.tagline')}</Text>
        </View>
      </View>
    );
  }

  const item = slides[Math.min(index, slides.length - 1)];
  const image = item?.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : null;

  return (
    <View style={styles.heroWrap}>
      <Animated.View style={[styles.heroSlide, { opacity: fadeAnim }]}>
        {image ? (
          <Image source={{ uri: image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceAlt }]} />
        )}
        <View style={styles.heroScrim} />
        <View style={styles.heroTextBg} />
        <View style={styles.heroContent}>
          <Text style={styles.heroEyebrow}>{t('hero.eyebrow')}</Text>
          <Text style={styles.heroTitle}>
            {item.year} {item.make} <Text style={{ fontWeight: '400' }}>{item.model}</Text>
          </Text>
          <View style={styles.heroMetaRow}>
            <Text style={styles.heroPrice}>
              ${(item.price / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
            <View style={styles.financeChip}>
              <Text style={styles.financeChipText}>{t('hero.financingAvailable')}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.heroCta} onPress={() => onSelect(item)}>
            <Text style={styles.heroCtaText}>{t('hero.viewDetails')} →</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {slides.length > 1 && (
        <View style={styles.heroDots}>
          {slides.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setIndex(i)}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
              style={[styles.heroDot, i === index && styles.heroDotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function FeedScreen() {
  const { colors, isDark, toggle } = useTheme();
  const { t, lang, setLang } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
    { key: 'home', label: t('nav.home'), icon: '🏠', onPress: () => setSelectedListing(null) },
    { key: 'inventory', label: t('nav.inventory'), icon: '🚗', onPress: () => setSelectedListing(null) },
    { key: 'financing', label: t('nav.financing'), icon: '💳', onPress: () => alert('Navigate to Financing') },
    { key: 'aboutUs', label: t('nav.aboutUs'), icon: 'ℹ️', onPress: () => alert('Navigate to About Us') },
    { key: 'adminAccess', label: t('nav.adminAccess'), icon: '⚙️', onPress: () => alert('Navigate to Admin screen') },
    { key: 'darkMode', label: t('drawer.darkMode'), icon: isDark ? '☀️' : '🌙', onPress: () => toggle() },
  ];

  const vehicleTypeLabel = (rawType: string | undefined) => {
    if (!rawType) return '—';
    const normalized = rawType.toLowerCase();
    if (normalized === 'car') return t('inventory.type.car');
    if (normalized === 'motorcycle') return t('inventory.type.motorcycle');
    return rawType;
  };

  const renderFeedItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => setSelectedListing(item)}>
      <View style={{ position: 'relative' }}>
        {item.image_urls && item.image_urls.length > 0 ? (
          <Image source={{ uri: item.image_urls[0] }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>{t('inventory.noPhoto')}</Text>
          </View>
        )}
        {item.vehicle_type && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{vehicleTypeLabel(item.vehicle_type)}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.year} {item.make} <Text style={{fontWeight: '400', color: colors.muted}}>{item.model}</Text></Text>

        <View style={styles.specRow}>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>{t('inventory.year')}</Text>
            <Text style={styles.specValue}>{item.year}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>{t('inventory.type')}</Text>
            <Text style={styles.specValue}>{vehicleTypeLabel(item.vehicle_type)}</Text>
          </View>
        </View>

        <Text style={styles.cardPrice}>${(item.price / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>

        {/* Updated Web-Style Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => setSelectedListing(item)}
          >
            <Text style={styles.detailsBtnText}>{t('inventory.view')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => alert(`Contacting ${item.seller_email}`)}
          >
            <Text style={styles.contactBtnText}>{t('inventory.contact')}</Text>
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
            <Text style={styles.brandTitle} numberOfLines={1} adjustsFontSizeToFit>
              NR <Text style={styles.brandLight}>MotorMarket</Text>
            </Text>
            <Text style={styles.brandSubtitle}>{t('common.tagline')}</Text>
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
          <ScrollView contentContainerStyle={styles.detailScrollContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedListing(null)}>
              <Text style={styles.backButtonText}>← {t('listing.backToInventory')}</Text>
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
                <View style={[styles.detailImage, styles.placeholderImage]}><Text style={styles.placeholderText}>{t('listing.noPhotosAvailable')}</Text></View>
              )}
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>{selectedListing.year} {selectedListing.make} {selectedListing.model}</Text>
              <Text style={styles.detailPrice}>${(selectedListing.price / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>

              {selectedListing.vehicle_type && (
                <Text style={styles.detailType}>{t('inventory.type')}: {vehicleTypeLabel(selectedListing.vehicle_type)}</Text>
              )}

              <View style={styles.divider} />
              <Text style={styles.detailSectionTitle}>{t('listing.vehicleDescription')}</Text>
              <Text style={styles.detailDescription}>{selectedListing.description || t('listing.noDescription')}</Text>

              <View style={styles.divider} />
              <Text style={styles.detailSectionTitle}>{t('listing.seller')}</Text>
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

            // Homepage concept sections, adapted from scratchpad/homepage.html,
            // wired to real listings via the FlatList header.
            ListHeaderComponent={(
              <View>
                <HeroCarousel listings={feed} colors={colors} styles={styles} onSelect={setSelectedListing} />

                {/* TRUST PROMISE STRIP */}
                <View style={styles.trustStrip}>
                  {TRUST_ITEM_KEYS.map((key) => (
                    <View key={key} style={styles.trustItem}>
                      <Text style={styles.trustCheck}>✓</Text>
                      <Text style={styles.trustText}>{t(key)}</Text>
                    </View>
                  ))}
                </View>

                {/* VALUE PROPS */}
                <View style={styles.paddedSection}>
                  <Eyebrow styles={styles}>{t('valueProps.eyebrow')}</Eyebrow>
                  <Text style={styles.sectionTitle}>{t('valueProps.heading')}</Text>
                  <View style={styles.valueProps}>
                    {VALUE_PROP_KEYS.map((v) => (
                      <View key={v.titleKey} style={styles.valueCard}>
                        <View style={styles.valueIconWrap}>
                          <Text style={styles.valueIcon}>{v.icon}</Text>
                        </View>
                        <Text style={styles.valueTitle}>{t(v.titleKey)}</Text>
                        <Text style={styles.valueBody}>{t(v.bodyKey)}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* SEARCH & FILTERS */}
                <View style={styles.paddedSection}>
                  <Eyebrow styles={styles}>{t('inventory.eyebrow')}</Eyebrow>
                  <Text style={styles.sectionTitle}>{t('inventory.heading')}</Text>
                  <View style={styles.filterContainer}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder={t('inventory.searchPlaceholder')}
                      placeholderTextColor={colors.muted}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                    <View style={styles.filterRow}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typePills}>
                        <TouchableOpacity onPress={() => setTypeFilter('All')} style={[styles.pill, typeFilter === 'All' && styles.pillActive]}>
                          <Text style={[styles.pillText, typeFilter === 'All' && styles.pillTextActive]}>{t('inventory.filter.all')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setTypeFilter('car')} style={[styles.pill, typeFilter === 'car' && styles.pillActive]}>
                          <Text style={[styles.pillText, typeFilter === 'car' && styles.pillTextActive]}>🚗 {t('inventory.filter.cars')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setTypeFilter('motorcycle')} style={[styles.pill, typeFilter === 'motorcycle' && styles.pillActive]}>
                          <Text style={[styles.pillText, typeFilter === 'motorcycle' && styles.pillTextActive]}>🏍️ {t('inventory.filter.motorcycles')}</Text>
                        </TouchableOpacity>
                      </ScrollView>
                      <TextInput
                        style={styles.priceInput}
                        placeholder={t('inventory.maxPricePlaceholder')}
                        placeholderTextColor={colors.muted}
                        keyboardType="numeric"
                        value={maxPrice}
                        onChangeText={setMaxPrice}
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}

            ListFooterComponent={(
              <View>
                {/* FINANCING BAND */}
                <View style={styles.financeBand}>
                  <View style={styles.financeBandAccent} />
                  <View style={styles.financeBandContent}>
                    <Eyebrow styles={styles}>{t('financing.eyebrow')}</Eyebrow>
                    <Text style={styles.financeBandTitle}>{t('financing.heading')}</Text>
                    <Text style={styles.financeBandBody}>
                      {t('financing.body')}
                    </Text>
                    <View style={styles.financePoints}>
                      {FINANCE_POINT_KEYS.map((key) => (
                        <Text key={key} style={styles.financePoint}>✓ {t(key)}</Text>
                      ))}
                    </View>
                    <TouchableOpacity style={styles.applyBtn} onPress={() => alert('Financing application coming soon')}>
                      <Text style={styles.applyBtnText}>{t('financing.cta')} →</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* TRADE-IN */}
                <View style={styles.paddedSection}>
                  <View style={styles.tradeCard}>
                    <Eyebrow styles={styles}>{t('tradeIn.eyebrow')}</Eyebrow>
                    <Text style={styles.tradeTitle}>{t('tradeIn.heading')}</Text>
                    <Text style={styles.tradeBody}>
                      {t('tradeIn.body')}
                    </Text>
                    <TouchableOpacity style={styles.tradeBtn} onPress={() => alert('Trade-in valuation coming soon')}>
                      <Text style={styles.tradeBtnText}>{t('tradeIn.cta')} →</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* BRAND STRIP (proper nouns — never translated) */}
                <View style={styles.brandStrip}>
                  {BRANDS.map((b) => (
                    <Text key={b} style={styles.brandText}>{b}</Text>
                  ))}
                </View>

                {/* FOOTER */}
                <View style={styles.footer}>
                  <Text style={styles.footerBrand}>
                    NR <Text style={styles.footerBrandLight}>MotorMarket</Text>
                  </Text>
                  <Text style={styles.footerTagline}>{t('common.tagline')}</Text>
                  <View style={styles.footerContactRow}>
                    <Text style={styles.footerContactText}>{t('common.location')}</Text>
                    <Text style={styles.footerContactText}>(888) 123-4567</Text>
                  </View>
                  <View style={styles.footerDivider} />
                  <Text style={styles.footerCopyright}>{t('footer.copyright')}</Text>
                </View>
              </View>
            )}

            ListEmptyComponent={
              !isLoadingFeed ? (
                <View style={{ marginTop: 40, paddingHorizontal: 20, alignItems: 'center' }}>
                  <Text style={{ color: colors.muted, fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>{t('inventory.noResults.body')}</Text>
                  <TouchableOpacity onPress={() => { setSearchQuery(""); setTypeFilter("All"); setMaxPrice(""); }} style={{ marginTop: 15 }}>
                    <Text style={{ color: colors.primary, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>{t('inventory.clearFilters')}</Text>
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
                    key={item.key}
                    style={styles.drawerItem}
                    onPress={() => { closeMenu(); item.onPress(); }}
                  >
                    <Text style={styles.drawerItemIcon}>{item.icon}</Text>
                    <Text style={[styles.drawerItemText, item.key === 'adminAccess' && { color: colors.primary }]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* LANGUAGE SWITCHER */}
              <View style={styles.drawerLanguageSection}>
                <Text style={styles.drawerLanguageLabel}>{t('drawer.language')}</Text>
                <View style={styles.drawerLanguageRow}>
                  {LANGS.map((l) => (
                    <TouchableOpacity
                      key={l.code}
                      onPress={() => setLang(l.code)}
                      style={[styles.langPill, lang === l.code && styles.langPillActive]}
                    >
                      <Text style={[styles.langPillText, lang === l.code && styles.langPillTextActive]}>{l.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Spacer to push contact info to the bottom */}
              <View style={{ flex: 1 }} />

              {/* Contact Footer pulled from Web Layout */}
              <View style={styles.drawerFooter}>
                <Text style={styles.drawerContactPhone}>(888) 123-4567</Text>
                <Text style={styles.drawerContactLocation}>{t('common.location')}</Text>
              </View>

            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>

      {/* FULL SCREEN ZOOM MODAL */}
      <Modal visible={!!zoomedImage} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setZoomedImage(null)}>
            <Text style={styles.modalCloseText}>✕ {t('listing.close')}</Text>
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

const createStyles = (c: ThemeColors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: c.bg },
  container: { flex: 1 },

  // --- PREMIUM HEADER ---
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: c.surface,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
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
    color: c.text,
    letterSpacing: -0.5,
  },
  brandLight: {
    fontWeight: '300',
    color: c.muted,
  },
  brandSubtitle: {
    fontSize: 12,
    color: c.primary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginLeft: 8,
  },
  menuBar: {
    width: 20,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: c.accent,
  },

  // --- SLIDE-OUT MENU ---
  drawerRoot: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  drawerBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: c.overlay },
  drawerPanel: { height: '100%', backgroundColor: c.surface, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 16 },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: c.border },
  drawerLogo: { width: 48, height: 48 },
  drawerClose: { fontSize: 20, color: c.muted, fontWeight: '600' },
  drawerItems: { paddingTop: 8 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: c.surfaceAlt },
  drawerItemIcon: { fontSize: 20, marginRight: 16, width: 24, textAlign: 'center' },
  drawerItemText: { fontSize: 16, fontWeight: '700', color: c.text },

  // Drawer Footer
  drawerFooter: { padding: 20, borderTopWidth: 1, borderTopColor: c.border, alignItems: 'center', marginBottom: 20 },
  drawerContactPhone: { fontSize: 20, fontWeight: '900', color: c.text, marginBottom: 4 },
  drawerContactLocation: { fontSize: 12, color: c.muted, fontWeight: '600' },

  // Drawer Language Switcher
  drawerLanguageSection: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: c.surfaceAlt },
  drawerLanguageLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: c.muted, marginBottom: 10 },
  drawerLanguageRow: { flexDirection: 'row', gap: 8 },
  langPill: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceAlt, alignItems: 'center' },
  langPillActive: { backgroundColor: c.primary, borderColor: c.primary },
  langPillText: { fontSize: 13, fontWeight: '700', color: c.text },
  langPillTextActive: { color: c.onPrimary },

  // --- SHARED SECTION HELPERS ---
  paddedSection: { paddingHorizontal: 16, marginBottom: 28 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  eyebrowLine: { width: 18, height: 2, borderRadius: 1, backgroundColor: c.primary },
  eyebrowText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', color: c.primary },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: c.text, textTransform: 'uppercase', letterSpacing: -0.5, marginBottom: 16 },

  // --- HERO CAROUSEL (always dark, per design) ---
  heroWrap: { width: '100%', height: 340, backgroundColor: '#0A0C0F', position: 'relative', marginBottom: 24, overflow: 'hidden' },
  heroSlide: { ...StyleSheet.absoluteFill },
  heroFallback: { alignItems: 'center', justifyContent: 'center' },
  heroFallbackBrand: { fontSize: 30, fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: -0.5 },
  heroFallbackTag: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 8 },
  heroScrim: { ...StyleSheet.absoluteFill, backgroundColor: c.overlay },
  heroTextBg: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '62%', backgroundColor: 'rgba(0,0,0,0.55)' },
  heroContent: { position: 'absolute', left: 20, right: 20, bottom: 36 },
  heroEyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginBottom: 8 },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: -0.5, marginBottom: 10 },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  heroPrice: { fontSize: 24, fontWeight: '900', color: c.primary },
  financeChip: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  financeChipText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  heroCta: { backgroundColor: c.primary, alignSelf: 'flex-start', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999 },
  heroCtaText: { color: c.onPrimary, fontWeight: '900', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
  heroDots: { position: 'absolute', left: 0, right: 0, bottom: 12, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  heroDot: { width: 18, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' },
  heroDotActive: { backgroundColor: c.primary },

  // --- TRUST PROMISE STRIP ---
  trustStrip: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: c.surfaceAlt, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.border, paddingVertical: 14, paddingHorizontal: 12, marginBottom: 24 },
  trustItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, marginVertical: 4 },
  trustCheck: { color: c.primary, fontWeight: '900', marginRight: 6, fontSize: 13 },
  trustText: { color: c.muted, fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 },

  // --- VALUE PROPS ---
  valueProps: { gap: 14 },
  valueCard: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 20 },
  valueIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: c.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  valueIcon: { fontSize: 20 },
  valueTitle: { fontSize: 16, fontWeight: '800', color: c.text, marginBottom: 4 },
  valueBody: { fontSize: 13, color: c.muted, lineHeight: 19 },

  // --- SEARCH & FILTERS (RED THEME) ---
  filterContainer: { marginBottom: 0 },
  searchInput: { backgroundColor: c.surface, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: c.border, marginBottom: 12, fontSize: 16, fontWeight: '500', color: c.text },
  filterRow: { flexDirection: 'row', alignItems: 'center' },
  typePills: { flex: 1, marginRight: 10 },
  pill: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: c.surface, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: c.border },
  pillActive: { backgroundColor: c.surfaceAlt, borderColor: c.primary },
  pillText: { color: c.muted, fontWeight: '700', fontSize: 14 },
  pillTextActive: { color: c.primary },
  priceInput: { width: 90, backgroundColor: c.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: c.border, fontSize: 14, textAlign: 'center', fontWeight: '600', color: c.text },

  // --- VEHICLE CARDS ---
  card: { backgroundColor: c.surface, borderRadius: 16, marginHorizontal: 16, marginBottom: 24, overflow: 'hidden', borderWidth: 1, borderColor: c.border, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
  cardImage: { width: '100%', height: 220, backgroundColor: c.bg },
  placeholderImage: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: c.muted, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  typeBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: c.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  typeBadgeText: { color: c.onPrimary, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },

  cardContent: { padding: 16 },
  cardTitle: { fontSize: 20, fontWeight: '900', color: c.text, marginBottom: 4, textTransform: 'uppercase' },
  cardPrice: { fontSize: 26, fontWeight: '900', color: c.primary, marginBottom: 16 },

  // Spec row (Year / Type only — no mileage/fuel/transmission in the real data)
  specRow: { flexDirection: 'row', gap: 24, borderTopWidth: 1, borderTopColor: c.border, marginTop: 10, paddingTop: 10, marginBottom: 12 },
  specItem: { flexDirection: 'column' },
  specLabel: { fontSize: 10, fontWeight: '800', color: c.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
  specValue: { fontSize: 13, fontWeight: '700', color: c.text },

  // Action Buttons
  actionRow: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 16 },
  detailsBtn: { flex: 1, backgroundColor: c.surfaceAlt, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  detailsBtnText: { color: c.text, fontWeight: '800', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  contactBtn: { flex: 1, backgroundColor: c.contactBg, paddingVertical: 12, borderRadius: 10, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  contactBtnText: { color: c.onContact, fontWeight: '800', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 },

  // --- FINANCING BAND ---
  financeBand: { flexDirection: 'row', backgroundColor: c.surfaceAlt, marginBottom: 24, overflow: 'hidden' },
  financeBandAccent: { width: 5, backgroundColor: c.primary },
  financeBandContent: { flex: 1, padding: 24 },
  financeBandTitle: { fontSize: 22, fontWeight: '900', color: c.text, textTransform: 'uppercase', letterSpacing: -0.5, marginTop: 4, marginBottom: 10 },
  financeBandBody: { fontSize: 14, color: c.muted, lineHeight: 21, marginBottom: 16 },
  financePoints: { marginBottom: 20, gap: 8 },
  financePoint: { fontSize: 13, fontWeight: '700', color: c.text },
  applyBtn: { backgroundColor: c.primary, paddingVertical: 14, borderRadius: 999, alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 24 },
  applyBtnText: { color: c.onPrimary, fontWeight: '900', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 },

  // --- TRADE-IN ---
  tradeCard: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 22 },
  tradeTitle: { fontSize: 18, fontWeight: '900', color: c.text, textTransform: 'uppercase', letterSpacing: -0.3, marginBottom: 8 },
  tradeBody: { fontSize: 13, color: c.muted, lineHeight: 19, marginBottom: 16 },
  tradeBtn: { backgroundColor: c.primary, paddingVertical: 13, borderRadius: 999, alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 22 },
  tradeBtnText: { color: c.onPrimary, fontWeight: '900', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },

  // --- BRAND STRIP ---
  brandStrip: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: c.surfaceAlt, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.border, paddingVertical: 20, paddingHorizontal: 16, marginBottom: 24, gap: 20 },
  brandText: { fontSize: 14, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase', color: c.muted },

  // --- FOOTER ---
  footer: { backgroundColor: c.surface, paddingHorizontal: 20, paddingVertical: 32, alignItems: 'center' },
  footerBrand: { fontSize: 20, fontWeight: '900', color: c.text, letterSpacing: -0.5, textTransform: 'uppercase' },
  footerBrandLight: { fontWeight: '300', color: c.muted },
  footerTagline: { fontSize: 12, color: c.primary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 },
  footerContactRow: { flexDirection: 'row', gap: 16, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' },
  footerContactText: { fontSize: 13, color: c.muted, fontWeight: '600' },
  footerDivider: { height: 1, backgroundColor: c.border, width: '100%', marginTop: 22, marginBottom: 14 },
  footerCopyright: { fontSize: 11, color: c.muted, textAlign: 'center' },

  // --- DETAILS VIEW ---
  detailScrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  backButton: { paddingVertical: 12, marginBottom: 5 },
  backButtonText: { color: c.primary, fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailImageContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 20, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
  detailImage: { width: SCREEN_WIDTH - 32, height: 300, resizeMode: 'cover' },
  detailContent: { backgroundColor: c.surface, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: c.border },
  detailTitle: { fontSize: 26, fontWeight: '900', color: c.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: -0.5 },
  detailPrice: { fontSize: 36, fontWeight: '900', color: c.primary, marginBottom: 12 },
  detailType: { color: c.muted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 },
  divider: { height: 1, backgroundColor: c.border, marginVertical: 20 },
  detailSectionTitle: { fontSize: 12, fontWeight: '900', color: c.muted, textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1 },
  detailDescription: { fontSize: 16, color: c.text, lineHeight: 26, fontWeight: '500' },
  detailSellerEmail: { fontSize: 16, color: c.text, fontWeight: '800' },

  // --- MODAL (media viewer stays black regardless of theme) ---
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.98)', justifyContent: 'center' },
  modalCloseButton: { position: 'absolute', top: 60, right: 20, zIndex: 10, padding: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
  modalCloseText: { color: '#fff', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  modalScrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: SCREEN_WIDTH, height: '100%' },
});
