// Hidden date-night ideas revealed via scratch-off. Deterministic daily pick
// keeps both partners' cards in sync.
export const DATE_IDEAS = [
  'Cook a brand-new recipe together — loser does the dishes.',
  'Build a blanket fort and watch a film from your first year together.',
  'Take a sunset walk and trade three favourite memories each.',
  'Recreate your very first date — same food, same playlist.',
  'Do a 20-question rapid-fire round about each other.',
  'Plan a dream trip you can’t afford yet, in full detail.',
  'Give each other a 10-minute back massage, no phones.',
  'Make a two-song playlist for each other and listen together.',
  'Bake something sweet and decorate it ridiculously.',
  'Stargaze and name a constellation after your relationship.',
  'Write a tiny love note and hide it for them to find tomorrow.',
  'Have a no-screens candlelit dinner at home.',
  'Try a 15-minute couples yoga or stretch session.',
  'Draw each other’s portrait in 60 seconds — keep them forever.',
  'Pick a country and have its food + music for the night.',
  'Slow dance to one song in the kitchen.',
];

/** Returns `count` ideas chosen deterministically for the given date (synced for both partners). */
export function dateIdeasForDay(d: Date, count = 4): string[] {
  const start = new Date(d.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86400000);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(DATE_IDEAS[(dayOfYear * 3 + i * 5) % DATE_IDEAS.length]);
  }
  return out;
}
