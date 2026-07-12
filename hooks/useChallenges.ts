import { useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { useChallengesStore } from '@/stores/challenges.store';

/**
 * Ensures the current weekly challenge is initialized and subscribed.
 * Returns the challenge state and a `refreshProgress` callback to call
 * after the user completes a challenge-relevant action.
 */
export function useChallenges() {
  const coupleId = useAuthStore((s) => s.profile?.couple_id);
  const { current, def, progress, loading, initialize, refreshProgress, subscribe } =
    useChallengesStore();

  useEffect(() => {
    if (!coupleId) return;
    initialize(coupleId);
    const unsub = subscribe(coupleId);
    return unsub;
  }, [coupleId]);

  // Re-count progress whenever the screen regains focus — challenge-relevant
  // actions (letters, drawings, bucket ticks) happen on other screens and don't
  // touch the couple_challenges realtime channel, so returning here recomputes.
  useFocusEffect(
    useCallback(() => {
      if (coupleId) refreshProgress(coupleId);
    }, [coupleId]),
  );

  const isComplete = !!(current?.completed_at);

  const daysLeft = (() => {
    if (!current) return 0;
    const now = new Date();
    const end = new Date(current.period_end + 'T23:59:59');
    const diff = Math.ceil((end.getTime() - now.getTime()) / 86400000);
    return Math.max(0, diff);
  })();

  return {
    challenge: current,
    def,
    progress,
    isComplete,
    daysLeft,
    loading,
    refresh: () => coupleId && refreshProgress(coupleId),
  };
}
