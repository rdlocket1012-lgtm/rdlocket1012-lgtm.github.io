import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type NudgeKind = 'sparkles' | 'hug' | 'kiss';

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
    // Remove any stale channel with this topic first — re-using an already
    // subscribed channel throws "cannot add callbacks after subscribe()".
    for (const c of supabase.getChannels()) {
      if (c.topic === `realtime:${topic}`) void supabase.removeChannel(c);
    }
    const channel = supabase.channel(topic, {
      config: { broadcast: { self: false }, presence: { key: userId } },
    });

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
      if (status === 'SUBSCRIBED') channel.track({ holding: false });
    });

    channelRef.current = channel;
    return () => {
      void supabase.removeChannel(channel);
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
