import { useEffect } from 'react';
import { useCoupleStore } from '@/stores/couple.store';
import { useAuthStore } from '@/stores/auth.store';

export function useCouple() {
  const { couple, dayCount, isPremium, loading, fetchCouple, subscribeToCouple } = useCoupleStore();
  const { profile } = useAuthStore();

  useEffect(() => {
    if (!profile?.couple_id) return;
    fetchCouple(profile.couple_id);
    const unsub = subscribeToCouple(profile.couple_id);
    return unsub;
  }, [profile?.couple_id]);

  return { couple, dayCount, isPremium, loading, fetchCouple: () => profile?.couple_id ? fetchCouple(profile.couple_id) : Promise.resolve() };
}
