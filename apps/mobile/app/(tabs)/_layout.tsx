import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#2563eb',
      tabBarInactiveTintColor: '#94a3b8',
      headerShown: false,
      tabBarStyle: { borderTopWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', height: 60, paddingBottom: 10 }
    }}>
      <Tabs.Screen 
        name="post" 
        options={{ title: 'Post', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📷</Text> }} 
      />
      <Tabs.Screen 
        name="index" 
        options={{ title: 'Feed', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🚗</Text> }} 
      />
      <Tabs.Screen 
        name="admin" 
        options={{ title: 'Admin', tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text> }} 
      />
    </Tabs>
  );
}