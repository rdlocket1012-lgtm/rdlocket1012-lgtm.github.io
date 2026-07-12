import { useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { useStreakPauseStore } from '@/stores/streak-pause.store';

/**
 * Loads the couple's streak-pause windows and keeps them fresh on focus (no
 * dedicated realtime channel — respects the per-client channel budget; a partner
 * sees a pause on their next screen focus / app open). Returns the active pause
 * plus couple-bound `pause`/`resume` actions.
 */
export function useStreakPause() {
  const coupleId = useAuthStore((s) => s.profile?.couple_id);
  const activePause = useStreakPauseStore((s) => s.activePause);
  const loading = useStreakPauseStore((s) => s.loading);
  const refresh = useStreakPauseStore((s) => s.refresh);
  const pauseFn = useStreakPauseStore((s) => s.pause);
  const resumeFn = useStreakPauseStore((s) => s.resume);

  useEffect(() => {
    if (coupleId) refresh(coupleId);
  }, [coupleId, refresh]);

  useFocusEffect(
    useCallback(() => {
      if (coupleId) refresh(coupleId);
    }, [coupleId, refresh]),
  );

  return {
    activePause,
    loading,
    pause: (days: number) => (coupleId ? pauseFn(coupleId, days) : Promise.resolve()),
    resume: () => (coupleId ? resumeFn(coupleId) : Promise.resolve()),
  };
}
