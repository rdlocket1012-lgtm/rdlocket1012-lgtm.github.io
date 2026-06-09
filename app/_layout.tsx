import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Linking from 'expo-linking';
import { useAuth } from '@/hooks/useAuth';
import { OfflineBanner } from '@/components/offline/OfflineBanner';
import { setupPurchases } from '@/lib/revenuecat';
import { supabase } from '@/lib/supabase';
import { registerForPush } from '@/lib/push';
import '@/lib/notifications';

/** Parses key=value pairs out of a URL hash or query string fragment. */
function parseFragment(url: string): Record<string, string> {
  const hash = url.includes('#') ? url.split('#')[1] : url.split('?')[1] ?? '';
  return Object.fromEntries(new URLSearchParams(hash));
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, loading } = useAuth();

  // Deep link handler: extracts Supabase tokens from the URL hash and sets the session.
  // This is required on native because the Supabase client doesn't auto-parse URLs like on web.
  useEffect(() => {
    async function handleDeepLink(url: string) {
      const params = parseFragment(url);
      if (params.access_token && params.refresh_token) {
        // Establish the session — this triggers onAuthStateChange below.
        await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
      }
    }

    // App opened from a cold start via deep link (e.g. email tap while app was closed).
    Linking.getInitialURL().then(url => { if (url) handleDeepLink(url); });

    // App already open and a deep link arrives.
    const sub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    return () => sub.remove();
  }, []);

  // Listen for PASSWORD_RECOVERY event — fired after setSession() above establishes the session.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/(auth)/reset-password');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Initialise in-app purchases (no-op in Expo Go) and tie them to the user.
  useEffect(() => {
    setupPurchases(session?.user?.id);
  }, [session?.user?.id]);

  // Register this device for push notifications once we know who the user is.
  useEffect(() => {
    if (session?.user?.id) registerForPush(session.user.id);
  }, [session?.user?.id]);

  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque: require('../assets/fonts/BricolageGrotesque-Bold.ttf'),
    PlusJakartaSans: require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    Newsreader: require('../assets/fonts/Newsreader-Regular.ttf'),
  });

  const fontsReady = fontsLoaded || !!fontError;

  useEffect(() => {
    if (!loading && fontsReady) SplashScreen.hideAsync();
  }, [loading, fontsReady]);

  if (loading || !fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="(auth)/reset-password" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="milestone/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="invite" options={{ presentation: 'modal' }} />
        <Stack.Screen name="letters/index" />
        <Stack.Screen name="coupons/index" />
        <Stack.Screen name="letter/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="bucket-list/index" />
        <Stack.Screen name="bucket-list/add-item" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings/danger-zone" options={{ presentation: 'modal' }} />
        <Stack.Screen name="quiz/history" options={{ presentation: 'modal' }} />
        <Stack.Screen name="profile/about" />
        <Stack.Screen name="profile/edit" options={{ presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
