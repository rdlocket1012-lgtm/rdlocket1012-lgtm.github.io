import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, FlatList, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import Animated, { FadeInUp, ReduceMotion } from 'react-native-reanimated';
import Transition from 'react-native-screen-transitions';
import { useUnseenStore } from '@/stores/unseen.store';
import { LK, shade, catColor, theme, rgba } from '@/constants/theme';
import { useMilestones } from '@/hooks/useMilestones';
import { useCouple } from '@/hooks/useCouple';
import { FREE_LIMITS } from '@/constants/free-limits';
import { MILESTONE_ILLUS, MILESTONE_FILTERS, typeGroup, type MilestoneFilterId } from '@/constants/milestone-types';
import { RoundIcon } from '@/components/ui/round-icon';
import { IconChip } from '@/components/ui/icon-chip';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { Icon } from '@/components/ui/Icon';
import { AddMilestoneModal } from '@/components/milestone/AddMilestoneModal';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import { SendMomentOverlay } from '@/components/ui/send-moment-overlay';
import type { Milestone } from '@/stores/milestones.store';
import { parseLocalDate } from '@/utils/date';

const BORDER = 'rgba(42,33,26,0.15)';

export default function TimelineScreen() {
  const { milestones } = useMilestones();
  const { isPremium } = useCouple();
  const [filter, setFilter] = useState<MilestoneFilterId>('all');
  const [sheet, setSheet] = useState<'add' | 'paywall' | null>(null);
  const [momentPeak, setMomentPeak] = useState(false);

  const atCap = !isPremium && milestones.length >= FREE_LIMITS.MILESTONES;
  const nearCap = !isPremium && milestones.length >= 25;

  // Clear the milestones badge whenever the timeline is viewed.
  useFocusEffect(useCallback(() => { useUnseenStore.getState().markSeen('milestones'); }, []));

  function handleAdd() {
    if (atCap) { setSheet('paywall'); return; }
    setSheet('add');
  }

  const filtered = useMemo(
    () => (filter === 'all' ? milestones : milestones.filter((m) => typeGroup(m.type) === filter)),
    [milestones, filter],
  );

  // First-5-only stagger (§10.3): map id → render order.
  const orderIndex = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((m, i) => map.set(m.id, i));
    return map;
  }, [filtered]);

  const sections = useMemo(() => {
    const byYear = new Map<number, Milestone[]>();
    for (const m of filtered) {
      const y = parseLocalDate(m.milestone_date).getFullYear();
      const arr = byYear.get(y);
      if (arr) arr.push(m); else byYear.set(y, [m]);
    }
    return [...byYear.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([year, data]) => ({ title: String(year), data }));
  }, [filtered]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      {/* Header (56pt) */}
      <View style={{ height: 56, paddingHorizontal: theme.layout.screenX, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 20, color: LK.espresso, letterSpacing: -0.5 }}>Timeline</Text>
        <View>
          <RoundIcon onPress={handleAdd}><Icon name="plus" size={22} color={LK.espresso} /></RoundIcon>
          {atCap && (
            <View style={{ position: 'absolute', top: -1, right: -1, width: 18, height: 18, borderRadius: 9, backgroundColor: LK.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: LK.parchment }}>
              <Icon name="lock" size={9} color="#fff" strokeWidth={2.5} />
            </View>
          )}
        </View>
      </View>

      {/* Category filter chips (sticky below header) */}
      <FlatList
        data={MILESTONE_FILTERS as readonly { id: MilestoneFilterId; label: string }[]}
        keyExtractor={(c) => c.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: theme.layout.screenX, gap: 8, paddingVertical: 8 }}
        style={{ flexGrow: 0 }}
        renderItem={({ item }) => {
          const active = filter === item.id;
          return (
            <ScalePressable
              scaleTo={0.96}
              onPress={() => setFilter(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                paddingHorizontal: 16,
                height: 36,
                borderRadius: 99,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? LK.coral : LK.ivory,
                borderWidth: active ? 0 : 1.5,
                borderColor: BORDER,
                ...(active ? theme.shadow.sm : null),
              }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: active ? '700' : '500', fontSize: 13, color: active ? LK.vellum : LK.espresso }}>
                {item.label}
              </Text>
            </ScalePressable>
          );
        }}
      />

      <SectionList
        sections={sections}
        keyExtractor={(m) => m.id}
        stickySectionHeadersEnabled
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 80, flexGrow: 1 }}
        ListHeaderComponent={nearCap ? (
          <Pressable
            onPress={() => setSheet('paywall')}
            style={{ marginHorizontal: theme.layout.screenX, marginBottom: 8, backgroundColor: LK.ivory, borderRadius: theme.radii.sm, borderCurve: 'continuous', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, ...theme.shadow.sm }}
          >
            <Icon name="lock" size={15} color={LK.gold} strokeWidth={2} />
            <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '500', fontSize: 12, color: LK.sepia }}>
              {milestones.length} of {FREE_LIMITS.MILESTONES} milestones used
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: LK.gold }}>Go unlimited →</Text>
          </Pressable>
        ) : null}
        renderSectionHeader={({ section }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: theme.layout.screenX, paddingTop: 8, paddingBottom: 6, backgroundColor: LK.parchment }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 30, color: LK.espresso, letterSpacing: -1 }}>{section.title}</Text>
            <View style={{ backgroundColor: LK.ivory, borderWidth: 1.5, borderColor: LK.hairline, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 9999 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: LK.sepia }}>
                {section.data.length} {section.data.length === 1 ? 'milestone' : 'milestones'}
              </Text>
            </View>
            <View style={{ flex: 1, height: 1.5, backgroundColor: LK.hairline, borderRadius: 2 }} />
          </View>
        )}
        renderItem={({ item }) => (
          <MilestoneCard milestone={item} animIndex={orderIndex.get(item.id) ?? 99} />
        )}
        ListEmptyComponent={
          milestones.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 64, paddingHorizontal: 30, gap: 14 }}>
              <IconChip color={LK.coral} size={72}><Icon name="heart" size={34} color={shade(LK.coral, 0.5)} /></IconChip>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 26, color: LK.espresso, textAlign: 'center' }}>Your story starts here</Text>
              <Text style={{ fontFamily: theme.fonts.handMedium, fontSize: 17, color: LK.sepia, textAlign: 'center', lineHeight: 24, maxWidth: 260 }}>
                Add your first milestone — the moment your story began.
              </Text>
              <ScalePressable scaleTo={0.97} onPress={handleAdd} style={{ backgroundColor: LK.coral, borderRadius: 9999, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8 }}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>Add your first memory</Text>
              </ScalePressable>
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingTop: 56, paddingHorizontal: 30, gap: 8 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: LK.sepia, textAlign: 'center' }}>
                No milestones in this filter yet.
              </Text>
            </View>
          )
        }
      />

      {sheet === 'add' && <AddMilestoneModal onClose={() => setSheet(null)} isPremium={isPremium} onPaywall={() => setSheet('paywall')} onSaved={() => setMomentPeak(true)} />}
      <SendMomentOverlay
        visible={momentPeak}
        name="moment-send"
        message="Added to your story ✨"
        onDismiss={() => setMomentPeak(false)}
      />
      {sheet === 'paywall' && <PaywallModal onClose={() => setSheet(null)} />}
    </SafeAreaView>
  );
}

