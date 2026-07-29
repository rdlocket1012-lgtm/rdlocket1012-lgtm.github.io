/**
 * TEMPORARY — the 17 Jul 2026 reunion.
 *
 * Everything for the one-off reunion surprise is gated on the constants in this
 * file, so tearing it back down afterwards is: delete this file, then delete the
 * two things that import it (`components/home/ReunionCountdown.tsx` and its call
 * site in `app/(tabs)/index.tsx`).
 *
 * This ships over the `production` OTA channel, which every v1.1.0 install
 * receives — so the card is gated on couple id as well as time. Only this couple
 * can ever render it, regardless of who pulls the update.
 */

/** Rendell + Daljeet. Any other couple never renders the reunion card. */
export const REUNION_COUPLE_ID = '12e21298-884c-49b3-8da1-ae8bf69705f2';

/** 5:30 PM, 17 Jul 2026, UTC-6 — the moment they actually meet.
 *  Written with an explicit offset so it's an absolute instant, not a
 *  device-local guess. */
export const REUNION_AT = new Date('2026-07-17T17:30:00-06:00');

/** How long the "you're together" state lingers before the card retires itself.
 *  After this the component renders null forever and the OTA becomes inert
 *  without needing a follow-up push. */
export const REUNION_GRACE_MS = 8 * 60 * 60 * 1000;
