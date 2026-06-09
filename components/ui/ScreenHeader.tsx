import React from 'react';
import { View, Text } from 'react-native';
import { LK, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { RoundIcon } from '@/components/ui';

/** Standardised screen header: back button row, then eyebrow + big title. */
export function ScreenHeader({ eyebrow, title, onBack, right }: {
  eyebrow: string;
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={{ paddingHorizontal: 22, paddingTop: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 46 }}>
        {onBack ? (
          <RoundIcon onPress={onBack}><Icon name="chevL" size={20} color={LK.ink} /></RoundIcon>
        ) : (
          <View style={{ width: 44, height: 44 }} />
        )}
        {right ?? <View style={{ width: 44, height: 44 }} />}
      </View>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', color: LK.ink70, marginTop: 10, marginLeft: 1 }}>{eyebrow}</Text>
      <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 40, letterSpacing: -1.5, color: LK.ink, lineHeight: 44 }}>{title}</Text>
    </View>
  );
}
