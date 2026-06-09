import { differenceInDays } from 'date-fns';

export function isWithinGracePeriod(deletedAt: string | null): boolean {
  if (!deletedAt) return false;
  return differenceInDays(new Date(), new Date(deletedAt)) < 30;
}

export function filterDeleted<T extends { deleted_at: string | null }>(items: T[]): T[] {
  return items.filter((item) => item.deleted_at === null);
}
