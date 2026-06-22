import { useEffect } from 'react';
import { useCouponsStore } from '@/stores/coupons.store';
import { useAuthStore } from '@/stores/auth.store';

export function useCoupons() {
  const coupons = useCouponsStore(s => s.coupons);
  const loading = useCouponsStore(s => s.loading);
  const fetchCoupons = useCouponsStore(s => s.fetchCoupons);
  const addCoupon = useCouponsStore(s => s.addCoupon);
  const requestRedeem = useCouponsStore(s => s.requestRedeem);
  const cancelRequest = useCouponsStore(s => s.cancelRequest);
  const approveRedeem = useCouponsStore(s => s.approveRedeem);
  const declineRequest = useCouponsStore(s => s.declineRequest);
  const deleteCoupon = useCouponsStore(s => s.deleteCoupon);
  const subscribe = useCouponsStore(s => s.subscribe);
  const profile = useAuthStore(s => s.profile);

  useEffect(() => {
    if (!profile?.couple_id) return;
    fetchCoupons(profile.couple_id);
    return subscribe(profile.couple_id);
  }, [profile?.couple_id]);

  return { coupons, loading, addCoupon, requestRedeem, cancelRequest, approveRedeem, declineRequest, deleteCoupon };
}
