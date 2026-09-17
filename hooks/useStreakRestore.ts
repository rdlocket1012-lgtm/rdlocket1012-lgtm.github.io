import { useMemo } from 'react';
import { useQuizStreak, addDays, todayISO } from '@/hooks/useQuizStreak';

/**
 * Determines whether a streak restore coupon can currently be gifted.
 *
 * The streak is considered "broken" when current === 0 and there was a prior
 * run (lastCompletionDate exists). Because of the automatic freeze, `current`
 * only reads 0 once TWO days have been missed — i.e. from `lastCompletionDate + 3`
 * (miss on +1 is bridged by the freeze, +2 is the breaking miss, and the
 * backward walk first returns 0 on the following day, +3). A true 48 h gifting
 * window from that moment therefore ends at `lastCompletionDate + 5`.
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

    // `current` first reads 0 on lastCompletionDate+3 (+1 grace freeze, +2 break,
    // +3 is when the backward walk returns 0). A full 48 h from that = +5.
    const deadlineStr = addDays(lastCompletionDate, 5);
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
