import React, { useRef, useState } from 'react';
import { View, Text, Animated, PanResponder, GestureResponderEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

const THRESHOLD = 520; // total finger travel (px) needed to reveal

export function ScratchCard({ idea, color }: { idea: string; color: string }) {
  const foilOpacity = useRef(new Animated.Value(1)).current;
  const scratched = useRef(0);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);

  function reveal() {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setRevealed(true);
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch { /* no-op */ }
    Animated.timing(foilOpacity, { toValue: 0, duration: 320, useNativeDriver: true }).start();
  }

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !revealedRef.current,
      onMoveShouldSetPanResponder: () => !revealedRef.current,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        last.current = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };
      },
      onPanResponderMove: (e: GestureResponderEvent) => {
        const { locationX, locationY } = e.nativeEvent;
        if (last.current) {
          scratched.current += Math.hypot(locationX - last.current.x, locationY - last.current.y);
          const progress = Math.min(1, scratched.current / THRESHOLD);
          foilOpacity.setValue(1 - progress * progress);
          if (progress >= 1) reveal();
        }
        last.current = { x: locationX, y: locationY };
      },
      onPanResponderRelease: () => { last.current = null; },
    })
  ).current;

  return (
    <View style={{ borderRadius: theme.radii.lg, overflow: 'hidden', minHeight: 96, ...theme.shadow.card }}>
      {/* Hidden idea underneath */}
      <View style={{ backgroundColor: tint(color, 0.78), padding: 18, minHeight: 96, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', gap: 13 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: color, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="sparkle" size={22} color={shade(color, 0.55)} />
        </View>
        <Text style={{ flex: 1, fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 16, color: LK.ink, lineHeight: 23 }}>{idea}</Text>
      </View>

      {/* Foil overlay (scratch this away) */}
      {!revealed && (
        <Animated.View
          {...pan.panHandlers}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: foilOpacity, overflow: 'hidden' }}
        >
          {/* Diagonal champagne-foil gradient — feels like treasure to uncover */}
          <LinearGradient
            colors={[shade(LK.gold, 0.18), shade(LK.gold, 0.42), shade(LK.gold, 0.24)]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          {/* Sheen highlight band */}
          <View style={{ position: 'absolute', top: -20, bottom: -20, left: '30%', width: 40, backgroundColor: 'rgba(255,255,255,0.14)', transform: [{ rotate: '20deg' }] }} />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
            <Icon name="sparkle" size={18} color="rgba(255,255,255,0.92)" />
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 13.5, letterSpacing: 0.5, color: '#fff' }}>Scratch to reveal</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
