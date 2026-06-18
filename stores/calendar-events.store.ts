import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

export type CalendarEventKind = 'birthday' | 'custom';

export type CalendarEvent = {
  id: string;
  couple_id: string;
  created_by: string | null;
  title: string;
  event_date: string;   // YYYY-MM-DD
  recurring: boolean;    // yearly
  emoji: string;
  kind: CalendarEventKind;
  deleted_at: string | null;
  created_at: string;
};

type AddEventInput = {
  couple_id: string;
  title: string;
  event_date: string;
  recurring: boolean;
  emoji: string;
  kind: CalendarEventKind;
};

type CalendarEventsState = {
  events: CalendarEvent[];
  loading: boolean;
  fetchEvents: (coupleId: string) => Promise<void>;
  addEvent: (data: AddEventInput) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  subscribe: (coupleId: string) => () => void;
};

export const useCalendarEventsStore = create<CalendarEventsState>((set, get) => ({
  events: [],
  loading: false,

  fetchEvents: async (coupleId) => {
    set({ loading: true });
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('couple_id', coupleId)
      .is('deleted_at', null)
      .order('event_date', { ascending: true });
    set({ events: (data as CalendarEvent[]) ?? [], loading: false });
  },

  addEvent: async ({ couple_id, title, event_date, recurring, emoji, kind }) => {
    const myId = useAuthStore.getState().profile?.id ?? null;
    const payload = { couple_id, created_by: myId, title, event_date, recurring, emoji, kind };
    const optimistic: CalendarEvent = {
      ...payload,
      id: `temp-${Date.now()}`,
      deleted_at: null,
      created_at: new Date().toISOString(),
    };
    set((s) => ({ events: [...s.events, optimistic] }));
    const { data: inserted, error } = await supabase.from('calendar_events').insert(payload).select().single();
    if (error) {
      set((s) => ({ events: s.events.filter((e) => e.id !== optimistic.id) }));
      throw new Error(error.message);
    }
    set((s) => ({ events: s.events.map((e) => (e.id === optimistic.id ? (inserted as CalendarEvent) : e)) }));
  },

  deleteEvent: async (id) => {
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
    await supabase.from('calendar_events').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  },

  subscribe: (coupleId) => {
    const channel = supabase
      .channel(`calendar_events:${coupleId}:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events', filter: `couple_id=eq.${coupleId}` }, () => {
        get().fetchEvents(coupleId);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },
}));
