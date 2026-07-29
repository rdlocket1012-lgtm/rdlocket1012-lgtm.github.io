import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing, ReduceMotion,
} from 'react-native-reanimated';
import { LK, rgba, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { Canvas, PrimaryCta, T } from '@/components/onboarding/Shell';
import { PressableScale } from '@/components/onboarding/PressableScale';

/** The one motion idea on this screen: a quiet heartbeat. */
function HeartbeatOrb() {
  const ring = useSharedValue(0);
  const beat = useSharedValue(1);
  useEffect(() => {
    ring.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }), -1, false);
    beat.value = withRepeat(withSequence(
      withTiming(1.06, { duration: 180, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 340, easing: Easing.inOut(Easing.quad) }),
      withTiming(1, { duration: 1680 }),
    ), -1, false);
  }, []);
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - ring.value),
    transform: [{ scale: 1 + ring.value * 0.45 }],
  }));
  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: beat.value }] }));
  return (
    <View style={{ width: 130, height: 130, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{
        position: 'absolute', width: 96, height: 96, borderRadius: 48,
        borderWidth: 1.5, borderColor: LK.marigold,
      }, ringStyle]} />
      <Animated.View style={[{
        width: 96, height: 96, borderRadius: 48, backgroundColor: LK.ivory,
        alignItems: 'center', justifyContent: 'center', ...theme.shadow.card,
      }, orbStyle]}>
        <Icon name="heart" size={44} color={LK.espresso} />
      </Animated.View>
    </View>
  );
}

/**
 * The three-step pairing explainer (UX_POLISH_PLAN §E3).
 *
 * "I have an invite" used to be a tertiary link with no explanation of what
 * pairing even was, so a user who already had a code could reasonably tap
 * "Begin your story" — and end up creating a second, empty couple instead of
 * joining their partner's. Saying what happens, before the ask, is what stops
 * that: it's the only place in the flow where the two directions diverge.
 */
function PairingSteps() {
  const STEPS: { icon: string; label: string }[] = [
    { icon: 'share', label: 'Invite' },
    { icon: 'heart', label: 'Pair' },
    { icon: 'sparkle', label: 'Share' },
  ];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 26 }}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s.label}>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <View style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: LK.ivory, borderWidth: 1.5, borderColor: rgba(LK.espresso, 0.12),
              alignItems: 'center', justifyContent: 'center', ...theme.shadow.sm,
            }}>
              <Icon name={s.icon} size={18} color={LK.espresso} strokeWidth={1.9} />
            </View>
            <Text style={{
              fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 10,
              letterSpacing: 1, textTransform: 'uppercase', color: LK.ink70,
            }}>
              {s.label}
            </Text>
          </View>
          {i < STEPS.length - 1 && (
            <View style={{ width: 26, height: 1.5, backgroundColor: rgba(LK.espresso, 0.14), marginBottom: 18 }} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  return (
    <Canvas>
      <View style={{
        flex: 1, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 18),
        paddingHorizontal: theme.layout.screenX,
      }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View entering={FadeInDown.delay(60).springify().damping(18).reduceMotion(ReduceMotion.System)}>
            <HeartbeatOrb />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(190).springify().damping(18).reduceMotion(ReduceMotion.System)} style={{ alignItems: 'center' }}>
            <Text style={{
              fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 54,
              color: LK.espresso, letterSpacing: -2, marginTop: 20,
            }}>
              Locket
            </Text>
            <Text style={{
              fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 23, lineHeight: 31,
              color: LK.espresso, marginTop: 14, textAlign: 'center', maxWidth: 300,
            }}>
              Your relationship's living memory.
            </Text>
            <Text style={[T.body, { marginTop: 12, textAlign: 'center', maxWidth: 280 }]}>
              Every milestone, letter and place — kept together, just for the two of you.
            </Text>
            <PairingSteps />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(330).springify().damping(18).reduceMotion(ReduceMotion.System)}>
          <PrimaryCta label="Begin your story" onPress={() => router.push('/(auth)/sign-up')} />

          {/* Redeem is a real secondary action, not a footnote. Person B arriving
              with a code has to be able to see their own door from here — a
              tertiary link next to "I have an account" was too easy to miss. */}
          <PressableScale
            haptic="soft"
            onPress={() => router.push('/(auth)/redeem-code')}
            accessibilityLabel="Join with an invite code"
            style={{
              marginTop: 10, height: 53, borderRadius: 9999,
              backgroundColor: LK.ivory, borderWidth: 1.5, borderColor: rgba(LK.espresso, 0.14),
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Icon name="heart" size={17} color={LK.espresso} strokeWidth={1.9} />
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: LK.espresso }}>
              I have an invite code
            </Text>
          </PressableScale>

          <PressableScale haptic="soft" onPress={() => router.push('/(auth)/sign-in')} style={{ paddingVertical: 13, marginTop: 2, alignItems: 'center' }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: LK.ink70 }}>
              I have an account
            </Text>
          </PressableScale>
        </Animated.View>
      </View>
    </Canvas>
  );
}
