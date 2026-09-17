import React from 'react';
import { View, Text } from 'react-native';
import { LK, theme } from '@/constants/theme';

/**
 * Region heading — a sentence-case title with optional trailing content
 * (a "See all" link, a progress ring, a count).
 *
 * This used to be an 11pt uppercase eyebrow trailed by a hairline rule. At that
 * size the regions read as fine print, not structure: the cards below outweighed
 * their own headings. Premium references on Mobbin (Alma "Trends", Ahead
 * "Advice", Bloom "Your Program") all title a region at ~20pt in the display
 * face and let whitespace do the separating, so this now does the same
 * (docs/PREMIUM_STANDARD.md §2). The export name stays so call sites don't churn.
 */
export function SectionEyebrow({
  label,
  trailing,
  handTrailing,
  paddingTop = theme.spacing.lg + 4,
}: {
  label: string;
  /** Rendered at the far right — a progress ring, a count, a link. */
  trailing?: React.ReactNode;
  /** Short handwritten note before `trailing`. */
  handTrailing?: string;
  paddingTop?: number;
}) {
  return (
    <View
      accessibilityRole="header"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: theme.layout.screenX, paddingTop, paddingBottom: 12, minHeight: 44 }}
    >
      <Text
        numberOfLines={1}
        style={{ flex: 1, fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 20, lineHeight: 25, letterSpacing: -0.4, color: LK.espresso }}
      >
        {label}
      </Text>
      {handTrailing ? <Text style={{ fontFamily: theme.fonts.hand, fontSize: 13, color: LK.sepia }}>{handTrailing}</Text> : null}
      {trailing}
    </View>
  );
}
