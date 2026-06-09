import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

export type PartnerProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  status_emoji: string | null;
};

/** Detects whether a second person has joined the couple, with Realtime updates. */
export function usePartner() {
  const profile = useAuthStore((s) => s.profile);
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!profile?.couple_id || !profile?.id) {
      setPartner(null);
      setLoading(false);
      return;
    }

    const coupleId = profile.couple_id;
    const myId = profile.id;

    // Initial fetch
    const fetch = () =>
      supabase
        .from('profiles')
        .select('id, display_name, avatar_url, status_emoji')
        .eq('couple_id', coupleId)
        .neq('id', myId)
        .maybeSingle()
        .then(({ data }) => {
          if (active) {
            setPartner((data as PartnerProfile) ?? null);
            setLoading(false);
          }
        });

    fetch();

    // Realtime — re-fetch when any profile in this couple changes
    // (catches partner joining, updating their name/avatar, or leaving).
    const channel = supabase
      .channel(`partner:${coupleId}:${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `couple_id=eq.${coupleId}` },
        () => { if (active) fetch(); }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [profile?.couple_id, profile?.id]);

  return { partner, partnerJoined: !!partner, loading };
}
