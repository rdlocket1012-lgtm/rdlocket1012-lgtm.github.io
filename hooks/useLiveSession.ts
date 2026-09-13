import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';

export type LiveEvent =
  | { kind: 'invite'; order: number[] }
  | { kind: 'accept' }
  | { kind: 'decline' }
  | { kind: 'answer'; round: number; choice: 'a' | 'b' }
  | { kind: 'next'; round: number }
  | { kind: 'end' };

/**
 * Realtime "live session" channel for a couple, built on Supabase presence +
 * broadcast (same proven pipe as the nudges/thumb-kiss). Presence tells us when
 * BOTH partners have the app open at once; broadcast carries the co-op game.
 *
 * - partnerOnline: true when the partner is currently present in the channel.
 * - send(event): broadcasts a game event to the partner (self excluded).
 * - onEvent fires when the PARTNER sends an event.
 */
export function useLiveSession(
  coupleId: string | null | undefined,
  userId: string | null | undefined,
  onEvent: (e: LiveEvent) => void,
) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!coupleId || !userId) return;
    const topic = `live:${coupleId}`;

    // Under realtime load the join/presence can be rate-limited and the channel
    // lands in CHANNEL_ERROR/TIMED_OUT, where it would otherwise stay dead and
    // the game silently never connects. We rejoin on failure with exponential
    // backoff + jitter (which also relieves the rate limit instead of hammering
    // it), and ignore callbacks from superseded channels.
    let cancelled = false;
    let retries = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const join = () => {
      if (cancelled) return;
      // Drop any stale channel on this topic before re-creating.
      for (const c of supabase.getChannels()) {
        if (c.topic === `realtime:${topic}`) void supabase.removeChannel(c);
      }
      const channel = supabase.channel(topic, {
        config: { broadcast: { self: false }, presence: { key: userId } },
      });
      channelRef.current = channel;

      channel.on('broadcast', { event: 'live' }, ({ payload }) => {
        const e = payload as LiveEvent;
        if (e?.kind) onEventRef.current(e);
      });

      const recomputePresence = () => {
        const state = channel.presenceState<{ online?: boolean }>();
        let online = false;
        for (const key of Object.keys(state)) {
          if (key !== userId && state[key]?.length) online = true;
        }
        setPartnerOnline(online);
      };
      channel.on('presence', { event: 'sync' }, recomputePresence);
      channel.on('presence', { event: 'join' }, recomputePresence);
      channel.on('presence', { event: 'leave' }, recomputePresence);

      channel.subscribe((status) => {
        // Ignore late callbacks from a channel we've already replaced.
        if (cancelled || channelRef.current !== channel) return;
        if (status === 'SUBSCRIBED') {
          retries = 0;
          void channel.track({ online: true });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Throttled or dropped — back off and rejoin so the game recovers.
          setPartnerOnline(false);
          const delay = Math.min(1000 * 2 ** retries, 15000) + Math.floor(Math.random() * 500);
          retries += 1;
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(join, delay);
        }
      });
    };

    join();

    // Leave/rejoin presence as the app is backgrounded/foregrounded so the
    // partner sees an accurate "online" state.
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void channelRef.current?.track({ online: true });
      else void channelRef.current?.untrack();
    });

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      sub.remove();
      if (channelRef.current) void supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, [coupleId, userId]);

  const send = useCallback((event: LiveEvent) => {
    channelRef.current?.send({ type: 'broadcast', event: 'live', payload: event });
  }, []);

  return { partnerOnline, send };
}
