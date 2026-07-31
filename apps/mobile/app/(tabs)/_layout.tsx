import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.muted,
      headerShown: false,
      tabBarStyle: { borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, height: 60, paddingBottom: 10 }
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
