import React from 'react';
import { Pressable, type PressableProps, type ViewStyle, type StyleProp } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { tap } from '@/lib/haptics';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  children: React.ReactNode;
  scaleTo?: number;
  /** Fire a light `tap()` haptic on press-in. Default true; set false for
   *  noisy/idle rows where a tick would be noise. */
  haptic?: boolean;
  /** Applied to the scaled inner view (the visual surface). */
  style?: StyleProp<ViewStyle>;
  /** Applied to the outer Pressable (layout: width, alignment). */
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Drop-in Pressable that runs its scale animation on the UI thread via
 * Reanimated — no JS bridge round-trip on press, so it responds in the same
 * frame the finger lands. Fires a `tap()` haptic by default (DESIGN.md §10.12).
 *
 * This is the canonical press primitive: `Btn`, `RoundIcon`, and any tappable
 * surface route through it instead of a bare TouchableOpacity.
 */
export function ScalePressable({
  scaleTo = 0.96,
  haptic = true,
  children,
  style,
  containerStyle,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={containerStyle}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, { damping: 22, stiffness: 400 });
        if (haptic && !disabled) tap();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 16, stiffness: 280 });
        onPressOut?.(e);
      }}
    >
      <Animated.View style={[animStyle, style]}>{children}</Animated.View>
    </Pressable>
  );
}
