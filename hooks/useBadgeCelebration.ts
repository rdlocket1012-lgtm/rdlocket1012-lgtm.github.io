import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STREAK_BADGES, unlockedCount, type StreakBadge } from '@/constants/streak-achievements';

const SEEN_KEY = 'lk.streakBadgesSeen';

/**
 * Watches the couple's best streak and fires a one-time celebration whenever a
 * new badge tier is crossed. The number of acknowledged badges is persisted, so:
 *  - Existing users who already earned badges before this feature shipped are
 *    baselined silently (no retroactive confetti spam).
 *  - A live increment (e.g. completing today's quiz) celebrates immediately.
 *  - A threshold crossed while the app was closed celebrates on next open.
 *
 * Pass in `best` + `ready` (= !loading) from an existing useQuizStreak() call so
 * this hook doesn't open its own realtime subscriptions.
 */
export function useBadgeCelebration(best: number, ready: boolean) {
  const [celebrating, setCelebrating] = useState<StreakBadge | null>(null);
  const seenRef = useRef<number | null>(null);
  const initialisedRef = useRef(false);

  useEffect(() => {
    if (!ready) return;
    const now = unlockedCount(best);

    // First ready render — establish the baseline from storage.
    if (!initialisedRef.current) {
      initialisedRef.current = true;
      AsyncStorage.getItem(SEEN_KEY)
        .then((stored) => {
          const persisted = stored != null ? parseInt(stored, 10) : null;
          if (persisted == null) {
            // Never tracked before — baseline silently, celebrate only going forward.
            seenRef.current = now;
            return AsyncStorage.setItem(SEEN_KEY, String(now));
          }
          if (now > persisted) {
            setCelebrating(STREAK_BADGES[now - 1] ?? null);
          }
          seenRef.current = now;
          return AsyncStorage.setItem(SEEN_KEY, String(now));
        })
        .catch(() => { seenRef.current = now; });
      return;
    }

    // Subsequent live changes within the session.
    if (seenRef.current != null && now > seenRef.current) {
      setCelebrating(STREAK_BADGES[now - 1] ?? null);
      seenRef.current = now;
      AsyncStorage.setItem(SEEN_KEY, String(now)).catch(() => {});
    }
  }, [ready, best]);

  const dismiss = useCallback(() => setCelebrating(null), []);

  return { celebrating, dismiss };
}
