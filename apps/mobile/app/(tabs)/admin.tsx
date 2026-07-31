import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, FlatList, SafeAreaView, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { useNavigation } from 'expo-router';
import { LISTINGS_URL } from '../../constants/api';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../constants/theme';

const RUST_API_URL = LISTINGS_URL;

export default function AdminScreen() {
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // --- FULL EDIT MODAL STATE ---
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [editVehicleType, setEditVehicleType] = useState<'car' | 'motorcycle'>('car');
  const [editMake, setEditMake] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFeed();
    });
    return unsubscribe;
  }, [navigation]);

  // --- EDIT LOGIC ---
  const handleEditOpen = (item: any) => {
    setEditingListing(item);
    
    // Pre-fill all the fields with the current database data
    setEditVehicleType(item.vehicle_type || 'car');
    setEditMake(item.make || "");
    setEditModel(item.model || "");
    setEditYear(item.year ? item.year.toString() : "");
    setEditPrice((item.price / 100).toString());
    setEditDescription(item.description || "");
  };

  const submitEdit = async () => {
    if (!editMake || !editModel || !editYear || !editPrice) {
      Alert.alert("Required", "Please fill out all required fields (Make, Model, Year, Price).");
      return;
    }

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
          vehicle_type: editVehicleType,
        }),
      });

      if (!res.ok) throw new Error("Failed to update listing on server");

      setEditingListing(null);
      fetchFeed(); // Refresh the list to show the new details
      
    } catch (error) {
      console.error("Edit failed:", error);
      Alert.alert("Error", "Failed to update the vehicle.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- DELETE LOGIC ---
  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Vehicle",
      "Are you sure you want to delete this listing? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            setFeed(currentFeed => currentFeed.filter(car => car.id !== id));
            try {
              const res = await fetch(`${RUST_API_URL}/${id}`, { method: 'DELETE' });
              if (!res.ok) throw new Error("Failed to delete on server");
            } catch (error) {
              console.error("Delete failed:", error);
              Alert.alert("Error", "Failed to delete the vehicle. Refreshing list.");
              fetchFeed();
            }
          }
        }
      ]
    );
  };

  const renderAdminItem = ({ item }: { item: any }) => (
    <View style={styles.adminCard}>
      <View style={styles.adminCardInfo}>
        <Text style={styles.adminCardTitle}>{item.year} {item.make} {item.model}</Text>
        <Text style={styles.adminCardPrice}>${(item.price / 100).toLocaleString()}</Text>
        <Text style={styles.adminCardId}>ID: {item.id.split('-')[0].toUpperCase()}</Text>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEditOpen(item)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Admin Dashboard</Text>
        <Text style={{ color: colors.muted, marginBottom: 15 }}>Manage your live inventory.</Text>

        {isLoadingFeed ? (
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 50 }} />
        ) : feed.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 50, color: colors.muted }}>No vehicles in inventory.</Text>
        ) : (
          <FlatList
            data={feed}
            keyExtractor={(item) => item.id}
            renderItem={renderAdminItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshing={isLoadingFeed}
            onRefresh={fetchFeed}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* FULL EDIT LISTING MODAL */}
      <Modal visible={!!editingListing} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Listing</Text>
              <TouchableOpacity onPress={() => setEditingListing(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {editingListing && (
              <ScrollView showsVerticalScrollIndicator={false}>
                
                <Text style={styles.label}>Vehicle Type</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity style={[styles.typeButton, editVehicleType === 'car' && styles.typeButtonActive]} onPress={() => setEditVehicleType('car')}>
                    <Text style={[styles.typeText, editVehicleType === 'car' && styles.typeTextActive]}>🚗 Car</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.typeButton, editVehicleType === 'motorcycle' && styles.typeButtonActive]} onPress={() => setEditVehicleType('motorcycle')}>
                    <Text style={[styles.typeText, editVehicleType === 'motorcycle' && styles.typeTextActive]}>🏍️ Motorcycle</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Make</Text>
                <TextInput style={styles.input} value={editMake} onChangeText={setEditMake} />

                <Text style={styles.label}>Model</Text>
                <TextInput style={styles.input} value={editModel} onChangeText={setEditModel} />

                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.label}>Year</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={editYear} onChangeText={setEditYear} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Price (USD)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={editPrice} onChangeText={setEditPrice} />
                  </View>
                </View>

                <Text style={styles.label}>Description</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  multiline 
                  numberOfLines={4} 
                  value={editDescription} 
                  onChangeText={setEditDescription} 
                />

                <TouchableOpacity 
                  style={[styles.saveButton, isSaving && styles.disabledButton]} 
                  onPress={submitEdit} 
                  disabled={isSaving}
                >
                  {isSaving ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                </TouchableOpacity>
              </ScrollView>
            )}

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: c.bg },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  header: { fontSize: 28, fontWeight: 'bold', color: c.text, marginBottom: 5 },
  adminCard: { flexDirection: 'row', backgroundColor: c.surface, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'space-between' },
  adminCardInfo: { flex: 1, paddingRight: 10 },
  adminCardTitle: { fontSize: 16, fontWeight: 'bold', color: c.text },
  adminCardPrice: { fontSize: 14, color: '#16a34a', fontWeight: '600', marginTop: 4 },
  adminCardId: { fontSize: 12, color: c.muted, marginTop: 4, fontFamily: 'monospace' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  editButton: { backgroundColor: c.surfaceAlt, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: c.accent },
  editButtonText: { color: c.accent, fontWeight: 'bold', fontSize: 14 },
  deleteButton: { backgroundColor: c.surfaceAlt, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: c.primary },
  deleteButtonText: { color: c.primary, fontWeight: 'bold', fontSize: 14 },

  // Edit Modal Styles
  modalOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: c.text },
  modalCloseText: { fontSize: 24, color: c.muted, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: 'bold', color: c.muted, marginBottom: 8 },
  input: { backgroundColor: c.bg, borderWidth: 1, borderColor: c.border, padding: 15, borderRadius: 10, fontSize: 16, marginBottom: 15, color: c.text },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  saveButton: { backgroundColor: c.accent, padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 5, marginBottom: 30 },
  disabledButton: { backgroundColor: c.muted },
  saveButtonText: { color: c.onPrimary, fontWeight: 'bold', fontSize: 16 },

  // Vehicle Type Toggle Styles
  typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  typeButton: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: c.border, alignItems: 'center', backgroundColor: c.bg },
  typeButtonActive: { borderColor: c.accent, backgroundColor: c.surfaceAlt, borderWidth: 2 },
  typeText: { fontSize: 14, color: c.muted, fontWeight: '600' },
  typeTextActive: { color: c.accent, fontWeight: 'bold' },
});