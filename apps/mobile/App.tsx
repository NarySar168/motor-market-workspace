import "./global.css";
import { useEffect, useState } from "react";
import { Text, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Button } from "@repo/ui";

interface User {
  id: string;
  email: string;
  status: string;
}

export default function App() {
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
  const [listingStatus, setListingStatus] = useState("");

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

  useEffect(() => {
    fetchStatus();
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!email || !firstName || !lastName) {
      setInsertStatus("⚠️ Please fill out all fields.");
      return;
    }
    setInsertStatus("Creating user...");
    try {
      const res = await fetch("http://127.0.0.1:8080/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        }),
      });

      if (!res.ok) {
        setInsertStatus("❌ Error: Database rejected this (Duplicate email?)");
        return;
      }

      const data = await res.json();
      setInsertStatus(`✅ Success! UUID:\n${data.id}`);
      setEmail(""); setFirstName(""); setLastName("");
      fetchUsers();
    } catch (error) {
      setInsertStatus("❌ Network error connecting to Rust.");
    }
  };

  const handleCreateListing = async () => {
    if (!selectedUserId) {
      setListingStatus("⚠️ Please select a user to post this car.");
      return;
    }
    if (!make || !model || !year || !price) {
      setListingStatus("⚠️ Please fill out Make, Model, Year, and Price.");
      return;
    }

    setListingStatus("Posting vehicle...");

    try {
      const res = await fetch("http://127.0.0.1:8080/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedUserId,
          make: make.trim(),
          model: model.trim(),
          year: parseInt(year),
          price: Math.round(parseFloat(price) * 100),
          description: description.trim() || null,
        }),
      });

      if (!res.ok) {
        setListingStatus("❌ Error: Failed to insert vehicle.");
        return;
      }

      const data = await res.json();
      setListingStatus(`✅ Success! Vehicle Posted:\n${data.make} ${data.model}`);
      
      setMake(""); setModel(""); setYear(""); setPrice(""); setDescription("");
      
    } catch (error) {
      setListingStatus("❌ Network error connecting to Rust.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', padding: 24, paddingTop: 60 }} className="bg-slate-50">
      <Text className="text-3xl font-bold mb-4 text-slate-900 text-center">
        Motor Market
      </Text>
      
      <View className="bg-green-100 border border-green-400 px-4 py-3 rounded-lg mb-6 w-full max-w-sm shadow-sm">
        <Text className="text-green-800 text-center font-bold">
          Backend Status: {backendMessage}
        </Text>
      </View>

      <View className="bg-white p-6 rounded-xl shadow-md border border-slate-200 w-full max-w-sm mb-6">
        <Text className="text-xl font-semibold mb-5 text-slate-800 text-center">Create New User</Text>
        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-1">Email</Text>
          <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" className="w-full px-3 py-3 border border-slate-300 rounded-md text-slate-900 bg-slate-50" placeholder="user@example.com" />
        </View>
        <View className="flex-row space-x-3 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-700 mb-1">First Name</Text>
            <TextInput value={firstName} onChangeText={setFirstName} className="w-full px-3 py-3 border border-slate-300 rounded-md text-slate-900 bg-slate-50" placeholder="John" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-700 mb-1">Last Name</Text>
            <TextInput value={lastName} onChangeText={setLastName} className="w-full px-3 py-3 border border-slate-300 rounded-md text-slate-900 bg-slate-50" placeholder="Doe" />
          </View>
        </View>
        <TouchableOpacity onPress={handleCreateUser} className="w-full bg-slate-900 py-3 rounded-lg mt-2 items-center active:bg-slate-800">
          <Text className="text-white font-bold text-base">Insert User</Text>
        </TouchableOpacity>
        
        {/* Switched to strict ternary operator to prevent empty string crashes */}
        {insertStatus ? (
          <View className={`mt-5 p-3 rounded-lg border items-center ${insertStatus.includes('Error') || insertStatus.includes('⚠️') ? 'bg-red-50 border-red-200' : 'bg-slate-100 border-slate-200'}`}>
            <Text className={`text-sm text-center font-medium ${insertStatus.includes('Error') || insertStatus.includes('⚠️') ? 'text-red-700' : 'text-slate-700'}`}>{insertStatus}</Text>
          </View>
        ) : null}
      </View>

      <View className="bg-white p-6 rounded-xl shadow-md border border-slate-200 w-full max-w-sm mb-8">
        <Text className="text-xl font-semibold mb-5 text-slate-800 text-center">Post a Vehicle</Text>
        
        <Text className="text-sm font-medium text-slate-700 mb-2">Who is posting this car?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {users.map((user) => (
            <TouchableOpacity 
              key={user.id} 
              onPress={() => setSelectedUserId(user.id)}
              className={`mr-3 px-4 py-2 rounded-full border ${selectedUserId === user.id ? 'bg-blue-100 border-blue-500' : 'bg-slate-50 border-slate-300'}`}
            >
              <Text className={selectedUserId === user.id ? 'text-blue-700 font-bold' : 'text-slate-600'}>
                {user.email.split('@')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="flex-row space-x-3 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-700 mb-1">Make</Text>
            <TextInput value={make} onChangeText={setMake} className="w-full px-3 py-3 border border-slate-300 rounded-md text-slate-900 bg-slate-50" placeholder="Honda" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-700 mb-1">Model</Text>
            <TextInput value={model} onChangeText={setModel} className="w-full px-3 py-3 border border-slate-300 rounded-md text-slate-900 bg-slate-50" placeholder="Civic" />
          </View>
        </View>

        <View className="flex-row space-x-3 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-700 mb-1">Year</Text>
            <TextInput value={year} onChangeText={setYear} keyboardType="number-pad" className="w-full px-3 py-3 border border-slate-300 rounded-md text-slate-900 bg-slate-50" placeholder="2018" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-700 mb-1">Price ($)</Text>
            <TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad" className="w-full px-3 py-3 border border-slate-300 rounded-md text-slate-900 bg-slate-50" placeholder="15000" />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-1">Description</Text>
          <TextInput value={description} onChangeText={setDescription} multiline numberOfLines={3} className="w-full px-3 py-3 border border-slate-300 rounded-md text-slate-900 bg-slate-50 h-24" placeholder="Runs great..." />
        </View>

        <TouchableOpacity onPress={handleCreateListing} className="w-full bg-blue-600 py-3 rounded-lg mt-2 items-center active:bg-blue-700">
          <Text className="text-white font-bold text-base">Post to Market</Text>
        </TouchableOpacity>

        {listingStatus ? (
          <View className={`mt-5 p-3 rounded-lg border items-center ${listingStatus.includes('Error') || listingStatus.includes('⚠️') ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <Text className={`text-sm text-center font-medium ${listingStatus.includes('Error') || listingStatus.includes('⚠️') ? 'text-red-700' : 'text-green-800'}`}>{listingStatus}</Text>
          </View>
        ) : null}
      </View>

      <Button>My Shared Button</Button>
      <View className="h-10" />
    </ScrollView>
  );
}