import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { LK, tint, shade, rgba, theme } from '@/constants/theme';
import { Skeleton } from '@/components/ui/Skeleton';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StreakMascot } from '@/components/ui/streak-mascot';
import { FadeSlideIn } from '@/components/ui/FadeSlideIn';
import { useQuizStreak } from '@/hooks/useQuizStreak';
import { STREAK_BADGES, nextBadge, unlockedCount, type StreakBadge } from '@/constants/streak-achievements';

const BADGE_COL_GAP = 12;

function BadgeTile({ badge, unlocked }: { badge: StreakBadge; unlocked: boolean }) {
  return (
    <View
      style={{
        width: `${100 / 3}%`,
        paddingHorizontal: BADGE_COL_GAP / 2,
        marginBottom: 18,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 70,
          height: 70,
          borderRadius: 35,
          borderCurve: 'continuous',
          backgroundColor: unlocked ? rgba(badge.accent, 0.16) : rgba(LK.espresso, 0.05),
          borderWidth: 1.5,
          borderColor: unlocked ? rgba(badge.accent, 0.5) : rgba(LK.espresso, 0.08),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          name={unlocked ? badge.icon : 'lock'}
          size={30}
          color={unlocked ? badge.accent : LK.ink45}
          strokeWidth={unlocked ? 2 : 1.8}
        />
      </View>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: '700',
          fontSize: 12.5,
          color: unlocked ? LK.espresso : LK.ink45,
          marginTop: 8,
          textAlign: 'center',
        }}
      >
        {badge.title}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: theme.fonts.body,
          fontSize: 10.5,
          color: unlocked ? LK.ink70 : LK.ink45,
          marginTop: 1,
          textAlign: 'center',
        }}
      >
        {badge.blurb}
      </Text>
    </View>
  );
}

function InfoCard({ icon, accent, title, children }: {
  icon: string;
  accent: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: LK.ivory,
        borderRadius: 20,
        borderCurve: 'continuous',
        padding: 16,
        flexDirection: 'row',
        gap: 13,
        boxShadow: '0 2px 8px rgba(42,33,26,0.07)',
      } as any}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: rgba(accent, 0.16),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={20} color={accent} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 16, color: LK.espresso, marginBottom: 5 }}>
          {title}
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5, color: LK.ink70, lineHeight: 20 }}>
          {children}
        </Text>
      </View>
    </View>
  );
}

