import { useEffect } from 'react';
import { useLettersStore } from '@/stores/letters.store';
import { useAuthStore } from '@/stores/auth.store';

export function useLetters() {
  const store = useLettersStore();
  const { profile } = useAuthStore();

  useEffect(() => {
    if (!profile?.couple_id) return;
    store.fetchLetters(profile.couple_id);
    const unsub = store.subscribeToLetters(profile.couple_id);
    return unsub;
  }, [profile?.couple_id]);

  return store;
}
