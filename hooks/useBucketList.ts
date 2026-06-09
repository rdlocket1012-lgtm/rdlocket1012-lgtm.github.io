import { useEffect } from 'react';
import { useBucketListStore } from '@/stores/bucket-list.store';
import { useAuthStore } from '@/stores/auth.store';

export function useBucketList() {
  const store = useBucketListStore();
  const { profile } = useAuthStore();

  useEffect(() => {
    if (!profile?.couple_id) return;
    store.fetchItems(profile.couple_id);
    const unsub = store.subscribeToItems(profile.couple_id);
    return unsub;
  }, [profile?.couple_id]);

  return store;
}
