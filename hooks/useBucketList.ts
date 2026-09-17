import { useEffect } from 'react';
import { useBucketListStore } from '@/stores/bucket-list.store';
import { useAuthStore } from '@/stores/auth.store';

export function useBucketList() {
  const items = useBucketListStore(s => s.items);
  const loading = useBucketListStore(s => s.loading);
  const fetchItems = useBucketListStore(s => s.fetchItems);
  const addItem = useBucketListStore(s => s.addItem);
  const toggleItem = useBucketListStore(s => s.toggleItem);
  const updateItem = useBucketListStore(s => s.updateItem);
  const deleteItem = useBucketListStore(s => s.deleteItem);
  const subscribeToItems = useBucketListStore(s => s.subscribeToItems);
  const profile = useAuthStore(s => s.profile);

  useEffect(() => {
    if (!profile?.couple_id) return;
    fetchItems(profile.couple_id);
    return subscribeToItems(profile.couple_id);
  }, [profile?.couple_id]);

  return { items, loading, addItem, toggleItem, updateItem, deleteItem };
}
