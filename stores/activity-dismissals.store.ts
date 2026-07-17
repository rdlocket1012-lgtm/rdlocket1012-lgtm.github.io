import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Feed rows the current user has swiped away. Personal and server-backed, so a
 * dismissal follows them to a new device and survives a reinstall — and never
 * touches what the partner sees (owner-only RLS, migration 016).
 */
type DismissalsState = {
  /** Activity feed item ids (e.g. 'lt-<uuid>'), not source-table row ids. */
  dismissed: Set<string>;
  loaded: boolean;
  fetch: () => Promise<void>;
  dismiss: (itemId: string) => Promise<void>;
  restore: (itemId: string) => Promise<void>;
};

export const useDismissalsStore = create<DismissalsState>((set, get) => ({
  dismissed: new Set(),
  loaded: false,

  fetch: async () => {
    const myId = useAuthStore.getState().profile?.id;
    if (!myId) return;
    const { data, error } = await supabase
      .from('activity_dismissals')
      .select('item_id')
      .eq('user_id', myId);
    if (error) {
      // Migration 016 not applied yet — show every item rather than hiding
      // things we can't account for.
      set({ loaded: true });
      return;
    }
    set({ dismissed: new Set((data ?? []).map((r) => r.item_id as string)), loaded: true });
  },

  dismiss: async (itemId) => {
    const myId = useAuthStore.getState().profile?.id;
    if (!myId) return;
    // Optimistic — the row animates out immediately.
    set((s) => ({ dismissed: new Set(s.dismissed).add(itemId) }));
    // ignoreDuplicates → ON CONFLICT DO NOTHING. A plain upsert compiles to
    // ON CONFLICT DO UPDATE, which needs an UPDATE policy that migration 016
    // deliberately doesn't grant — so re-dismissing an already-dismissed row
    // would error and bounce it back into the feed.
    const { error } = await supabase
      .from('activity_dismissals')
      .upsert({ user_id: myId, item_id: itemId }, { onConflict: 'user_id,item_id', ignoreDuplicates: true });
    if (error) {
      // Couldn't persist — put it back rather than have it reappear on next
      // launch with no explanation.
      set((s) => {
        const next = new Set(s.dismissed);
        next.delete(itemId);
        return { dismissed: next };
      });
    }
  },

  restore: async (itemId) => {
    const myId = useAuthStore.getState().profile?.id;
    if (!myId) return;
    set((s) => {
      const next = new Set(s.dismissed);
      next.delete(itemId);
      return { dismissed: next };
    });
    await supabase.from('activity_dismissals').delete().eq('user_id', myId).eq('item_id', itemId);
  },
}));
