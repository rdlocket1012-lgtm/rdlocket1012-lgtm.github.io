import React, { useEffect } from 'react';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';

type Props = {
  size?: number;
  color: string;
  /** When false the flame holds still (e.g. a dormant streak). */
  active?: boolean;
};

/**
 * A softly flickering flame — gentle breathing scale + a small sway, looping
 * forever. Used for the streak icon. Holds perfectly still under Reduce Motion
 * or when `active` is false so a dormant streak doesn't dance.
 */
export function AnimatedFlame({ size = 22, color, active = true }: Props) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const sway = useSharedValue(0);

  useEffect(() => {
    if (!active || reducedMotion) {
      scale.value = withTiming(1, { duration: 200 });
      sway.value = withTiming(0, { duration: 200 });
      return;
    }
    // Breathing pulse — slightly irregular so it reads like a real flame.
    scale.value = withRepeat(
      withSequence(
        withTiming(1.14, { duration: 620, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.97, { duration: 480, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.06, { duration: 540, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
    // Subtle flame sway.
    sway.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(3, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [active, reducedMotion]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${sway.value}deg` },
    ],
  }));

  return (
    <Animated.View style={style}>
      <Image source="sf:flame.fill" style={{ width: size, height: size }} tintColor={color} />
    </Animated.View>
  );
}
