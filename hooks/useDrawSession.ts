import { useEffect, useRef, useCallback, useState } from 'react';
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
    for (const c of supabase.getChannels()) {
      if (c.topic === `realtime:${topic}`) void supabase.removeChannel(c);
    }

    const channel = supabase.channel(topic, {
      config: { broadcast: { self: false }, presence: { key: myId } },
    });

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
      if (status === 'SUBSCRIBED') {
        void channel.track({ userId: myId, at: Date.now() });
      }
    });
    channelRef.current = channel;

    return () => { setPartnerOnline(false); void supabase.removeChannel(channel); };
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
