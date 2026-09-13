import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';

export type NudgeKind = 'sparkles' | 'hug' | 'kiss' | 'kiss_request' | 'kiss_accepted' | 'bite' | 'thumb_kiss_invite';

/**
 * Realtime "nudge" channel for a couple, built on Supabase broadcast + presence.
 * - sendNudge(kind): broadcasts a nudge to the partner.
 * - setHolding(bool): tracks thumb-kiss hold state via presence.
 * - partnerHolding: true when the partner is currently holding the thumb-kiss.
 * onNudge fires when the PARTNER sends a nudge (self broadcasts are excluded).
 */
export function useNudgeChannel(coupleId: string | null | undefined, userId: string | null | undefined, onNudge: (kind: NudgeKind) => void) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [partnerHolding, setPartnerHolding] = useState(false);
  const onNudgeRef = useRef(onNudge);
  onNudgeRef.current = onNudge;

  useEffect(() => {
    if (!coupleId || !userId) return;
    const topic = `nudge:${coupleId}`;

    // Under realtime load the join can be rate-limited and the channel lands in
    // CHANNEL_ERROR/TIMED_OUT, where it would otherwise stay dead — incoming
    // nudge broadcasts never arrive and no animation plays on receive. Rejoin on
    // failure with exponential backoff + jitter (which also relieves the rate
    // limit instead of hammering it), and ignore callbacks from superseded
    // channels. Mirrors the live-session hardening (useLiveSession).
    let cancelled = false;
    let retries = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const join = () => {
      if (cancelled) return;
      // Drop any stale channel on this topic before re-creating — re-using an
      // already-subscribed channel throws "cannot add callbacks after subscribe()".
      for (const c of supabase.getChannels()) {
        if (c.topic === `realtime:${topic}`) void supabase.removeChannel(c);
      }
      const channel = supabase.channel(topic, {
        config: { broadcast: { self: false }, presence: { key: userId } },
      });
      channelRef.current = channel;

      channel.on('broadcast', { event: 'nudge' }, ({ payload }) => {
        const kind = (payload as { kind?: NudgeKind })?.kind;
        if (kind) onNudgeRef.current(kind);
      });

      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ holding?: boolean }>();
        let anyPartnerHolding = false;
        for (const key of Object.keys(state)) {
          if (key === userId) continue;
          for (const meta of state[key]) {
            if (meta.holding) anyPartnerHolding = true;
          }
        }
        setPartnerHolding(anyPartnerHolding);
      });

      channel.subscribe((status) => {
        // Ignore late callbacks from a channel we've already replaced.
        if (cancelled || channelRef.current !== channel) return;
        if (status === 'SUBSCRIBED') {
          retries = 0;
          void channel.track({ holding: false });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Throttled or dropped — back off and rejoin so nudges recover.
          setPartnerHolding(false);
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

  const sendNudge = useCallback((kind: NudgeKind) => {
    channelRef.current?.send({ type: 'broadcast', event: 'nudge', payload: { kind } });
  }, []);

  const setHolding = useCallback((holding: boolean) => {
    void channelRef.current?.track({ holding });
  }, []);

  return { sendNudge, setHolding, partnerHolding };
}
