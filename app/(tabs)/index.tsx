import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, FlatList, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withSpring, useReducedMotion } from 'react-native-reanimated';
import Transition from 'react-native-screen-transitions';
import { LK, tint, shade, rgba, theme, catColor } from '@/constants/theme';
import { useCouple } from '@/hooks/useCouple';
import { useAuth } from '@/hooks/useAuth';
import { useMilestones } from '@/hooks/useMilestones';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Avatar } from '@/components/ui/avatar';
import { RoundIcon } from '@/components/ui/round-icon';
import { IconChip } from '@/components/ui/icon-chip';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { Icon } from '@/components/ui/Icon';
import { DoodleBackground } from '@/components/ui/doodle-background';
import { TYPE_ICON } from '@/constants/milestone-types';
import { DailyQuizCard } from '@/components/quiz/DailyQuizCard';
import { ChallengeCard } from '@/components/ui/ChallengeCard';
import { BadgeUnlockOverlay } from '@/components/ui/BadgeUnlockOverlay';
import { useChallenges } from '@/hooks/useChallenges';
import { useBadgeCelebration } from '@/hooks/useBadgeCelebration';
import { FadeSlideIn } from '@/components/ui/FadeSlideIn';
import { StatusBubble } from '@/components/home/StatusBubble';
import { CouponActivityBanners } from '@/components/home/CouponActivityBanners';
import { usePartner } from '@/hooks/usePartner';
import { usePartnerTime } from '@/hooks/usePartnerTime';
import { useQuizStreak } from '@/hooks/useQuizStreak';
import { useStreakPause } from '@/hooks/useStreakPause';
import { shareInvite } from '@/lib/invite';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import { syncWidget } from '@/lib/widget-bridge';
import { parseLocalDate } from '@/utils/date';
import { useBiteFx } from '@/stores/bite-fx.store';
import { BiteAvatarFx } from '@/components/nudges/BiteAvatarFx';
import { CountUp } from '@/components/onboarding/CountUp';
import { useUnseenStore } from '@/stores/unseen.store';
import MascotAnimation from '@/components/ui/mascot-animation';
import type { MascotAnimationName } from '@/components/ui/mascot-animation';
import { SendMomentOverlay } from '@/components/ui/send-moment-overlay';
import { WidgetHelpModal } from '@/components/ui/widget-help-modal';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { TodaySpine } from '@/components/home/today-spine';
import { StreakRow } from '@/components/home/streak-row';
// TEMPORARY — the 17 Jul 2026 reunion. Remove this import, the block below it
// in the tree, and `constants/reunion.ts` once the day has passed.
import { ReunionCountdown } from '@/components/home/ReunionCountdown';
import { REUNION_COUPLE_ID } from '@/constants/reunion';
// NOTE: WatchTogether is intentionally NOT imported here yet — it pulls in the
// native react-native-webview module which only exists in build #19 (v1.0.1).
// Importing it would crash build #18 over OTA. Re-wire when cutting build #19.

// v2: the original CTA's button was a no-op that dismissed itself; users who
// tapped it set the old key and never saw it again. Bump the key so the fixed
// CTA (now opens the how-to sheet) reappears once.
const WIDGET_CTA_KEY = 'lk.widgetCtaDismissed.v2';

