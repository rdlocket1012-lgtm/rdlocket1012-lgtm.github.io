import React from 'react';
import { View, Text, TouchableOpacity, type ViewStyle } from 'react-native';
import { LK, tint, theme } from '@/constants/theme';

// Direct-import these — do NOT import from this barrel file.
export { Avatar } from './avatar';
export { IconChip } from './icon-chip';
export { RoundIcon } from './round-icon';
export { Btn } from './btn';
export { Chip } from './chip';

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

// ---------- Divider ----------
export function HDivider() {
  return <View style={{ height: 1, backgroundColor: LK.hairline }} />;
}

// ---------- Spinner ----------
export function Spinner({ color = LK.espresso, size = 20 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2.5, borderColor: 'rgba(42,33,26,0.15)', borderTopColor: color }} />
  );
}

// ---------- Toast ----------
export function Toast({ message }: { message: string }) {
  return (
    <View style={{
      position: 'absolute', left: 20, right: 20, bottom: 36,
      backgroundColor: LK.espresso, borderRadius: 9999,
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
