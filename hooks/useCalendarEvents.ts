import { useEffect } from 'react';
import { useCalendarEventsStore } from '@/stores/calendar-events.store';
import { useAuthStore } from '@/stores/auth.store';

export function useCalendarEvents() {
  const events = useCalendarEventsStore(s => s.events);
  const loading = useCalendarEventsStore(s => s.loading);
  const fetchEvents = useCalendarEventsStore(s => s.fetchEvents);
  const addEvent = useCalendarEventsStore(s => s.addEvent);
  const deleteEvent = useCalendarEventsStore(s => s.deleteEvent);
  const subscribe = useCalendarEventsStore(s => s.subscribe);
  const profile = useAuthStore(s => s.profile);

  useEffect(() => {
    if (!profile?.couple_id) return;
    fetchEvents(profile.couple_id);
    return subscribe(profile.couple_id);
  }, [profile?.couple_id]);

  return { events, loading, addEvent, deleteEvent };
}
