import { Tabs } from 'expo-router';
import { CalendarDays, House, Landmark, UserRound, type LucideIcon } from 'lucide-react-native';
import { Platform, StyleSheet, type ColorValue } from 'react-native';

import { useT } from '@/components/ui';
import { fontFor } from '@/theme/fonts';
import { colors } from '@/theme/tokens';

function icon(Icon: LucideIcon) {
  return function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Icon size={23} color={color} strokeWidth={focused ? 2 : 1.75} />;
  };
}

export default function TabLayout() {
  const t = useT();
  const labels = { index: t('home'), events: t('events'), temples: t('temples'), me: t('me') };
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.faint,
        tabBarStyle: {
          borderTopColor: colors.line,
          borderTopWidth: StyleSheet.hairlineWidth,
          backgroundColor: colors.bg,
          // Browsers report no bottom inset, so give labels room of their own.
          ...(Platform.OS === 'web' && { height: 62, paddingBottom: 8 }),
        },
        tabBarLabelStyle: { fontFamily: fontFor(labels.index, 'medium'), fontSize: 11 },
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      <Tabs.Screen name="index" options={{ title: labels.index, tabBarIcon: icon(House) }} />
      <Tabs.Screen name="events" options={{ title: labels.events, tabBarIcon: icon(CalendarDays) }} />
      <Tabs.Screen name="temples" options={{ title: labels.temples, tabBarIcon: icon(Landmark) }} />
      <Tabs.Screen name="me" options={{ title: labels.me, tabBarIcon: icon(UserRound) }} />
    </Tabs>
  );
}