export default function StreakScreen() {
  const streak = useQuizStreak();
  const best = streak.best;
  const goal = nextBadge(best);
  const earned = unlockedCount(best);

  // Progress toward the next badge — relative to the previous threshold.
  const prevThreshold = goal ? (STREAK_BADGES[STREAK_BADGES.indexOf(goal) - 1]?.days ?? 0) : 0;
  const span = goal ? goal.days - prevThreshold : 1;
  const into = goal ? Math.max(0, best - prevThreshold) : 1;
  const pct = goal ? Math.min(1, into / span) : 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }}>
      <ScreenHeader eyebrow="Daily Match" title="Your Streak" onBack={() => router.back()} />

      {streak.loading ? (
        <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 16, gap: 16 }}>
          <Skeleton height={150} radius={theme.radii.lg} />
          <Skeleton height={90} radius={theme.radii.md} />
          <Skeleton height={90} radius={theme.radii.md} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
          {/* ── Hero: current streak ───────────────────────────────────────── */}
          <FadeSlideIn delay={60} fromY={10}>
            <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 16 }}>
              <View
                style={{
                  backgroundColor: LK.vellum,
                  borderRadius: theme.radii.lg,
                  borderCurve: 'continuous',
                  paddingVertical: 26,
                  alignItems: 'center',
                  ...theme.shadow.card,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <StreakMascot size={120} active={streak.current > 0} />
                  <Text
                    style={{
                      fontFamily: theme.fonts.heading,
                      fontWeight: '800',
                      fontSize: 64,
                      letterSpacing: -2,
                      color: streak.current > 0 ? LK.coral : LK.espresso,
                      fontVariant: ['tabular-nums'],
                      lineHeight: 70,
                    }}
                  >
                    {streak.current}
                  </Text>
                </View>
                <Text style={{ fontFamily: theme.fonts.handMedium, fontSize: 17, color: LK.sepia, marginTop: 2 }}>
                  {streak.current === 1 ? 'day streak' : 'day streak'}
                </Text>
                {streak.freezeActive && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10, backgroundColor: rgba(LK.sky, 0.14), borderRadius: 9999, paddingHorizontal: 11, paddingVertical: 5 }}>
                    <Icon name="shield" size={13} color={shade(LK.sky, 0.4)} strokeWidth={2} />
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11.5, color: shade(LK.sky, 0.4) }}>
                      A freeze is holding your streak
                    </Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', gap: 28, marginTop: 18 }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 22, color: LK.espresso }}>{best}</Text>
                    <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70, marginTop: 1 }}>best ever</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: LK.hairline }} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 22, color: LK.espresso }}>{earned}/{STREAK_BADGES.length}</Text>
                    <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70, marginTop: 1 }}>badges</Text>
                  </View>
                </View>
              </View>
            </View>
          </FadeSlideIn>

          {/* ── Next badge progress ────────────────────────────────────────── */}
          {goal && (
            <FadeSlideIn delay={110}>
              <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 16 }}>
                <View
                  style={{
                    backgroundColor: LK.ivory,
                    borderRadius: 20,
                    borderCurve: 'continuous',
                    padding: 16,
                    boxShadow: '0 2px 8px rgba(42,33,26,0.07)',
                  } as any}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: rgba(goal.accent, 0.16), alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={goal.icon} size={17} color={goal.accent} strokeWidth={2} />
                    </View>
                    <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.espresso }}>
                      Next: {goal.title}
                    </Text>
                    <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.faded }}>
                      {Math.max(0, goal.days - best)} days to go
                    </Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: rgba(LK.espresso, 0.1), borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${Math.round(pct * 100)}%`, backgroundColor: goal.accent, borderRadius: 3 }} />
                  </View>
                </View>
              </View>
            </FadeSlideIn>
          )}

          {/* ── Badge grid ─────────────────────────────────────────────────── */}
          <FadeSlideIn delay={150}>
            <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 26 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', color: LK.espresso, marginBottom: 16 }}>
                Achievements
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -BADGE_COL_GAP / 2 }}>
                {STREAK_BADGES.map((b) => (
                  <BadgeTile key={b.key} badge={b} unlocked={best >= b.days} />
                ))}
              </View>
            </View>
          </FadeSlideIn>

          {/* ── How it works ───────────────────────────────────────────────── */}
          <FadeSlideIn delay={190}>
            <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 14 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', color: LK.espresso, marginBottom: 14 }}>
                How it works
              </Text>
              <View style={{ gap: 12 }}>
                <InfoCard icon="star" accent={LK.coral} title="Building your streak">
                  Your streak grows by one each day you <Text style={{ fontWeight: '700', color: LK.espresso }}>both</Text> answer the Daily Match. Today never counts against you until the day ends — so there's no rush.
                </InfoCard>
                <InfoCard icon="shield" accent={LK.sky} title="One free freeze">
                  Miss a single day and an automatic freeze quietly bridges the gap, keeping your run alive. Two missed days in a row is what ends a streak.
                </InfoCard>
                <InfoCard icon="palette" accent={LK.lilac} title="Weekly challenges">
                  Each week brings a shared goal — answer quizzes, send letters or drawings, tick off a bucket-list dream. Complete it and the whole week counts toward your streak, even days you missed the quiz.
                </InfoCard>
                <InfoCard icon="gift" accent={LK.gold} title="Streak rescue coupon">
                  If a streak does break, either of you can gift a Streak Rescue from the Coupons screen within 48 hours. It restores your run instantly for both of you and stays in your coupon history as a little keepsake.
                </InfoCard>
              </View>
            </View>
          </FadeSlideIn>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
