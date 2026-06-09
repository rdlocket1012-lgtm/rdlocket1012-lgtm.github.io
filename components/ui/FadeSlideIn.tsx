import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

/**
 * Wraps children in a fade + upward-slide entrance animation.
 * Use `delay` to stagger multiple items on the same screen.
 *
 * Example:
 *   <FadeSlideIn delay={100}><SomeCard /></FadeSlideIn>
 */
export function FadeSlideIn({
  children,
  delay = 0,
  duration = 300,
  fromY = 14,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  /** How many px below its final position the element starts. Default 14. */
  fromY?: number;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(fromY)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
        mass: 0.8,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
