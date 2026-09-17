import React, { useEffect, useRef } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';
import { LK } from '@/constants/theme';

const DEFAULT_COLORS = [LK.coral, LK.marigold, LK.blush, LK.sky, LK.sage, LK.lilac];

function ConfettiPiece({ x, color, delay, size, fall }: {
  x: number;
  color: string;
  delay: number;
  size: number;
  fall: number;
}) {
  const y = useSharedValue(-30);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const start = setTimeout(() => {
      y.value = withTiming(fall, { duration: 2400, easing: Easing.in(Easing.quad) });
      rot.value = withTiming(720 * (Math.random() > 0.5 ? 1 : -1), { duration: 2400 });
      opacity.value = withTiming(0, { duration: 2400, easing: Easing.in(Easing.quad) });
    }, delay);
    return () => clearTimeout(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate: `${rot.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          left: x,
          top: 0,
          width: size,
          height: size * 0.6,
          backgroundColor: color,
          borderRadius: 2,
        },
      ]}
      pointerEvents="none"
    />
  );
}

/**
 * Full-screen falling-confetti burst. Mount it conditionally (`{show && <ConfettiShower />}`)
 * so its pieces re-seed on each appearance. No-op under Reduce Motion.
 */
export function ConfettiShower({
  count = 32,
  colors = DEFAULT_COLORS,
  zIndex = 101,
}: {
  count?: number;
  colors?: string[];
  zIndex?: number;
}) {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();

  const pieces = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (i / count) * width + Math.random() * 24 - 12,
      color: colors[i % colors.length],
      delay: Math.random() * 650,
      size: 8 + Math.random() * 9,
      fall: height + 40,
    })),
  ).current;

  if (reduced) return null;

  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex }}
      pointerEvents="none"
      accessibilityElementsHidden
    >
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} x={p.x} color={p.color} delay={p.delay} size={p.size} fall={p.fall} />
      ))}
    </View>
  );
}
