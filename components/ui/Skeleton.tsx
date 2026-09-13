import React, { useEffect } from 'react';
import { type DimensionValue, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: ViewStyle;
};

/**
 * Shimmer placeholder (DESIGN.md §10.6 / §10.12 rule 5). A soft opacity pulse on
 * an ink-tinted block — outlines the shape of content while it loads so the eye
 * recognises the layout before data arrives. Replaces static grey blocks and
 * bare ActivityIndicator spinners.
 *
 * Pulse loops on the UI thread (Reanimated); collapses to a static block when
 * Reduce Motion is on. Match the placeholder dims to the real content so there's
 * no layout jump on load.
 */
export function Skeleton({ width = '100%', height = 12, radius = 8, style }: SkeletonProps) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    progress.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reduced, progress]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: reduced ? 0.6 : interpolate(progress.value, [0, 0.5, 1], [0.45, 0.85, 0.45]),
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          borderCurve: 'continuous',
          backgroundColor: 'rgba(42,33,26,0.08)',
        },
        animStyle,
        style,
      ]}
    />
  );
}
