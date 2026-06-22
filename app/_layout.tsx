import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import Mapbox from '@rnmapbox/maps';

// Initialise Mapbox once at app startup — must run before any MapView renders.
try {
  Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');
} catch {
  // guard against missing native module in dev/OTA scenarios
}
import { useURL } from 'expo-linking';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ReducedMotionConfig, ReduceMotion } from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth';
import { useSyncTimezone } from '@/hooks/useSyncTimezone';
import { OfflineBanner } from '@/components/offline/OfflineBanner';
import { setupPurchases } from '@/lib/revenuecat';
import { supabase } from '@/lib/supabase';
import { registerForPush } from '@/lib/push';
import { registerNudgeCategories, setupNudgeResponseHandler } from '@/lib/notifications';
import { routeAfterAuth } from '@/lib/post-auth';
import { useNudgeLaunch } from '@/stores/nudge-launch.store';

/** Extracts key=value pairs from both the query string AND hash of a URL. */
function parseAllParams(url: string): Record<string, string> {
  try {
    const [base, hash = ''] = url.split('#');
    const query = base.includes('?') ? base.split('?')[1] : '';
    return {
      ...Object.fromEntries(new URLSearchParams(query)),
      ...Object.fromEntries(new URLSearchParams(hash)),
    };
  } catch {
    return {};
  }
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, loading } = useAuth();

  // Keep our own timezone synced so the partner sees our correct local time.
  useSyncTimezone();

  // useURL() from expo-router gives us the active deep-link URL reactively —
  // it fires on cold-start AND when the app is foregrounded via a link.
  const url = useURL();

  useEffect(() => {
    if (!url) return;
    handleDeepLink(url);
  }, [url]);

  async function handleDeepLink(url: string) {
    // Widget nudge shortcut: locket://nudge opens the nudge composer immediately.
    // On iOS 17+ the widget fires the AppIntent directly (no app launch).
    // On iOS 16 it falls back to this deep link.
    if (url.startsWith('locket://nudge')) {
      useNudgeLaunch.getState().request();
      return;
    }

    const params = parseAllParams(url);

    if (params.code) {
      // PKCE flow (Supabase default): exchange the code for a session.
      // For recovery, onAuthStateChange fires PASSWORD_RECOVERY (handled below).
      const { data } = await supabase.auth.exchangeCodeForSession(params.code);
      // Email-confirmation link → session is now live; route into the app
      // (onboarding if not set up yet, home if already a couple).
      if (url.includes('confirm-email') && data.session) {
        router.replace((await routeAfterAuth(data.session.user.id)) as never);
      }
      return;
    }

    if (params.access_token && params.refresh_token) {
      // Implicit flow fallback: set the session directly from tokens.
      await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
    }
  }

  // Register the interactive "Bite Back!" notification category + its handler.
  useEffect(() => {
    registerNudgeCategories();
    const teardown = setupNudgeResponseHandler();
    return teardown;
  }, []);

  // Routes to reset-password once exchangeCodeForSession/setSession establishes a recovery session.
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
    ShantellSans: require('../assets/fonts/ShantellSans-Regular.ttf'),
    'ShantellSans-Medium': require('../assets/fonts/ShantellSans-Medium.ttf'),
  });

  const fontsReady = fontsLoaded || !!fontError;

  useEffect(() => {
    if (!loading && fontsReady) SplashScreen.hideAsync();
  }, [loading, fontsReady]);

  if (loading || !fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Force-enable Reanimated animations even when the OS "Reduce Motion"
          setting is on. Sets the global default for every withSpring/withTiming
          in the app — no per-call-site override needed. */}
      <ReducedMotionConfig mode={ReduceMotion.Never} />
      <StatusBar style="dark" />
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)/forgot-password" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)/reset-password" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="map/index" />
        <Stack.Screen name="milestone/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="milestone/photo-viewer" options={{ presentation: 'modal', animation: 'fade' }} />
        <Stack.Screen name="invite" options={{ presentation: 'modal' }} />
        <Stack.Screen name="letters/index" />
        <Stack.Screen name="coupons/index" />
        <Stack.Screen name="letter/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="games/index" />
        <Stack.Screen name="games/this-or-that" />
        <Stack.Screen name="games/draw-and-guess" options={{ headerShown: false }} />
        <Stack.Screen name="bucket-list/index" />
        <Stack.Screen name="bucket-list/add-item" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings/danger-zone" options={{ presentation: 'modal' }} />
        <Stack.Screen name="quiz/history" options={{ presentation: 'modal' }} />
        <Stack.Screen name="notes/index" />
        <Stack.Screen name="notes/compose" options={{ presentation: 'formSheet', sheetGrabberVisible: true }} />
        <Stack.Screen name="profile/about" />
        <Stack.Screen name="profile/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="notifications/index" />
      </Stack>
    </GestureHandlerRootView>
  );
}
