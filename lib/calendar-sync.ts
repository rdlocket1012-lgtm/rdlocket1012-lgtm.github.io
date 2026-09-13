import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import type { CalEvent } from '@/hooks/useConnectionCalendar';

const LOCKET_CALENDAR_TITLE = 'Locket 💛';

/**
 * Ensures permission and returns a dedicated "Locket 💛" calendar id,
 * creating it if needed. Returns null if permission is denied.
 */
async function getLocketCalendarId(): Promise<string | null> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return null;

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const existing = calendars.find((c) => c.title === LOCKET_CALENDAR_TITLE);
  if (existing) return existing.id;

  // Create a new local calendar
  let source: { id?: string; isLocalAccount?: boolean; name: string; type?: string };
  if (Platform.OS === 'ios') {
    const defaultCal = await Calendar.getDefaultCalendarAsync();
    source = defaultCal.source;
  } else {
    source = { isLocalAccount: true, name: LOCKET_CALENDAR_TITLE };
  }

  const newId = await Calendar.createCalendarAsync({
    title: LOCKET_CALENDAR_TITLE,
    color: '#F48FB1',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: Platform.OS === 'ios' ? (source as any).id : undefined,
    source: source as any,
    name: LOCKET_CALENDAR_TITLE,
    ownerAccount: LOCKET_CALENDAR_TITLE,
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
  return newId;
}

export type CalendarSyncResult = 'added' | 'denied' | 'error';

/**
 * Adds a single Connection-Calendar event to the phone's native calendar
 * as an all-day event with a beautifully tagged title and a day-before alarm.
 * One-way: Locket → phone. Idempotency is best-effort (we don't track ids).
 */
export async function addEventToPhoneCalendar(event: CalEvent): Promise<CalendarSyncResult> {
  try {
    const calendarId = await getLocketCalendarId();
    if (!calendarId) return 'denied';

    const start = new Date(event.date + 'T09:00:00');
    const end = new Date(event.date + 'T10:00:00');

    await Calendar.createEventAsync(calendarId, {
      title: `${event.emoji} ${event.title}`,
      startDate: start,
      endDate: end,
      allDay: true,
      notes: 'Added from Locket 💛',
      alarms: [{ relativeOffset: -60 * 24 }], // 1 day before
      ...(event.recurring
        ? { recurrenceRule: { frequency: Calendar.Frequency.YEARLY } }
        : {}),
    });

    return 'added';
  } catch {
    return 'error';
  }
}

/** Bulk-add several events. Returns the count successfully added. */
export async function addAllToPhoneCalendar(events: CalEvent[]): Promise<{ added: number; denied: boolean }> {
  const calendarId = await getLocketCalendarId();
  if (!calendarId) return { added: 0, denied: true };

  let added = 0;
  for (const event of events) {
    const start = new Date(event.date + 'T09:00:00');
    const end = new Date(event.date + 'T10:00:00');
    try {
      await Calendar.createEventAsync(calendarId, {
        title: `${event.emoji} ${event.title}`,
        startDate: start,
        endDate: end,
        allDay: true,
        notes: 'Added from Locket 💛',
        alarms: [{ relativeOffset: -60 * 24 }],
        ...(event.recurring ? { recurrenceRule: { frequency: Calendar.Frequency.YEARLY } } : {}),
      });
      added++;
    } catch {
      // skip failures, continue
    }
  }
  return { added, denied: false };
}
