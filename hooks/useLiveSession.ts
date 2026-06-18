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
    for (const c of supabase.getChannels()) {
      if (c.topic === `realtime:${topic}`) void supabase.removeChannel(c);
    }
    const channel = supabase.channel(topic, {
      config: { broadcast: { self: false }, presence: { key: userId } },
    });

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
      if (status === 'SUBSCRIBED') channel.track({ online: true });
    });

    // Leave/rejoin presence as the app is backgrounded/foregrounded so the
    // partner sees an accurate "online" state.
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void channel.track({ online: true });
      else void channel.untrack();
    });

    channelRef.current = channel;
    return () => {
      sub.remove();
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [coupleId, userId]);

  const send = useCallback((event: LiveEvent) => {
    channelRef.current?.send({ type: 'broadcast', event: 'live', payload: event });
  }, []);

  return { partnerOnline, send };
}
