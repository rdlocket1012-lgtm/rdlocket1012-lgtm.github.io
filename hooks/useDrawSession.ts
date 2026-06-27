import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';
import type { Stroke } from '@/components/draw/DrawCanvas';

export type DrawGameEvent =
  | { type: 'round_start'; roundId: string; drawerUserId: string; options: [string, string, string] }
  | { type: 'word_picked' }
  | { type: 'stroke'; stroke: Stroke }
  | { type: 'guess'; text: string }
  | { type: 'correct'; word: string }
  | { type: 'time_up'; word: string }
  | { type: 'next_round' };

/**
 * Manages the Supabase Realtime channel for a Draw & Guess session.
 * Each couple shares one persistent draw channel; round isolation is handled
 * by roundId in game state. Channel is reused across rounds to avoid reconnect lag.
 */
export function useDrawSession(
  coupleId: string | null | undefined,
  myId: string | null | undefined,
  onEvent: (e: DrawGameEvent) => void,
) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  // Whether the partner is also present in the draw channel (both on the
  // Draw & Guess screen). Drives the 2-player connection gate.
  const [partnerOnline, setPartnerOnline] = useState(false);

  useEffect(() => {
    if (!coupleId || !myId) return;

    const topic = `draw-session:${coupleId}`;

    // Under realtime load the join/presence can be rate-limited and the channel
    // lands in CHANNEL_ERROR/TIMED_OUT, where it would otherwise stay dead and
    // the session silently never connects. Rejoin on failure with exponential
    // backoff + jitter, and ignore callbacks from superseded channels. Mirrors
    // the live-session hardening (useLiveSession).
    let cancelled = false;
    let retries = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const join = () => {
      if (cancelled) return;
      for (const c of supabase.getChannels()) {
        if (c.topic === `realtime:${topic}`) void supabase.removeChannel(c);
      }

      const channel = supabase.channel(topic, {
        config: { broadcast: { self: false }, presence: { key: myId } },
      });
      channelRef.current = channel;

      channel.on('broadcast', { event: 'draw' }, ({ payload }) => {
        const e = payload as DrawGameEvent;
        if (e?.type) onEventRef.current(e);
      });

      // Presence: anyone tracked under a key other than mine is the partner.
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setPartnerOnline(Object.keys(state).some((k) => k !== myId));
      });

      channel.subscribe((status) => {
        if (cancelled || channelRef.current !== channel) return;
        if (status === 'SUBSCRIBED') {
          retries = 0;
          void channel.track({ userId: myId, at: Date.now() });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setPartnerOnline(false);
          const delay = Math.min(1000 * 2 ** retries, 15000) + Math.floor(Math.random() * 500);
          retries += 1;
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(join, delay);
        }
      });
    };

    join();

    // Rejoin when the app returns to the foreground — the socket may have been
    // dropped while backgrounded, leaving the channel silently dead.
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active' && channelRef.current?.state !== 'joined') join();
    });

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      sub.remove();
      setPartnerOnline(false);
      if (channelRef.current) void supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, [coupleId, myId]);

  const send = useCallback((event: DrawGameEvent) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'draw',
      payload: event,
    });
  }, []);

  return { send, partnerOnline };
}
