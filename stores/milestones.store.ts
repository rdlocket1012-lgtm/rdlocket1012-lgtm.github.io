import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type Milestone = {
  id: string;
  couple_id: string;
  created_by: string | null;
  title: string;
  milestone_date: string;
  type: string;
  note: string | null;
  note_rich_html: string | null;
  is_future: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

type MilestonesState = {
  milestones: Milestone[];
  loading: boolean;
  error: string | null;
  fetchMilestones: (coupleId: string) => Promise<void>;
  addMilestone: (data: Omit<Milestone, 'id' | 'created_at' | 'updated_at' | 'is_future'>) => Promise<void>;
  updateMilestone: (id: string, data: Partial<Milestone>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  subscribeToMilestones: (coupleId: string) => () => void;
};

export const useMilestonesStore = create<MilestonesState>((set, get) => ({
  milestones: [],
  loading: false,
  error: null,

  fetchMilestones: async (coupleId) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('couple_id', coupleId)
      .is('deleted_at', null)
      .order('milestone_date', { ascending: false });
    if (error) set({ error: error.message, loading: false });
    else set({ milestones: (data as Milestone[]) ?? [], loading: false });
  },

  addMilestone: async (data) => {
    const optimistic: Milestone = {
      ...data, id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_future: new Date(data.milestone_date) > new Date(),
    };
    set((s) => ({ milestones: [optimistic, ...s.milestones] }));
    const { data: inserted, error } = await supabase.from('milestones').insert(data).select().single();
    if (error) {
      set((s) => ({ milestones: s.milestones.filter((m) => m.id !== optimistic.id), error: error.message }));
      throw new Error(error.message);
    } else {
      set((s) => ({ milestones: s.milestones.map((m) => m.id === optimistic.id ? (inserted as Milestone) : m) }));
    }
  },

  updateMilestone: async (id, data) => {
    set((s) => ({ milestones: s.milestones.map((m) => m.id === id ? { ...m, ...data } : m) }));
    const { error } = await supabase.from('milestones').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      set({ error: error.message });
      get().fetchMilestones(get().milestones[0]?.couple_id ?? '');
    }
  },

  deleteMilestone: async (id) => {
    const deletedAt = new Date().toISOString();
    set((s) => ({ milestones: s.milestones.filter((m) => m.id !== id) }));
    await supabase.from('milestones').update({ deleted_at: deletedAt }).eq('id', id);
  },

  subscribeToMilestones: (coupleId) => {
    const channel = supabase
      .channel(`milestones:${coupleId}:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones', filter: `couple_id=eq.${coupleId}` }, () => {
        get().fetchMilestones(coupleId);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },
}));
