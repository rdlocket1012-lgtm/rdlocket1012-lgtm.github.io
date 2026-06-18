import { useMemo } from 'react';
import { useMilestones } from '@/hooks/useMilestones';
import { useBucketList } from '@/hooks/useBucketList';
import { useCouple } from '@/hooks/useCouple';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { catColor, LK } from '@/constants/theme';
import { TYPE_ICON } from '@/constants/milestone-types';
import { parseLocalDate } from '@/utils/date';

export type CalEventKind = 'milestone' | 'anniversary' | 'bucket' | 'birthday' | 'custom';

export interface CalEvent {
  id: string;
  /** YYYY-MM-DD — for recurring events this is the occurrence in a given year. */
  date: string;
  title: string;
  kind: CalEventKind;
  color: string;
  icon: string;
  /** Emoji tag used when exporting to the native phone calendar. */
  emoji: string;
  recurring: boolean;
  /** Original source id (milestone id, bucket id) for navigation. */
  sourceId?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Aggregates everything date-bound about a relationship into one event list:
 *  - milestones (past & future)
 *  - bucket-list items with a target date
 *  - the yearly anniversary derived from the couple start date (recurring)
 *
 * Recurring events are expanded across a window of years so month navigation
 * always shows them.
 */
export function useConnectionCalendar() {
  const { milestones } = useMilestones();
  const { items: bucketItems } = useBucketList();
  const { couple } = useCouple();
  const { events: customEvents } = useCalendarEvents();

  const events = useMemo<CalEvent[]>(() => {
    const out: CalEvent[] = [];
    const thisYear = new Date().getFullYear();
    const YEAR_WINDOW = [thisYear - 1, thisYear, thisYear + 1, thisYear + 2];

    // ── Milestones ────────────────────────────────────────────────────────
    for (const m of milestones) {
      const cc = catColor(m.type);
      out.push({
        id: `ms-${m.id}`,
        date: m.milestone_date.slice(0, 10),
        title: m.title,
        kind: 'milestone',
        color: cc.base,
        icon: TYPE_ICON[m.type] ?? 'heart',
        emoji: emojiForType(m.type),
        recurring: false,
        sourceId: m.id,
      });
    }

    // ── Bucket-list items with a target date ──────────────────────────────
    for (const b of bucketItems) {
      if (!b.target_date) continue;
      out.push({
        id: `bk-${b.id}`,
        date: b.target_date.slice(0, 10),
        title: b.title,
        kind: 'bucket',
        color: LK.success,
        icon: 'list',
        emoji: '🎯',
        recurring: false,
        sourceId: b.id,
      });
    }

    // ── Yearly anniversary (recurring) ────────────────────────────────────
    if (couple?.start_date) {
      // parseLocalDate avoids the UTC-midnight shift that moved the anniversary
      // back a day in negative-offset timezones.
      const start = parseLocalDate(couple.start_date.slice(0, 10));
      const mo = start.getMonth();
      const day = start.getDate();
      for (const y of YEAR_WINDOW) {
        const occ = new Date(y, mo, day);
        const years = y - start.getFullYear();
        if (years <= 0) continue; // only count actual anniversaries
        out.push({
          id: `anniv-${y}`,
          date: ymd(occ),
          title: `${ordinal(years)} Anniversary`,
          kind: 'anniversary',
          color: LK.marigold,
          icon: 'sparkle',
          emoji: '💕',
          recurring: true,
        });
      }
    }

    // ── Custom events (birthdays, etc.) ───────────────────────────────────
    for (const ce of customEvents) {
      const isBirthday = ce.kind === 'birthday';
      const color = isBirthday ? LK.lilac : LK.coral;
      const icon = isBirthday ? 'gift' : 'star';
      if (ce.recurring) {
        // Expand the yearly occurrence across the visible window.
        const base = parseLocalDate(ce.event_date.slice(0, 10));
        const mo = base.getMonth();
        const day = base.getDate();
        for (const y of YEAR_WINDOW) {
          if (y < base.getFullYear()) continue; // don't show before it started
          out.push({
            id: `ce-${ce.id}-${y}`,
            date: ymd(new Date(y, mo, day)),
            title: ce.title,
            kind: isBirthday ? 'birthday' : 'custom',
            color,
            icon,
            emoji: ce.emoji,
            recurring: true,
            sourceId: ce.id,
          });
        }
      } else {
        out.push({
          id: `ce-${ce.id}`,
          date: ce.event_date.slice(0, 10),
          title: ce.title,
          kind: isBirthday ? 'birthday' : 'custom',
          color,
          icon,
          emoji: ce.emoji,
          recurring: false,
          sourceId: ce.id,
        });
      }
    }

    return out.sort((a, b) => a.date.localeCompare(b.date));
  }, [milestones, bucketItems, couple?.start_date, customEvents]);

  /** Events occurring on a specific YYYY-MM-DD. */
  const eventsOnDay = (dateStr: string) => events.filter((e) => e.date === dateStr);

  /** Map of YYYY-MM-DD → events, for fast day-cell dot lookups. */
  const eventsByDay = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    for (const e of events) {
      (map[e.date] ??= []).push(e);
    }
    return map;
  }, [events]);

  /** Upcoming events from today forward. */
  const upcoming = useMemo(() => {
    const today = ymd(new Date());
    return events.filter((e) => e.date >= today).slice(0, 30);
  }, [events]);

  return { events, eventsOnDay, eventsByDay, upcoming };
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function emojiForType(type: string): string {
  const map: Record<string, string> = {
    firstDate: '💖', trip: '✈️', moveIn: '🏠', engagement: '💍',
    wedding: '💒', pet: '🐾', job: '💼', newHome: '🏡',
  };
  return map[type] ?? '💛';
}
