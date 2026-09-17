import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, Text } from 'react-native';
import { success as hapticSuccess } from '@/lib/haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
  useReducedMotion,
} from 'react-native-reanimated';
import { LK, theme, rgba } from '@/constants/theme';
import MascotAnimation, { MASCOT_DURATIONS_MS, type MascotAnimationName } from '@/components/ui/mascot-animation';

/**
 * The send peak moment (§10.5) — the most important animation in the app.
 * Full-screen Parchment overlay playing the type-specific Lo & Kit mascot WebP
 * (NOT Lottie — §10.7), with a warm line. Self-dismissing: fades in, holds while
 * the mascot plays, then fades out and calls `onDismiss`.
 *
 * Driven entirely by Reanimated *shared values* (not entering/exiting layout
 * animations) so it animates correctly whether it's mounted at a screen root
 * (nudges) OR inside a React Native <Modal> (letter/card compose) — layout
 * animations silently no-op inside Modals.
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
  const overlay = useSharedValue(0); // backdrop + everything fade
  const pop = useSharedValue(0.9);   // gentle mascot scale-in
  const copy = useSharedValue(0);    // warm line fade + rise
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayedRef = useRef(false); // onDisplay fires once; ignore repeats
  const dismissingRef = useRef(false); // guard against double-dismiss

  const triggerDismiss = useCallback(() => {
    if (dismissingRef.current) return;
    dismissingRef.current = true;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    copy.value = withTiming(0, { duration: 160 });
    overlay.value = withTiming(0, { duration: 260 }, (finished) => {
      'worklet';
      if (finished) runOnJS(onDismiss)();
    });
  // overlay/copy are shared values — stable refs, safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDismiss]);

  // Hold the overlay for exactly one playback loop, then dismiss. The GIFs loop
  // infinitely and expo-image (SDK 54) gives no loop-count / end callback, so we
  // time the dismiss to land on the natural loop boundary (= the resting pose),
  // never mid-motion. Timed from onDisplay so GIF load lag doesn't eat the tail.
  //
  // NOTE: the mascot GIF is *content*, not vestibular motion — Reduce Motion must
  // not truncate it. (It used to cut the hold to 1400 ms under Reduce Motion,
  // which clipped the animation to "a split second.") We only tone down the
  // scale-in pop below for Reduce Motion; the GIF always plays its full loop.
  const startHold = useCallback(() => {
    if (displayedRef.current || dismissingRef.current) return;
    displayedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const loop = MASCOT_DURATIONS_MS[name] ?? 5060;
    timerRef.current = setTimeout(triggerDismiss, loop);
  // name is stable for the overlay's lifetime
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, triggerDismiss]);

  useEffect(() => {
    if (!visible) return;
    dismissingRef.current = false;
    displayedRef.current = false;
    if (process.env.EXPO_OS === 'ios') {
      hapticSuccess();
    }

    overlay.value = withTiming(1, { duration: reduced ? 120 : 240 });
    pop.value = reduced
      ? 1
      : withDelay(40, withSpring(1, { damping: theme.spring.gentle.damping, stiffness: theme.spring.gentle.stiffness }));
    copy.value = withDelay(reduced ? 120 : 320, withTiming(1, { duration: 280 }));

    // Safety net: if onDisplay never fires (asset decode failure, etc.) dismiss
    // from mount after one loop + 600 ms grace so the overlay can't get stuck open.
    timerRef.current = setTimeout(triggerDismiss, (MASCOT_DURATIONS_MS[name] ?? 5060) + 600);
    return () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }));
  const mascotStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const copyStyle = useAnimatedStyle(() => ({ opacity: copy.value, transform: [{ translateY: (1 - copy.value) * 6 }] }));

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          elevation: 100,
          backgroundColor: rgba(LK.parchment, 0.97),
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
        },
        overlayStyle,
      ]}
    >
      {/* Tap anywhere to skip — Duolingo pattern */}
      <Pressable style={{ alignItems: 'center' }} onPress={triggerDismiss}>
        <Animated.View style={mascotStyle}>
          <MascotAnimation name={name} size={260} onDisplay={startHold} />
        </Animated.View>
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
      </Pressable>
    </Animated.View>
  );
}
