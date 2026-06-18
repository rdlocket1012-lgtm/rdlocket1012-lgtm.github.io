import React, { useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ActivityIndicator, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { LK, tint, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from './PressableScale';

/**
 * Onboarding design language — "warm editorial".
 * Cream canvas with two slow-breathing tinted blobs, Bricolage display
 * titles, Newsreader-italic "why" lines, one gold accent thread (progress
 * bar + highlights), ink pill CTAs. Every screen shares this shell so the
 * flow reads as one continuously unfolding story.
 */

// ---------- Typography ----------
export const T = {
  title: {
    fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 34,
    color: LK.espresso, letterSpacing: -1.2, lineHeight: 40,
  } as TextStyle,
  why: {
    fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 17.5,
    color: LK.ink70, lineHeight: 26, marginTop: 10,
  } as TextStyle,
  body: {
    fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70, lineHeight: 23,
  } as TextStyle,
  btn: { fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 17 } as TextStyle,
};

// ---------- Ambient canvas ----------
function Blob({ color, size, top, left, drift = 26, duration = 9000, delay = 0 }: {
  color: string; size: number; top: number; left: number; drift?: number; duration?: number; delay?: number;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true,
    ));
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: t.value * drift },
      { translateY: t.value * drift * 0.55 },
      { scale: 1 + t.value * 0.06 },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{
        position: 'absolute', top, left, width: size, height: size,
        borderRadius: size / 2, backgroundColor: color, opacity: 0.55,
      }, style]}
    />
  );
}

export function Canvas({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: LK.parchment, overflow: 'hidden' }}>
      <Blob color={tint(LK.marigold, 0.78)} size={380} top={-150} left={150} duration={9000} />
      <Blob color={tint(LK.blush, 0.84)} size={430} top={540} left={-190} duration={11000} delay={500} drift={-22} />
      {children}
    </View>
  );
}

// ---------- Continuous progress ----------
export function ProgressBar({ step, total }: { step: number; total: number }) {
  // Starts at the previous step's fill and springs forward, so each screen
  // arrival visibly "earns" its progress.
  const w = useSharedValue(Math.max(0, step - 1) / total);
  useEffect(() => {
    w.value = withSpring(step / total, { damping: 22, stiffness: 110, mass: 0.9 });
  }, [step, total]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={{ height: 4, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.09)', overflow: 'hidden' }}>
      <Animated.View style={[{ height: 4, borderRadius: 9999, backgroundColor: LK.marigold }, fill]} />
    </View>
  );
}

// ---------- Back orb ----------
export function BackOrb({ onPress }: { onPress?: () => void }) {
  return (
    <PressableScale
      onPress={onPress ?? (() => router.back())}
      scaleTo={0.88}
      accessibilityLabel="Go back"
      style={{
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: 'rgba(42,33,26,0.06)', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Icon name="chevL" size={21} color={LK.espresso} />
    </PressableScale>
  );
}

// ---------- CTAs ----------
export function PrimaryCta({ label, onPress, busy, disabled }: {
  label: string; onPress?: () => void; busy?: boolean; disabled?: boolean;
}) {
  return (
    <PressableScale
      onPress={busy || disabled ? undefined : onPress}
      disabled={busy || disabled}
      accessibilityLabel={label}
      style={{
        height: 57, borderRadius: 9999, backgroundColor: LK.espresso,
        alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.35 : 1, ...theme.shadow.sm,
      }}
    >
      {busy ? <ActivityIndicator color="#fff" /> : <Text style={[T.btn, { color: '#fff' }]}>{label}</Text>}
    </PressableScale>
  );
}

export function QuietCta({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <PressableScale onPress={onPress} haptic="soft" style={{ paddingVertical: 13, alignItems: 'center' }}>
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.ink70 }}>
        {label}
      </Text>
    </PressableScale>
  );
}

// ---------- Screen shell ----------
export function Shell({ step, total, title, why, children, footer, showBack = true, onBack, keyboardAvoid }: {
  step: number;
  total: number;
  title: string;
  why?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  keyboardAvoid?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const inner = (
    <View style={{ flex: 1, paddingTop: insets.top + 10, paddingBottom: Math.max(insets.bottom, 18) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: theme.layout.screenX }}>
        {showBack ? <BackOrb onPress={onBack} /> : <View style={{ width: 42 }} />}
        <View style={{ flex: 1 }}><ProgressBar step={step} total={total} /></View>
        <View style={{ width: 26 }} />
      </View>

      <Animated.View
        entering={FadeInDown.delay(70).springify().damping(19)}
        style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 34 }}
      >
        <Text style={T.title}>{title}</Text>
        {!!why && <Text style={T.why}>{why}</Text>}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(170).springify().damping(19)}
        style={{ flex: 1, paddingHorizontal: theme.layout.screenX }}
      >
        {children}
      </Animated.View>

      {!!footer && (
        <Animated.View
          entering={FadeInDown.delay(270).springify().damping(19)}
          style={{ paddingHorizontal: theme.layout.screenX, gap: 6 }}
        >
          {footer}
        </Animated.View>
      )}
    </View>
  );

  return (
    <Canvas>
      {keyboardAvoid ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {inner}
        </KeyboardAvoidingView>
      ) : inner}
    </Canvas>
  );
}
