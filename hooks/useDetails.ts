import { useEffect } from 'react';
import { useDetailsStore } from '@/stores/details.store';
import { useAuthStore } from '@/stores/auth.store';

export function useDetails() {
  const store = useDetailsStore();
  const { profile } = useAuthStore();

  useEffect(() => {
    if (!profile?.couple_id) return;
    store.fetchDetails(profile.couple_id);
    const unsub = store.subscribeToDetails(profile.couple_id);
    return unsub;
  }, [profile?.couple_id]);

  return store;
}
