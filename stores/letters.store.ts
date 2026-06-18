import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type Letter = {
  id: string;
  couple_id: string;
  sender_id: string | null;
  recipient_id: string | null;
  body_rich_html: string;
  is_sealed_until: boolean;
  reveal_at: string | null;
  sent_at: string | null;
  is_draft: boolean;
  deleted_at: string | null;
  created_at: string;
  // Audio letters (null for text-only letters)
  audio_path: string | null;
  audio_duration: number | null;
  transcript: string | null;
  // Reaction (a single emoji either partner can leave on a letter)
  reaction: string | null;
  reaction_by: string | null;
  reacted_at: string | null;
};

type LettersState = {
  letters: Letter[];
  loading: boolean;
  fetchLetters: (coupleId: string) => Promise<void>;
  sendLetter: (data: Omit<Letter, 'id' | 'created_at' | 'reaction' | 'reaction_by' | 'reacted_at'>) => Promise<void>;
  reactToLetter: (id: string, emoji: string | null, userId: string) => Promise<void>;
  deleteLetter: (id: string) => Promise<void>;
  subscribeToLetters: (coupleId: string) => () => void;
};

export const useLettersStore = create<LettersState>((set, get) => ({
  letters: [],
  loading: false,

  fetchLetters: async (coupleId) => {
    set({ loading: true });
    const { data } = await supabase
      .from('letters')
      .select('*')
      .eq('couple_id', coupleId)
      .is('deleted_at', null)
      .eq('is_draft', false)
      .order('created_at', { ascending: false });
    set({ letters: (data as Letter[]) ?? [], loading: false });
  },

  sendLetter: async (data) => {
    const row = { ...data, reaction: null, reaction_by: null, reacted_at: null };
    const optimistic: Letter = { ...row, id: `temp-${Date.now()}`, created_at: new Date().toISOString() };
    set((s) => ({ letters: [optimistic, ...s.letters] }));
    const { data: inserted, error } = await supabase.from('letters').insert(row).select().single();
    if (error) {
      set((s) => ({ letters: s.letters.filter((l) => l.id !== optimistic.id) }));
    } else {
      set((s) => ({ letters: s.letters.map((l) => l.id === optimistic.id ? (inserted as Letter) : l) }));
    }
  },

  reactToLetter: async (id, emoji, userId) => {
    // Optimistic — toggle the emoji (passing null clears it).
    const reacted_at = emoji ? new Date().toISOString() : null;
    const reaction_by = emoji ? userId : null;
    set((s) => ({
      letters: s.letters.map((l) => l.id === id ? { ...l, reaction: emoji, reaction_by, reacted_at } : l),
    }));
    await supabase.from('letters').update({ reaction: emoji, reaction_by, reacted_at }).eq('id', id);
  },

  deleteLetter: async (id) => {
    set((s) => ({ letters: s.letters.filter((l) => l.id !== id) }));
    await supabase.from('letters').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  },

  subscribeToLetters: (coupleId) => {
    const channel = supabase
      .channel(`letters:${coupleId}:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'letters', filter: `couple_id=eq.${coupleId}` }, () => {
        get().fetchLetters(coupleId);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },
}));
