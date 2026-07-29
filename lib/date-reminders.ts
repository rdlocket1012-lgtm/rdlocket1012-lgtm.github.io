import * as Notifications from 'expo-notifications';
import type { CalEvent } from '@/hooks/useConnectionCalendar';
import { parseLocalDate } from '@/utils/date';
import { usePrefsStore } from '@/stores/prefs.store';

/**
 * Local scheduled reminders for dated events — birthdays, anniversaries,
 * milestones and bucket-list targets.
 *
 * These are LOCAL notifications, not pushes from the server. The date is known
 * on-device well in advance, so the OS can fire them without the app running
 * and without a server round-trip. (A push would need a cron + per-timezone
 * scheduling to do the same job worse.)
 */

export const DATE_REMINDER_PREFIX = 'date:';

/** iOS silently drops anything past 64 pending local notifications, and the
 *  daily On This Day reminder needs one of those slots. Two reminders per event
 *  (day-before + day-of) means we can safely cover 24 events. */
const MAX_EVENTS = 24;

/** Hour of day both reminders fire at — matches the On This Day default. */
const HOUR = 9;

/** Cancels every reminder this module scheduled, leaving other ids untouched. */
export async function cancelDateReminders(): Promise<void> {
  try {
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      pending
        .filter((n) => n.identifier.startsWith(DATE_REMINDER_PREFIX))
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch {
    // best-effort
  }
}

function at9am(day: Date): Date {
  const d = new Date(day);
  d.setHours(HOUR, 0, 0, 0);
  return d;
}

function dayOfCopy(e: CalEvent): { title: string; body: string } {
  switch (e.kind) {
    case 'anniversary':
      return { title: `Today is your ${e.title} 💕`, body: 'Make it count.' };
    case 'birthday':
      return { title: `Today is ${e.title} 🎂`, body: 'Say something lovely.' };
    case 'bucket':
      return { title: `Today's the day: ${e.title} 🎯`, body: 'The one you two planned.' };
    default:
      return { title: `Today: ${e.title}`, body: 'One for the two of you.' };
  }
}

function dayBeforeCopy(e: CalEvent): { title: string; body: string } {
  switch (e.kind) {
    case 'anniversary':
      return { title: `Your ${e.title} is tomorrow`, body: 'Last chance to plan something.' };
    case 'birthday':
      return { title: `${e.title} is tomorrow 🎂`, body: 'Time to sort a card.' };
    default:
      return { title: `${e.title} is tomorrow`, body: 'Just so it doesn’t sneak up on you.' };
  }
}

/**
 * Re-schedules all date reminders from the current event list. Safe to call
 * repeatedly — it cancels its own previous reminders first, so events that were
 * edited or deleted don't leave orphaned alerts behind.
 *
 * Deliberately re-scheduled from scratch rather than diffed: the set is small,
 * and a stale "Today is your 3rd Anniversary" for a date the user changed is a
 * much worse bug than a few redundant OS calls.
 */
export async function syncDateReminders(events: CalEvent[]): Promise<void> {
  try {
    if (!usePrefsStore.getState().dateReminders) {
      await cancelDateReminders();
      return;
    }
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return; // don't prompt from a background sync

    await cancelDateReminders();

    const now = new Date();
    const upcoming = events
      .filter((e) => at9am(parseLocalDate(e.date)) > now)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, MAX_EVENTS);

    for (const e of upcoming) {
      const day = parseLocalDate(e.date);

      const dayOf = at9am(day);
      if (dayOf > now) {
        const c = dayOfCopy(e);
        await Notifications.scheduleNotificationAsync({
          identifier: `${DATE_REMINDER_PREFIX}${e.id}:day`,
          content: { title: c.title, body: c.body, data: { type: 'calendar_event', eventId: e.id } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dayOf },
        });
      }

      const before = at9am(new Date(day.getTime() - 86_400_000));
      if (before > now) {
        const c = dayBeforeCopy(e);
        await Notifications.scheduleNotificationAsync({
          identifier: `${DATE_REMINDER_PREFIX}${e.id}:pre`,
          content: { title: c.title, body: c.body, data: { type: 'calendar_event', eventId: e.id } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: before },
        });
      }
    }
  } catch {
    // Reminders are best-effort — never block or surface an error.
  }
}
