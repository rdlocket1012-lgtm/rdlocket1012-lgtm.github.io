import { useEffect, useMemo, useRef } from 'react';
import { buildCalendarEvents, collapseUpcoming } from '@/hooks/useConnectionCalendar';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useMilestonesStore } from '@/stores/milestones.store';
import { useBucketListStore } from '@/stores/bucket-list.store';
import { useCoupleStore } from '@/stores/couple.store';
import { usePrefsStore } from '@/stores/prefs.store';
import { syncDateReminders } from '@/lib/date-reminders';

/**
 * Keeps the OS's scheduled birthday/anniversary reminders in step with the
 * couple's actual calendar. Mount once, high in the tree.
 *
 * Reads milestones / bucket items / couple straight from their stores rather
 * than via useConnectionCalendar: those stores are already subscribed by the
 * tab screens (the tab bar is a swipe pager, so all four are mounted at once),
 * and calling the hook here would open a second realtime channel for each. Only
 * calendar_events gets a subscription, because nothing else loads birthdays
 * app-wide and a birthday reminder is the main thing this exists for.
 */
export function useDateReminders() {
  const { events: customEvents } = useCalendarEvents();
  const milestones = useMilestonesStore((s) => s.milestones);
  const bucketItems = useBucketListStore((s) => s.items);
  const couple = useCoupleStore((s) => s.couple);

  const enabled = usePrefsStore((s) => s.dateReminders);
  const hydrated = usePrefsStore((s) => s.hydrated);
  useEffect(() => { void usePrefsStore.getState().hydrate(); }, []);

  const events = useMemo(
    () => collapseUpcoming(buildCalendarEvents({ milestones, bucketItems, couple, customEvents })),
    [milestones, bucketItems, couple?.start_date, customEvents],
  );

  // Only re-schedule when the dates themselves change. Syncing on array
  // identity would hammer the OS scheduler on every unrelated store update.
  // `enabled` is part of the signature so flipping the Settings toggle back on
  // re-schedules immediately instead of waiting for the next calendar edit.
  const signature = `${enabled}|${events.map((e) => `${e.id}@${e.date}`).join('|')}`;
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated) return; // don't schedule off the default before the pref loads
    if (last.current === signature) return;
    last.current = signature;
    void syncDateReminders(events);
  }, [signature, hydrated]);
}
