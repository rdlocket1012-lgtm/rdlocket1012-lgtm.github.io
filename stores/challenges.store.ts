import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { getCurrentChallengeDef, getCurrentWeekBounds } from '@/constants/challenge-definitions';
import type { ChallengeDef } from '@/constants/challenge-definitions';

export type CoupleChallenge = {
  id: string;
  couple_id: string;
  challenge_key: string;
  period_type: 'weekly' | 'monthly';
  period_start: string; // YYYY-MM-DD
  period_end: string;   // YYYY-MM-DD
  completed_at: string | null;
  streak_awarded: boolean;
  created_at: string;
};

/** Counts couple activity in [start, end] from the relevant table. */
async function fetchProgress(
  coupleId: string,
  def: ChallengeDef,
  start: string,
  end: string,
): Promise<number> {
  const startTs = `${start}T00:00:00.000Z`;
  const endTs = `${end}T23:59:59.999Z`;

  if (def.activity === 'quiz_both_answered') {
    // Count daily_quiz rows where both partners fully answered.
    const { data } = await supabase
      .from('daily_quiz')
      .select('quiz_date, creator_self, creator_guess, partner_self, partner_guess, me_answer, partner_answer')
      .eq('couple_id', coupleId)
      .gte('quiz_date', start)
      .lte('quiz_date', end);

    if (!data) return 0;
    return data.filter((r) => {
      const newModel = !!r.creator_self && !!r.creator_guess && !!r.partner_self && !!r.partner_guess;
      const legacy = !!r.me_answer && !!r.partner_answer;
      return newModel || legacy;
    }).length;
  }

  if (def.activity === 'letter_sent') {
    const { count } = await supabase
      .from('letters')
      .select('id', { count: 'exact', head: true })
      .eq('couple_id', coupleId)
      .eq('is_draft', false)
      .is('deleted_at', null)
      .gte('created_at', startTs)
      .lte('created_at', endTs);
    return count ?? 0;
  }

  if (def.activity === 'drawing_sent') {
    const { count } = await supabase
      .from('partner_drawings')
      .select('id', { count: 'exact', head: true })
      .eq('couple_id', coupleId)
      .gte('created_at', startTs)
      .lte('created_at', endTs);
    return count ?? 0;
  }

  if (def.activity === 'bucket_completed') {
    const { count } = await supabase
      .from('bucket_list_items')
      .select('id', { count: 'exact', head: true })
      .eq('couple_id', coupleId)
      .eq('is_done', true)
      .is('deleted_at', null)
      .gte('completed_at', startTs)
      .lte('completed_at', endTs);
    return count ?? 0;
  }

  return 0;
}

type ChallengesState = {
  current: CoupleChallenge | null;
  def: ChallengeDef | null;
  progress: number;
  /** Past + current completed periods — passed to computeStreak to bridge missed quiz days. */
  completedPeriods: Array<{ start: string; end: string }>;
  loading: boolean;
  initialize: (coupleId: string) => Promise<void>;
  refreshProgress: (coupleId: string) => Promise<void>;
  subscribe: (coupleId: string) => () => void;
};

export const useChallengesStore = create<ChallengesState>((set, get) => ({
  current: null,
  def: null,
  progress: 0,
  completedPeriods: [],
  loading: true,

  initialize: async (coupleId) => {
    set({ loading: true });
    try {
      const today = new Date();
      const def = getCurrentChallengeDef(today);
      const { start, end } = getCurrentWeekBounds(today);

      // Upsert the row for this period (INSERT if missing, skip if exists).
      await supabase.from('couple_challenges').upsert(
        {
          couple_id: coupleId,
          challenge_key: def.key,
          period_type: 'weekly',
          period_start: start,
          period_end: end,
        },
        { onConflict: 'couple_id,period_start,period_type', ignoreDuplicates: true },
      );

      // Fetch current row.
      const { data: row } = await supabase
        .from('couple_challenges')
        .select('*')
        .eq('couple_id', coupleId)
        .eq('period_start', start)
        .eq('period_type', 'weekly')
        .maybeSingle();

      // Fetch recently completed periods (last 8 weeks) for streak bridging.
      const eightWeeksAgo = new Date(today);
      eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
      const p = (n: number) => String(n).padStart(2, '0');
      const since = `${eightWeeksAgo.getFullYear()}-${p(eightWeeksAgo.getMonth() + 1)}-${p(eightWeeksAgo.getDate())}`;

      const { data: pastRows } = await supabase
        .from('couple_challenges')
        .select('period_start, period_end, completed_at')
        .eq('couple_id', coupleId)
        .not('completed_at', 'is', null)
        .gte('period_start', since);

      const completedPeriods = (pastRows ?? []).map((r) => ({
        start: r.period_start as string,
        end: r.period_end as string,
      }));

      const current = row as CoupleChallenge | null;
      set({ current, def, completedPeriods });

      // Compute progress for the current (possibly in-progress) row.
      if (current && !current.completed_at) {
        const progress = await fetchProgress(coupleId, def, start, end);
        set({ progress });

        // Auto-complete if target reached.
        if (progress >= def.target) {
          await supabase
            .from('couple_challenges')
            .update({ completed_at: new Date().toISOString(), streak_awarded: true })
            .eq('id', current.id);
          set((s) => ({
            current: s.current ? { ...s.current, completed_at: new Date().toISOString() } : null,
            completedPeriods: [...completedPeriods, { start, end }],
          }));
        }
      } else {
        set({ progress: current?.completed_at ? def.target : 0 });
      }
    } catch {
      // non-fatal — leave stale state
    } finally {
      set({ loading: false });
    }
  },

  refreshProgress: async (coupleId) => {
    const { current, def } = get();
    if (!current || !def || current.completed_at) return;
    try {
      const progress = await fetchProgress(coupleId, def, current.period_start, current.period_end);
      set({ progress });

      if (progress >= def.target) {
        const now = new Date().toISOString();
        await supabase
          .from('couple_challenges')
          .update({ completed_at: now, streak_awarded: true })
          .eq('id', current.id);
        set((s) => ({
          current: s.current ? { ...s.current, completed_at: now } : null,
          completedPeriods: [
            ...s.completedPeriods,
            { start: current.period_start, end: current.period_end },
          ],
        }));
      }
    } catch {
      // non-fatal
    }
  },

  subscribe: (coupleId) => {
    const channel = supabase
      .channel(`challenges:${coupleId}:${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'couple_challenges', filter: `couple_id=eq.${coupleId}` },
        () => { get().initialize(coupleId); },
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },
}));
