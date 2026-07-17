import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { syncAppBadge } from '@/lib/badge';

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
  /**
   * When the user last opened the Activity screen. Drives the Home bell dot and
   * the app-icon badge. Kept separate from the per-feature markers above:
   * seeing that a letter arrived is not the same as reading it.
   */
  activitySeenAt: string | null;
  /** Partner-initiated items created since `activitySeenAt`. Feeds the badge. */
  activityCount: number;
  fetch: (coupleId: string) => Promise<void>;
  markSeen: (feature: Feature) => Promise<void>;
  markActivitySeen: () => Promise<void>;
  /** Is a specific item (by created_at + owner) unseen by the current user? */
  isItemUnseen: (feature: Feature, createdAt: string, ownerId: string | null) => boolean;
  subscribe: (coupleId: string) => () => void;
};

const FEATURES: Feature[] = ['letters', 'coupons', 'milestones'];

/**
 * Every table that backs the Activity feed, with the column naming the person
 * who created the row. These don't share a convention (`sender_id` vs
 * `created_by` vs `added_by`), and `partner_drawings` has no `deleted_at` at
 * all (migration 012), so each one is described explicitly.
 *
 * Keep in sync with `supabase/functions/notify/index.ts`, which computes the
 * same count server-side for the push badge.
 */
const ACTIVITY_TABLES: Array<{ table: string; ownerCol: string; softDelete: boolean }> = [
  { table: 'letters', ownerCol: 'sender_id', softDelete: true },
  { table: 'coupons', ownerCol: 'created_by', softDelete: true },
  { table: 'milestones', ownerCol: 'created_by', softDelete: true },
  { table: 'partner_drawings', ownerCol: 'sender_id', softDelete: false },
  { table: 'bucket_list_items', ownerCol: 'added_by', softDelete: true },
];

export const useUnseenStore = create<UnseenState>((set, get) => ({
  counts: { letters: 0, coupons: 0, milestones: 0 },
  seenAt: { letters: null, coupons: null, milestones: null },
  activitySeenAt: null,
  activityCount: 0,

  fetch: async (coupleId) => {
    const myId = useAuthStore.getState().profile?.id;
    if (!myId) return;

    // 1) Read this user's "last seen" markers.
    //
    // `activity_seen_at` ships in migration 015. If that migration hasn't been
    // applied yet the whole select errors, which would zero out the markers and
    // wrongly light up "NEW" on every existing item. So fall back to the three
    // columns we know are in production and leave the badge dark until 015 lands.
    let prof: Record<string, string | null> | null = null;
    let hasActivityCol = true;
    {
      const { data, error } = await supabase
        .from('profiles')
        .select('letters_seen_at, coupons_seen_at, milestones_seen_at, activity_seen_at')
        .eq('id', myId)
        .maybeSingle();
      if (error) {
        hasActivityCol = false;
        const { data: legacy } = await supabase
          .from('profiles')
          .select('letters_seen_at, coupons_seen_at, milestones_seen_at')
          .eq('id', myId)
          .maybeSingle();
        prof = legacy as any;
      } else {
        prof = data as any;
      }
    }

    const seenAt: Record<Feature, string | null> = {
      letters: prof?.letters_seen_at ?? null,
      coupons: prof?.coupons_seen_at ?? null,
      milestones: prof?.milestones_seen_at ?? null,
    };
    const activitySeenAt = prof?.activity_seen_at ?? null;

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

    // 3) Count everything the partner has done since the Activity screen was
    //    last opened — one number for the bell dot and the app-icon badge.
    let activityCount = 0;
    if (hasActivityCol) {
      const perTable = await Promise.all(
        ACTIVITY_TABLES.map(async ({ table, ownerCol, softDelete }) => {
          let q = supabase
            .from(table)
            .select('id', { count: 'exact', head: true })
            .eq('couple_id', coupleId)
            .neq(ownerCol, myId);
          if (softDelete) q = q.is('deleted_at', null);
          if (activitySeenAt) q = q.gt('created_at', activitySeenAt);
          const { count } = await q;
          return count ?? 0;
        })
      );
      activityCount = perTable.reduce((a, b) => a + b, 0);
    }

    set({ counts, seenAt, activitySeenAt, activityCount });
    void syncAppBadge(activityCount);
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

  markActivitySeen: async () => {
    const myId = useAuthStore.getState().profile?.id;
    if (!myId) return;
    const now = new Date().toISOString();
    // Optimistic: the dot and badge clear the instant the screen opens.
    set({ activityCount: 0, activitySeenAt: now });
    void syncAppBadge(0);
    const { error } = await supabase.from('profiles').update({ activity_seen_at: now }).eq('id', myId);
    if (error) {
      // Migration 015 not applied yet — the marker can't persist, so the dot
      // will come back on next fetch. Don't fake success by leaving it cleared.
      set({ activitySeenAt: null });
    }
  },

  isItemUnseen: (feature, createdAt, ownerId) => {
    const myId = useAuthStore.getState().profile?.id;
    if (!myId || ownerId === myId) return false; // my own items are never "new" to me
    const seen = get().seenAt[feature];
    if (!seen) return true;
    return new Date(createdAt).getTime() > new Date(seen).getTime();
  },

  subscribe: (coupleId) => {
    // One channel with a postgres_changes binding per feature table, instead of
    // a separate realtime channel per feature. Fewer channels per client keeps
    // us under Supabase's per-client realtime rate limit (the join/presence
    // burst from too many channels was destabilising the live-game channel).
    const channel = supabase.channel(`unseen:${coupleId}:${Math.random().toString(36).slice(2)}`);
    for (const { table } of ACTIVITY_TABLES) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `couple_id=eq.${coupleId}` }, () => {
        get().fetch(coupleId);
      });
    }
    channel.subscribe();
    return () => { void supabase.removeChannel(channel); };
  },
}));
