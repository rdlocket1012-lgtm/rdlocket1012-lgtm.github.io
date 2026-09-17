import { useEffect } from 'react';
import { useQuizStore } from '@/stores/quiz.store';
import { useAuthStore } from '@/stores/auth.store';

export function useQuiz() {
  const today = useQuizStore(s => s.today);
  const loading = useQuizStore(s => s.loading);
  const fetchToday = useQuizStore(s => s.fetchToday);
  const submit = useQuizStore(s => s.submit);
  const comment = useQuizStore(s => s.comment);
  const subscribe = useQuizStore(s => s.subscribe);
  const profile = useAuthStore(s => s.profile);

  useEffect(() => {
    if (!profile?.couple_id) return;
    fetchToday(profile.couple_id);
    return subscribe(profile.couple_id);
  }, [profile?.couple_id]);

  return { today, loading, submit, comment };
}
