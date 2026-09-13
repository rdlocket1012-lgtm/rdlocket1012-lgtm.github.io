import { LK } from '@/constants/theme';

export type IllustrationKey =
  | 'envelope'
  | 'star'
  | 'moon'
  | 'sun'
  | 'latte'
  | 'boba'
  | 'donut'
  | 'avocado'
  | 'popcorn'
  | 'puzzle';

export type LoveCardIllustration = {
  key: IllustrationKey;
  label: string;
  accentColor: string;
  /** Small cursive setup line (Shantell) — the greeting-card lead-in. */
  setup: string;
  /** Big coloured punchline word (Bricolage) — the pun payoff. */
  punchline: string;
  source: ReturnType<typeof require>;
};

export const LOVE_CARD_ILLUSTRATIONS: LoveCardIllustration[] = [
  {
    key: 'envelope',
    label: 'Love letter',
    accentColor: LK.coral,
    setup: 'sealed with a',
    punchline: 'KISS',
    source: require('../assets/illustrations/love-cards/envelope.png'),
  },
  {
    key: 'star',
    label: 'You\'re a star',
    accentColor: LK.marigold,
    setup: 'you\'re a',
    punchline: 'SUPERSTAR',
    source: require('../assets/illustrations/love-cards/star.png'),
  },
  {
    key: 'moon',
    label: 'To the moon',
    accentColor: LK.lilac,
    setup: 'love you to the',
    punchline: 'MOON & BACK',
    source: require('../assets/illustrations/love-cards/moon.png'),
  },
  {
    key: 'sun',
    label: 'You light me up',
    accentColor: LK.marigold,
    setup: 'you are my',
    punchline: 'SUNSHINE',
    source: require('../assets/illustrations/love-cards/sun.png'),
  },
  {
    key: 'latte',
    label: 'Morning love',
    accentColor: '#C2873C', // Gold
    setup: 'i love you a',
    punchline: 'LATTE',
    source: require('../assets/illustrations/love-cards/latte.png'),
  },
  {
    key: 'boba',
    label: 'Bubble tea date',
    accentColor: LK.blush,
    setup: 'you\'re',
    punchline: 'BOBA-TIFUL',
    source: require('../assets/illustrations/love-cards/boba.png'),
  },
  {
    key: 'donut',
    label: 'Doughnut forget',
    accentColor: LK.coral,
    setup: 'doughnut forget',
    punchline: 'I ♥ YOU',
    source: require('../assets/illustrations/love-cards/donut.png'),
  },
  {
    key: 'avocado',
    label: 'You\'re my avocado',
    accentColor: LK.sage,
    setup: 'you\'re my',
    punchline: 'AVO-CUDDLE',
    source: require('../assets/illustrations/love-cards/avocado.png'),
  },
  {
    key: 'popcorn',
    label: 'Movie night',
    accentColor: LK.marigold,
    setup: 'you make my heart',
    punchline: 'POP',
    source: require('../assets/illustrations/love-cards/popcorn.png'),
  },
  {
    key: 'puzzle',
    label: 'We fit together',
    accentColor: LK.sky,
    setup: 'you\'re my missing',
    punchline: 'PIECE',
    source: require('../assets/illustrations/love-cards/puzzle.png'),
  },
];

/** Encode love card data into body_rich_html — used for Supabase storage without schema migration. */
export type LoveCardPayload = {
  _type: 'love_card';
  illus: IllustrationKey;
  message: string;
};

export function encodeLoveCard(illus: IllustrationKey, message: string): string {
  return JSON.stringify({ _type: 'love_card', illus, message } satisfies LoveCardPayload);
}

export function decodeLoveCard(bodyHtml: string): LoveCardPayload | null {
  if (!bodyHtml.startsWith('{"_type":"love_card"')) return null;
  try {
    const parsed = JSON.parse(bodyHtml) as LoveCardPayload;
    if (parsed._type === 'love_card') return parsed;
    return null;
  } catch {
    return null;
  }
}

export function getIllustration(key: IllustrationKey): LoveCardIllustration {
  return LOVE_CARD_ILLUSTRATIONS.find((i) => i.key === key) ?? LOVE_CARD_ILLUSTRATIONS[0];
}
