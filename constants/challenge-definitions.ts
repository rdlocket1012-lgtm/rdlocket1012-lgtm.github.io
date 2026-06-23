/**
 * Static pool of app-defined rotating weekly challenges.
 *
 * Selection is deterministic: ISO-week-number % pool.length → same challenge
 * for all couples in the same week. No server content management needed.
 */

export type ChallengeActivity =
  | 'quiz_both_answered'  // both partners answer the same daily_quiz row
  | 'letter_sent'         // any letter (text or voice) sent to partner
  | 'drawing_sent'        // partner drawing sent via partner_drawings table
  | 'bucket_completed';   // bucket_list_item marked done (completed_at set)

export type ChallengeDef = {
  key: string;
  period: 'weekly';
  activity: ChallengeActivity;
  target: number;    // combined couple count (both partners' actions summed)
  title: string;
  description: string;
  icon: string;      // Icon component name
  accent: string;    // hex color used for progress bar + icon tint
};

export const WEEKLY_CHALLENGES: ChallengeDef[] = [
  {
    key: 'w_quiz_5',
    period: 'weekly',
    activity: 'quiz_both_answered',
    target: 5,
    title: 'Answer 5 daily quizzes together',
    description: 'Both of you complete 5 daily match questions this week.',
    icon: 'star',
    accent: '#9B8CFF', // Lilac
  },
  {
    key: 'w_letters_2',
    period: 'weekly',
    activity: 'letter_sent',
    target: 2,
    title: 'Write each other 2 letters',
    description: 'Send 2 heartfelt letters between you this week.',
    icon: 'feather',
    accent: '#C2873C', // Gold
  },
  {
    key: 'w_drawings_3',
    period: 'weekly',
    activity: 'drawing_sent',
    target: 3,
    title: 'Send 3 drawings to each other',
    description: 'Share 3 partner drawings this week — doodles welcome.',
    icon: 'palette',
    accent: '#FF7A6B', // Coral
  },
  {
    key: 'w_bucket_1',
    period: 'weekly',
    activity: 'bucket_completed',
    target: 1,
    title: 'Tick off a bucket list item',
    description: 'Complete at least one thing from your shared bucket list.',
    icon: 'check',
    accent: '#A8D08D', // Sage
  },
  {
    key: 'w_quiz_7',
    period: 'weekly',
    activity: 'quiz_both_answered',
    target: 7,
    title: 'Complete every daily quiz this week',
    description: 'Go 7 for 7 — answer the daily match question every single day.',
    icon: 'star',
    accent: '#9B8CFF', // Lilac
  },
  {
    key: 'w_letters_3',
    period: 'weekly',
    activity: 'letter_sent',
    target: 3,
    title: 'Exchange 3 letters this week',
    description: 'Share 3 letters between you — text, voice, or sealed.',
    icon: 'feather',
    accent: '#C2873C', // Gold
  },
  {
    key: 'w_drawings_5',
    period: 'weekly',
    activity: 'drawing_sent',
    target: 5,
    title: 'Share 5 drawings with each other',
    description: 'Keep the sketchbook busy — 5 drawings from either of you.',
    icon: 'palette',
    accent: '#FF7A6B', // Coral
  },
  {
    key: 'w_bucket_2',
    period: 'weekly',
    activity: 'bucket_completed',
    target: 2,
    title: 'Complete 2 bucket list adventures',
    description: 'Check two things off your list — big or little.',
    icon: 'check',
    accent: '#A8D08D', // Sage
  },
];

/** ISO week number (Monday = week start). Same week across timezones. */
function isoWeekNumber(d: Date): number {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  );
}

/** The Monday of the week containing `d` as a YYYY-MM-DD string. */
function mondayOf(d: Date): string {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${mon.getFullYear()}-${p(mon.getMonth() + 1)}-${p(mon.getDate())}`;
}

/** The Sunday of the week containing `d` as a YYYY-MM-DD string. */
function sundayOf(d: Date): string {
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  const sun = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${sun.getFullYear()}-${p(sun.getMonth() + 1)}-${p(sun.getDate())}`;
}

/** The challenge definition running in the current ISO week. */
export function getCurrentChallengeDef(today: Date = new Date()): ChallengeDef {
  const week = isoWeekNumber(today);
  return WEEKLY_CHALLENGES[week % WEEKLY_CHALLENGES.length];
}

/** Start (Monday) and end (Sunday) of the current week as YYYY-MM-DD strings. */
export function getCurrentWeekBounds(today: Date = new Date()): { start: string; end: string } {
  return { start: mondayOf(today), end: sundayOf(today) };
}
