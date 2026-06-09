import { useEffect } from 'react';
import { useUnseenStore } from '@/stores/unseen.store';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Keeps unseen counts fresh for the whole app. Mount once high in the tree
 * (e.g. the tabs layout). Returns the live counts for convenience.
 */
export function useUnseen() {
  const coupleId = useAuthStore((s) => s.profile?.couple_id);
  const counts = useUnseenStore((s) => s.counts);
  const fetch = useUnseenStore((s) => s.fetch);
  const subscribe = useUnseenStore((s) => s.subscribe);

  useEffect(() => {
    if (!coupleId) return;
    fetch(coupleId);
    const unsub = subscribe(coupleId);
    return unsub;
  }, [coupleId]);

  return counts;
}
