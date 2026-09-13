import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { LK, theme, tint, shade, rgba } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { StreakMascot } from '@/components/ui/streak-mascot';
import { addDays } from '@/utils/streak';

type Props = {
  current: number;
  best: number;
  pausedActive: boolean;
  /** `activePause.end_date` — the last day the pause covers. */
  pauseEndDate?: string | null;
};

/**
 * Home's streak entry (UX_POLISH_PLAN B3/B4).
 *
 * Two states, not one row with a swapped string:
 *
 *  - **Paused** — its own card. Locket has a whole fixed-duration pause feature
 *    (migration 014) that used to surface only as the words "streak paused"
 *    inside the slim row, so the safety net was invisible to the people relying
 *    on it. Alma treats the equivalent ("Vacation mode") as a first-class card;
 *    this follows that.
 *  - **Running** — the slim row.
 *
 * Takes plain props rather than mounting `useQuizStreak` / `useStreakPause`
 * itself: those hooks are not refcounted, and Home already holds them. Mounting
 * again would open duplicate realtime channels.
 */
export function StreakRow({ current, best, pausedActive, pauseEndDate }: Props) {
  if (pausedActive) {
    return <PausedCard current={current} pauseEndDate={pauseEndDate} />;
  }

  return (
    <ScalePressable
      scaleTo={0.98}
      onPress={() => router.push('/streak')}
      accessibilityLabel="View your streak and achievements"
      style={{
        backgroundColor: LK.ivory,
        borderRadius: 20,
        borderCurve: 'continuous',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 2px 8px rgba(42,33,26,0.07)',
      } as any}
    >
      <StreakMascot size={52} active={current > 0} />
      <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 24, color: current > 0 ? LK.coral : LK.espresso, letterSpacing: -0.5, fontVariant: ['tabular-nums'] }}>
        {current}
      </Text>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.sepia, flex: 1 }}>
        {current === 0 ? 'start a new streak today' : 'day streak'}
      </Text>
      {best > 0 && (
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: '700', color: LK.faded }}>
          best: {best}
        </Text>
      )}
      <Icon name="chevR" size={16} color={LK.faded} />
    </ScalePressable>
  );
}

function PausedCard({ current, pauseEndDate }: { current: number; pauseEndDate?: string | null }) {
  // The pause covers through end_date, so the streak resumes the day after.
  const resumesOn = pauseEndDate
    ? new Date(addDays(pauseEndDate, 1) + 'T00:00:00').toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short',
      })
    : null;

  return (
    <ScalePressable
      scaleTo={0.98}
      onPress={() => router.push('/streak')}
      accessibilityLabel="Your streak is paused — open streak settings"
      style={{
        backgroundColor: tint(LK.sky, 0.72),
        borderRadius: 20,
        borderCurve: 'continuous',
        borderWidth: 1.5,
        borderColor: rgba(LK.sky, 0.45),
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
      } as any}
    >
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: rgba(LK.sky, 0.3), alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="pause" size={20} color={shade(LK.sky, 0.5)} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 16.5, color: LK.espresso }}>
          Your streak is safe
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: shade(LK.sky, 0.55), marginTop: 2, lineHeight: 18 }}>
          {current} {current === 1 ? 'day' : 'days'} held
          {resumesOn ? ` · picks back up ${resumesOn}` : ''}
        </Text>
      </View>
      <Icon name="chevR" size={18} color={shade(LK.sky, 0.45)} />
    </ScalePressable>
  );
}
