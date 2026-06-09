import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type Person = 'me' | 'partner';

export type Detail = {
  id: string;
  couple_id: string;
  person: Person;
  key: string;
  label: string;
  value: string | null;
  is_question: boolean;
  created_at: string;
  updated_at: string;
};

type DetailsState = {
  details: Detail[];
  loading: boolean;
  fetchDetails: (coupleId: string) => Promise<void>;
  upsertDetail: (input: { coupleId: string; person: Person; key: string; label: string; value: string | null; is_question?: boolean }) => Promise<void>;
  deleteDetail: (id: string) => Promise<void>;
  subscribeToDetails: (coupleId: string) => () => void;
};

export const useDetailsStore = create<DetailsState>((set, get) => ({
  details: [],
  loading: false,

  fetchDetails: async (coupleId) => {
    set({ loading: true });
    const { data } = await supabase
      .from('profile_details')
      .select('*')
      .eq('couple_id', coupleId);
    set({ details: (data as Detail[]) ?? [], loading: false });
  },

  upsertDetail: async ({ coupleId, person, key, label, value, is_question = false }) => {
    const { data, error } = await supabase
      .from('profile_details')
      .upsert(
        { couple_id: coupleId, person, key, label, value, is_question, updated_at: new Date().toISOString() },
        { onConflict: 'couple_id,person,key' }
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    set((s) => {
      const others = s.details.filter((d) => !(d.couple_id === coupleId && d.person === person && d.key === key));
      return { details: [...others, data as Detail] };
    });
  },

  deleteDetail: async (id) => {
    set((s) => ({ details: s.details.filter((d) => d.id !== id) }));
    await supabase.from('profile_details').delete().eq('id', id);
  },

  subscribeToDetails: (coupleId) => {
    const channel = supabase
      .channel(`details:${coupleId}:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profile_details', filter: `couple_id=eq.${coupleId}` }, () => {
        get().fetchDetails(coupleId);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },
}));
