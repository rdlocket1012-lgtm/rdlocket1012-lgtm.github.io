import { useEffect } from 'react';
import { useMilestonesStore } from '@/stores/milestones.store';
import { useAuthStore } from '@/stores/auth.store';

export function useMilestones() {
  const store = useMilestonesStore();
  const { profile } = useAuthStore();

  useEffect(() => {
    if (!profile?.couple_id) return;
    store.fetchMilestones(profile.couple_id);
    const unsub = store.subscribeToMilestones(profile.couple_id);
    return unsub;
  }, [profile?.couple_id]);

  return store;
}
