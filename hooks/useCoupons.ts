import { useEffect } from 'react';
import { useCouponsStore } from '@/stores/coupons.store';
import { useAuthStore } from '@/stores/auth.store';

export function useCoupons() {
  const store = useCouponsStore();
  const { profile } = useAuthStore();

  useEffect(() => {
    if (!profile?.couple_id) return;
    store.fetchCoupons(profile.couple_id);
    const unsub = store.subscribe(profile.couple_id);
    return unsub;
  }, [profile?.couple_id]);

  return store;
}
