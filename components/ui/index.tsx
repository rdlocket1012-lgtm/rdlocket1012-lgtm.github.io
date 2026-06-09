import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, Image,
} from 'react-native';
import { LK, tint, shade, rgba, theme } from '@/constants/theme';
import { Icon } from './Icon';

// ---------- Avatar ----------
type AvatarProps = { initial: string; color: string; size?: number; style?: ViewStyle; imageUrl?: string | null };
export function Avatar({ initial, color, size = 40, style, imageUrl }: AvatarProps) {
  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={[{ width: size, height: size, borderRadius: size / 2 }, style as any]} />;
  }
  return (
    <View style={[{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: tint(color, 0.3),
      alignItems: 'center', justifyContent: 'center',
    }, style]}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.42, fontFamily: theme.fonts.heading }}>
        {initial}
      </Text>
    </View>
  );
}

// ---------- IconChip ----------
type IconChipProps = { children: React.ReactNode; color?: string; size?: number; soft?: string; style?: ViewStyle };
export function IconChip({ children, color = LK.gold, size = 44, soft, style }: IconChipProps) {
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

// ---------- Btn ----------
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
    primary: LK.ink,
    accent: LK.gold,
    soft: 'rgba(42,33,26,0.06)',
    ghost: 'transparent',
    outline: 'transparent',
  };
  const fgMap: Record<BtnKind, string> = {
    primary: '#fff',
    accent: LK.ink,
    soft: LK.ink,
    ghost: LK.ink,
    outline: LK.ink,
  };
  const bg = color && kind === 'accent' ? color : (bgMap[kind] ?? bgMap.primary);
  const fg = fgMap[kind] ?? fgMap.primary;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
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
    </TouchableOpacity>
  );
}

// ---------- RoundIcon button ----------
type RoundIconProps = { children: React.ReactNode; onPress?: () => void; badge?: boolean; style?: ViewStyle };
export function RoundIcon({ children, onPress, badge, style }: RoundIconProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
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
    </TouchableOpacity>
  );
}

// ---------- Sticker card ----------
type StickerProps = {
  children: React.ReactNode;
  color?: string;
  tiltDeg?: number;
  soft?: string;
  style?: ViewStyle;
  onPress?: () => void;
  flat?: boolean;
};
export function Sticker({ children, color, tiltDeg = 0, soft, style, onPress, flat }: StickerProps) {
  const bg = soft ?? (color ? tint(color, 0.8) : LK.ivory);
  const inner = (
    <View style={[{
      backgroundColor: bg,
      borderRadius: theme.radii.lg,
      padding: 18,
      transform: tiltDeg ? [{ rotate: `${tiltDeg}deg` }] : undefined,
      ...(flat ? {} : theme.shadow.card),
    }, style]}>
      {children}
    </View>
  );
  if (!onPress) return inner;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      {inner}
    </TouchableOpacity>
  );
}

// ---------- Chip pill ----------
type ChipProps = { children: React.ReactNode; color?: string; active?: boolean; onPress?: () => void; style?: ViewStyle };
export function Chip({ children, color = LK.gold, active, onPress, style }: ChipProps) {
  const bg = active ? color : tint(color, 0.8);
  const fg = active ? shade(color, 0.62) : shade(color, 0.4);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
      style={[{ backgroundColor: bg, borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 8 }, style]}
    >
      <Text style={{ color: fg, fontWeight: '700', fontSize: 13.5, fontFamily: theme.fonts.body }}>
        {children as string}
      </Text>
    </TouchableOpacity>
  );
}

// ---------- StepDots ----------
export function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 7, justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{
          width: i === current ? 22 : 7, height: 7,
          borderRadius: 9999,
          backgroundColor: i === current ? LK.ink : 'rgba(42,33,26,0.18)',
        }} />
      ))}
    </View>
  );
}

// ---------- Divider ----------
export function HDivider() {
  return <View style={{ height: 1, backgroundColor: LK.line }} />;
}

// ---------- Spinner ----------
export function Spinner({ color = LK.ink, size = 20 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2.5, borderColor: 'rgba(42,33,26,0.15)', borderTopColor: color }} />
  );
}

// ---------- Toast ----------
export function Toast({ message }: { message: string }) {
  return (
    <View style={{
      position: 'absolute', left: 20, right: 20, bottom: 36,
      backgroundColor: LK.ink, borderRadius: 9999,
      paddingHorizontal: 20, paddingVertical: 12,
      alignItems: 'center',
      ...theme.shadow.card,
    }}>
      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14, fontFamily: theme.fonts.body }}>
        {message}
      </Text>
    </View>
  );
}
