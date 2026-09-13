import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { deviceTimezone } from '@/utils/timezone';

/**
 * Keeps the signed-in user's `profiles.timezone` in sync with the device's
 * current IANA zone (so the partner always sees the right local time, even
 * after travel). Writes only when it actually changed.
 */
export function useSyncTimezone() {
  const profile = useAuthStore((s) => s.profile);

  useEffect(() => {
    if (!profile?.id) return;
    const tz = deviceTimezone();
    if (!tz || tz === profile.timezone) return;

    let active = true;
    supabase
      .from('profiles')
      .update({ timezone: tz })
      .eq('id', profile.id)
      .then(({ error }) => {
        if (!error && active) {
          useAuthStore.getState().setProfile({ ...useAuthStore.getState().profile!, timezone: tz });
        }
      });
    return () => { active = false; };
  }, [profile?.id, profile?.timezone]);
}