export default function HomeScreen() {
  const { dayCount, couple, isPremium } = useCouple();
  const { user, profile } = useAuth();
  const { milestones } = useMilestones();
  const { isOnline } = useNetworkStatus();
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [peakMoment, setPeakMoment] = useState<{ name: MascotAnimationName; message: string; sub?: string } | null>(null);
  const handleReveal = useCallback((name: MascotAnimationName, message: string, sub?: string) => {
    setPeakMoment({ name, message, sub });
  }, []);
  const [widgetCtaVisible, setWidgetCtaVisible] = useState(false);
  const [widgetHelpOpen, setWidgetHelpOpen] = useState(false);
  const { partner, partnerJoined } = usePartner();
  const partnerTime = usePartnerTime();
  const streak = useQuizStreak();
  const badge = useBadgeCelebration(streak.best, !streak.loading);
  const challenge = useChallenges();
  // Keeps pause windows loaded so the streak math holds during a pause — and now
  // also feeds the paused-state card its resume date (§B3).
  const { activePause } = useStreakPause();
  // The bell reflects everything in the Activity feed — letters, coupons,
  // memories and drawings — not just letters+coupons, and it clears when the
  // feed is opened rather than only when each feature screen is visited.
  const activityCount = useUnseenStore((s) => s.activityCount);
  const hasUnread = activityCount > 0;
  const partnerFirst = (partner?.display_name || 'Partner').split(' ')[0];
  const feisty = useBiteFx((s) => s.feisty);

  const myInitial = ((profile?.display_name || user?.email || 'Y').charAt(0) || 'Y').toUpperCase();
  const partnerInitial = ((partner?.display_name || '?').charAt(0) || '?').toUpperCase();
  const coupleNickname = couple?.nickname ?? 'Your relationship';

  const dayFontSize = width < 390 ? 72 : 84;

  // Keep the iOS home-screen widget in sync with live couple data.
  useEffect(() => {
    syncWidget({
      dayCount,
      startDate: couple?.start_date ?? null,
      nickname: couple?.nickname ?? 'Us',
      partnerName: partner?.display_name ?? 'Partner',
      partnerStatusEmoji: (partner as any)?.status_emoji ?? null,
    });
  }, [dayCount, couple?.start_date, couple?.nickname, partner?.display_name, (partner as any)?.status_emoji]);

  // When the daily quiz completes (either partner, via the quiz realtime feed),
  // recount the weekly challenge right away. Home doesn't refocus while the quiz
  // card is answered in-place, so the focus-refresh in useChallenges won't fire.
  const quizChallengeSignal = streak.loading ? null : `${streak.todayDone}|${streak.current}`;
  useEffect(() => {
    if (quizChallengeSignal != null) challenge.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizChallengeSignal]);

  // Widget "Add to Home Screen" CTA — iOS only (the widget is an apple-target),
  // dismiss-once, gone forever.
  useEffect(() => {
    if (process.env.EXPO_OS !== 'ios') return;
    AsyncStorage.getItem(WIDGET_CTA_KEY).then((v) => setWidgetCtaVisible(v !== '1')).catch(() => {});
  }, []);
  function dismissWidgetCta() {
    setWidgetCtaVisible(false);
    AsyncStorage.setItem(WIDGET_CTA_KEY, '1').catch(() => {});
  }

  // ── Contextual data ──────────────────────────────────────────────────────
  const today = new Date();

  // Zone D — "On this day": past milestones sharing today's month & day.
  const memory = [...milestones]
    .filter((m) => {
      const d = parseLocalDate(m.milestone_date);
      return d.getMonth() === today.getMonth() && d.getDate() === today.getDate() && d.getFullYear() < today.getFullYear();
    })
    .sort((a, b) => parseLocalDate(b.milestone_date).getTime() - parseLocalDate(a.milestone_date).getTime())[0];
  const memoryYearsAgo = memory ? today.getFullYear() - parseLocalDate(memory.milestone_date).getFullYear() : 0;
  const memoryColor = memory ? catColor(memory.type) : null;

  // Anniversary maths from couple.start_date.
  const start = couple?.start_date ? parseLocalDate(couple.start_date) : null;
  const isAnniversary = !!start && dayCount > 0 && start.getDate() === today.getDate() && start.getMonth() === today.getMonth();
  const daysUntilAnniversary = (() => {
    if (!start) return null;
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const next = new Date(t.getFullYear(), start.getMonth(), start.getDate());
    if (next.getTime() < t.getTime()) next.setFullYear(t.getFullYear() + 1);
    return Math.round((next.getTime() - t.getTime()) / 86400000);
  })();
  const showAnniversaryCountdown = daysUntilAnniversary != null && daysUntilAnniversary > 0 && daysUntilAnniversary <= 45;

  // Zone F — "Your story": recent past milestones, newest first, max 5.
  const story = [...milestones]
    .filter((m) => !m.is_future)
    .sort((a, b) => parseLocalDate(b.milestone_date).getTime() - parseLocalDate(a.milestone_date).getTime())
    .slice(0, 5);

  // Anniversary pulse on the day number (once, on mount).
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (isAnniversary && !reducedMotion) {
      pulse.value = withSequence(
        withSpring(1.12, theme.spring.bounce),
        withSpring(1, theme.spring.bounce),
      );
    }
  }, [isAnniversary, reducedMotion]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  // §B2 — entrance delays derive from the order of what's actually VISIBLE.
  // They used to be hardcoded (60/120/160/185/200/220/260/300), so a user with
  // three cards waited as long as one with eight, and got dead air where the
  // hidden cards would have been. JSX children evaluate in source order and
  // `&&` short-circuits, so a skipped section never takes a slot.
  let entranceStep = 0;
  const nextDelay = () => 60 + Math.min(entranceStep++, 8) * 45;

  // Region contents — computed up front so each region can decide whether it
  // has anything to say before it prints a heading.
  const showStreak = partnerJoined && !streak.loading;
  const showChallenge = partnerJoined && !challenge.loading && !!challenge.def;
  const hasStory = !!(memory && memoryColor) || showAnniversaryCountdown || story.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* ── Header: avatars + presence (left) · bell (right) ─────────────── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.layout.screenX, paddingTop: 16, paddingBottom: 8 }}>
          <ScalePressable scaleTo={0.98} onPress={() => router.push('/profile/about')} containerStyle={{ flex: 1, minWidth: 0 }} style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }} accessibilityLabel="About us">
            <View style={{ flexDirection: 'row' }}>
              <View style={{ marginRight: -12, zIndex: 2 }}>
                <Avatar initial={myInitial} imageUrl={profile?.avatar_url} color={LK.coral} size={38} style={{ borderWidth: 2.5, borderColor: LK.parchment }} />
                <StatusBubble />
              </View>
              <View>
                <Avatar initial={partnerInitial} imageUrl={partner?.avatar_url ?? undefined} color={LK.sky} size={38} style={{ borderWidth: 2.5, borderColor: LK.parchment }} />
                <BiteAvatarFx size={38} />
              </View>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 17, color: LK.espresso, lineHeight: 20 }}>
                  {coupleNickname}
                </Text>
                {isPremium && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: tint(LK.marigold, 0.7), borderRadius: 9999, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Icon name="crown" size={11} color={shade(LK.marigold, 0.55)} />
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 9.5, letterSpacing: 0.4, color: shade(LK.marigold, 0.55) }}>PREMIUM</Text>
                  </View>
                )}
              </View>
              {/* Presence line */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: feisty ? LK.blush : partnerJoined ? LK.success : LK.warning }} />
                <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: feisty ? shade(LK.blush, 0.5) : LK.ink70, fontWeight: feisty ? '800' : '600' }}>
                  {feisty
                    ? "Nom nom… someone's feeling feisty 🦈"
                    : !partnerJoined ? 'Partner not joined yet' : isOnline ? 'Connected' : 'Offline'}
                </Text>
              </View>
              {/* Partner local-time line (long-distance touch) */}
              {partnerJoined && partnerTime && partnerTime.diffHours !== 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <Text style={{ fontSize: 11 }}>{partnerTime.emoji}</Text>
                  <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70 }}>
                    {partnerTime.time} for {partnerFirst}
                    <Text style={{ color: shade(LK.sky, 0.45), fontWeight: '700' }}>  ·  {partnerTime.diffLabel}</Text>
                  </Text>
                </View>
              )}
            </View>
          </ScalePressable>
          {/* Right: bell → activity feed (recent letters + upcoming dates). Coral dot when unread. */}
          <View style={{ flexShrink: 0 }}>
            <RoundIcon onPress={() => router.push('/notifications')}>
              <Icon name="bell" size={22} color={LK.espresso} strokeWidth={1.7} />
            </RoundIcon>
            {hasUnread && (
              <View style={{ position: 'absolute', top: 4, right: 4, width: 9, height: 9, borderRadius: 4.5, backgroundColor: LK.coral, borderWidth: 1.5, borderColor: LK.parchment }} />
            )}
          </View>
        </View>

        {/* ── Zone A: Hero counter card ────────────────────────────────────── */}
        <FadeSlideIn delay={60} fromY={10}>
          <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 6 }}>
            <ScalePressable scaleTo={0.985} onPress={() => router.push('/(tabs)/timeline')} accessibilityLabel="Open timeline">
              <View style={{ backgroundColor: LK.vellum, borderRadius: theme.radii.lg, borderCurve: 'continuous', paddingTop: 18, paddingBottom: widgetCtaVisible ? 0 : 22, alignItems: 'center', overflow: 'hidden', ...theme.shadow.card }}>
                {/* §13.13 Zone A: decorative ink layer — the scrapbook page under the counter */}
                <DoodleBackground group="general" density="medium" />
                <MascotAnimation name={isAnniversary ? 'anniversary' : 'lo-kit-idle'} size={104} />
                <Animated.View style={pulseStyle}>
                  <CountUp
                    value={dayCount}
                    style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: dayFontSize, lineHeight: dayFontSize * 1.06, letterSpacing: -3, color: LK.espresso, includeFontPadding: false, textAlign: 'center', fontVariant: ['tabular-nums'] }}
                  />
                </Animated.View>
                <Text style={{ fontFamily: theme.fonts.handMedium, fontSize: 17, color: LK.sepia, marginTop: 2 }}>
                  days together
                </Text>
                {start && (
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '500', fontSize: 12, color: LK.faded, marginTop: 4 }}>
                    since {start.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Text>
                )}
                {widgetCtaVisible && (
                  <>
                    <View style={{ height: 1, alignSelf: 'stretch', backgroundColor: LK.hairline, marginTop: 18, marginHorizontal: 18 }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'center', marginVertical: 14, paddingLeft: 14, paddingRight: 6, paddingVertical: 4, borderRadius: 9999, backgroundColor: LK.ivory, borderWidth: 1.5, borderColor: rgba(LK.gold, 0.5) }}>
                      <Pressable
                        onPress={(e) => { e.stopPropagation?.(); setWidgetHelpOpen(true); }}
                        accessibilityRole="button"
                        accessibilityLabel="How to add the Locket widget to your home screen"
                        hitSlop={8}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 6 }}
                      >
                        <Icon name="house" size={14} color={LK.gold} strokeWidth={2} />
                        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 12, color: LK.gold }}>Add to Home Screen</Text>
                      </Pressable>
                      <Pressable
                        onPress={(e) => { e.stopPropagation?.(); dismissWidgetCta(); }}
                        accessibilityRole="button"
                        accessibilityLabel="Dismiss"
                        hitSlop={10}
                        style={{ padding: 6 }}
                      >
                        <Icon name="x" size={13} color={rgba(LK.gold, 0.6)} strokeWidth={2} />
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            </ScalePressable>
          </View>
        </FadeSlideIn>

        {/* ── TEMPORARY: reunion countdown (17 Jul 2026) ───────────────────── */}
        {couple?.id === REUNION_COUPLE_ID && <ReunionCountdown partnerFirstName={partnerFirst} />}

        {/* Invite-partner banner (only when no partner) */}
        {!partnerJoined && (
          <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 12 }}>
            <ScalePressable
              onPress={() => shareInvite()}
              scaleTo={0.98}
              accessibilityLabel="Invite your person to Locket"
              style={{ backgroundColor: tint(LK.sky, 0.7), borderRadius: theme.radii.lg, borderCurve: 'continuous', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13, ...theme.shadow.sm }}
            >
              <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: LK.sky, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="heart" size={22} color={shade(LK.sky, 0.5)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 16.5, color: LK.espresso }}>Invite your person to Locket</Text>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, marginTop: 2 }}>Locket is better for two — send them a link.</Text>
              </View>
              <Icon name="share" size={16} color={shade(LK.sky, 0.5)} />
            </ScalePressable>
          </View>
        )}

        {/* ── Coupon activity: redeem requests (approve) + recent redemptions ── */}
        {partnerJoined && <CouponActivityBanners partnerName={partnerFirst} />}

        {/* ══ REGION: TODAY ════════════════════════════════════════════════
            The day's actions, strung on one connector spine so they read as a
            single unit instead of three more cards in the stack (§B1). Coral is
            this region's accent; Your story below owns Marigold. */}
        <SectionEyebrow label="Today" color={shade(LK.coral, 0.3)} paddingTop={22} />
        <TodaySpine>
          <FadeSlideIn delay={nextDelay()}>
            <DailyQuizCard bare hideStreak onReveal={handleReveal} />
          </FadeSlideIn>

          {showChallenge && challenge.def && (
            <FadeSlideIn delay={nextDelay()}>
              <ChallengeCard
                title={challenge.def.title}
                icon={challenge.def.icon}
                accent={challenge.def.accent}
                progress={challenge.progress}
                target={challenge.def.target}
                daysLeft={challenge.daysLeft}
                isComplete={challenge.isComplete}
              />
            </FadeSlideIn>
          )}

          {/* Renders whenever the couple is connected — paused or running. The
              old comment here claimed "forgiven state only", which never matched
              the condition (§B4). */}
          {showStreak && (
            <FadeSlideIn delay={nextDelay()}>
              <StreakRow
                current={streak.current}
                best={streak.best}
                pausedActive={!!streak.pausedActive}
                pauseEndDate={activePause?.end_date}
              />
            </FadeSlideIn>
          )}
        </TodaySpine>

        {/* ══ REGION: YOUR STORY ═══════════════════════════════════════════
            What you've already built together. Only prints its heading when
            there's something under it. */}
        {hasStory && (
          <SectionEyebrow
            label="Your story"
            color={shade(LK.marigold, 0.4)}
            trailing={
              <ScalePressable
                onPress={() => router.push('/(tabs)/timeline')}
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                accessibilityLabel="See all of your story"
                style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
              >
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: shade(LK.marigold, 0.5) }}>See all</Text>
                <Icon name="chevR" size={13} color={shade(LK.marigold, 0.5)} />
              </ScalePressable>
            }
          />
        )}

        {/* On this day (contextual) */}
        {memory && memoryColor && (
          <FadeSlideIn delay={nextDelay()}>
            <View style={{ paddingHorizontal: theme.layout.screenX }}>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 19, color: LK.espresso, marginBottom: 10, paddingHorizontal: 2 }}>
                On this day
              </Text>
              {/* SOURCE for the card → milestone-detail morph (§10.13). Same
                  group/id as the timeline + story-strip triggers; pairs are keyed
                  per source screen so the duplicate id is unambiguous. */}
              <Transition.Boundary.Trigger
                group="milestone"
                id={memory.id}
                onPress={() => router.push(`/milestone/${memory.id}`)}
                accessibilityLabel={memory.title}
                style={{ borderRadius: theme.radii.lg, borderCurve: 'continuous', overflow: 'hidden', height: 248, ...theme.shadow.card }}
              >
                <View style={{ flex: 1, backgroundColor: tint(memoryColor.base, 0.35) }}>
                  <LinearGradient
                    colors={['transparent', 'rgba(20,15,10,0.35)', 'rgba(20,15,10,0.78)']}
                    locations={[0, 0.55, 1]}
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 150 }}
                  />
                  <View style={{ position: 'absolute', top: '50%', left: 0, right: 0, alignItems: 'center', marginTop: -26 }}>
                    <IconChip color={memoryColor.base} size={64}>
                      <Icon name={TYPE_ICON[memory.type] ?? 'star'} size={30} color={memoryColor.deep} />
                    </IconChip>
                  </View>
                  <View style={{ position: 'absolute', top: 14, left: 14, backgroundColor: rgba('#ffffff', 0.9), borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Icon name="sparkle" size={14} color={LK.warning} />
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 11.5, color: LK.espresso }}>
                      {memoryYearsAgo} year{memoryYearsAgo === 1 ? '' : 's'} ago today
                    </Text>
                  </View>
                  <View style={{ position: 'absolute', left: 20, bottom: 18, right: 20 }}>
                    <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 30, lineHeight: 34, color: '#fff' }}>{memory.title}</Text>
                    <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, color: 'rgba(255,255,255,0.92)', marginTop: 3 }}>
                      {parseLocalDate(memory.milestone_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                  </View>
                </View>
              </Transition.Boundary.Trigger>
            </View>
          </FadeSlideIn>
        )}

        {/* ── Zone E: Anniversary countdown (contextual, ≤45 days) ─────────── */}
        {showAnniversaryCountdown && (
          <FadeSlideIn delay={nextDelay()}>
            <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 14 }}>
              <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.md, borderCurve: 'continuous', overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14, paddingRight: 16, ...theme.shadow.sm }}>
                <View style={{ width: 4, alignSelf: 'stretch', backgroundColor: LK.marigold }} />
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: tint(LK.marigold, 0.7), alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                  <Icon name="cake" size={24} color={shade(LK.marigold, 0.55)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: LK.faded }}>Coming up</Text>
                  <Text style={{ fontFamily: theme.fonts.heading, fontSize: 19, fontWeight: '700', color: LK.espresso, lineHeight: 23 }}>
                    {daysUntilAnniversary} {daysUntilAnniversary === 1 ? 'day' : 'days'} until your anniversary
                  </Text>
                </View>
              </View>
            </View>
          </FadeSlideIn>
        )}

        {/* ── Zone F: Your story (milestone strip) ─────────────────────────── */}
        {/* Milestone strip. The region eyebrow above carries its label and
            "See all", so this no longer prints a duplicate header. */}
        {story.length > 0 && (
          <FadeSlideIn delay={nextDelay()}>
            <View style={{ paddingTop: 14 }}>
              <FlatList
                data={story}
                keyExtractor={(m) => m.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                renderItem={({ item }) => {
                  const c = catColor(item.type);
                  return (
                    // SOURCE for the card → milestone-detail morph (§10.13) —
                    // shares group="milestone" with the timeline + On-this-day triggers.
                    <Transition.Boundary.Trigger
                      group="milestone"
                      id={item.id}
                      onPress={() => router.push(`/milestone/${item.id}`)}
                      accessibilityLabel={item.title}
                      style={{ width: 160, height: 180 }}
                    >
                      <View style={{ flex: 1, backgroundColor: LK.ivory, borderRadius: theme.radii.md, borderCurve: 'continuous', overflow: 'hidden', ...theme.shadow.sm }}>
                        <View style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}>
                          <IconChip color={c.base} size={44}>
                            <Icon name={TYPE_ICON[item.type] ?? 'heart'} size={21} color={c.deep} />
                          </IconChip>
                          <View>
                            <Text numberOfLines={2} style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 16, color: LK.espresso, lineHeight: 19 }}>{item.title}</Text>
                            <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70, marginTop: 3 }}>
                              {parseLocalDate(item.milestone_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </Text>
                          </View>
                        </View>
                        <View style={{ height: 4, backgroundColor: c.base }} />
                      </View>
                    </Transition.Boundary.Trigger>
                  );
                }}
              />
            </View>
          </FadeSlideIn>
        )}

        {/* ── Zone G: Premium nudge (free users only) ──────────────────────── */}
        {/* Premium nudge (free users only). Deliberately OUTSIDE both regions:
            it is a persistent footer CTA, and filing it under "Your story" would
            mean a couple with no milestones yet got a heading whose only content
            was an advert. */}
        {!isPremium && (
          <FadeSlideIn delay={nextDelay()}>
            <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 24 }}>
              <ScalePressable
                onPress={() => setPaywallOpen(true)}
                scaleTo={0.98}
                accessibilityLabel="Unlock Locket Premium"
                style={{
                  backgroundColor: tint(LK.marigold, 0.82), borderRadius: theme.radii.lg, borderCurve: 'continuous',
                  borderWidth: 1.5, borderColor: rgba(LK.marigold, 0.55), padding: 16,
                  flexDirection: 'row', alignItems: 'center', gap: 13, ...theme.shadow.sm,
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: LK.marigold, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="crown" size={22} color={shade(LK.marigold, 0.55)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 16.5, color: LK.espresso }}>Keep your whole story</Text>
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, marginTop: 2, lineHeight: 18 }}>
                    Unlock unlimited history, sealed letters & rich notes.
                  </Text>
                </View>
                <Icon name="chevR" size={20} color={shade(LK.marigold, 0.5)} />
              </ScalePressable>
            </View>
          </FadeSlideIn>
        )}
      </ScrollView>

      {paywallOpen && <PaywallModal onClose={() => setPaywallOpen(false)} />}
      <SendMomentOverlay
        visible={!!peakMoment}
        name={peakMoment?.name ?? 'quiz-correct'}
        message={peakMoment?.message ?? ''}
        subMessage={peakMoment?.sub}
        onDismiss={() => setPeakMoment(null)}
      />
      {/* Defer the badge celebration until any quiz-reveal moment has cleared,
          so the two full-screen overlays never stack. */}
      <BadgeUnlockOverlay badge={peakMoment ? null : badge.celebrating} onDismiss={badge.dismiss} />
      <WidgetHelpModal visible={widgetHelpOpen} onClose={() => setWidgetHelpOpen(false)} />
    </SafeAreaView>
  );
}
