import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Post-value paywall timing (UX_POLISH_PLAN §A7).
 *
 * Every existing paywall trigger is a *wall*: the user hit a cap and the sheet
 * explains why. That's the only place Locket asks, which means it only ever asks
 * at the moment of frustration. The strongest moment to ask is the opposite one —
 * right after a peak, when the couple has just felt the product work.
 *
 * The soft-nudge model (see the `feature-decisions` memory) is what keeps this
 * from turning into nagging, so the rules are deliberately strict:
 *
 *  1. **Follows a peak, never interrupts one.** Callers offer from the peak
 *     overlay's `onDismiss`, after a short beat, so the celebration always
 *     finishes first and two full-screen surfaces never stack.
 *  2. **Each named moment fires at most once, ever.** A repeatable peak (a badge,
 *     a streak) can't ask twice for the same reason.
 *  3. **A global cooldown between offers**, so two peaks in the same evening
 *     produce one ask.
 *  4. **A lifetime cap.** After this many post-value asks the app stops
 *     volunteering entirely and goes back to cap-driven walls only.
 *
 * Callers must also check `isPremium` and that the couple is actually paired —
 * asking a user who hasn't found their partner yet is asking for nothing.
 */

const KEY = 'lk.premiumMoments.v1';

/** Days that must pass between two post-value offers. */
const COOLDOWN_DAYS = 21;

/** Total post-value offers this install will ever make. */
const LIFETIME_CAP = 3;

const DAY_MS = 86_400_000;

/** Reasons are stable strings so the "once ever" rule survives app restarts. */
export type PremiumMoment =
  | `milestone-${number}`
  | `badge-${string}`;

type Ledger = {
  /** How many post-value offers have been made on this install. */
  count: number;
  /** Epoch ms of the most recent offer. */
  last: number;
  /** Moments already used, so none repeats. */
  used: string[];
};

const EMPTY: Ledger = { count: 0, last: 0, used: [] };

async function read(): Promise<Ledger> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Ledger>;
    return {
      count: typeof parsed.count === 'number' ? parsed.count : 0,
      last: typeof parsed.last === 'number' ? parsed.last : 0,
      used: Array.isArray(parsed.used) ? parsed.used.filter((u) => typeof u === 'string') : [],
    };
  } catch {
    // A corrupt ledger must fail *closed* — silently not offering is a far
    // better failure than re-offering on every peak forever.
    return { count: LIFETIME_CAP, last: Date.now(), used: [] };
  }
}

/**
 * Ask whether this peak may show the paywall, and consume the moment if so.
 *
 * Combined on purpose: a separate check-then-record pair is one `await` away
 * from a bug where the offer shows but never gets recorded, and the same peak
 * asks again on every render.
 *
 * Returns false on any storage error — never offer on a guess.
 */
export async function claimPremiumMoment(reason: PremiumMoment): Promise<boolean> {
  try {
    const ledger = await read();
    if (ledger.count >= LIFETIME_CAP) return false;
    if (ledger.used.includes(reason)) return false;
    if (ledger.last && Date.now() - ledger.last < COOLDOWN_DAYS * DAY_MS) return false;

    const next: Ledger = {
      count: ledger.count + 1,
      last: Date.now(),
      used: [...ledger.used, reason],
    };
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

/**
 * Which milestone counts are worth asking on.
 *
 * **Deviation from the plan as written**, which said "first milestone saved".
 * The first save is an activation moment, not a value moment: the couple has
 * just started and has 29 of 30 free slots left, so an upsell there reads as a
 * toll booth on the front door. The 10th is where the timeline starts to feel
 * like *theirs*, and it's the same count the peak-moment copy already gives its
 * own beat to. Multiples of 25 catch the couples who are genuinely near the cap.
 */
export function milestoneMoment(count: number): PremiumMoment | null {
  if (count === 10) return 'milestone-10';
  if (count > 0 && count % 25 === 0) return `milestone-${count}`;
  return null;
}

/**
 * Which streak badges are worth asking on.
 *
 * The plan listed "streak hits 7" and "badge unlocked" as two separate triggers,
 * but the badge tiers *are* the streak milestones (3 / 7 / 14 / 30 / …), so a
 * streak-7 trigger would fire alongside the One Week badge and ask twice for one
 * event. The badge already owns a full-screen celebration, so it owns the ask.
 *
 * The 3-day First Spark is excluded: it lands on day three of using the app,
 * which is too early to have earned the right to ask.
 */
export function badgeMoment(days: number, key: string): PremiumMoment | null {
  if (days < 7) return null;
  return `badge-${key}`;
}

/**
 * How long to wait after a peak dismisses before the paywall slides in.
 * Long enough to clear the overlay's 260ms fade-out, short enough to still read
 * as part of the same beat. Mirrors the letter-arrival delay in `letter-moments`.
 */
export const PEAK_HANDOFF_MS = 420;
