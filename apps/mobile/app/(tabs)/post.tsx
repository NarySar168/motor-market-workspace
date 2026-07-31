import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import { LISTINGS_URL } from '../../constants/api';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../constants/theme';

export default function PostScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // --- CONFIGURATION ---
  const HARDCODED_USER_ID = "9b9a712f-205a-43d1-82e8-8dcf57071923"; 
  const CLOUD_NAME = "dozcgwtqo"; 
  const UPLOAD_PRESET = "motor_market_cars";
  const RUST_API_URL = LISTINGS_URL;

  // --- STATE ---
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
        // Instantly switch over to the Live Feed tab using Expo Router
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
    <SafeAreaView style={styles.safeArea}>
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
            <TouchableOpacity style={[styles.typeButton, vehicleType === 'car' && styles.typeButtonActive]} onPress={() => setVehicleType('car')}>
              <Text style={[styles.typeText, vehicleType === 'car' && styles.typeTextActive]}>🚗 Car</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.typeButton, vehicleType === 'motorcycle' && styles.typeButtonActive]} onPress={() => setVehicleType('motorcycle')}>
              <Text style={[styles.typeText, vehicleType === 'motorcycle' && styles.typeTextActive]}>🏍️ Motorcycle</Text>
            </TouchableOpacity>
          </View>

          <TextInput style={styles.input} placeholder="Make (e.g. Honda)" placeholderTextColor={colors.muted} value={make} onChangeText={setMake} />
          <TextInput style={styles.input} placeholder="Model (e.g. Civic)" placeholderTextColor={colors.muted} value={model} onChangeText={setModel} />
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} placeholder="Year" placeholderTextColor={colors.muted} keyboardType="numeric" value={year} onChangeText={setYear} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Price (USD)" placeholderTextColor={colors.muted} keyboardType="numeric" value={price} onChangeText={setPrice} />
          </View>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Description" placeholderTextColor={colors.muted} multiline numberOfLines={4} value={description} onChangeText={setDescription} />

          {status ? <Text style={styles.statusText}>{status}</Text> : null}
          <TouchableOpacity style={[styles.submitButton, isUploading && styles.disabledButton]} onPress={submitListing} disabled={isUploading}>
            {isUploading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.submitButtonText}>Post to Marketplace</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: c.bg },
  scrollContent: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 40 },
  header: { fontSize: 28, fontWeight: 'bold', color: c.text, marginBottom: 15 },
  typeSelector: { flexDirection: 'row', gap: 10 },
  typeButton: { flex: 1, paddingVertical: 15, borderRadius: 10, borderWidth: 1, borderColor: c.border, alignItems: 'center', backgroundColor: c.surface },
  typeButtonActive: { borderColor: c.accent, backgroundColor: c.surfaceAlt, borderWidth: 2 },
  typeText: { fontSize: 16, color: c.muted, fontWeight: '600' },
  typeTextActive: { color: c.accent, fontWeight: 'bold' },
  imageSection: { marginBottom: 20 },
  photoButton: { backgroundColor: c.surfaceAlt, padding: 15, borderRadius: 10, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: c.border },
  photoButtonText: { color: c.muted, fontWeight: 'bold' },
  thumbnailContainer: { flexDirection: 'row', marginTop: 15 },
  thumbnail: { width: 80, height: 80, borderRadius: 10, marginRight: 10 },
  form: { gap: 15 },
  row: { flexDirection: 'row' },
  input: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, padding: 15, borderRadius: 10, fontSize: 16, color: c.text },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: c.accent, padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  disabledButton: { backgroundColor: c.muted },
  submitButtonText: { color: c.onPrimary, fontWeight: 'bold', fontSize: 16 },
  statusText: { textAlign: 'center', fontWeight: 'bold', color: c.text, marginTop: 10 },
});