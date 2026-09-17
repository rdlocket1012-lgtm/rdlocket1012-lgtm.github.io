import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
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

    // Under realtime load the join can be rate-limited and the channel lands in
    // CHANNEL_ERROR/TIMED_OUT, where it would otherwise stay dead and playback
    // sync silently never connects. Rejoin on failure with exponential backoff
    // + jitter, and ignore callbacks from superseded channels. Mirrors the
    // live-session hardening (useLiveSession).
    let cancelled = false;
    let retries = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const join = () => {
      if (cancelled) return;
      for (const c of supabase.getChannels()) {
        if (c.topic === `realtime:${topic}`) void supabase.removeChannel(c);
      }
      const channel = supabase.channel(topic, {
        config: { broadcast: { self: false }, presence: { key: userId } },
      });
      channelRef.current = channel;

      channel.on('broadcast', { event: 'watch' }, ({ payload }) => {
        const e = payload as WatchEvent;
        if (e?.kind) onEventRef.current(e);
      });

      channel.subscribe((status) => {
        if (cancelled || channelRef.current !== channel) return;
        if (status === 'SUBSCRIBED') {
          retries = 0;
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
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
      if (channelRef.current) void supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, [coupleId, userId]);

  const send = useCallback((event: WatchEvent) => {
    channelRef.current?.send({ type: 'broadcast', event: 'watch', payload: event });
  }, []);

  return { send };
}
