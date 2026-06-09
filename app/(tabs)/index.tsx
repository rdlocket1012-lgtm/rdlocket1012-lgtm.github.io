import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Modal, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LK, tint, shade, rgba, theme, catColor } from '@/constants/theme';
import { useCouple } from '@/hooks/useCouple';
import { useAuth } from '@/hooks/useAuth';
import { useMilestones } from '@/hooks/useMilestones';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Avatar, RoundIcon, IconChip, Sticker } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';
import { TYPE_ICON } from '@/constants/milestone-types';
import { DailyQuizCard } from '@/components/quiz/DailyQuizCard';
import { FadeSlideIn } from '@/components/ui/FadeSlideIn';
import { usePressScale } from '@/hooks/usePressScale';
import { StatusBubble } from '@/components/home/StatusBubble';
import { NudgesLayer } from '@/components/nudges/NudgesLayer';
import { usePartner } from '@/hooks/usePartner';
import { shareInvite } from '@/lib/invite';
import { AddMilestoneModal } from '@/components/milestone/AddMilestoneModal';
import { ComposeLetterModal } from '@/components/letter/ComposeLetterModal';
import { AddPinModal } from '@/components/map/AddPinModal';
import { PaywallModal } from '@/components/paywall/PaywallModal';

export default function HomeScreen() {
  const { dayCount, couple, isPremium } = useCouple();
  const { user, profile } = useAuth();
  const { milestones } = useMilestones();
  const { isOnline } = useNetworkStatus();
  const [sheet, setSheet] = useState<'addMilestone' | 'compose' | 'addPin' | 'paywall' | null>(null);
  const [nudgeOpen, setNudgeOpen] = useState(false);
  const { partner, partnerJoined } = usePartner();

  const upcoming = milestones.find((m) => m.is_future);
  const myInitial = ((profile?.display_name || user?.email || 'Y').charAt(0) || 'Y').toUpperCase();
  const partnerInitial = ((partner?.display_name || '?').charAt(0) || '?').toUpperCase();

  // "On this day" — past milestones that share today's month & day
  const today = new Date();
  const onThisDay = milestones
    .filter((m) => {
      const d = new Date(m.milestone_date);
      return d.getMonth() === today.getMonth() && d.getDate() === today.getDate() && d.getFullYear() < today.getFullYear();
    })
    .sort((a, b) => new Date(b.milestone_date).getTime() - new Date(a.milestone_date).getTime());
  const memory = onThisDay[0];
  const memoryYearsAgo = memory ? today.getFullYear() - new Date(memory.milestone_date).getFullYear() : 0;
  const memoryColor = memory ? catColor(memory.type) : null;

  // Recent activity — past milestones only, most recently occurred first.
  // Exclude the "upcoming" milestone so it doesn't appear twice (it already has its own card).
  const recentActivity = [...milestones]
    .filter((m) => !m.is_future && m.id !== upcoming?.id)
    .sort((a, b) => new Date(b.milestone_date).getTime() - new Date(a.milestone_date).getTime())
    .slice(0, 3)
    .map((m) => ({
      id: m.id,
      icon: TYPE_ICON[m.type] ?? 'heart',
      color: catColor(m.type).base,
      text: m.title,
      time: new Date(m.milestone_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      onPress: () => router.push(`/milestone/${m.id}`),
    }));
  const coupleNickname = couple?.nickname ?? 'Your relationship';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.layout.screenX, paddingTop: 16, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setNudgeOpen(true)} style={{ flexDirection: 'row' }} accessibilityLabel="Send a love nudge">
              <View style={{ marginRight: -12, zIndex: 2 }}>
                <Avatar initial={myInitial} imageUrl={profile?.avatar_url} color={LK.coral} size={38} style={{ borderWidth: 2.5, borderColor: LK.cream }} />
                <StatusBubble />
              </View>
              <Avatar initial={partnerInitial} imageUrl={partner?.avatar_url ?? undefined} color={LK.sky} size={38} style={{ borderWidth: 2.5, borderColor: LK.cream }} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 15, color: LK.ink, lineHeight: 18 }}>
                {coupleNickname}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: partnerJoined ? LK.mint : LK.amber }} />
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70, fontWeight: '600' }}>
                  {!partnerJoined ? 'Partner not joined yet' : isOnline ? 'Connected' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setNudgeOpen(true)}
              accessibilityLabel="Send a love nudge"
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: tint(LK.pink, 0.65), alignItems: 'center', justifyContent: 'center', ...theme.shadow.sm }}
            >
              <Icon name="sparkle" size={20} color={shade(LK.pink, 0.5)} />
            </TouchableOpacity>
            <RoundIcon onPress={() => router.push('/settings')}>
              <Icon name="gear" size={22} color={LK.ink} strokeWidth={1.5} />
            </RoundIcon>
          </View>
        </View>

        {/* Day counter — springs in on mount */}
        <FadeSlideIn delay={60} fromY={10}>
          <View style={{ alignItems: 'center', paddingHorizontal: theme.layout.screenX, paddingVertical: 14 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', color: LK.ink70 }}>Day</Text>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 84, lineHeight: 96, letterSpacing: -3, color: LK.ink, marginVertical: 2, includeFontPadding: false }}>
              {dayCount.toLocaleString()}
            </Text>
            <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 24, color: shade(LK.gold, 0.45) }}>
              together
            </Text>
          </View>
        </FadeSlideIn>

        {/* Invite partner banner */}
        {!partnerJoined && (
          <View style={{ paddingHorizontal: theme.layout.screenX, paddingBottom: 4 }}>
            <TouchableOpacity
              onPress={() => shareInvite()}
              activeOpacity={0.9}
              style={{ backgroundColor: tint(LK.sky, 0.7), borderRadius: theme.radii.lg, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13, ...theme.shadow.sm }}
            >
              <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: LK.sky, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="heart" size={22} color={shade(LK.sky, 0.5)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 16.5, color: LK.ink }}>Invite your partner</Text>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, marginTop: 2 }}>Locket is better for two — send them a link.</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="share" size={16} color={shade(LK.sky, 0.5)} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* On This Day hero */}
        <FadeSlideIn delay={120}>
        <View style={{ paddingHorizontal: theme.layout.screenX }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 4 }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 19, color: LK.ink }}>On this day</Text>
            {memory && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/timeline')} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13.5, color: shade(LK.gold, 0.5) }}>See all</Text>
                <Icon name="chevR" size={14} color={shade(LK.gold, 0.5)} />
              </TouchableOpacity>
            )}
          </View>
          {memory && memoryColor ? (
            <TouchableOpacity
              onPress={() => router.push(`/milestone/${memory.id}`)}
              style={{ borderRadius: theme.radii.lg, overflow: 'hidden', height: 248, ...theme.shadow.card }}
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
                <View style={{
                  position: 'absolute', top: 14, left: 14,
                  backgroundColor: rgba('#ffffff', 0.9), borderRadius: 9999,
                  paddingHorizontal: 12, paddingVertical: 6,
                  flexDirection: 'row', alignItems: 'center', gap: 5,
                }}>
                  <Icon name="sparkle" size={14} color={LK.amber} />
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 11.5, color: LK.ink }}>
                    {memoryYearsAgo} year{memoryYearsAgo === 1 ? '' : 's'} ago today
                  </Text>
                </View>
                <View style={{ position: 'absolute', left: 20, bottom: 18, right: 20 }}>
                  <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 30, lineHeight: 34, color: '#fff' }}>{memory.title}</Text>
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, color: 'rgba(255,255,255,0.92)', marginTop: 3 }}>
                    {new Date(memory.milestone_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={{ borderRadius: theme.radii.lg, height: 180, backgroundColor: LK.ivory, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 30, ...theme.shadow.sm }}>
              <IconChip color={LK.sky} size={48}><Icon name="sparkle" size={22} color={shade(LK.sky, 0.5)} /></IconChip>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: LK.ink, textAlign: 'center' }}>No memories on this day yet</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, textAlign: 'center', lineHeight: 18 }}>
                As your timeline grows, moments from this date in past years will appear here.
              </Text>
            </View>
          )}
        </View>
        </FadeSlideIn>

        {/* Daily quiz */}
        <FadeSlideIn delay={180}>
          <DailyQuizCard />
        </FadeSlideIn>

        {/* Capture a moment card */}
        <FadeSlideIn delay={240}>
        <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 16 }}>
          <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.lg, padding: 18, ...theme.shadow.card }}>
            {/* Header — same pattern as DailyQuizCard */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 18, color: LK.ink }}>
                Capture a moment ✨
              </Text>
            </View>
            <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 15, color: LK.ink70, lineHeight: 22, marginBottom: 14 }}>
              What's worth keeping from today?
            </Text>
            {/* Action tiles */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { color: LK.coral, icon: 'heart', label: 'Milestone', sheet: 'addMilestone' as const },
                { color: LK.pink, icon: 'feather', label: 'Letter', sheet: 'compose' as const },
                { color: LK.lilac, icon: 'mapPin', label: 'Map Pin', sheet: 'addPin' as const },
              ].map((qa) => (
                <CaptureTile key={qa.sheet} {...qa} onPress={() => setSheet(qa.sheet)} />
              ))}
            </View>
          </View>
        </View>
        </FadeSlideIn>

        {/* Upcoming milestone chip */}
        {upcoming && (
          <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 12 }}>
            <Sticker color={LK.gold} onPress={() => router.push(`/milestone/${upcoming.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15 }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: LK.gold, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={TYPE_ICON[upcoming.type] ?? 'sparkle'} size={22} color={shade(LK.gold, 0.55)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: shade(LK.gold, 0.5) }}>Coming up</Text>
                <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 19, color: LK.ink, lineHeight: 22 }}>{upcoming.title}</Text>
              </View>
              <Icon name="chevR" size={20} color={shade(LK.gold, 0.5)} />
            </Sticker>
          </View>
        )}

        {/* Recent activity — fully readable on free */}
        <FadeSlideIn delay={300}>
        <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 24 }}>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 19, color: LK.ink, marginBottom: 12 }}>Recent activity</Text>

          {recentActivity.length === 0 ? (
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, color: LK.ink70, lineHeight: 21 }}>
              Your shared moments will appear here as you add them.
            </Text>
          ) : (
            <View style={{ gap: 2 }}>
              {recentActivity.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  onPress={a.onPress}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 10 }}
                >
                  <IconChip color={a.color} size={40}><Icon name={a.icon} size={19} color={shade(a.color, 0.5)} /></IconChip>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 14.5, color: LK.ink, lineHeight: 20 }}>{a.text}</Text>
                    <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: LK.ink70, marginTop: 1 }}>{a.time}</Text>
                  </View>
                  <Icon name="chevR" size={16} color={LK.ink70} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Premium prompt — elegant, non-blocking, at the very bottom */}
          {!isPremium && (
            <TouchableOpacity
              onPress={() => setSheet('paywall')}
              activeOpacity={0.9}
              style={{
                marginTop: 16, backgroundColor: tint(LK.gold, 0.82), borderRadius: theme.radii.lg,
                borderWidth: 1.5, borderColor: rgba(LK.gold, 0.55), padding: 16,
                flexDirection: 'row', alignItems: 'center', gap: 13, ...theme.shadow.sm,
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: LK.gold, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="crown" size={22} color={shade(LK.gold, 0.55)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 16.5, color: LK.ink }}>Keep your whole story</Text>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, marginTop: 2, lineHeight: 18 }}>
                  Unlock unlimited history, sealed letters & rich notes.
                </Text>
              </View>
              <Icon name="chevR" size={20} color={shade(LK.gold, 0.5)} />
            </TouchableOpacity>
          )}
        </View>
        </FadeSlideIn>
      </ScrollView>

      {sheet === 'addMilestone' && <AddMilestoneModal onClose={() => setSheet(null)} isPremium={isPremium} onPaywall={() => setSheet('paywall')} />}
      {sheet === 'compose' && <ComposeLetterModal onClose={() => setSheet(null)} isPremium={isPremium} onPaywall={() => setSheet('paywall')} />}
      {sheet === 'addPin' && <AddPinModal onClose={() => setSheet(null)} />}
      {sheet === 'paywall' && <PaywallModal onClose={() => setSheet(null)} />}

      <NudgesLayer
        open={nudgeOpen}
        onClose={() => setNudgeOpen(false)}
        coupleId={profile?.couple_id ?? null}
        userId={profile?.id ?? null}
      />
    </SafeAreaView>
  );
}

function CaptureTile({ color, icon, label, onPress }: { color: string; icon: string; label: string; onPress: () => void }) {
  const press = usePressScale(0.94);
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      activeOpacity={1}
      style={{ flex: 1 }}
    >
      <Animated.View style={{
        height: 96,
        backgroundColor: tint(color, 0.8),
        borderRadius: theme.radii.sm,
        alignItems: 'center', justifyContent: 'center', gap: 9,
        transform: [{ scale: press.scale }],
      }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={22} color={shade(color, 0.55)} />
        </View>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: shade(color, 0.55) }}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}
