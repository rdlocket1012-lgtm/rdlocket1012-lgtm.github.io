import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { computeStreak, type StreakInfo } from '@/utils/streak';

function todayISO() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** A quiz day counts when BOTH partners have fully answered. */
function isDayComplete(r: {
  creator_self: string | null; creator_guess: string | null;
  partner_self: string | null; partner_guess: string | null;
  me_answer: string | null; partner_answer: string | null;
}): boolean {
  const newModel = !!r.creator_self && !!r.creator_guess && !!r.partner_self && !!r.partner_guess;
  const legacy = !!r.me_answer && !!r.partner_answer; // old single-answer rows
  return newModel || legacy;
}

/**
 * Loads the couple's Daily Match history and derives a gentle shared streak.
 * Re-fetches whenever the daily_quiz table changes so completing today's quiz
 * updates the flame immediately for both partners.
 */
export function useQuizStreak(): StreakInfo & { loading: boolean } {
  const coupleId = useAuthStore((s) => s.profile?.couple_id);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!coupleId) return;
    const { data } = await supabase
      .from('daily_quiz')
      .select('quiz_date, creator_self, creator_guess, partner_self, partner_guess, me_answer, partner_answer')
      .eq('couple_id', coupleId)
      .order('quiz_date', { ascending: false })
      .limit(400);
    const done = (data ?? []).filter(isDayComplete).map((r: any) => r.quiz_date as string);
    setCompletedDates(done);
    setLoading(false);
  }, [coupleId]);

  useEffect(() => {
    if (!coupleId) return;
    fetchHistory();
    const channel = supabase
      .channel(`quiz-streak:${coupleId}:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_quiz', filter: `couple_id=eq.${coupleId}` }, () => {
        fetchHistory();
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [coupleId, fetchHistory]);

  const info = useMemo(() => computeStreak(completedDates, todayISO()), [completedDates]);
  return { ...info, loading };
}
