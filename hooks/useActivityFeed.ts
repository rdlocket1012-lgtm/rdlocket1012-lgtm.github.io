import { useEffect, useMemo } from 'react';
import { LK, catColor } from '@/constants/theme';
import { TYPE_ICON } from '@/constants/milestone-types';
import { useAuth } from '@/hooks/useAuth';
import { useLetters } from '@/hooks/useLetters';
import { useCoupons } from '@/hooks/useCoupons';
import { useConnectionCalendar } from '@/hooks/useConnectionCalendar';
import { useDrawStore } from '@/stores/draw.store';
import { useMilestonesStore } from '@/stores/milestones.store';
import { useUnseenStore } from '@/stores/unseen.store';

export type ActivityKind = 'letter' | 'coupon' | 'coupon_request' | 'milestone' | 'drawing';

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  icon: string;
  color: string;
  title: string;
  /** ISO timestamp the item landed. Drives ordering and the relative label. */
  at: string;
  unseen: boolean;
  href: string;
};

/**
 * Everything the partner has done, newest first, across every table that
 * persists partner-initiated activity.
 *
 * Deliberately excluded:
 *  - private notes — RLS is owner-only (migration 010), the partner's rows are
 *    unreadable by design and must never surface here;
 *  - nudges / bites / thumb kisses — ephemeral realtime broadcasts with no
 *    table, so there is nothing to show after the moment passes.
 */
/**
 * @param since ISO marker that "unseen" is judged against. The Activity screen
 *   freezes this at the moment it opens, because it also marks activity as seen
 *   on focus — reading the live store marker instead would clear every coral dot
 *   before the user could see it. Pass `undefined` to track the live marker.
 */
export function useActivityFeed(since?: string | null) {
  const { profile } = useAuth();
  const myId = profile?.id;
  const coupleId = profile?.couple_id;

  const { letters } = useLetters();
  const { coupons } = useCoupons();
  const { upcoming } = useConnectionCalendar();
  const { milestones } = useMilestonesFromCalendar();

  const drawings = useDrawStore((s) => s.received);
  const fetchDrawings = useDrawStore((s) => s.fetchDrawings);

  const liveSeenAt = useUnseenStore((s) => s.activitySeenAt);
  const activityCount = useUnseenStore((s) => s.activityCount);
  const seenAt = since === undefined ? liveSeenAt : since;

  // Letters, coupons and milestones each carry their own realtime subscription
  // via the hooks above, so they refresh themselves. Drawings don't — nothing
  // else on this screen loads them. Rather than open a fifth realtime channel
  // (a channel per feature is what tripped Supabase's per-client limit and
  // broke the live-game channel), we re-fetch off the unseen store's already
  // consolidated channel: it watches partner_drawings and moves activityCount
  // on every partner row, which is the signal we key off here.
  useEffect(() => {
    if (!coupleId || !myId) return;
    void fetchDrawings(coupleId, myId);
  }, [coupleId, myId, activityCount]);

  const items = useMemo<ActivityItem[]>(() => {
    if (!myId) return [];
    const out: ActivityItem[] = [];
    const mark = (at: string, owner: string | null) => {
      if (owner === myId) return false; // my own actions are never new to me
      if (!seenAt) return true; // never opened the feed → everything is new
      return new Date(at).getTime() > new Date(seenAt).getTime();
    };

    for (const l of letters) {
      if (!l.sender_id || l.sender_id === myId) continue;
      if (l.is_draft || l.deleted_at) continue;
      const at = l.sent_at ?? l.created_at;
      out.push({
        id: `lt-${l.id}`,
        kind: 'letter',
        icon: 'envelope',
        color: LK.gold,
        title: l.audio_path ? 'New voice letter' : 'New letter',
        at,
        unseen: mark(at, l.sender_id),
        href: `/letters/${l.id}`,
      });
    }

    for (const c of coupons) {
      if (c.deleted_at) continue;
      // Two different events live on the coupons table, and they point in
      // opposite directions: the partner gifting me a coupon, and the partner
      // asking to redeem one I gifted them.
      if (c.created_by && c.created_by !== myId) {
        out.push({
          id: `cp-${c.id}`,
          kind: 'coupon',
          icon: c.icon || 'gift',
          color: c.color || LK.blush,
          title: `Coupon gifted: ${c.title}`,
          at: c.created_at,
          unseen: mark(c.created_at, c.created_by),
          href: '/coupons',
        });
      }
      if (c.redeem_requested_at && c.created_by === myId && !c.redeemed_at) {
        out.push({
          id: `cr-${c.id}`,
          kind: 'coupon_request',
          icon: 'receipt',
          color: LK.coral,
          title: `Redeem request: ${c.title}`,
          at: c.redeem_requested_at,
          // The requester is the partner, so pass null-safe non-me owner.
          unseen: mark(c.redeem_requested_at, null),
          href: '/coupons',
        });
      }
    }

    for (const m of milestones) {
      if (m.deleted_at || !m.created_by || m.created_by === myId) continue;
      out.push({
        id: `ms-${m.id}`,
        kind: 'milestone',
        icon: TYPE_ICON[m.type] ?? 'heart',
        color: catColor(m.type).base,
        title: `Added a memory: ${m.title}`,
        at: m.created_at,
        unseen: mark(m.created_at, m.created_by),
        href: '/(tabs)/timeline',
      });
    }

    for (const d of drawings) {
      out.push({
        id: `dr-${d.id}`,
        kind: 'drawing',
        icon: 'pen',
        color: LK.lilac,
        title: 'Sent you a drawing',
        at: d.created_at,
        unseen: mark(d.created_at, d.sender_id),
        href: '/draw',
      });
    }

    return out.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 40);
  }, [letters, coupons, milestones, drawings, myId, seenAt]);

  return { items, upcoming };
}

/**
 * useConnectionCalendar already mounts useMilestones internally, so reading the
 * store directly here reuses that subscription instead of opening a second one.
 */
function useMilestonesFromCalendar() {
  const milestones = useMilestonesStore((s) => s.milestones);
  return { milestones };
}
