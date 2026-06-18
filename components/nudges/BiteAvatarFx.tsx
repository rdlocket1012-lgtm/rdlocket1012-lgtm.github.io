import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import { useBiteFx } from '@/stores/bite-fx.store';

/**
 * Overlays a quick "love-bite" on the partner avatar: a curved row of pastel
 * teeth-marks presses in and the avatar gives a little squash, then releases.
 * Absolutely fills its parent (which should be the avatar wrapper) and ignores
 * touches. Re-triggers on each bite via the store `tick`.
 */
export function BiteAvatarFx({ size }: { size: number }) {
  const feisty = useBiteFx((s) => s.feisty);
  const tick = useBiteFx((s) => s.tick);
  const press = useRef(new Animated.Value(0)).current; // 0 → 1 → 0

  useEffect(() => {
    if (tick === 0) return;
    press.setValue(0);
    Animated.sequence([
      Animated.timing(press, { toValue: 1, duration: 140, easing: Easing.out(Easing.back(2.2)), useNativeDriver: true }),
      Animated.delay(2400),
      Animated.timing(press, { toValue: 0, duration: 260, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [tick]);

  if (!feisty) return null;

  const toothCount = 5;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'flex-start' }]}>
      {/* Teeth row, pressing down from the top edge of the avatar */}
      <Animated.View
        style={{
          flexDirection: 'row',
          gap: size * 0.05,
          marginTop: -size * 0.06,
          opacity: press,
          transform: [
            { translateY: press.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) },
            { scale: press.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
          ],
        }}
      >
        {Array.from({ length: toothCount }).map((_, i) => (
          <View
            key={i}
            style={{
              width: size * 0.12,
              height: size * 0.2,
              borderBottomLeftRadius: size * 0.12,
              borderBottomRightRadius: size * 0.12,
              backgroundColor: 'rgba(255,255,255,0.92)',
              borderWidth: 1,
              borderColor: 'rgba(244,143,177,0.9)',
            }}
          />
        ))}
      </Animated.View>
    </View>
  );
}
