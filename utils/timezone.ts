/**
 * Warm timezone helpers for long-distance couples.
 *
 * Given a partner's IANA timezone (e.g. "America/Denver"), derive their current
 * local time, a friendly part-of-day label, and the hour difference from us —
 * framed gently rather than as a cold UTC offset.
 */

export type PartnerClock = {
  /** Partner's current local time, e.g. "11:42 PM". */
  time: string;
  /** Hour of day 0–23 in the partner's zone. */
  hour: number;
  /** Friendly state: morning / afternoon / evening / night / late. */
  phase: 'morning' | 'afternoon' | 'evening' | 'night' | 'late';
  /** A short warm label, e.g. "late evening", "fast asleep". */
  label: string;
  /** Emoji for the phase. */
  emoji: string;
  /** Whole-hour difference partner − me (e.g. +3 means they're ahead). */
  diffHours: number;
  /** Human diff, e.g. "3h ahead", "same time", "2h behind". */
  diffLabel: string;
  /** Whether it's a delicate time to ping them (asleep hours). */
  asleep: boolean;
};

/** Current wall-clock hour (0-23) in an IANA timezone. */
function hourInZone(tz: string, now: Date): number {
  const s = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: tz }).format(now);
  const h = parseInt(s, 10);
  return Number.isFinite(h) ? h % 24 : now.getHours();
}

/** Minute-of-day offset of a zone from UTC, used to compute the couple's diff. */
function zoneOffsetMinutes(tz: string, now: Date): number {
  // Render the same instant as a "wall clock" in the zone, then diff from UTC.
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
  const parts = dtf.formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
  return Math.round((asUTC - now.getTime()) / 60000);
}

export function partnerClock(tz: string | null | undefined, myTz: string | null | undefined, now: Date = new Date()): PartnerClock | null {
  if (!tz) return null;
  let time: string;
  let hour: number;
  try {
    time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz }).format(now);
    hour = hourInZone(tz, now);
  } catch {
    return null; // invalid tz string
  }

  let phase: PartnerClock['phase'];
  let label: string;
  let emoji: string;
  if (hour >= 5 && hour < 12) { phase = 'morning'; label = 'good morning'; emoji = '☀️'; }
  else if (hour >= 12 && hour < 17) { phase = 'afternoon'; label = 'afternoon'; emoji = '🌤️'; }
  else if (hour >= 17 && hour < 21) { phase = 'evening'; label = 'evening'; emoji = '🌆'; }
  else if (hour >= 21 && hour < 24) { phase = 'night'; label = 'winding down'; emoji = '🌙'; }
  else { phase = 'late'; label = 'fast asleep'; emoji = '😴'; } // 0–5

  const asleep = hour >= 23 || hour < 6;

  // Diff between the two zones (partner − me).
  let diffHours = 0;
  try {
    if (myTz) {
      const diffMin = zoneOffsetMinutes(tz, now) - zoneOffsetMinutes(myTz, now);
      diffHours = Math.round(diffMin / 60);
    }
  } catch { diffHours = 0; }

  const diffLabel =
    diffHours === 0 ? 'same time as you'
    : diffHours > 0 ? `${diffHours}h ahead of you`
    : `${Math.abs(diffHours)}h behind you`;

  return { time, hour, phase, label, emoji, diffHours, diffLabel, asleep };
}

/** This device's IANA timezone, or null if unavailable. */
export function deviceTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}
