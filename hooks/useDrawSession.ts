import { useEffect, useRef, useCallback } from 'react';
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

  useEffect(() => {
    if (!coupleId || !myId) return;

    const topic = `draw-session:${coupleId}`;
    for (const c of supabase.getChannels()) {
      if (c.topic === `realtime:${topic}`) void supabase.removeChannel(c);
    }

    const channel = supabase.channel(topic, {
      config: { broadcast: { self: false } },
    });

    channel.on('broadcast', { event: 'draw' }, ({ payload }) => {
      const e = payload as DrawGameEvent;
      if (e?.type) onEventRef.current(e);
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => { void supabase.removeChannel(channel); };
  }, [coupleId, myId]);

  const send = useCallback((event: DrawGameEvent) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'draw',
      payload: event,
    });
  }, []);

  return { send };
}
