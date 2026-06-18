import { useEffect, useState } from 'react';
import { usePartner } from '@/hooks/usePartner';
import { useAuthStore } from '@/stores/auth.store';
import { partnerClock, type PartnerClock } from '@/utils/timezone';

/**
 * The partner's live local clock + warm part-of-day context. Re-renders each
 * minute so the time and "asleep" state stay current. Returns null until the
 * partner has a known timezone.
 */
export function usePartnerTime(): PartnerClock | null {
  const { partner } = usePartner();
  const myTz = useAuthStore((s) => s.profile?.timezone);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return partnerClock(partner?.timezone, myTz, now);
}
