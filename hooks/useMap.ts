import { useEffect } from 'react';
import { useMapStore } from '@/stores/map.store';
import { useAuthStore } from '@/stores/auth.store';

export function useMap() {
  const store = useMapStore();
  const { profile } = useAuthStore();

  useEffect(() => {
    if (!profile?.couple_id) return;
    store.fetchPins(profile.couple_id);
    const unsub = store.subscribeToPins(profile.couple_id);
    return unsub;
  }, [profile?.couple_id]);

  return store;
}
