import { LK } from '@/constants/theme';

/**
 * Streak achievement tiers. A badge unlocks once the couple's BEST quiz streak
 * (longest run ever, from useQuizStreak().best) reaches its `days` threshold.
 *
 * `icon` names must exist in components/ui/Icon.tsx. `accent` is a design token.
 */
export type StreakBadge = {
  key: string;
  days: number;
  title: string;
  blurb: string;   // shown under the title once unlocked / as the goal when locked
  icon: string;
  accent: string;
};

export const STREAK_BADGES: StreakBadge[] = [
  { key: 'spark',   days: 3,   title: 'First Spark',   blurb: '3 days in a row',   icon: 'sparkle',  accent: LK.marigold },
  { key: 'week',    days: 7,   title: 'One Week',      blurb: '7 day streak',      icon: 'star',     accent: LK.coral },
  { key: 'fort',    days: 14,  title: 'Two Weeks',     blurb: '14 day streak',     icon: 'moon',     accent: LK.sky },
  { key: 'month',   days: 30,  title: 'One Month',     blurb: '30 day streak',     icon: 'gem',      accent: LK.lilac },
  { key: 'quarter', days: 90,  title: 'Three Months',  blurb: '90 day streak',     icon: 'shield',   accent: LK.sage },
  { key: 'half',    days: 180, title: 'Six Months',    blurb: '180 day streak',    icon: 'flower',   accent: LK.blush },
  { key: 'year',    days: 365, title: 'One Year',      blurb: '365 day streak',    icon: 'crown',    accent: LK.gold },
  { key: 'two_yr',  days: 730, title: 'Two Years',     blurb: '730 day streak',    icon: 'mountain', accent: LK.teal },
];

/** The next badge the couple is working toward, or null once all are unlocked. */
export function nextBadge(best: number): StreakBadge | null {
  return STREAK_BADGES.find((b) => best < b.days) ?? null;
}

/** Count of unlocked badges for a given best-streak value. */
export function unlockedCount(best: number): number {
  return STREAK_BADGES.filter((b) => best >= b.days).length;
}
