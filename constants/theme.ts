export const LK = {
  cream: '#FFF6E3',
  creamDeep: '#F6EBD2',
  ivory: '#FFFDF7',
  ink: '#2A211A',
  ink70: 'rgba(42,33,26,0.66)',
  ink45: 'rgba(42,33,26,0.45)',
  line: 'rgba(42,33,26,0.10)',
  gold: '#FFC94D',
  coral: '#FF7A6B',
  pink: '#FF9EC4',
  lilac: '#9B8CFF',
  sky: '#5BB8E8',
  mint: '#5FC79B',
  sage: '#A8D08D',
  amber: '#F6A94A',
  teal: '#4FC2C2',
  dusk: '#8FA8C0',
  butter: '#FFE08A',
  destructive: '#E5705F',
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
  firstDate: LK.coral, trip: LK.sky, moveIn: LK.mint, engagement: LK.pink,
  wedding: LK.gold, pet: LK.lilac, job: LK.amber, newHome: LK.teal,
  loss: LK.dusk, custom: LK.sage, achievement: LK.butter, firstTime: LK.pink,
  anniversary: LK.coral, proposal: LK.pink, other: LK.sage,
  restaurant: LK.coral, home: LK.mint, hiddenGem: LK.lilac,
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
    primary: LK.ink,
    secondary: LK.ink70,
    tertiary: LK.ink45,
  },
  shadow: {
    card: {
      shadowColor: LK.ink,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.09,
      shadowRadius: 22,
      elevation: 5,
    },
    sm: {
      shadowColor: LK.ink,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.06,
      shadowRadius: 14,
      elevation: 3,
    },
  },
} as const;
