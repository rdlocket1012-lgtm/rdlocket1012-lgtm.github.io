import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

export type Feature = 'letters' | 'coupons' | 'milestones';

const OWNER_COL: Record<Feature, string> = {
  letters: 'sender_id',
  coupons: 'created_by',
  milestones: 'created_by',
};
const SEEN_COL: Record<Feature, string> = {
  letters: 'letters_seen_at',
  coupons: 'coupons_seen_at',
  milestones: 'milestones_seen_at',
};

type Counts = Record<Feature, number>;

type UnseenState = {
  counts: Counts;
  /** ISO timestamp of when the current user last viewed each feature. */
  seenAt: Record<Feature, string | null>;
  fetch: (coupleId: string) => Promise<void>;
  markSeen: (feature: Feature) => Promise<void>;
  /** Is a specific item (by created_at + owner) unseen by the current user? */
  isItemUnseen: (feature: Feature, createdAt: string, ownerId: string | null) => boolean;
  subscribe: (coupleId: string) => () => void;
};

const FEATURES: Feature[] = ['letters', 'coupons', 'milestones'];

export const useUnseenStore = create<UnseenState>((set, get) => ({
  counts: { letters: 0, coupons: 0, milestones: 0 },
  seenAt: { letters: null, coupons: null, milestones: null },

  fetch: async (coupleId) => {
    const myId = useAuthStore.getState().profile?.id;
    if (!myId) return;

    // 1) Read this user's "last seen" markers.
    const { data: prof } = await supabase
      .from('profiles')
      .select('letters_seen_at, coupons_seen_at, milestones_seen_at')
      .eq('id', myId)
      .maybeSingle();

    const seenAt: Record<Feature, string | null> = {
      letters: (prof as any)?.letters_seen_at ?? null,
      coupons: (prof as any)?.coupons_seen_at ?? null,
      milestones: (prof as any)?.milestones_seen_at ?? null,
    };

    // 2) Count unseen items per feature (created by the partner, after seen marker).
    const counts: Counts = { letters: 0, coupons: 0, milestones: 0 };
    await Promise.all(
      FEATURES.map(async (f) => {
        let query = supabase
          .from(f)
          .select('id', { count: 'exact', head: true })
          .eq('couple_id', coupleId)
          .is('deleted_at', null)
          .neq(OWNER_COL[f], myId);
        if (seenAt[f]) query = query.gt('created_at', seenAt[f]!);
        const { count } = await query;
        counts[f] = count ?? 0;
      })
    );

    set({ counts, seenAt });
  },

  markSeen: async (feature) => {
    const myId = useAuthStore.getState().profile?.id;
    if (!myId) return;
    const now = new Date().toISOString();
    // Optimistic
    set((s) => ({
      counts: { ...s.counts, [feature]: 0 },
      seenAt: { ...s.seenAt, [feature]: now },
    }));
    await supabase.from('profiles').update({ [SEEN_COL[feature]]: now }).eq('id', myId);
  },

  isItemUnseen: (feature, createdAt, ownerId) => {
    const myId = useAuthStore.getState().profile?.id;
    if (!myId || ownerId === myId) return false; // my own items are never "new" to me
    const seen = get().seenAt[feature];
    if (!seen) return true;
    return new Date(createdAt).getTime() > new Date(seen).getTime();
  },

  subscribe: (coupleId) => {
    const channels = FEATURES.map((f) =>
      supabase
        .channel(`unseen:${f}:${coupleId}:${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: f, filter: `couple_id=eq.${coupleId}` }, () => {
          get().fetch(coupleId);
        })
        .subscribe()
    );
    return () => { channels.forEach((c) => void supabase.removeChannel(c)); };
  },
}));
