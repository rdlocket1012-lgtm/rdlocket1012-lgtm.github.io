import React from 'react';
import { Text, type ViewStyle } from 'react-native';
import { LK, tint, shade, theme } from '@/constants/theme';
import { ScalePressable } from './scale-pressable';

type ChipProps = { children: React.ReactNode; color?: string; active?: boolean; onPress?: () => void; style?: ViewStyle };

export function Chip({ children, color = LK.marigold, active, onPress, style }: ChipProps) {
  const bg = active ? color : tint(color, 0.8);
  const fg = active ? shade(color, 0.62) : shade(color, 0.4);
  return (
    <ScalePressable
      onPress={onPress}
      scaleTo={0.95}
      disabled={!onPress}
      haptic={!!onPress}
      style={[{ backgroundColor: bg, borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 8 }, style]}
    >
      <Text style={{ color: fg, fontWeight: '700', fontSize: 13.5, fontFamily: theme.fonts.body }}>
        {children as string}
      </Text>
    </ScalePressable>
  );
}
