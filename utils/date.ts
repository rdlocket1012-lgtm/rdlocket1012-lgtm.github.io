import { format, formatDistanceToNow, differenceInDays, startOfDay, endOfDay, isSameDay } from 'date-fns';

export function daysTogether(startDate: Date): number {
  return differenceInDays(new Date(), startDate) + 1;
}

/**
 * Parses a date value safely. A bare `YYYY-MM-DD` string is parsed as LOCAL
 * midnight (not UTC) so it never shifts a day backward in negative-offset
 * timezones. Other strings/Dates pass through unchanged.
 */
export function parseLocalDate(date: Date | string): Date {
  if (typeof date !== 'string') return date;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(date);
}

export function formatDate(date: Date | string): string {
  return format(parseLocalDate(date), 'MMM d, yyyy');
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isTodayAnniversary(date: Date): boolean {
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

export function startOfDayTs(date: Date): number {
  return startOfDay(date).getTime();
}

export function endOfDayTs(date: Date): number {
  return endOfDay(date).getTime();
}

export { isSameDay, startOfDay, endOfDay };
