import { ReduceMotion } from 'react-native-reanimated';

// Canonical design tokens — names + values match docs/DESIGN.md §3.
export const LK = {
  // Canvas & surfaces (§3)
  parchment: '#F3E9D2',     // app background — the "page"
  parchmentDeep: '#F6EBD2', // pressed / deeper parchment
  ivory: '#FBF5E8',         // default card surface
  vellum: '#FFFDF7',        // raised cards, hero, modals, sheets

  // Ink & text (§3)
  espresso: '#2A211A',          // primary text, hand-drawn borders
  sepia: '#6E6253',             // secondary text (solid)
  faded: '#9A8A63',             // captions, hints — decorative only
  hairline: 'rgba(42,33,26,0.10)', // subtle dividers
  // Translucent ink variants — AA-verified for body secondary/decoration.
  ink70: 'rgba(42,33,26,0.66)',
  ink45: 'rgba(42,33,26,0.45)',

  // Brand accents (§3)
  coral: '#FF7A6B',     // Lo coral — primary action, love
  sky: '#5BB8E8',       // Kit sky — cool accent, info
  blush: '#FF9EC4',     // playful, nudges, Love Cards
  marigold: '#FFC94D',  // stars, day accent, highlights
  gold: '#C2873C',      // treasured touches, Letters, warm pill borders
  sage: '#A8D08D',      // calm/nature, success
  lilac: '#9B8CFF',     // play/games

  // Semantic (§3)
  success: '#5FC79B',
  warning: '#F6A94A',
  danger: '#E5705F',
  info: '#5BB8E8',

  // Extended palette — milestone categories & accents
  teal: '#4FC2C2',
  dusk: '#8FA8C0',
  butter: '#FFE08A',
} as const;

function hexToRgb(h: string): [number, number, number] {
  const hex = h.replace('#', '');
  const full = hex.length === 3
    ? hex.split('').map((c) => c + c).join('')
    : hex;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

export function mix(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const r = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return `rgb(${r[0]},${r[1]},${r[2]})`;
}

export function tint(hex: string, t: number): string {
  return mix(hex, '#ffffff', t);
}

export function shade(hex: string, t: number): string {
  return mix(hex, '#2a1f17', t);
}

export function rgba(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

const CAT: Record<string, string> = {
  firstDate: LK.coral, trip: LK.sky, moveIn: LK.success, engagement: LK.blush,
  wedding: LK.marigold, pet: LK.lilac, job: LK.warning, newHome: LK.teal,
  loss: LK.dusk, custom: LK.sage, achievement: LK.butter, firstTime: LK.blush,
  anniversary: LK.coral, proposal: LK.blush, other: LK.sage,
  restaurant: LK.coral, home: LK.success, hiddenGem: LK.lilac,
};

export function catColor(key: string): { base: string; soft: string; mid: string; deep: string } {
  const base = CAT[key] ?? LK.sage;
  return { base, soft: tint(base, 0.78), mid: tint(base, 0.5), deep: shade(base, 0.5) };
}

export const theme = {
  colors: LK,
  fonts: {
    heading: 'BricolageGrotesque',
    body: 'PlusJakartaSans',
    serif: 'Newsreader',
    hand: 'ShantellSans',
    handMedium: 'ShantellSans-Medium',
  },
  radii: {
    sm: 16,
    md: 20,
    lg: 28,
    xl: 32,
  },
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
  },
  // Single source of truth for screen gutters so every screen's content edge
  // lines up. Use theme.layout.screenX for outer horizontal padding.
  layout: {
    screenX: 22,
  },
  // Semantic text colors. Prefer these over raw ink tokens so contrast stays
  // WCAG-safe: `secondary` (ink70 ≈ 4.85:1) passes AA; reserve `tertiary`
  // (ink45 ≈ 2.6:1) for decoration only — dividers, em-dash placeholders.
  text: {
    primary: LK.espresso,
    secondary: LK.ink70,
    tertiary: LK.ink45,
  },
  // §10.2 Spring tokens — always reference by name; never hardcode damping/stiffness.
  spring: {
    snappy:  { damping: 22, stiffness: 320, reduceMotion: ReduceMotion.Never }, // tab pill, icon taps, badges
    warm:    { damping: 18, stiffness: 280, reduceMotion: ReduceMotion.Never }, // card entrances, sheet slides
    gentle:  { damping: 14, stiffness: 220, reduceMotion: ReduceMotion.Never }, // hero card, day counter
    bounce:  { damping: 12, stiffness: 260, reduceMotion: ReduceMotion.Never }, // FAB press, milestone pop (~8% overshoot)
  },
  // §10.2 Timing tokens
  timing: {
    micro: 150,       // button press, icon tap
    transition: 280,  // card entrance, sheet open
    exit: 150,        // exits always faster than entrances
  },
  shadow: {
    card: {
      shadowColor: LK.espresso,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.09,
      shadowRadius: 22,
      elevation: 5,
    },
    sm: {
      shadowColor: LK.espresso,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.06,
      shadowRadius: 14,
      elevation: 3,
    },
  },
} as const;
