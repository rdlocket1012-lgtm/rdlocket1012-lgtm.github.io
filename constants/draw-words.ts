export type Difficulty = 'easy' | 'medium' | 'hard';

type WordEntry = { word: string; difficulty: Difficulty };

const WORDS: WordEntry[] = [
  // Animals
  { word: 'cat', difficulty: 'easy' },
  { word: 'dog', difficulty: 'easy' },
  { word: 'fish', difficulty: 'easy' },
  { word: 'bird', difficulty: 'easy' },
  { word: 'rabbit', difficulty: 'easy' },
  { word: 'penguin', difficulty: 'medium' },
  { word: 'butterfly', difficulty: 'medium' },
  { word: 'elephant', difficulty: 'medium' },
  { word: 'jellyfish', difficulty: 'hard' },
  { word: 'flamingo', difficulty: 'hard' },
  { word: 'hedgehog', difficulty: 'hard' },

  // Food
  { word: 'pizza', difficulty: 'easy' },
  { word: 'cake', difficulty: 'easy' },
  { word: 'donut', difficulty: 'easy' },
  { word: 'ice cream', difficulty: 'easy' },
  { word: 'apple', difficulty: 'easy' },
  { word: 'sushi', difficulty: 'medium' },
  { word: 'bubble tea', difficulty: 'medium' },
  { word: 'ramen', difficulty: 'medium' },
  { word: 'croissant', difficulty: 'hard' },
  { word: 'avocado toast', difficulty: 'hard' },
  { word: 'dumplings', difficulty: 'medium' },

  // Places
  { word: 'beach', difficulty: 'easy' },
  { word: 'park', difficulty: 'easy' },
  { word: 'home', difficulty: 'easy' },
  { word: 'mountains', difficulty: 'medium' },
  { word: 'airport', difficulty: 'medium' },
  { word: 'library', difficulty: 'medium' },
  { word: 'treehouse', difficulty: 'hard' },
  { word: 'cozy cafe', difficulty: 'hard' },
  { word: 'hot spring', difficulty: 'hard' },

  // Feelings
  { word: 'happy', difficulty: 'easy' },
  { word: 'sad', difficulty: 'easy' },
  { word: 'sleepy', difficulty: 'medium' },
  { word: 'excited', difficulty: 'medium' },
  { word: 'in love', difficulty: 'hard' },
  { word: 'nervous', difficulty: 'hard' },
  { word: 'cozy', difficulty: 'hard' },

  // Actions
  { word: 'running', difficulty: 'easy' },
  { word: 'reading', difficulty: 'easy' },
  { word: 'cooking', difficulty: 'easy' },
  { word: 'hugging', difficulty: 'easy' },
  { word: 'dancing', difficulty: 'medium' },
  { word: 'swimming', difficulty: 'medium' },
  { word: 'hiking', difficulty: 'medium' },
  { word: 'stargazing', difficulty: 'hard' },

  // Us / Relationship
  { word: 'cuddle', difficulty: 'easy' },
  { word: 'picnic', difficulty: 'easy' },
  { word: 'date night', difficulty: 'medium' },
  { word: 'road trip', difficulty: 'medium' },
  { word: 'sunrise', difficulty: 'medium' },
  { word: 'first kiss', difficulty: 'hard' },
  { word: 'our song', difficulty: 'hard' },
  { word: 'anniversary', difficulty: 'hard' },
];

function pick(pool: WordEntry[]): string {
  return pool[Math.floor(Math.random() * pool.length)].word;
}

/** Returns [easy, medium, hard] — one option per difficulty tier. */
export function getWordOptions(): [string, string, string] {
  const easy = WORDS.filter((w) => w.difficulty === 'easy');
  const medium = WORDS.filter((w) => w.difficulty === 'medium');
  const hard = WORDS.filter((w) => w.difficulty === 'hard');
  return [pick(easy), pick(medium), pick(hard)];
}
