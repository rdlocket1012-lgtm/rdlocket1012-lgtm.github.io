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
  source: ReturnType<typeof require>;
};

export const LOVE_CARD_ILLUSTRATIONS: LoveCardIllustration[] = [
  {
    key: 'envelope',
    label: 'Love letter',
    accentColor: LK.coral,
    source: require('../assets/illustrations/love-cards/envelope.png'),
  },
  {
    key: 'star',
    label: 'You\'re a star',
    accentColor: LK.marigold,
    source: require('../assets/illustrations/love-cards/star.png'),
  },
  {
    key: 'moon',
    label: 'To the moon',
    accentColor: LK.lilac,
    source: require('../assets/illustrations/love-cards/moon.png'),
  },
  {
    key: 'sun',
    label: 'You light me up',
    accentColor: LK.marigold,
    source: require('../assets/illustrations/love-cards/sun.png'),
  },
  {
    key: 'latte',
    label: 'Morning love',
    accentColor: '#C2873C', // Gold
    source: require('../assets/illustrations/love-cards/latte.png'),
  },
  {
    key: 'boba',
    label: 'Bubble tea date',
    accentColor: LK.blush,
    source: require('../assets/illustrations/love-cards/boba.png'),
  },
  {
    key: 'donut',
    label: 'Doughnut forget',
    accentColor: LK.coral,
    source: require('../assets/illustrations/love-cards/donut.png'),
  },
  {
    key: 'avocado',
    label: 'You\'re my avocado',
    accentColor: LK.sage,
    source: require('../assets/illustrations/love-cards/avocado.png'),
  },
  {
    key: 'popcorn',
    label: 'Movie night',
    accentColor: LK.marigold,
    source: require('../assets/illustrations/love-cards/popcorn.png'),
  },
  {
    key: 'puzzle',
    label: 'We fit together',
    accentColor: LK.sky,
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
