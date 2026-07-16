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

  // ── Animals (more) ──
  { word: 'snail', difficulty: 'easy' },
  { word: 'snake', difficulty: 'easy' },
  { word: 'bee', difficulty: 'easy' },
  { word: 'ladybug', difficulty: 'easy' },
  { word: 'frog', difficulty: 'easy' },
  { word: 'turtle', difficulty: 'easy' },
  { word: 'crab', difficulty: 'easy' },
  { word: 'shark', difficulty: 'easy' },
  { word: 'owl', difficulty: 'medium' },
  { word: 'octopus', difficulty: 'medium' },
  { word: 'whale', difficulty: 'medium' },
  { word: 'dolphin', difficulty: 'medium' },
  { word: 'giraffe', difficulty: 'medium' },
  { word: 'lion', difficulty: 'medium' },
  { word: 'monkey', difficulty: 'medium' },
  { word: 'panda', difficulty: 'medium' },
  { word: 'dinosaur', difficulty: 'medium' },
  { word: 'unicorn', difficulty: 'medium' },
  { word: 'dragon', difficulty: 'hard' },
  { word: 'peacock', difficulty: 'hard' },

  // ── Food (more) ──
  { word: 'banana', difficulty: 'easy' },
  { word: 'carrot', difficulty: 'easy' },
  { word: 'egg', difficulty: 'easy' },
  { word: 'cherry', difficulty: 'easy' },
  { word: 'lollipop', difficulty: 'easy' },
  { word: 'cookie', difficulty: 'easy' },
  { word: 'hotdog', difficulty: 'easy' },
  { word: 'watermelon', difficulty: 'easy' },
  { word: 'strawberry', difficulty: 'easy' },
  { word: 'hamburger', difficulty: 'medium' },
  { word: 'taco', difficulty: 'medium' },
  { word: 'popcorn', difficulty: 'medium' },
  { word: 'cupcake', difficulty: 'medium' },
  { word: 'pineapple', difficulty: 'medium' },
  { word: 'pretzel', difficulty: 'medium' },
  { word: 'sandwich', difficulty: 'medium' },

  // ── Nature & weather ──
  { word: 'sun', difficulty: 'easy' },
  { word: 'moon', difficulty: 'easy' },
  { word: 'star', difficulty: 'easy' },
  { word: 'cloud', difficulty: 'easy' },
  { word: 'rainbow', difficulty: 'easy' },
  { word: 'tree', difficulty: 'easy' },
  { word: 'flower', difficulty: 'easy' },
  { word: 'mushroom', difficulty: 'easy' },
  { word: 'cactus', difficulty: 'easy' },
  { word: 'snowflake', difficulty: 'medium' },
  { word: 'lightning', difficulty: 'medium' },
  { word: 'volcano', difficulty: 'medium' },
  { word: 'island', difficulty: 'medium' },
  { word: 'waterfall', difficulty: 'hard' },
  { word: 'tornado', difficulty: 'hard' },

  // ── Objects & household ──
  { word: 'chair', difficulty: 'easy' },
  { word: 'clock', difficulty: 'easy' },
  { word: 'key', difficulty: 'easy' },
  { word: 'umbrella', difficulty: 'easy' },
  { word: 'candle', difficulty: 'easy' },
  { word: 'book', difficulty: 'easy' },
  { word: 'lamp', difficulty: 'easy' },
  { word: 'balloon', difficulty: 'easy' },
  { word: 'glasses', difficulty: 'easy' },
  { word: 'bucket', difficulty: 'easy' },
  { word: 'ladder', difficulty: 'easy' },
  { word: 'scissors', difficulty: 'medium' },
  { word: 'toothbrush', difficulty: 'medium' },
  { word: 'mirror', difficulty: 'medium' },
  { word: 'broom', difficulty: 'medium' },

  // ── Transport ──
  { word: 'car', difficulty: 'easy' },
  { word: 'boat', difficulty: 'easy' },
  { word: 'rocket', difficulty: 'easy' },
  { word: 'bus', difficulty: 'easy' },
  { word: 'bicycle', difficulty: 'medium' },
  { word: 'airplane', difficulty: 'medium' },
  { word: 'train', difficulty: 'medium' },
  { word: 'sailboat', difficulty: 'medium' },
  { word: 'skateboard', difficulty: 'medium' },
  { word: 'hot air balloon', difficulty: 'medium' },
  { word: 'helicopter', difficulty: 'hard' },
  { word: 'submarine', difficulty: 'hard' },

  // ── Clothing ──
  { word: 'hat', difficulty: 'easy' },
  { word: 'sock', difficulty: 'easy' },
  { word: 'shoe', difficulty: 'easy' },
  { word: 'shirt', difficulty: 'easy' },
  { word: 'dress', difficulty: 'easy' },
  { word: 'crown', difficulty: 'easy' },
  { word: 'scarf', difficulty: 'easy' },
  { word: 'bowtie', difficulty: 'easy' },
  { word: 'sunglasses', difficulty: 'easy' },
  { word: 'gloves', difficulty: 'medium' },
  { word: 'boots', difficulty: 'medium' },
  { word: 'backpack', difficulty: 'medium' },

  // ── Sports & activities ──
  { word: 'kite', difficulty: 'easy' },
  { word: 'basketball', difficulty: 'easy' },
  { word: 'soccer ball', difficulty: 'easy' },
  { word: 'skiing', difficulty: 'medium' },
  { word: 'surfing', difficulty: 'medium' },
  { word: 'bowling', difficulty: 'medium' },
  { word: 'fishing', difficulty: 'medium' },
  { word: 'skating', difficulty: 'medium' },
  { word: 'yoga', difficulty: 'medium' },
  { word: 'camping', difficulty: 'medium' },
  { word: 'juggling', difficulty: 'hard' },

  // ── Music ──
  { word: 'drum', difficulty: 'easy' },
  { word: 'headphones', difficulty: 'easy' },
  { word: 'music note', difficulty: 'easy' },
  { word: 'guitar', difficulty: 'medium' },
  { word: 'piano', difficulty: 'medium' },
  { word: 'trumpet', difficulty: 'medium' },
  { word: 'microphone', difficulty: 'medium' },
  { word: 'violin', difficulty: 'hard' },

  // ── Buildings & places (more) ──
  { word: 'house', difficulty: 'easy' },
  { word: 'tent', difficulty: 'easy' },
  { word: 'igloo', difficulty: 'easy' },
  { word: 'pyramid', difficulty: 'easy' },
  { word: 'castle', difficulty: 'medium' },
  { word: 'lighthouse', difficulty: 'medium' },
  { word: 'windmill', difficulty: 'medium' },
  { word: 'bridge', difficulty: 'medium' },
  { word: 'skyscraper', difficulty: 'hard' },
  { word: 'ferris wheel', difficulty: 'hard' },

  // ── Body & face ──
  { word: 'eye', difficulty: 'easy' },
  { word: 'hand', difficulty: 'easy' },
  { word: 'foot', difficulty: 'easy' },
  { word: 'smile', difficulty: 'easy' },
  { word: 'ear', difficulty: 'easy' },
  { word: 'mustache', difficulty: 'easy' },
  { word: 'heart', difficulty: 'easy' },

  // ── Fantasy & whimsy ──
  { word: 'ghost', difficulty: 'easy' },
  { word: 'robot', difficulty: 'easy' },
  { word: 'alien', difficulty: 'easy' },
  { word: 'snowman', difficulty: 'easy' },
  { word: 'wizard', difficulty: 'medium' },
  { word: 'mermaid', difficulty: 'medium' },
  { word: 'fairy', difficulty: 'medium' },
  { word: 'pirate', difficulty: 'medium' },
  { word: 'superhero', difficulty: 'medium' },
  { word: 'genie', difficulty: 'hard' },

  // ── Tech & misc ──
  { word: 'phone', difficulty: 'easy' },
  { word: 'lightbulb', difficulty: 'easy' },
  { word: 'battery', difficulty: 'easy' },
  { word: 'magnet', difficulty: 'easy' },
  { word: 'camera', difficulty: 'medium' },
  { word: 'compass', difficulty: 'medium' },
  { word: 'telescope', difficulty: 'medium' },
  { word: 'hourglass', difficulty: 'medium' },

  // ── Kitchen ──
  { word: 'frying pan', difficulty: 'easy' },
  { word: 'rolling pin', difficulty: 'easy' },
  { word: 'teapot', difficulty: 'medium' },
  { word: 'blender', difficulty: 'medium' },
  { word: 'toaster', difficulty: 'medium' },
  { word: 'birthday cake', difficulty: 'medium' },

  // ── Toys & games ──
  { word: 'dice', difficulty: 'easy' },
  { word: 'yo-yo', difficulty: 'easy' },
  { word: 'teddy bear', difficulty: 'medium' },
  { word: 'puzzle', difficulty: 'medium' },
  { word: 'chess', difficulty: 'medium' },
  { word: 'playing cards', difficulty: 'medium' },
  { word: 'spinning top', difficulty: 'medium' },

  // ── Doodles & symbols ──
  { word: 'arrow', difficulty: 'easy' },
  { word: 'flag', difficulty: 'easy' },
  { word: 'gift', difficulty: 'easy' },
  { word: 'anchor', difficulty: 'medium' },
  { word: 'map', difficulty: 'medium' },
  { word: 'treasure chest', difficulty: 'medium' },

  // ── Us & love (more) ──
  { word: 'kiss', difficulty: 'easy' },
  { word: 'ring', difficulty: 'easy' },
  { word: 'love letter', difficulty: 'medium' },
  { word: 'wedding cake', difficulty: 'medium' },
  { word: 'holding hands', difficulty: 'medium' },
  { word: 'heart balloon', difficulty: 'medium' },
  { word: 'slow dance', difficulty: 'hard' },
  { word: 'movie night', difficulty: 'hard' },
];

function pick(pool: WordEntry[]): string {
  return pool[Math.floor(Math.random() * pool.length)].word;
}

/** Pick n distinct words from a pool (falls back gracefully if pool is small). */
function pickDistinct(pool: WordEntry[], n: number): string[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).map((w) => w.word);
}

/**
 * Returns 3 options biased toward draw-able words: two easy + one medium, no
 * hard tier. Drawing abstract "hard" words (cozy, in love, anniversary…) was
 * too punishing, so they're kept in the list for variety but never offered.
 */
export function getWordOptions(): [string, string, string] {
  const easy = WORDS.filter((w) => w.difficulty === 'easy');
  const medium = WORDS.filter((w) => w.difficulty === 'medium');
  const [e1, e2] = pickDistinct(easy, 2);
  return [e1, e2, pick(medium)];
}
