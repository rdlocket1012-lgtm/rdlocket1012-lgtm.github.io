import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type MapPin = {
  id: string;
  couple_id: string;
  added_by: string | null;
  name: string;
  note: string | null;
  category: string;
  latitude: number;
  longitude: number;
  place_name: string | null;
  country: string | null;
  visited_date: string | null;
  deleted_at: string | null;
  created_at: string;
};

type MapState = {
  pins: MapPin[];
  loading: boolean;
  fetchPins: (coupleId: string) => Promise<void>;
  addPin: (data: Omit<MapPin, 'id' | 'created_at'>) => Promise<void>;
  updatePin: (id: string, data: Partial<MapPin>) => Promise<void>;
  deletePin: (id: string) => Promise<void>;
  subscribeToPins: (coupleId: string) => () => void;
};

export const useMapStore = create<MapState>((set, get) => ({
  pins: [],
  loading: false,

  fetchPins: async (coupleId) => {
    set({ loading: true });
    const { data } = await supabase
      .from('map_pins')
      .select('*')
      .eq('couple_id', coupleId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    set({ pins: (data as MapPin[]) ?? [], loading: false });
  },

  addPin: async (data) => {
    const optimistic: MapPin = { ...data, id: `temp-${Date.now()}`, created_at: new Date().toISOString() };
    set((s) => ({ pins: [optimistic, ...s.pins] }));
    const { data: inserted, error } = await supabase.from('map_pins').insert(data).select().single();
    if (error) {
      set((s) => ({ pins: s.pins.filter((p) => p.id !== optimistic.id) }));
    } else {
      set((s) => ({ pins: s.pins.map((p) => p.id === optimistic.id ? (inserted as MapPin) : p) }));
    }
  },

  updatePin: async (id, data) => {
    set((s) => ({ pins: s.pins.map((p) => p.id === id ? { ...p, ...data } : p) }));
    const { error } = await supabase.from('map_pins').update(data).eq('id', id);
    if (error) throw new Error(error.message);
  },

  deletePin: async (id) => {
    set((s) => ({ pins: s.pins.filter((p) => p.id !== id) }));
    await supabase.from('map_pins').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  },

  subscribeToPins: (coupleId) => {
    const channel = supabase
      .channel(`pins:${coupleId}:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'map_pins', filter: `couple_id=eq.${coupleId}` }, () => {
        get().fetchPins(coupleId);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },
}));
