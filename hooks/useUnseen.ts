import { useEffect } from 'react';
import { AppState } from 'react-native';
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

    // Realtime drops while the app is backgrounded, so anything the partner did
    // in the meantime never fires a postgres_changes event. Re-fetch on
    // foreground or the bell dot and app-icon badge come back stale — which is
    // the most common way a "new" item goes unnoticed.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void fetch(coupleId);
    });

    return () => {
      unsub();
      sub.remove();
    };
  }, [coupleId]);

  return counts;
}
