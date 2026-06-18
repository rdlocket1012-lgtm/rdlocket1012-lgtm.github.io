import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type WatchEvent =
  | { kind: 'invite'; videoId: string }
  | { kind: 'accept' }
  | { kind: 'decline' }
  | { kind: 'load'; videoId: string }
  | { kind: 'play'; at: number; sentAt: number }
  | { kind: 'pause'; at: number }
  | { kind: 'seek'; to: number }
  | { kind: 'heartbeat'; at: number; sentAt: number; playing: boolean }
  | { kind: 'end' };

/**
 * Realtime "watch together" channel — a dedicated broadcast pipe for syncing a
 * YouTube session between the two partners. The host drives playback; the
 * follower mirrors and self-corrects from periodic heartbeats.
 *
 * onEvent fires for events sent by the PARTNER (self is excluded).
 */
export function useWatchSession(
  coupleId: string | null | undefined,
  userId: string | null | undefined,
  onEvent: (e: WatchEvent) => void,
) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!coupleId || !userId) return;
    const topic = `watch:${coupleId}`;
    for (const c of supabase.getChannels()) {
      if (c.topic === `realtime:${topic}`) void supabase.removeChannel(c);
    }
    const channel = supabase.channel(topic, {
      config: { broadcast: { self: false }, presence: { key: userId } },
    });
    channel.on('broadcast', { event: 'watch' }, ({ payload }) => {
      const e = payload as WatchEvent;
      if (e?.kind) onEventRef.current(e);
    });
    channel.subscribe();
    channelRef.current = channel;
    return () => {
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [coupleId, userId]);

  const send = useCallback((event: WatchEvent) => {
    channelRef.current?.send({ type: 'broadcast', event: 'watch', payload: event });
  }, []);

  return { send };
}
