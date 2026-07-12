import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { useChallengesStore } from '@/stores/challenges.store';
import { useStreakPauseStore } from '@/stores/streak-pause.store';
import { computeStreak, todayISO, addDays, type StreakInfo } from '@/utils/streak';

/** A quiz day counts when BOTH partners have fully answered. */
function isDayComplete(r: {
  creator_self: string | null; creator_guess: string | null;
  partner_self: string | null; partner_guess: string | null;
  me_answer: string | null; partner_answer: string | null;
}): boolean {
  const newModel = !!r.creator_self && !!r.creator_guess && !!r.partner_self && !!r.partner_guess;
  const legacy = !!r.me_answer && !!r.partner_answer;
  return newModel || legacy;
}

export type QuizStreakInfo = StreakInfo & {
  loading: boolean;
  /** Most recent date where BOTH partners completed the quiz (YYYY-MM-DD), or null. */
  lastCompletionDate: string | null;
  /** Dates restored by a streak-restore coupon. */
  overrideDates: string[];
};

/**
 * Loads the couple's Daily Match history + streak-override dates and derives
 * a gentle shared streak. Re-fetches whenever either table changes for this couple.
 * Completed challenge periods (from useChallengesStore) are also merged in so
 * that finishing a weekly challenge bridges any missed quiz days that week.
 */
export function useQuizStreak(): QuizStreakInfo {
  const coupleId = useAuthStore((s) => s.profile?.couple_id);
  const completedPeriods = useChallengesStore((s) => s.completedPeriods);
  const pausePeriods = useStreakPauseStore((s) => s.pausePeriods);

  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [overrideDates, setOverrideDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!coupleId) return;
    const [quizRes, overrideRes] = await Promise.all([
      supabase
        .from('daily_quiz')
        .select('quiz_date, creator_self, creator_guess, partner_self, partner_guess, me_answer, partner_answer')
        .eq('couple_id', coupleId)
        .order('quiz_date', { ascending: false })
        .limit(400),
      supabase
        .from('quiz_streak_overrides')
        .select('override_date')
        .eq('couple_id', coupleId),
    ]);

    const done = (quizRes.data ?? [])
      .filter(isDayComplete)
      .map((r: any) => r.quiz_date as string);
    const overrides = (overrideRes.data ?? []).map((r: any) => r.override_date as string);

    setCompletedDates(done);
    setOverrideDates(overrides);
    setLoading(false);
  }, [coupleId]);

  useEffect(() => {
    if (!coupleId) return;
    fetchHistory();

    const quizCh = supabase
      .channel(`quiz-streak:${coupleId}:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_quiz', filter: `couple_id=eq.${coupleId}` }, fetchHistory)
      .subscribe();

    const overrideCh = supabase
      .channel(`streak-overrides:${coupleId}:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_streak_overrides', filter: `couple_id=eq.${coupleId}` }, fetchHistory)
      .subscribe();

    return () => {
      void supabase.removeChannel(quizCh);
      void supabase.removeChannel(overrideCh);
    };
  }, [coupleId, fetchHistory]);

  const today = todayISO();
  const info = useMemo(
    () => computeStreak(completedDates, today, overrideDates, completedPeriods, pausePeriods),
    [completedDates, today, overrideDates, completedPeriods, pausePeriods],
  );

  const lastCompletionDate = useMemo(() => {
    // completedDates are fetched in DESC order; [0] is the most recent.
    // Also factor in override dates — take the max of both.
    const allDates = [...completedDates, ...overrideDates].sort().reverse();
    return allDates[0] ?? null;
  }, [completedDates, overrideDates]);

  return { ...info, loading, lastCompletionDate, overrideDates };
}

/** Re-exports for streak-restore hook. */
export { addDays, todayISO };
