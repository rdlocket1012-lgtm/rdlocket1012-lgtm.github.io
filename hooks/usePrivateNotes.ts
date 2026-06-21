import { useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

export type NoteTag = 'gift' | 'observation' | 'memory' | 'idea' | 'reminder';

export interface PrivateNote {
  id: string;
  user_id: string;
  content: string;
  tag: NoteTag | null;
  created_at: string;
}

type NotesState = {
  notes: PrivateNote[];
  loading: boolean;
  fetch: (userId: string) => Promise<void>;
  add: (userId: string, content: string, tag: NoteTag | null) => Promise<void>;
  remove: (id: string) => Promise<void>;
  update: (id: string, content: string, tag: NoteTag | null) => Promise<void>;
};

const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  loading: false,

  fetch: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('private_notes')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) { console.warn('[notes] fetch failed:', error.message); set({ loading: false }); return; }
    set({ notes: (data as PrivateNote[]) ?? [], loading: false });
  },

  add: async (userId, content, tag) => {
    const { data, error } = await supabase
      .from('private_notes')
      .insert({ user_id: userId, content, tag })
      .select()
      .single();
    if (error) { console.warn('[notes] add failed:', error.message); throw new Error(error.message); }
    if (data) set({ notes: [data as PrivateNote, ...get().notes] });
  },

  update: async (id, content, tag) => {
    const { error } = await supabase.from('private_notes').update({ content, tag }).eq('id', id);
    if (error) { console.warn('[notes] update failed:', error.message); throw new Error(error.message); }
    set({ notes: get().notes.map((n) => (n.id === id ? { ...n, content, tag } : n)) });
  },

  remove: async (id) => {
    await supabase.from('private_notes').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    set({ notes: get().notes.filter((n) => n.id !== id) });
  },
}));

export function usePrivateNotes() {
  const userId = useAuthStore((s) => s.profile?.id);
  // Atomic selectors — subscribe only to the slices we read, and pull the
  // store actions (stable references that never change identity).
  const notes = useNotesStore((s) => s.notes);
  const loading = useNotesStore((s) => s.loading);
  const fetch = useNotesStore((s) => s.fetch);
  const add = useNotesStore((s) => s.add);
  const remove = useNotesStore((s) => s.remove);
  const update = useNotesStore((s) => s.update);

  useEffect(() => {
    if (userId) fetch(userId);
  }, [userId, fetch]);

  // Stable callback — only changes when userId/add change, NOT every render.
  // A new reference each render would defeat the compose screen's memoised
  // header and re-trigger expo-router's setOptions → infinite render loop.
  const addNote = useCallback(
    (content: string, tag: NoteTag | null) => (userId ? add(userId, content, tag) : Promise.resolve()),
    [userId, add],
  );

  return {
    notes,
    loading,
    addNote,
    removeNote: remove,
    updateNote: update,
  };
}

export const NOTE_TAGS: { id: NoteTag; label: string; icon: string; color: string }[] = [
  { id: 'gift',        label: 'Gift idea',    icon: 'gift',    color: '#F48FB1' },
  { id: 'observation', label: 'About her',    icon: 'heart',   color: '#FFD166' },
  { id: 'memory',      label: 'Memory',       icon: 'sparkle', color: '#5BB8E8' },
  { id: 'idea',        label: 'Date idea',    icon: 'star',    color: '#5FC79B' },
  { id: 'reminder',    label: 'Reminder',     icon: 'bell',    color: '#9B8CFF' },
];
