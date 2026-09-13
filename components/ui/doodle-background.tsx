import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { LK } from '@/constants/theme';

// §6 / §11: Absolute-fill decorative ink layer.
// Always inside a parent with overflow:'hidden' so marks clip to card boundary.
// Never on interactive surfaces — always pointerEvents="none".

type DoodleGroup = 'lilac' | 'coral' | 'sage' | 'marigold' | 'general';
type Density = 'light' | 'medium' | 'heavy';

interface Mark {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: any;
  // percentage strings or numbers (will be cast to string for RN layout)
  left: number | string;
  top: number | string;
  size: number;
  rotate: number;
  opacity: number;
}

// Lilac group: spiral · crescent-moon · hourglass (§8.1 quiz card, §8.5 game card)
const LILAC_MEDIUM: Mark[] = [
  { source: require('@/assets/doodles/spiral.svg'), left: '78%', top: '5%', size: 30, rotate: 18, opacity: 0.18 },
  { source: require('@/assets/doodles/crescent-moon.svg'), left: '4%', top: '68%', size: 26, rotate: -22, opacity: 0.15 },
  { source: require('@/assets/doodles/hourglass.svg'), left: '82%', top: '58%', size: 22, rotate: 12, opacity: 0.12 },
  { source: require('@/assets/doodles/dot-trio.svg'), left: '10%', top: '10%', size: 18, rotate: 0, opacity: 0.09 },
];
const LILAC_LIGHT: Mark[] = [
  { source: require('@/assets/doodles/spiral.svg'), left: '78%', top: '5%', size: 30, rotate: 18, opacity: 0.14 },
  { source: require('@/assets/doodles/crescent-moon.svg'), left: '4%', top: '68%', size: 26, rotate: -22, opacity: 0.11 },
];

// Coral group: heart-sm · sparkle · confetti  (nudge card, Love Card accents)
const CORAL_MEDIUM: Mark[] = [
  { source: require('@/assets/doodles/heart-sm.svg'), left: '80%', top: '6%', size: 22, rotate: 10, opacity: 0.18 },
  { source: require('@/assets/doodles/sparkle.svg'), left: '5%', top: '70%', size: 20, rotate: -15, opacity: 0.15 },
  { source: require('@/assets/doodles/confetti.svg'), left: '75%', top: '65%', size: 18, rotate: 5, opacity: 0.12 },
];

// Sage group: leaf · infinity · ocean-wave  (bucket list, success states)
const SAGE_MEDIUM: Mark[] = [
  { source: require('@/assets/doodles/leaf.svg'), left: '76%', top: '4%', size: 28, rotate: 20, opacity: 0.18 },
  { source: require('@/assets/doodles/infinity.svg'), left: '5%', top: '72%', size: 24, rotate: -10, opacity: 0.14 },
  { source: require('@/assets/doodles/ocean-wave.svg'), left: '70%', top: '60%', size: 20, rotate: 0, opacity: 0.11 },
];

// General group: light scatter — wavy-line · dot-trio · star-cluster
const GENERAL_MEDIUM: Mark[] = [
  { source: require('@/assets/doodles/wavy-line.svg'), left: '72%', top: '5%', size: 32, rotate: 10, opacity: 0.24 },
  { source: require('@/assets/doodles/dot-trio.svg'), left: '6%', top: '75%', size: 20, rotate: 0, opacity: 0.20 },
  { source: require('@/assets/doodles/star-cluster.svg'), left: '80%', top: '62%', size: 26, rotate: -8, opacity: 0.26 },
];

function getMarks(group: DoodleGroup, density: Density): Mark[] {
  if (group === 'lilac') return density === 'light' ? LILAC_LIGHT : LILAC_MEDIUM;
  if (group === 'coral') return CORAL_MEDIUM;
  if (group === 'sage') return SAGE_MEDIUM;
  return GENERAL_MEDIUM;
}

function groupColor(group: DoodleGroup): string {
  if (group === 'lilac') return LK.lilac;
  if (group === 'coral') return LK.coral;
  if (group === 'sage') return LK.sage;
  if (group === 'marigold') return LK.marigold;
  return LK.sepia;
}

interface Props {
  group?: DoodleGroup;
  density?: Density;
  color?: string;
}

export function DoodleBackground({ group = 'general', density = 'medium', color }: Props) {
  const marks = getMarks(group, density);
  const tint = color ?? groupColor(group);

  return (
    <View
      style={{ position: 'absolute', inset: 0 }}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {marks.map((m, i) => (
        <Image
          key={i}
          source={m.source}
          style={{
            position: 'absolute',
            left: m.left as number,
            top: m.top as number,
            width: m.size,
            height: m.size,
            opacity: m.opacity,
            transform: [{ rotate: `${m.rotate}deg` }],
          }}
          contentFit="contain"
          tintColor={tint}
          accessible={false}
        />
      ))}
    </View>
  );
}
