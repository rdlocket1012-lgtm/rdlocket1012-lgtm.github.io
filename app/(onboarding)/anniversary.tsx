import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';
import { LK, shade, theme } from '@/constants/theme';
import { Shell, PrimaryCta } from '@/components/onboarding/Shell';
import { WheelPicker, WHEEL_ITEM_H } from '@/components/onboarding/WheelPicker';
import { CountUp } from '@/components/onboarding/CountUp';
import { ensureCoupleSession } from '@/lib/bootstrap';
import { supabase } from '@/lib/supabase';
import { success } from '@/lib/haptics';
import { alert } from '@/lib/feedback';
import { daysTogether } from '@/utils/date';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AnniversaryScreen() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [day, setDay] = useState(today.getDate());
  const [yearIdx, setYearIdx] = useState(0);
  const [busy, setBusy] = useState(false);

  const years = Array.from({ length: 60 }, (_, i) => today.getFullYear() - i);
  const year = years[yearIdx];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const clampedDay = Math.min(day, daysInMonth);

  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
  // Identical formula to the home day counter (daysTogether = diff + 1, so the
  // first day is Day 1) — the reveal must match what they'll see on home.
  const dc = daysTogether(new Date(dateStr));
  const isFuture = dc < 1;

  async function next() {
    if (busy) return;
    setBusy(true);
    try {
      await AsyncStorage.multiSet([
        ['onboarding_start_date', dateStr],
        ['has_account', 'true'],
      ]);
      // Creates / links the couple — auth happened back at sign-up, so this
      // always runs against a real, recoverable account.
      const coupleId = await ensureCoupleSession(dateStr);
      // Stamp the connection style picked one screen ago (best-effort —
      // column may not exist yet on older databases).
      const style = await AsyncStorage.getItem('connection_style');
      if (style && coupleId) {
        try { await supabase.from('couples').update({ connection_style: style }).eq('id', coupleId); } catch { /* best-effort */ }
      }
      success();
      router.push('/(onboarding)/photo');
    } catch (e: any) {
      // Almost always: signed up with email + PKCE, so the account isn't
      // confirmed yet and there's no real session. Don't dead-end — send them
      // to sign in; the date is saved and onboarding resumes here afterwards.
      await alert(
        "Let's finish setting up",
        "We just need to confirm your account first. Sign in (or tap the link in your confirmation email) and we'll pick up right here.",
      );
      router.replace('/(auth)/sign-in');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell
      step={3}
      total={7}
      title="When did your story begin?"
      why="this date anchors your day counter — every day since, counted."
      footer={<PrimaryCta label="Continue" onPress={next} busy={busy} />}
    >
      <View style={{ marginTop: 26 }}>
        <View>
          {/* Selection pill behind all three wheels */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute', top: WHEEL_ITEM_H * 2, left: 0, right: 0,
              height: WHEEL_ITEM_H, borderRadius: 16, backgroundColor: 'rgba(42,33,26,0.05)',
            }}
          />
          <View style={{ flexDirection: 'row' }}>
            <WheelPicker values={MONTHS} index={month} onChange={setMonth} flex={1.6} fontSize={19} />
            <WheelPicker values={days} index={clampedDay - 1} onChange={(i) => setDay(i + 1)} />
            <WheelPicker values={years} index={yearIdx} onChange={setYearIdx} />
          </View>
        </View>

        {/* Inline micro-reveal — the answer rewards you on the same screen */}
        <Animated.View entering={FadeIn.delay(250).reduceMotion(ReduceMotion.System)} style={{ alignItems: 'center', marginTop: 26, minHeight: 64 }}>
          {!isFuture ? (
            <>
              <CountUp
                value={dc}
                delay={0}
                duration={900}
                style={{
                  fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 38,
                  letterSpacing: -1.5, color: shade(LK.marigold, 0.4), textAlign: 'center',
                }}
              />
              <Text style={{
                fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 18,
                color: LK.ink70, marginTop: 2,
              }}>
                {dc === 1 ? 'day one of you two 💛' : 'days of you two 💛'}
              </Text>
            </>
          ) : (
            <Text style={{
              fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 17,
              color: LK.ink70, textAlign: 'center', lineHeight: 26,
            }}>
              That day's still ahead of you ✨
            </Text>
          )}
        </Animated.View>
      </View>
    </Shell>
  );
}
