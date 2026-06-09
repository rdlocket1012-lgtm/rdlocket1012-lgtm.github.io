import { format, formatDistanceToNow, differenceInDays, startOfDay, endOfDay, isSameDay } from 'date-fns';

export function daysTogether(startDate: Date): number {
  return differenceInDays(new Date(), startDate) + 1;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
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
