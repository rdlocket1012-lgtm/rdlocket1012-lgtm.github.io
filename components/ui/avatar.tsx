import React from 'react';
import { View, Text, Image, type ViewStyle } from 'react-native';
import { LK, tint, theme } from '@/constants/theme';

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
