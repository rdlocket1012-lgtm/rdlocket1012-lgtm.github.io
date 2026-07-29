import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSpring, useReducedMotion, cancelAnimation } from 'react-native-reanimated';
import { LK, tint, shade, rgba, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { DoodleBackground } from '@/components/ui/doodle-background';
import MascotAnimation from '@/components/ui/mascot-animation';
import { REUNION_AT, REUNION_GRACE_MS } from '@/constants/reunion';

/**
 * TEMPORARY — see `constants/reunion.ts`.
 *
 * Counts down to the moment they're in the same place, then flips to a "you're
 * together" state and finally retires itself once the grace window closes.
 *
 * Deliberately uses no native module that isn't already in the v1.1.0 binary:
 * this ships over OTA, and importing anything newer would crash the installed
 * build on launch rather than fail gracefully (see the WatchTogether note in
 * `app/(tabs)/index.tsx`).
 */

type Phase = 'before' | 'together' | 'done';

function phaseFor(now: number): Phase {
  const target = REUNION_AT.getTime();
  if (now < target) return 'before';
  if (now < target + REUNION_GRACE_MS) return 'together';
  return 'done';
}

/** Splits the remaining milliseconds into padded display units. */
function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function ReunionCountdown({ partnerFirstName }: { partnerFirstName: string }) {
  const [now, setNow] = useState(() => Date.now());
  const reduceMotion = useReducedMotion();
  const heart = useSharedValue(1);

  // The tick lives in this component, not on HomeScreen, so a once-a-second
  // countdown doesn't re-render the whole home tab.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const phase = phaseFor(now);

  useEffect(() => {
    if (reduceMotion || phase !== 'before') return;
    // A slow heartbeat on the icon — the one question it answers is "is this
    // still live?", which is exactly what a countdown needs to say.
    heart.value = withRepeat(withTiming(1.12, { duration: 900 }), -1, true);
    return () => cancelAnimation(heart);
  }, [reduceMotion, phase]);

  useEffect(() => {
    if (reduceMotion || phase !== 'together') return;
    heart.value = withSpring(1.18, theme.spring.bounce);
  }, [reduceMotion, phase]);

  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heart.value }] }));

  // Once the day is over the card stops existing. No follow-up deploy needed to
  // clean it off the home screen.
  if (phase === 'done') return null;

  const remaining = split(REUNION_AT.getTime() - now);
  const together = phase === 'together';
  const accent = together ? LK.blush : LK.coral;

  return (
    <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 12 }}>
      <View
        style={{
          backgroundColor: LK.vellum,
          borderRadius: theme.radii.lg,
          borderCurve: 'continuous',
          borderWidth: 1.5,
          borderColor: rgba(accent, 0.45),
          overflow: 'hidden',
          alignItems: 'center',
          paddingTop: 16,
          paddingBottom: 20,
          ...theme.shadow.card,
        }}
      >
        <DoodleBackground group="general" density="light" />

        {/* The hero counter directly above this card already carries a 104px
            idle mascot. Stacking a second one while counting would just repeat
            it and push the numbers down — so the mascot is held back and spent
            on the arrival, where it reads as a payoff instead of decoration. */}
        {together && <MascotAnimation name="hug-receive" size={92} />}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 2 }}>
          <Animated.View style={heartStyle}>
            <Icon name={together ? 'heart' : 'plane'} size={14} color={accent} strokeWidth={2} />
          </Animated.View>
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: shade(accent, 0.35),
            }}
          >
            {together ? 'Together at last' : 'Together in'}
          </Text>
        </View>

        {together ? (
          <Text
            style={{
              fontFamily: theme.fonts.heading,
              fontWeight: '800',
              fontSize: 34,
              letterSpacing: -1,
              color: LK.espresso,
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            No more miles
          </Text>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 8 }}>
            <Unit value={remaining.hours} label="hrs" />
            <Colon />
            <Unit value={remaining.minutes} label="min" pad />
            <Colon />
            <Unit value={remaining.seconds} label="sec" pad />
          </View>
        )}

        <Text
          style={{
            fontFamily: theme.fonts.hand,
            fontSize: 15,
            color: LK.sepia,
            marginTop: 12,
            paddingHorizontal: 28,
            textAlign: 'center',
            lineHeight: 22,
          }}
        >
          {together
            ? `${partnerFirstName} is right there. Put the phone down.`
            : `until you're holding ${partnerFirstName}`}
        </Text>
      </View>
    </View>
  );
}

function Unit({ value, label, pad }: { value: number; label: string; pad?: boolean }) {
  return (
    <View style={{ alignItems: 'center', minWidth: 58 }}>
      <Text
        style={{
          fontFamily: theme.fonts.heading,
          fontWeight: '800',
          fontSize: 44,
          lineHeight: 48,
          letterSpacing: -2,
          color: LK.espresso,
          includeFontPadding: false,
          // Without tabular figures the whole row jitters every tick as glyph
          // widths change under it.
          fontVariant: ['tabular-nums'],
        }}
      >
        {pad ? String(value).padStart(2, '0') : value}
      </Text>
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.5,
          color: LK.faded,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function Colon() {
  return (
    <Text
      style={{
        fontFamily: theme.fonts.heading,
        fontWeight: '800',
        fontSize: 34,
        lineHeight: 44,
        color: rgba(LK.espresso, 0.25),
      }}
    >
      :
    </Text>
  );
}
