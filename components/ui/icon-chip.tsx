import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { LK, tint } from '@/constants/theme';

type IconChipProps = { children: React.ReactNode; color?: string; size?: number; soft?: string; style?: ViewStyle };

export function IconChip({ children, color = LK.marigold, size = 44, soft, style }: IconChipProps) {
  return (
    <View style={[{
      width: size, height: size,
      borderRadius: size * 0.44,
      backgroundColor: soft ?? tint(color, 0.62),
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }, style]}>
      {children}
    </View>
  );
}
