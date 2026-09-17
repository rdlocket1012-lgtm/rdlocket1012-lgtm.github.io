import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { notifyPartner } from '@/lib/push';
import { todayISO, addDays } from '@/utils/streak';

export type StreakPause = {
  id: string;
  couple_id: string;
  start_date: string; // YYYY-MM-DD, inclusive first protected day
  end_date: string;   // YYYY-MM-DD, inclusive last protected day
  created_by: string | null;
  created_at: string;
};

/** Fixed pause lengths offered in the UI (days). */
export const PAUSE_DURATIONS = [3, 7, 14] as const;

function derive(pauses: StreakPause[]) {
  const today = todayISO();
  const pausePeriods = pauses
    .filter((p) => p.end_date >= p.start_date) // drop resumed/empty windows
    .map((p) => ({ start: p.start_date, end: p.end_date }));
  const activePause =
    pauses.find((p) => p.start_date <= today && today <= p.end_date) ?? null;
  return { pausePeriods, activePause };
}

type StreakPauseState = {
  pauses: StreakPause[];
  /** Ranges passed to computeStreak so held days neither break nor grow the run. */
  pausePeriods: Array<{ start: string; end: string }>;
  /** The pause window covering today, if any. */
  activePause: StreakPause | null;
  loading: boolean;
  refresh: (coupleId: string) => Promise<void>;
  pause: (coupleId: string, days: number) => Promise<void>;
  resume: (coupleId: string) => Promise<void>;
};

export const useStreakPauseStore = create<StreakPauseState>((set, get) => ({
  pauses: [],
  pausePeriods: [],
  activePause: null,
  loading: true,

  refresh: async (coupleId) => {
    try {
      const { data, error } = await supabase
        .from('streak_pauses')
        .select('*')
        .eq('couple_id', coupleId)
        .order('start_date', { ascending: false });
      if (!error) {
        const pauses = (data as StreakPause[]) ?? [];
        set({ pauses, ...derive(pauses) });
      }
    } catch {
      // network/auth error — keep cached pauses
    } finally {
      set({ loading: false });
    }
  },

  pause: async (coupleId, days) => {
    // Ignore if a pause already covers today — the UI hides the control then.
    if (get().activePause) return;
    const myId = useAuthStore.getState().profile?.id ?? null;
    const start = todayISO();
    const end = addDays(start, days - 1);

    const optimistic: StreakPause = {
      id: `temp-${Date.now()}`,
      couple_id: coupleId,
      start_date: start,
      end_date: end,
      created_by: myId,
      created_at: new Date().toISOString(),
    };
    const prev = get().pauses;
    const withOpt = [optimistic, ...prev];
    set({ pauses: withOpt, ...derive(withOpt) });

    try {
      const { data, error } = await supabase
        .from('streak_pauses')
        .insert({ couple_id: coupleId, start_date: start, end_date: end, created_by: myId })
        .select()
        .single();
      if (error) throw error;
      const swapped = get().pauses.map((p) => (p.id === optimistic.id ? (data as StreakPause) : p));
      set({ pauses: swapped, ...derive(swapped) });
      void notifyPartner('streak_pause', 'Streak paused 💤', `Your streak is safe until ${end}.`);
    } catch {
      const rolledBack = get().pauses.filter((p) => p.id !== optimistic.id);
      set({ pauses: rolledBack, ...derive(rolledBack) });
      throw new Error('Could not pause the streak');
    }
  },

  resume: async (coupleId) => {
    const active = get().activePause;
    if (!active) return;
    // End the pause immediately: set end_date to yesterday so today is no longer
    // protected. If the pause started today this makes an empty (expired) window.
    const newEnd = addDays(todayISO(), -1);

    const apply = (endDate: string) => {
      const next = get().pauses.map((p) => (p.id === active.id ? { ...p, end_date: endDate } : p));
      set({ pauses: next, ...derive(next) });
    };
    const prevEnd = active.end_date;
    apply(newEnd);

    try {
      const { error } = await supabase
        .from('streak_pauses')
        .update({ end_date: newEnd })
        .eq('id', active.id);
      if (error) throw error;
    } catch {
      apply(prevEnd);
      throw new Error('Could not resume the streak');
    }
  },
}));
