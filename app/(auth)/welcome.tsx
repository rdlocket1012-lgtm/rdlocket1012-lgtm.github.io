import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing, ReduceMotion,
} from 'react-native-reanimated';
import { LK, theme } from '@/constants/theme';
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

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  return (
    <Canvas>
      <View style={{
        flex: 1, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 18),
        paddingHorizontal: theme.layout.screenX,
      }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View entering={FadeInDown.delay(60).springify().damping(18).reduceMotion(ReduceMotion.Never)}>
            <HeartbeatOrb />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(190).springify().damping(18).reduceMotion(ReduceMotion.Never)} style={{ alignItems: 'center' }}>
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
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(330).springify().damping(18).reduceMotion(ReduceMotion.Never)}>
          <PrimaryCta label="Begin your story" onPress={() => router.push('/(auth)/sign-up')} />
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
            <PressableScale haptic="soft" onPress={() => router.push('/(auth)/sign-in')} style={{ padding: 12 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: LK.ink70 }}>
                I have an account
              </Text>
            </PressableScale>
            <Text style={{ color: LK.ink45, fontSize: 14 }}>·</Text>
            <PressableScale haptic="soft" onPress={() => router.push('/(auth)/redeem-code')} style={{ padding: 12 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: LK.ink70 }}>
                I have an invite
              </Text>
            </PressableScale>
          </View>
        </Animated.View>
      </View>
    </Canvas>
  );
}
