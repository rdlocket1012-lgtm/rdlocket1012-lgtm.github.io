import { useEffect } from 'react';
import { useQuizStore } from '@/stores/quiz.store';
import { useAuthStore } from '@/stores/auth.store';

export function useQuiz() {
  const store = useQuizStore();
  const { profile } = useAuthStore();

  useEffect(() => {
    if (!profile?.couple_id) return;
    store.fetchToday(profile.couple_id);
    const unsub = store.subscribe(profile.couple_id);
    return unsub;
  }, [profile?.couple_id]);

  return store;
}
