import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';

export default function RootIndex() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    async function navigate() {
      if (session) {
        // Logged-in user — always go straight to tabs.
        // Back-fill the flags so future cold-starts stay on the fast path.
        await AsyncStorage.multiSet([
          ['ai_consent_granted_at', new Date().toISOString()],
          ['onboarding_done', 'true'],
          ['has_account', 'true'],
        ]);
        router.replace('/(tabs)');
        return;
      }

      // Not logged in — choose between welcome (new) and sign-in (returning).
      const hasAccount = await AsyncStorage.getItem('has_account');
      if (hasAccount) {
        router.replace('/(auth)/sign-in');
      } else {
        router.replace('/(auth)/welcome');
      }
    }

    navigate();
  }, [session, loading]);

  return null;
}
