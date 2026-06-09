export type QuizQuestion = {
  category: 'casual' | 'romantic' | 'deep';
  prompt: string;
  options: [string, string, string, string]; // A, B, C, D
};

// 30-question rotating bank. The day's question = dayOfYear % QUIZ_QUESTIONS.length.
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ── Category 1: Hilarious & Casual ──
  { category: 'casual', prompt: 'If your partner could magically banish one chore forever, which is getting deleted?', options: ['The mountain of dishes', 'Folding & putting away laundry', 'Taking out the trash in the cold', 'Deciding what to eat every night'] },
  { category: 'casual', prompt: 'Snack blackout at a convenience store — what are they walking out with?', options: ['Something extremely chocolatey', 'Aggressively spicy or salty chips', 'A baked good or gummies', 'Just a drink — they resisted'] },
  { category: 'casual', prompt: "Their ultimate guilty-pleasure activity with the house to themselves?", options: ['Singing dramatically at full volume', 'Games / a secret project for 6 hrs', 'A massive multi-hour nap', 'Pacing while deep in thought'] },
  { category: 'casual', prompt: 'If your partner was in a horror movie, what is their tragic fate?', options: ['Investigates the noise, dies first', "Skeptic who won't believe it", 'Mastermind who survives to the end', 'Tries to befriend the ghost'] },
  { category: 'casual', prompt: "Which minor inconvenience ruins their whole morning mood?", options: ['Tech that won’t connect', 'Dropping food they were excited for', 'Waking 5 min before the alarm', 'Stubbing a toe on the bed frame'] },
  { category: 'casual', prompt: 'If your partner won a bizarre world record, it would be for…', options: ['Overanalyzing a single text', 'Falling asleep in any moving vehicle', 'Highest daily caffeine / tea intake', 'Most unfinished draft projects'] },
  { category: 'casual', prompt: 'Your partner says "I’ll be ready in 5 minutes." It really means…', options: ['Already putting shoes on (rare)', 'Still scrolling in a towel', 'Just stepped into the shower', "Pray — they haven’t started"] },
  { category: 'casual', prompt: 'If your partner became a viral meme, which one?', options: ['Panik / Kalm overthinking', 'Cat staring at a screen at 3 AM', 'Wholesome supportive reaction', '"This is Fine" amid chaos'] },
  { category: 'casual', prompt: "Their worst grocery shopping habit?", options: ['Shops hungry, buys the snack aisle', 'Rigid list, refuses to browse', 'Forgets the 3 things they came for', 'Compares nutrition labels for ages'] },
  { category: 'casual', prompt: 'Zombie apocalypse with only their desk objects — how do they fare?', options: ['Elite — weaponizes their tech', 'Okay, but complains about no wifi', 'Casualty within 10 minutes', 'Talks the zombies into leaving'] },

  // ── Category 2: Cozy & Romantic ──
  { category: 'romantic', prompt: "Favorite way to receive affection when totally exhausted?", options: ['Heavy, silent bear hugs', 'Hair strokes / back scratches', 'Sneaky surprise kisses', 'Quietly together, feet touching'] },
  { category: 'romantic', prompt: 'Movie-night cuddle configuration of choice?', options: ['Big spoon / holding you tight', 'Little spoon / buried in your chest', 'Head on your shoulder or lap', 'Tangled up, limbs everywhere'] },
  { category: 'romantic', prompt: 'Trying to be subtle about initiating a kiss, they…', options: ['Give "the look" and lean in slow', 'Stop mid-sentence, stare at your lips', 'Say they’re cold so you move closer', "No subtlety — they just dive in"] },
  { category: 'romantic', prompt: 'Their signature way of saying "I love you" without words?', options: ['Making sure you’ve eaten / a warm drink', 'Random funny links that remind them of you', 'Squeezing your hand three times', 'Fixing a problem before you ask'] },
  { category: 'romantic', prompt: 'Which romantic trope fits your dynamic best?', options: ['Grumpy vs. Sunshine', 'Two chaotic besties, one brain cell', 'Hopeless romantic vs. realist', 'Mutual adoration / obsessed'] },
  { category: 'romantic', prompt: "Their absolute favorite spot to be kissed?", options: ['Right on the lips, full stop', 'A soft, protective forehead kiss', 'A surprise cheek or jawline kiss', 'A playful kiss on hand or nose'] },
  { category: 'romantic', prompt: 'Their ideal recipe for a perfect date night?', options: ['Dressed up, intimate dinner somewhere new', 'Blanket fort + takeout at home', 'Outdoor adventure + stargazing', 'Midnight drive with a favorite playlist'] },
  { category: 'romantic', prompt: 'A spontaneous out-of-nowhere hug was triggered by…', options: ['You did something cute or funny', 'They felt lucky to have you', 'They needed a quick comfort recharge', 'Cold hands — you’re the heater'] },
  { category: 'romantic', prompt: 'How long before they start missing your cuddles?', options: ['A few hours — needy puppy', 'A day, then separation anxiety', 'Tough outside, breaks by half a day', 'Craves space, folds when they see you'] },
  { category: 'romantic', prompt: 'If they could freeze time in one shared moment, it’d be…', options: ['Laughing at an inside joke', 'Quiet morning before getting up', 'Slow dancing / holding hands', 'Right after a reassuring talk'] },

  // ── Category 3: Know Them Even Better ──
  { category: 'deep', prompt: 'Under massive stress, what do they need most from you?', options: ['Space and silence to process', 'A sounding board to vent it all', 'Active distraction from the issue', 'Quiet physical reassurance'] },
  { category: 'deep', prompt: 'Their most deep-rooted fear around communication?', options: ['Being a burden or annoying you', 'Being misunderstood / twisted', 'Sounding too emotional', 'Causing conflict when it’s peaceful'] },
  { category: 'deep', prompt: 'Which compliment makes their heart swell most?', options: ['Pride in their creative work / mind', 'That they make you feel safe', 'About their appearance or smile', 'That they’re a deeply kind soul'] },
  { category: 'deep', prompt: 'Their primary love language?', options: ['Words of Affirmation', 'Quality Time', 'Physical Touch', 'Acts of Service / Gifts'] },
  { category: 'deep', prompt: 'One thing they’d fix about how they handle disagreements?', options: ['Avoiding it to keep the peace', 'Getting defensive / shutting down', 'Wanting to solve it immediately', 'Overthinking it into a bigger deal'] },
  { category: 'deep', prompt: "Their definition of a true “safe space”?", options: ['Comfortable silence, no awkwardness', 'Sharing messy thoughts unjudged', 'A cozy room, zero responsibilities', 'Wrapped in your arms amid chaos'] },
  { category: 'deep', prompt: 'Where are they pouring the most emotional energy right now?', options: ['Creative passion / identity', 'Long-term security & structure', 'Mental health & boundaries', 'Our future foundation together'] },
  { category: 'deep', prompt: "Something they’re secretly sensitive about?", options: ['Their hard work going unnoticed', 'Falling behind their timeline', "Not matching your energy", 'Criticism, even given lovingly'] },
  { category: 'deep', prompt: 'What do they value most about your connection?', options: ['You make them laugh when sad', 'They can be their weirdest self', 'Mutual respect & emotional safety', "You support each other’s dreams"] },
  { category: 'deep', prompt: 'Their primary focus for the next big life step?', options: ['A milestone in their craft / career', 'Setting roots / a permanent home', 'A healthier, slower routine', 'Lifelong memories & traveling together'] },
];

export const LETTERS = ['A', 'B', 'C', 'D'] as const;

/** Returns the question index for a given date (deterministic, rotates daily). */
export function questionIndexForDate(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return dayOfYear % QUIZ_QUESTIONS.length;
}
