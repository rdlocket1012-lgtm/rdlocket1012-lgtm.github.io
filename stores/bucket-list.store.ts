import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type BucketItem = {
  id: string;
  couple_id: string;
  added_by: string | null;
  title: string;
  category: string;
  target_date: string | null;
  note: string | null;
  is_done: boolean;
  completed_at: string | null;
  deleted_at: string | null;
  created_at: string;
};

type BucketState = {
  items: BucketItem[];
  loading: boolean;
  fetchItems: (coupleId: string) => Promise<void>;
  addItem: (data: Omit<BucketItem, 'id' | 'created_at'>) => Promise<void>;
  toggleItem: (id: string, isDone: boolean) => Promise<void>;
  updateItem: (id: string, data: Partial<BucketItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  subscribeToItems: (coupleId: string) => () => void;
};

export const useBucketListStore = create<BucketState>((set, get) => ({
  items: [],
  loading: false,

  fetchItems: async (coupleId) => {
    set({ loading: true });
    const { data } = await supabase
      .from('bucket_list_items')
      .select('*')
      .eq('couple_id', coupleId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    set({ items: (data as BucketItem[]) ?? [], loading: false });
  },

  addItem: async (data) => {
    const optimistic: BucketItem = { ...data, id: `temp-${Date.now()}`, created_at: new Date().toISOString() };
    set((s) => ({ items: [optimistic, ...s.items] }));
    const { data: inserted, error } = await supabase.from('bucket_list_items').insert(data).select().single();
    if (error) {
      set((s) => ({ items: s.items.filter((i) => i.id !== optimistic.id) }));
    } else {
      set((s) => ({ items: s.items.map((i) => i.id === optimistic.id ? (inserted as BucketItem) : i) }));
    }
  },

  toggleItem: async (id, isDone) => {
    const completedAt = isDone ? new Date().toISOString() : null;
    set((s) => ({ items: s.items.map((i) => i.id === id ? { ...i, is_done: isDone, completed_at: completedAt } : i) }));
    await supabase.from('bucket_list_items').update({ is_done: isDone, completed_at: completedAt }).eq('id', id);
  },

  updateItem: async (id, data) => {
    set((s) => ({ items: s.items.map((i) => i.id === id ? { ...i, ...data } : i) }));
    await supabase.from('bucket_list_items').update(data).eq('id', id);
  },

  deleteItem: async (id) => {
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
    await supabase.from('bucket_list_items').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  },

  subscribeToItems: (coupleId) => {
    const channel = supabase
      .channel(`bucket:${coupleId}:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bucket_list_items', filter: `couple_id=eq.${coupleId}` }, () => {
        get().fetchItems(coupleId);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },
}));
