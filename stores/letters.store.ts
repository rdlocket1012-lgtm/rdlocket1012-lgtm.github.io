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
};

type LettersState = {
  letters: Letter[];
  loading: boolean;
  fetchLetters: (coupleId: string) => Promise<void>;
  sendLetter: (data: Omit<Letter, 'id' | 'created_at'>) => Promise<void>;
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
    const optimistic: Letter = { ...data, id: `temp-${Date.now()}`, created_at: new Date().toISOString() };
    set((s) => ({ letters: [optimistic, ...s.letters] }));
    const { data: inserted, error } = await supabase.from('letters').insert(data).select().single();
    if (error) {
      set((s) => ({ letters: s.letters.filter((l) => l.id !== optimistic.id) }));
    } else {
      set((s) => ({ letters: s.letters.map((l) => l.id === optimistic.id ? (inserted as Letter) : l) }));
    }
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
