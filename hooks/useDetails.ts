import { useEffect } from 'react';
import { useDetailsStore } from '@/stores/details.store';
import { useAuthStore } from '@/stores/auth.store';

export function useDetails() {
  const details = useDetailsStore(s => s.details);
  const loading = useDetailsStore(s => s.loading);
  const fetchDetails = useDetailsStore(s => s.fetchDetails);
  const upsertDetail = useDetailsStore(s => s.upsertDetail);
  const deleteDetail = useDetailsStore(s => s.deleteDetail);
  const subscribeToDetails = useDetailsStore(s => s.subscribeToDetails);
  const profile = useAuthStore(s => s.profile);

  useEffect(() => {
    if (!profile?.couple_id) return;
    fetchDetails(profile.couple_id);
    return subscribeToDetails(profile.couple_id);
  }, [profile?.couple_id]);

  return { details, loading, upsertDetail, deleteDetail };
}
