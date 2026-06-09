import { useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Returns an Animated scale value + press handlers that spring-scale an
 * element down on press and snap back on release.
 *
 * Usage:
 *   const press = usePressScale();
 *   <Animated.View style={{ transform: [{ scale: press.scale }] }}
 *     onStartShouldSetResponder={() => true}
 *     onResponderGrant={press.onPressIn}
 *     onResponderRelease={press.onPressOut}
 *     onResponderTerminate={press.onPressOut}
 *   />
 *
 * Or with TouchableOpacity (use onPressIn / onPressOut props directly).
 */
export function usePressScale(to = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;

  function onPressIn() {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      damping: 15,
      stiffness: 500,
      mass: 0.6,
    }).start();
  }

  function onPressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 14,
      stiffness: 320,
      mass: 0.6,
    }).start();
  }

  return { scale, onPressIn, onPressOut };
}
