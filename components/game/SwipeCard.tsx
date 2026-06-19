import React from 'react';
import { View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LK, tint, shade, theme } from '@/constants/theme';

type Prompt = { q: string; a: string; b: string };

const THRESHOLD = 60;
const SPRING_BOUNCE = theme.spring.bounce;

interface Props {
  prompt: Prompt;
  name1: string;
  name2: string;
  disabled: boolean;
  onChoose: (choice: 'a' | 'b') => void;
}

export function SwipeCard({ prompt, name1, name2, disabled, onChoose }: Props) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const rot = useSharedValue(0);

  const fill = (s: string) =>
    s.replace(/\{p1\}/g, name1).replace(/\{p2\}/g, name2);

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((e) => {
      'worklet';
      tx.value = e.translationX * 0.7;
      ty.value = e.translationY * 0.15;
      rot.value = e.translationX * 0.07;
    })
    .onEnd((e) => {
      'worklet';
      if (Math.abs(e.translationX) > THRESHOLD) {
        const dir = e.translationX > 0 ? 1 : -1;
        tx.value = withSpring(dir * 500, SPRING_BOUNCE);
        ty.value = withSpring(e.translationY * 0.5, SPRING_BOUNCE);
        rot.value = withSpring(dir * 22, SPRING_BOUNCE);
        const choice: 'a' | 'b' = dir < 0 ? 'a' : 'b'; // left = A, right = B
        runOnJS(onChoose)(choice);
      } else {
        tx.value = withSpring(0, SPRING_BOUNCE);
        ty.value = withSpring(0, SPRING_BOUNCE);
        rot.value = withSpring(0, SPRING_BOUNCE);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rot.value}deg` },
    ],
  }));

  // Left (A) overlay: visible when swiping left (tx < 0)
  const leftTintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));
  // Right (B) overlay: visible when swiping right (tx > 0)
  const rightTintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [0, THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));
  // Left label brightens when dragging left
  const leftLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-THRESHOLD, 0], [1, 0.5], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(tx.value, [-THRESHOLD, 0], [1.06, 1], Extrapolation.CLAMP) }],
  }));
  // Right label brightens when dragging right
  const rightLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [0, THRESHOLD], [0.5, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(tx.value, [0, THRESHOLD], [1, 1.06], Extrapolation.CLAMP) }],
  }));

  const cardBase: object = {
    backgroundColor: LK.vellum,
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 2,
    borderColor: 'rgba(42,33,26,0.18)',
    padding: 28,
    minHeight: 280,
    justifyContent: 'space-between',
    ...theme.shadow.card,
  };

  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      {/* Ghost card — furthest back */}
      <View
        style={[cardBase, {
          position: 'absolute', width: '100%',
          transform: [{ rotate: '3deg' }, { scale: 0.96 }],
          opacity: 0.5,
        }]}
      />
      {/* Ghost card — middle */}
      <View
        style={[cardBase, {
          position: 'absolute', width: '100%',
          transform: [{ rotate: '-1.5deg' }, { scale: 0.98 }],
          opacity: 0.75,
        }]}
      />

      {/* Active card */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[cardBase, { width: '100%', overflow: 'hidden' }, cardStyle]}>
          {/* Coral overlay — left swipe (Option A) */}
          <Animated.View
            style={[leftTintStyle, {
              position: 'absolute', inset: 0, borderRadius: 24,
              backgroundColor: 'rgba(255,122,107,0.13)',
            }]}
            pointerEvents="none"
          />
          {/* Sky overlay — right swipe (Option B) */}
          <Animated.View
            style={[rightTintStyle, {
              position: 'absolute', inset: 0, borderRadius: 24,
              backgroundColor: 'rgba(91,184,232,0.13)',
            }]}
            pointerEvents="none"
          />

          {/* Question */}
          <Text style={{
            fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 22,
            color: LK.espresso, textAlign: 'center', lineHeight: 30, letterSpacing: -0.5,
          }}>
            {fill(prompt.q)}
          </Text>

          {/* OR divider */}
          <View style={{ alignItems: 'center', marginVertical: 6 }}>
            <View style={{
              backgroundColor: LK.ivory, borderRadius: 9999,
              borderWidth: 1.5, borderColor: 'rgba(42,33,26,0.10)',
              paddingHorizontal: 18, paddingVertical: 6,
            }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: LK.sepia, letterSpacing: 2 }}>
                OR
              </Text>
            </View>
          </View>

          {/* Option hint row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Animated.View style={[leftLabelStyle, { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: shade(LK.coral, 0.45) }}>←</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: LK.espresso, flex: 1 }} numberOfLines={2}>
                {fill(prompt.a)}
              </Text>
            </Animated.View>
            <View style={{ width: 1, height: 28, backgroundColor: 'rgba(42,33,26,0.10)', marginHorizontal: 8 }} />
            <Animated.View style={[rightLabelStyle, { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }]}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: LK.espresso, flex: 1, textAlign: 'right' }} numberOfLines={2}>
                {fill(prompt.b)}
              </Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: shade(LK.sky, 0.45) }}>→</Text>
            </Animated.View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
