/**
 * Forgiving shared-streak math for the Daily Match.
 *
 * A day "counts" when BOTH partners completed that day's quiz. The streak is
 * deliberately gentle (per couples-app research, guilt-driven streaks backfire):
 *  - Today not being done yet never counts against you — the streak is measured
 *    up to yesterday until you complete today.
 *  - A single missed day is bridged by one automatic "freeze" so one slip does
 *    not reset the run. Two missed days in a row ends it.
 *  - There are no broken/negative states — only a count and a soft "saved" flag.
 */

export type StreakInfo = {
  /** Length of the current run (in counted days). */
  current: number;
  /** Longest run ever (strict consecutive, for a gentle "best" stat). */
  best: number;
  /** Whether today is already completed by both. */
  todayDone: boolean;
  /** A freeze is currently holding the run together (a recent day was missed). */
  freezeActive: boolean;
};

/** Parse YYYY-MM-DD as a LOCAL date (avoids UTC-midnight day shifts). */
function parse(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fmt(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function addDays(dateStr: string, delta: number): string {
  const d = parse(dateStr);
  d.setDate(d.getDate() + delta);
  return fmt(d);
}

/** Longest strict consecutive run of completed days (used for the "best" stat). */
function longestRun(set: Set<string>): number {
  if (set.size === 0) return 0;
  const sorted = Array.from(set).sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (addDays(sorted[i - 1], 1) === sorted[i]) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

export function computeStreak(completedDates: string[], today: string): StreakInfo {
  const set = new Set(completedDates);
  const todayDone = set.has(today);

  let current = 0;
  let freezeLeft = 1; // one grace day to bridge a single miss
  let countAtFreeze = -1; // run length when the freeze was spent

  // Start the backward walk at today (or yesterday if today isn't done yet, so
  // an unfinished today never penalizes the run).
  let cursor = todayDone ? today : addDays(today, -1);

  while (true) {
    if (set.has(cursor)) {
      current++;
      cursor = addDays(cursor, -1);
    } else if (freezeLeft > 0) {
      freezeLeft--;
      countAtFreeze = current;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }

  // The freeze only "saved" the streak if it bridged a gap to MORE completed
  // days — not if it merely walked off the start of history.
  const freezeActive = current > 0 && countAtFreeze >= 0 && current > countAtFreeze;

  return { current, best: longestRun(set), todayDone, freezeActive };
}
