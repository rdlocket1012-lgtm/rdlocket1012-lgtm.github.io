import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { routeAfterAuth } from '@/lib/post-auth';

export default function RootIndex() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    async function navigate() {
      if (session) {
        await AsyncStorage.setItem('has_account', 'true');
        // Couple-aware: home if set up, onboarding if not, invite if pending.
        // Handles being killed mid-onboarding without landing on an empty home.
        router.replace((await routeAfterAuth(session.user.id)) as never);
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
