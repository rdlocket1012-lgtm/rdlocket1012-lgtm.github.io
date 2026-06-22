import React from 'react';
import { Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { tap, soft } from '@/lib/haptics';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Scale at full press. Buttons 0.965, small orbs 0.9. */
  scaleTo?: number;
  haptic?: 'tap' | 'soft' | 'none';
  accessibilityLabel?: string;
};

/**
 * The one press primitive for onboarding: spring-physics scale-down on touch,
 * springy release, haptic on press-in. Wrap any visual in it.
 */
export function PressableScale({
  children, onPress, disabled, style, scaleTo = 0.965, haptic = 'tap', accessibilityLabel,
}: Props) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => {
        scale.value = withSpring(scaleTo, { damping: 24, stiffness: 420, mass: 0.7 });
        if (!disabled) {
          if (haptic === 'tap') tap();
          else if (haptic === 'soft') soft();
        }
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300, mass: 0.8 });
      }}
    >
      <Animated.View style={[animated, style]}>{children}</Animated.View>
    </Pressable>
  );
}
