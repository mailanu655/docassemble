import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoreProvider, useStore } from '@/data/store';
import { fontAssets } from '@/theme/fonts';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.bg, text: colors.ink, border: colors.line, primary: colors.ink },
};

function Navigator() {
  const { hydrated, language } = useStore();
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const ready = hydrated && (fontsLoaded || Boolean(fontError));

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={language !== null}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="temple/[id]" />
        <Stack.Screen name="event/[id]" />
        <Stack.Screen name="post/[id]" />
        <Stack.Screen name="compose" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={language === null}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <StoreProvider>
          <StatusBar style="dark" />
          <Navigator />
        </StoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
