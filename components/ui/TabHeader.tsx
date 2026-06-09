import React from 'react';
import { View, Text } from 'react-native';
import { LK, theme } from '@/constants/theme';

/**
 * Standardised header for the bottom-tab root screens (no back button):
 * a small uppercase eyebrow over a large title, with an optional right slot
 * for actions. Shares metrics with ScreenHeader so every screen's title and
 * content edge line up.
 */
export function TabHeader({ eyebrow, title, right, accent }: {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
  /** Optional color for the title (defaults to ink). */
  accent?: string;
}) {
  return (
    <View style={{
      paddingHorizontal: theme.layout.screenX,
      paddingTop: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontFamily: theme.fonts.body, fontSize: 12.5, fontWeight: '800',
          letterSpacing: 1.5, textTransform: 'uppercase', color: theme.text.secondary,
          marginBottom: 2, marginLeft: 1,
        }}>
          {eyebrow}
        </Text>
        <Text style={{
          fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 40,
          letterSpacing: -1.5, color: accent ?? LK.ink, lineHeight: 44,
        }}>
          {title}
        </Text>
      </View>
      {right ? <View style={{ marginTop: 6 }}>{right}</View> : null}
    </View>
  );
}
