import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  useReducedMotion,
} from 'react-native-reanimated';
import { LK, theme, rgba } from '@/constants/theme';
import MascotAnimation, { type MascotAnimationName } from '@/components/ui/mascot-animation';

/**
 * The send peak moment (§10.5) — the most important animation in the app.
 * Full-screen Parchment overlay playing the type-specific Lo & Kit mascot WebP
 * (NOT Lottie — §10.7), with a warm line. Self-dismissing: fades in, holds
 * while the mascot plays, fades out, then calls `onDismiss` (caller pops/closes).
 *
 * Used by Letters, Love Cards, nudges, Draw & Guess reveal — build once.
 * Mount it inside the sending screen's root; it covers that screen (zIndex 100).
 */
export function SendMomentOverlay({
  visible,
  name,
  message = 'Sent with love',
  subMessage,
  onDismiss,
}: {
  visible: boolean;
  name: MascotAnimationName;
  message?: string;
  subMessage?: string;
  onDismiss: () => void;
}) {
  const reduced = useReducedMotion();
  const overlay = useSharedValue(0);
  const copy = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    if (process.env.EXPO_OS === 'ios') {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch { /* no-op */ }
    }
    const hold = reduced ? 1100 : 2300;
    overlay.value = 0;
    copy.value = 0;
    overlay.value = withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(
        hold,
        withTiming(0, { duration: 250 }, (finished) => {
          'worklet';
          if (finished) runOnJS(onDismiss)();
        }),
      ),
    );
    // Warm copy fades in shortly after the mascot appears (§10.5 step 5).
    copy.value = withDelay(500, withTiming(1, { duration: 300 }));
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }));
  const copyStyle = useAnimatedStyle(() => ({ opacity: copy.value }));

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, backgroundColor: rgba(LK.parchment, 0.96), alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
        overlayStyle,
      ]}
    >
      <MascotAnimation name={name} size={260} />
      <Animated.View style={[{ alignItems: 'center', marginTop: 8 }, copyStyle]}>
        <Text style={{ fontFamily: theme.fonts.handMedium, fontSize: 20, color: LK.espresso, textAlign: 'center' }}>
          {message}
        </Text>
        {subMessage ? (
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '400', fontSize: 14, color: LK.sepia, textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
            {subMessage}
          </Text>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}
