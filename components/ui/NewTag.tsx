import React from 'react';
import { View, Text } from 'react-native';
import { LK, theme } from '@/constants/theme';

/** Small "NEW" pill to flag unseen items from a partner. */
export function NewTag({ label = 'NEW' }: { label?: string }) {
  return (
    <View style={{ backgroundColor: LK.coral, borderRadius: 9999, paddingHorizontal: 7, paddingVertical: 2 }}>
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 9.5, letterSpacing: 0.5, color: '#fff' }}>
        {label}
      </Text>
    </View>
  );
}
