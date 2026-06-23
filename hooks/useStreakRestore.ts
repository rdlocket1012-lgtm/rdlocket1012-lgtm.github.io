import { useMemo } from 'react';
import { useQuizStreak, addDays, todayISO } from '@/hooks/useQuizStreak';

/**
 * Determines whether a streak restore coupon can currently be gifted.
 *
 * The streak is considered "broken" when current === 0 and there was a prior
 * run (lastCompletionDate exists). The gifting window is 48 h from the moment
 * the streak actually broke, which happens on `lastCompletionDate + 2 days`
 * (1 natural miss + the 1 automatic freeze day). That makes the deadline
 * `lastCompletionDate + 4 days`.
 *
 * On redemption the gifter calls `addStreakRestoreCoupon` in coupons.store,
 * which inserts override rows for each missed date so the streak is
 * immediately visible to both partners.
 */
export function useStreakRestore() {
  const { current, lastCompletionDate, loading } = useQuizStreak();
  const today = todayISO();

  return useMemo(() => {
    const isStreakBroken = current === 0 && !!lastCompletionDate;

    if (!isStreakBroken || !lastCompletionDate) {
      return {
        isStreakBroken: false,
        canRestore: false,
        hoursLeft: 0,
        missedDates: [] as string[],
        streakBeforeBreak: 0,
        loading,
      };
    }

    // Streak broke on day lastCompletionDate+2 (0-indexed missed days: +1 grace, +2 break).
    // 48 h from that = lastCompletionDate+4.
    const deadlineStr = addDays(lastCompletionDate, 4);
    const deadlineMs = new Date(deadlineStr + 'T00:00:00').getTime();
    const nowMs = Date.now();
    const canRestore = nowMs < deadlineMs;
    const hoursLeft = canRestore ? Math.ceil((deadlineMs - nowMs) / 3600000) : 0;

    // Dates to restore = all missed days between lastCompletion+1 and yesterday.
    const yesterday = addDays(today, -1);
    const missedDates: string[] = [];
    let cursor = addDays(lastCompletionDate, 1);
    while (cursor <= yesterday) {
      missedDates.push(cursor);
      cursor = addDays(cursor, 1);
    }

    return {
      isStreakBroken: true,
      canRestore,
      hoursLeft,
      missedDates,
      streakBeforeBreak: missedDates.length, // approximate — how many days were lost
      loading,
    };
  }, [current, lastCompletionDate, today, loading]);
}
