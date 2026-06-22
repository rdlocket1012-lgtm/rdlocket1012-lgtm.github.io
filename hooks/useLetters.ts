import { useEffect } from 'react';
import { useLettersStore } from '@/stores/letters.store';
import { useAuthStore } from '@/stores/auth.store';

export function useLetters() {
  const letters = useLettersStore(s => s.letters);
  const loading = useLettersStore(s => s.loading);
  const fetchLetters = useLettersStore(s => s.fetchLetters);
  const sendLetter = useLettersStore(s => s.sendLetter);
  const reactToLetter = useLettersStore(s => s.reactToLetter);
  const deleteLetter = useLettersStore(s => s.deleteLetter);
  const subscribeToLetters = useLettersStore(s => s.subscribeToLetters);
  const profile = useAuthStore(s => s.profile);

  useEffect(() => {
    if (!profile?.couple_id) return;
    fetchLetters(profile.couple_id);
    return subscribeToLetters(profile.couple_id);
  }, [profile?.couple_id]);

  return { letters, loading, sendLetter, reactToLetter, deleteLetter };
}
