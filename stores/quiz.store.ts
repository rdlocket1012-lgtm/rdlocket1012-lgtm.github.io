import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { questionIndexForDate } from '@/constants/quiz-questions';
import { notifyPartner } from '@/lib/push';

export type QuizRow = {
  id: string;
  couple_id: string;
  quiz_date: string;
  question_id: number;
  created_by: string | null;
  // Double-answer model: each person submits a self answer + a guess of the partner.
  creator_self: string | null;
  creator_guess: string | null;
  partner_self: string | null;
  partner_guess: string | null;
  // Comments (kept from previous model).
  me_comment: string | null;
  partner_comment: string | null;
  // Legacy single-answer columns (no longer written; retained for old rows).
  me_answer: string | null;
  partner_answer: string | null;
};

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Returns whether the current user created the quiz row.
 * If created_by is null (legacy rows) we treat the current user as the creator.
 */
function iAmCreator(row: QuizRow): boolean {
  const myId = useAuthStore.getState().profile?.id;
  if (!row.created_by) return true; // legacy row — default to creator
  return row.created_by === myId;
}

export type ResolvedQuiz = {
  /** What the current user said they'd actually do. */
  mySelf: string | null;
  /** The current user's guess of what their partner would do. */
  myGuess: string | null;
  /** What the partner said they'd actually do. */
  partnerSelf: string | null;
  /** The partner's guess of what the current user would do. */
  partnerGuess: string | null;
  /** Current user has submitted both of their answers. */
  iSubmitted: boolean;
  /** Partner has submitted both of their answers. */
  partnerSubmitted: boolean;
  /** Both people have fully answered — safe to reveal. */
  bothSubmitted: boolean;
  /** Did the current user guess their partner correctly? (only meaningful once bothSubmitted) */
  iGuessedRight: boolean;
  /** Did the partner guess the current user correctly? */
  partnerGuessedRight: boolean;
};

/**
 * Resolves the row into the current user's perspective, regardless of which
 * DB columns (creator_* vs partner_*) belong to them.
 */
export function resolveQuiz(row: QuizRow): ResolvedQuiz {
  const creator = iAmCreator(row);
  const mySelf = creator ? row.creator_self : row.partner_self;
  const myGuess = creator ? row.creator_guess : row.partner_guess;
  const partnerSelf = creator ? row.partner_self : row.creator_self;
  const partnerGuess = creator ? row.partner_guess : row.creator_guess;

  const iSubmitted = !!mySelf && !!myGuess;
  const partnerSubmitted = !!partnerSelf && !!partnerGuess;
  const bothSubmitted = iSubmitted && partnerSubmitted;

  return {
    mySelf,
    myGuess,
    partnerSelf,
    partnerGuess,
    iSubmitted,
    partnerSubmitted,
    bothSubmitted,
    iGuessedRight: bothSubmitted && myGuess === partnerSelf,
    partnerGuessedRight: bothSubmitted && partnerGuess === mySelf,
  };
}

export function resolveComments(row: QuizRow): { myComment: string | null; partnerComment: string | null } {
  const creator = iAmCreator(row);
  return {
    myComment: creator ? row.me_comment : row.partner_comment,
    partnerComment: creator ? row.partner_comment : row.me_comment,
  };
}

type QuizState = {
  today: QuizRow | null;
  loading: boolean;
  fetchToday: (coupleId: string) => Promise<void>;
  /** Submit both the current user's self answer and their guess of the partner. */
  submit: (self: string, guess: string) => Promise<void>;
  comment: (text: string) => Promise<void>;
  subscribe: (coupleId: string) => () => void;
};

export const useQuizStore = create<QuizState>((set, get) => ({
  today: null,
  loading: false,

  fetchToday: async (coupleId) => {
    set({ loading: true });
    const date = todayISO();
    const { data } = await supabase
      .from('daily_quiz')
      .select('*')
      .eq('couple_id', coupleId)
      .eq('quiz_date', date)
      .maybeSingle();

    if (data) {
      set({ today: data as QuizRow, loading: false });
      return;
    }

    // No row yet — this user creates it and becomes the "creator".
    const myId = useAuthStore.getState().profile?.id;
    const { data: created } = await supabase
      .from('daily_quiz')
      .insert({
        couple_id: coupleId,
        quiz_date: date,
        question_id: questionIndexForDate(new Date()),
        created_by: myId ?? null,
      })
      .select()
      .single();

    set({ today: (created as QuizRow) ?? null, loading: false });
  },

  submit: async (self, guess) => {
    const row = get().today;
    if (!row) return;

    const creator = iAmCreator(row);
    const selfCol = creator ? 'creator_self' : 'partner_self';
    const guessCol = creator ? 'creator_guess' : 'partner_guess';

    const patch = { [selfCol]: self, [guessCol]: guess };

    // Optimistic update
    set({ today: { ...row, ...patch } });

    const { error } = await supabase
      .from('daily_quiz')
      .update(patch)
      .eq('id', row.id);

    if (error) {
      set({ today: row }); // roll back
      throw new Error(error.message);
    }

    // Let the partner know it's their turn / ready to reveal.
    const name = (useAuthStore.getState().profile?.display_name || 'Your partner').split(' ')[0];
    notifyPartner('quiz', 'Daily Match 🧠', `${name} answered today's quiz — your turn to guess!`);
  },

  comment: async (text) => {
    const row = get().today;
    if (!row) return;

    const col = iAmCreator(row) ? 'me_comment' : 'partner_comment';
    set({ today: { ...row, [col]: text } });
    await supabase.from('daily_quiz').update({ [col]: text }).eq('id', row.id);
  },

  subscribe: (coupleId) => {
    const channel = supabase
      .channel(`quiz:${coupleId}:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_quiz', filter: `couple_id=eq.${coupleId}` }, () => {
        get().fetchToday(coupleId);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },
}));
