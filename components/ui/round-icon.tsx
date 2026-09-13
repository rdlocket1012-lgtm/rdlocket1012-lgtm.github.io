import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { LK, theme } from '@/constants/theme';
import { ScalePressable } from '@/components/ui/scale-pressable';

type RoundIconProps = { children: React.ReactNode; onPress?: () => void; badge?: boolean; style?: ViewStyle };

export function RoundIcon({ children, onPress, badge, style }: RoundIconProps) {
  return (
    <ScalePressable
      onPress={onPress}
      scaleTo={0.92}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={[{
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: LK.ivory,
        alignItems: 'center', justifyContent: 'center',
        ...theme.shadow.sm,
      }, style]}
    >
      {children}
      {badge && (
        <View style={{
          position: 'absolute', top: 8, right: 9,
          width: 8, height: 8, borderRadius: 4,
          backgroundColor: LK.coral,
          borderWidth: 1.5, borderColor: LK.ivory,
        }} />
      )}
    </ScalePressable>
  );
}
