import React from 'react';
import { Text, type ViewStyle, type TextStyle } from 'react-native';
import { LK, theme } from '@/constants/theme';
import { ScalePressable } from '@/components/ui/scale-pressable';

type BtnKind = 'primary' | 'accent' | 'soft' | 'ghost' | 'outline';

type BtnProps = {
  children: React.ReactNode;
  onPress?: () => void;
  kind?: BtnKind;
  color?: string;
  full?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export function Btn({ children, onPress, kind = 'primary', color, full, style, textStyle, disabled }: BtnProps) {
  const bgMap: Record<BtnKind, string> = {
    primary: LK.espresso,
    accent: LK.marigold,
    soft: 'rgba(42,33,26,0.06)',
    ghost: 'transparent',
    outline: 'transparent',
  };
  const fgMap: Record<BtnKind, string> = {
    primary: '#fff',
    accent: LK.espresso,
    soft: LK.espresso,
    ghost: LK.espresso,
    outline: LK.espresso,
  };
  const bg = color && kind === 'accent' ? color : (bgMap[kind] ?? bgMap.primary);
  const fg = fgMap[kind] ?? fgMap.primary;
  return (
    <ScalePressable
      onPress={onPress}
      disabled={disabled}
      haptic={!disabled}
      containerStyle={full ? { width: '100%' } : undefined}
      style={[{
        backgroundColor: bg,
        borderRadius: 9999,
        paddingHorizontal: 24,
        paddingVertical: 15,
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'row', gap: 9,
        width: full ? '100%' : undefined,
        opacity: disabled ? 0.45 : 1,
        ...(kind === 'outline' ? { borderWidth: 2, borderColor: 'rgba(42,33,26,0.18)' } : {}),
      }, style]}
    >
      {typeof children === 'string'
        ? <Text style={[{ color: fg, fontWeight: '700', fontSize: 16, fontFamily: theme.fonts.body, letterSpacing: 0.1 }, textStyle]}>{children}</Text>
        : children}
    </ScalePressable>
  );
}
