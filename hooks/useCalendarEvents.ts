import { useEffect } from 'react';
import { useCalendarEventsStore } from '@/stores/calendar-events.store';
import { useAuthStore } from '@/stores/auth.store';

export function useCalendarEvents() {
  const store = useCalendarEventsStore();
  const { profile } = useAuthStore();

  useEffect(() => {
    if (!profile?.couple_id) return;
    store.fetchEvents(profile.couple_id);
    const unsub = store.subscribe(profile.couple_id);
    return unsub;
  }, [profile?.couple_id]);

  return store;
}
