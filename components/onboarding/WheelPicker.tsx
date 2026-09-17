import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolation, runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import { LK, theme } from '@/constants/theme';
import { tick } from '@/lib/haptics';

export const WHEEL_ITEM_H = 46;
const VISIBLE = 5;
const PAD = WHEEL_ITEM_H * Math.floor(VISIBLE / 2);
export const WHEEL_H = WHEEL_ITEM_H * VISIBLE;

type Props = {
  values: (string | number)[];
  index: number;
  onChange: (i: number) => void;
  flex?: number;
  fontSize?: number;
};

/**
 * Pure-JS wheel picker — deliberate alternative to the native datetimepicker
 * so we add no native module (OTA-safe) and fully own the physics, type and
 * haptics. Snap scrolling with per-row scale/opacity falloff and a selection
 * tick on every detent.
 */
export function WheelPicker({ values, index, onChange, flex = 1, fontSize = 21 }: Props) {
  const y = useSharedValue(index * WHEEL_ITEM_H);
  const lastTick = useSharedValue(index);

  // If the list shrinks under the selection (e.g. 31 → Feb), clamp.
  useEffect(() => {
    if (index >= values.length) onChange(values.length - 1);
  }, [values.length, index, onChange]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      y.value = e.contentOffset.y;
      const i = Math.round(e.contentOffset.y / WHEEL_ITEM_H);
      if (i !== lastTick.value && i >= 0 && i < values.length) {
        lastTick.value = i;
        runOnJS(tick)();
      }
    },
    onMomentumEnd: (e) => {
      const i = Math.min(values.length - 1, Math.max(0, Math.round(e.contentOffset.y / WHEEL_ITEM_H)));
      runOnJS(onChange)(i);
    },
  });

  return (
    <View style={{ flex, height: WHEEL_H }}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_H}
        decelerationRate="fast"
        contentOffset={{ x: 0, y: index * WHEEL_ITEM_H }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: PAD }}
      >
        {values.map((v, i) => (
          <Row key={`${v}-${i}`} label={String(v)} i={i} y={y} fontSize={fontSize} />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

function Row({ label, i, y, fontSize }: { label: string; i: number; y: SharedValue<number>; fontSize: number }) {
  const style = useAnimatedStyle(() => {
    const d = Math.abs(y.value / WHEEL_ITEM_H - i);
    return {
      opacity: interpolate(d, [0, 1, 2.2], [1, 0.36, 0.08], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(d, [0, 1.6], [1, 0.84], Extrapolation.CLAMP) }],
    };
  });
  return (
    <Animated.View style={[{ height: WHEEL_ITEM_H, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize, color: LK.espresso }}>
        {label}
      </Text>
    </Animated.View>
  );
}
