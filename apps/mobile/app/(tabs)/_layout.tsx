import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.muted,
      headerShown: false,
      tabBarStyle: { borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, height: 60, paddingBottom: 10 }
    }}>
      <Tabs.Screen
        name="post"
        options={{ title: t('nav.post'), tabBarIcon: () => <Text style={{ fontSize: 20 }}>📷</Text> }}
      />
      <Tabs.Screen
        name="index"
        options={{ title: t('nav.feed'), tabBarIcon: () => <Text style={{ fontSize: 20 }}>🚗</Text> }}
      />
      <Tabs.Screen
        name="admin"
        options={{ title: t('nav.admin'), tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text> }}
      />
    </Tabs>
  );
}