function MilestoneCard({ milestone: m, animIndex }: { milestone: Milestone; animIndex: number }) {
  const c = catColor(m.type);
  const photos = m.photos ?? [];
  const entering = animIndex < 5 ? FadeInUp.duration(320).delay(animIndex * 40).reduceMotion(ReduceMotion.System) : undefined;

  return (
    <Animated.View entering={entering} style={{ paddingHorizontal: theme.layout.screenX, paddingBottom: 12 }}>
      {/* SOURCE for the card → milestone-detail morph (§10.13). Boundary.Trigger
          is the Pressable; group="milestone" + id pairs it with the matching
          Boundary.View on app/milestone/[id].tsx (sharedBoundTag 'milestone',
          set in app/_layout.tsx). Mirrors the proven letters/draw morphs. The
          nested photo-strip ScalePressables keep their own taps (photo viewer). */}
      <Transition.Boundary.Trigger
        group="milestone"
        id={m.id}
        onPress={() => router.push(`/milestone/${m.id}`)}
        accessibilityLabel={m.title}
      >
        <View style={{ flexDirection: 'row', backgroundColor: LK.ivory, borderRadius: theme.radii.md, borderCurve: 'continuous', borderWidth: 1.5, borderColor: BORDER, overflow: 'hidden', ...theme.shadow.sm }}>
          {/* 4px category accent bar */}
          <View style={{ width: 4, backgroundColor: c.base }} />
          <View style={{ flex: 1, padding: 16 }}>
            {/* Category sticker (top-right) — kawaii object-mascot per §13.14 */}
            <Image
              source={MILESTONE_ILLUS[m.type] ?? MILESTONE_ILLUS.custom}
              contentFit="contain"
              accessible={false}
              style={{ position: 'absolute', top: 12, right: 12, width: 48, height: 48, transform: [{ rotate: '4deg' }] }}
            />
            <Text numberOfLines={2} style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: LK.espresso, lineHeight: 23, paddingRight: 52 }}>
              {m.title}
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '500', fontSize: 12, color: LK.sepia, marginTop: 4 }}>
              {parseLocalDate(m.milestone_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
            {m.note ? (
              <Text numberOfLines={2} style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.sepia, marginTop: 6, lineHeight: 20, paddingRight: 8 }}>
                {m.note}
              </Text>
            ) : null}
            {photos.length > 0 && <PhotoStrip photos={photos} />}
          </View>
        </View>
      </Transition.Boundary.Trigger>
    </Animated.View>
  );
}

function PhotoStrip({ photos }: { photos: string[] }) {
  const visible = photos.slice(0, 4);
  const overflow = photos.length - visible.length;

  function open(index: number) {
    router.push({ pathname: '/milestone/photo-viewer', params: { photos: JSON.stringify(photos), index: String(index) } });
  }

  return (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 2 }}>
      {visible.map((uri, i) => {
        const isLastVisible = i === visible.length - 1 && overflow > 0;
        return (
          <ScalePressable key={`${i}-${uri}`} scaleTo={0.96} onPress={() => open(i)}>
            <View style={{ width: 56, height: 56, borderRadius: 10, borderCurve: 'continuous', overflow: 'hidden', backgroundColor: rgba(LK.espresso, 0.05) }}>
              <Image source={{ uri }} style={{ width: 56, height: 56 }} contentFit="cover" transition={150} />
              {isLastVisible && (
                <View style={{ position: 'absolute', inset: 0, backgroundColor: rgba(LK.espresso, 0.45), alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: '#fff' }}>+{overflow}</Text>
                </View>
              )}
            </View>
          </ScalePressable>
        );
      })}
    </View>
  );
}
