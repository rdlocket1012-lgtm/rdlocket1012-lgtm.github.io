import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '@/hooks/useAuth';
import { OfflineBanner } from '@/components/offline/OfflineBanner';
import { setupPurchases } from '@/lib/revenuecat';
import { supabase } from '@/lib/supabase';
import { registerForPush } from '@/lib/push';
import '@/lib/notifications';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, loading } = useAuth();

  // Listen for PASSWORD_RECOVERY event — fired when user opens the reset-password deep link.
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
