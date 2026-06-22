import React, { useEffect } from 'react';
import { TextInput, TextStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedProps, withDelay, withTiming, Easing, ReduceMotion,
} from 'react-native-reanimated';

Animated.addWhitelistedNativeProps({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

function fmt(n: number): string {
  'worklet';
  const s = String(Math.max(0, Math.round(n)));
  let out = '';
  for (let i = 0; i < s.length; i++) {
    out += s[i];
    const rem = s.length - 1 - i;
    if (rem > 0 && rem % 3 === 0) out += ',';
  }
  return out;
}

/**
 * Animated number that counts up (or re-counts when `value` changes) with an
 * ease-out curve — the day-counter's heartbeat. Renders via a non-editable
 * TextInput so the digits update on the UI thread without re-rendering React.
 */
export function CountUp({ value, duration = 1300, delay = 200, style }: {
  value: number;
  duration?: number;
  delay?: number;
  style?: StyleProp<TextStyle>;
}) {
  const sv = useSharedValue(0);
  useEffect(() => {
    sv.value = withDelay(delay, withTiming(value, { duration, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.Never }));
  }, [value]);

  const animatedProps = useAnimatedProps(() => ({ text: fmt(sv.value) } as any));

  return (
    <AnimatedTextInput
      editable={false}
      defaultValue="0"
      animatedProps={animatedProps}
      allowFontScaling={false}
      underlineColorAndroid="transparent"
      style={[{ padding: 0 }, style]}
    />
  );
}
