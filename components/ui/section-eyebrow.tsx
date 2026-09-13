import React from 'react';
import { View, Text } from 'react-native';
import { LK, theme } from '@/constants/theme';

/**
 * Region label — uppercase eyebrow, a hairline rule that eats the remaining
 * width, and optional trailing content.
 *
 * This is the device that gives a screen named regions instead of a stack of
 * equal-weight cards. Originally local to the Fun tab; lifted here so Home's
 * "Today" / "Your story" split reads in the same language (UX_POLISH_PLAN B1).
 */
export function SectionEyebrow({
  label,
  trailing,
  handTrailing,
  color = LK.faded,
  paddingTop = 24,
}: {
  label: string;
  /** Rendered at the far right — a progress ring, a count, a link. */
  trailing?: React.ReactNode;
  /** Short handwritten note before `trailing`. */
  handTrailing?: string;
  /** Eyebrow + rule tint. Lets a region carry its own accent. */
  color?: string;
  paddingTop?: number;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: theme.layout.screenX, paddingTop, paddingBottom: 12 }}>
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color }}>
        {label}
      </Text>
      <View style={{ flex: 1, height: 1.5, backgroundColor: LK.hairline, borderRadius: 2 }} />
      {handTrailing ? <Text style={{ fontFamily: theme.fonts.hand, fontSize: 12, color: LK.faded }}>{handTrailing}</Text> : null}
      {trailing}
    </View>
  );
}
