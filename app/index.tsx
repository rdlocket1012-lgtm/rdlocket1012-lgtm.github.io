import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';

export default function RootIndex() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    async function navigate() {
      const consent = await AsyncStorage.getItem('ai_consent_granted_at');
      if (!consent) {
        // Brand-new user (or signed-out returner): show the welcome screen
        // with Get Started / Sign in. Get Started leads into ai-consent.
        router.replace('/(auth)/welcome');
        return;
      }

      // Onboarding establishes the (anonymous) session + couple itself.
      // If there's no session yet — including users who completed the old
      // session-less onboarding — send them through onboarding to bootstrap.
      if (!session) {
        router.replace('/(onboarding)/start-date');
        return;
      }

      const onboardingDone = await AsyncStorage.getItem('onboarding_done');
      if (!onboardingDone) {
        router.replace('/(onboarding)/start-date');
        return;
      }

      router.replace('/(tabs)');
    }

    navigate();
  }, [session, loading]);

  return null;
}
