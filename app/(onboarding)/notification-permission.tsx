import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LK, rgba, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { Shell, PrimaryCta, QuietCta } from '@/components/onboarding/Shell';
import { registerForPush } from '@/lib/push';
import { useAuthStore } from '@/stores/auth.store';
import { success } from '@/lib/haptics';

/**
 * Notification priming (UX_POLISH_PLAN §E3).
 *
 * Locket rides on push harder than most apps — nudges, letters, date reminders
 * and partner activity are all push-first — yet the OS prompt used to fire from
 * `app/_layout.tsx` the instant a session existed: before onboarding rendered
 * anything, with no explanation. A denial there is expensive and, in practice,
 * permanent. `registerForPush` no longer requests by default; this screen is the
 * only caller that passes `request: true`, so Locket asks in its own words first.
 *
 * Named `notification-permission` to mirror `photo-permission` — and because a
 * bare `notifications.tsx` would resolve to `/notifications`, colliding with the
 * Activity feed at `app/notifications/index.tsx` (route groups don't namespace
 * URLs).
 *
 * The samples below are the app's real notification copy, not invented examples —
 * this screen is a promise about what will actually arrive.
 */

const SAMPLES: { title: string; body: string; tint: string; tilt: string }[] = [
  { title: 'Kiss incoming! 💋', body: 'Tap to catch it before it lands…', tint: LK.blush, tilt: '-1.5deg' },
  { title: 'A letter arrived 💌', body: 'Sam wrote you something.', tint: LK.gold, tilt: '1deg' },
  { title: 'Two years ago today', body: 'Sunset at Oia — remember?', tint: LK.marigold, tilt: '-0.75deg' },
];

function SampleNotification({ title, body, tint: accent, tilt }: (typeof SAMPLES)[number]) {
  return (
    <View
      style={{
        backgroundColor: LK.vellum, borderRadius: 18, borderCurve: 'continuous',
        borderWidth: 1.5, borderColor: rgba(LK.espresso, 0.1),
        padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11,
        transform: [{ rotate: tilt }], ...theme.shadow.sm,
      }}
    >
      <View style={{
        width: 34, height: 34, borderRadius: 9, borderCurve: 'continuous',
        backgroundColor: accent, alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="heart" size={17} color="#fff" strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 13.5, color: LK.espresso }}>
          {title}
        </Text>
        <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, marginTop: 1 }}>
          {body}
        </Text>
      </View>
    </View>
  );
}

export default function NotificationPrimingScreen() {
  const { joiner } = useLocalSearchParams<{ joiner?: string }>();
  const isJoiner = joiner === '1';
  const [busy, setBusy] = useState(false);

  /**
   * The joiner's flow ends here (their partner already set the anniversary and
   * connection style), so it also has to close onboarding out. The inviter still
   * has the photo-permission screen after this one.
   */
  async function done() {
    await AsyncStorage.setItem('notification_permission_asked', 'true');
    if (isJoiner) {
      await AsyncStorage.setItem('onboarding_done', 'true');
      router.replace('/(tabs)');
    } else {
      router.push('/(onboarding)/photo-permission');
    }
  }

  async function handleAllow() {
    if (busy) return;
    setBusy(true);
    try {
      const pid = useAuthStore.getState().profile?.id ?? useAuthStore.getState().user?.id;
      // Requests permission AND stores the token in one pass, so a granted
      // permission can't end up without a push token attached to the profile.
      if (pid) await registerForPush(pid, { request: true });
      success();
    } finally {
      setBusy(false);
    }
    await done();
  }

  return (
    <Shell
      step={isJoiner ? 3 : 6}
      total={isJoiner ? 3 : 7}
      title={isJoiner ? 'Want to know when they reach for you?' : 'Want to know the moment they join?'}
      why="nudges, letters and little anniversaries — nothing else, ever. No marketing, no digests."
      footer={
        <>
          <PrimaryCta label="Turn on notifications" onPress={handleAllow} busy={busy} />
          <QuietCta label="Not right now" onPress={done} />
        </>
      }
    >
      <View style={{ marginTop: 30, gap: 11 }}>
        {SAMPLES.map((s) => <SampleNotification key={s.title} {...s} />)}
        <Text style={{
          fontFamily: theme.fonts.body, fontSize: 12, color: LK.ink70,
          textAlign: 'center', marginTop: 14, lineHeight: 18,
        }}>
          Only ever from your person. You can change this any time in Settings.
        </Text>
      </View>
    </Shell>
  );
}
