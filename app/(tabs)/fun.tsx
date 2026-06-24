import React from 'react';
import { View, Text, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, ReduceMotion } from 'react-native-reanimated';
import { LK, shade, theme } from '@/constants/theme';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { Icon } from '@/components/ui/Icon';
import { ProgressRing } from '@/components/ui/progress-ring';
import { LIVE_CATEGORIES } from '@/constants/live-games';
import { BUCKET_CATEGORIES } from '@/constants/categories';
import { useBucketList } from '@/hooks/useBucketList';
import { useLiveLaunch } from '@/stores/live.store';

const CARD_BORDER = 'rgba(42,33,26,0.12)';

function lightHaptic() {
  if (process.env.EXPO_OS === 'ios') {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* no-op */ }
  }
}

/**
 * Fun tab — the play hub (§9.6b / §13.16b). Three labeled sections of content
 * blocks: This or That (launches the live game directly — Fun IS the picker),
 * Creative (Draw / Draw & Guess), and Bucket List (per-category progress rings).
 */
export default function FunScreen() {
  const { items } = useBucketList();
  const { width } = useWindowDimensions();
  const requestStart = useLiveLaunch((s) => s.requestStart);

  const cardW = (width - theme.layout.screenX * 2 - 12) / 2;

  // Bucket progress per category + overall.
  const doneTotal = items.filter((i) => i.is_done).length;
  const bucketStat = (catId: string) => {
    const inCat = items.filter((i) => i.category === catId);
    return { done: inCat.filter((i) => i.is_done).length, total: inCat.length };
  };

  function startGame(catId: string) {
    lightHaptic();
    requestStart(catId);     // Home's LiveLayer owns the Realtime channel + runs it
    router.push('/(tabs)');  // hop to Home, where the game launches
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      {/* Header (56pt) */}
      <View style={{ height: 56, paddingHorizontal: theme.layout.screenX, justifyContent: 'center' }}>
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 20, color: LK.espresso, letterSpacing: -0.5 }}>Fun</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* ── Section 1: THIS OR THAT ───────────────────────────────────── */}
        <SectionEyebrow label="This or That" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: theme.layout.screenX, gap: 12 }}>
          {LIVE_CATEGORIES.map((cat, i) => {
            const total = cat.prompts.length || 30;
            const played = 0; // game_sessions table not built yet — rings show 0/N
            return (
              <FunBlock key={cat.id} index={i} width={cardW} onPress={() => startGame(cat.id)} accentBar="top" color={cat.color}>
                <View style={{ position: 'absolute', top: 10, right: 8 }}>
                  <ProgressRing size={36} progress={total ? played / total : 0} color={cat.color}>
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 10, color: played ? LK.espresso : LK.faded }}>
                      {played}/{total}
                    </Text>
                  </ProgressRing>
                </View>
                <Text style={{ fontSize: 32, textAlign: 'center', marginTop: 14 }}>{cat.emoji}</Text>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.espresso, textAlign: 'center', marginTop: 8 }}>{cat.name}</Text>
                <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontWeight: '500', fontSize: 11, color: LK.sepia, textAlign: 'center', marginTop: 4, marginBottom: 12 }}>{cat.blurb}</Text>
              </FunBlock>
            );
          })}
        </View>

        {/* ── Section 2: CREATIVE ───────────────────────────────────────── */}
        <SectionEyebrow label="Creative" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: theme.layout.screenX, gap: 12 }}>
          <CreativeBlock index={6} width={cardW} color={LK.marigold} icon="pen" name="Draw" route="/draw" />
          <CreativeBlock index={7} width={cardW} color={LK.sky} icon="feather" name="Draw & Guess" route="/games/draw-and-guess" />
        </View>

        {/* ── Section 3: BUCKET LIST ────────────────────────────────────── */}
        <SectionEyebrow
          label="Bucket List"
          trailing={
            <ProgressRing size={32} strokeWidth={3} progress={items.length ? doneTotal / items.length : 0} color={LK.sage}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 9, color: LK.sepia }}>
                {doneTotal}/{items.length}
              </Text>
            </ProgressRing>
          }
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: theme.layout.screenX, gap: 12 }}>
          {BUCKET_CATEGORIES.map((cat, i) => {
            const { done, total } = bucketStat(cat.id);
            return (
              <FunBlock
                key={cat.id}
                index={8 + i}
                width={cardW}
                onPress={() => { lightHaptic(); router.push({ pathname: '/bucket-list', params: { category: cat.id } }); }}
                accentBar="bottom"
                color={cat.color}
              >
                <View style={{ position: 'absolute', top: 8, right: 8 }}>
                  <ProgressRing size={36} progress={total ? done / total : 0} color={cat.color}>
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 10, color: total ? LK.espresso : LK.faded }}>
                      {total ? `${done}/${total}` : '—'}
                    </Text>
                  </ProgressRing>
                </View>
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                  <Icon name={cat.icon} size={28} color={cat.color} />
                </View>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: LK.espresso, textAlign: 'center', marginTop: 8, marginBottom: 14 }}>{cat.label}</Text>
              </FunBlock>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionEyebrow({ label, trailing }: { label: string; trailing?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: theme.layout.screenX, paddingTop: 24, paddingBottom: 12 }}>
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: LK.faded }}>{label}</Text>
      <View style={{ flex: 1, height: 1.5, backgroundColor: LK.hairline, borderRadius: 2 }} />
      {trailing}
    </View>
  );
}

/** Shared block shell: Ivory card, accent bar (top or bottom), press scale + stagger. */
function FunBlock({
  index, width, color, accentBar, onPress, children,
}: {
  index: number; width: number; color: string; accentBar: 'top' | 'bottom';
  onPress: () => void; children: React.ReactNode;
}) {
  const entering = index < 8 ? FadeInUp.duration(300).delay(index * 30).reduceMotion(ReduceMotion.Never) : undefined;
  return (
    <Animated.View entering={entering} style={{ width }}>
      <ScalePressable scaleTo={0.96} onPress={onPress}>
        <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.sm, borderCurve: 'continuous', borderWidth: 1.5, borderColor: CARD_BORDER, overflow: 'hidden', ...theme.shadow.sm }}>
          {accentBar === 'top' && <View style={{ height: 4, backgroundColor: color }} />}
          <View>{children}</View>
          {accentBar === 'bottom' && <View style={{ height: 4, backgroundColor: color }} />}
        </View>
      </ScalePressable>
    </Animated.View>
  );
}

/** Creative block — Draw (partner widget, Soon) / Draw & Guess (live). */
function CreativeBlock({
  index,
  width,
  color,
  icon,
  name,
  route,
}: {
  index: number;
  width: number;
  color: string;
  icon: string;
  name: string;
  route?: string;
}) {
  const entering = FadeInUp.duration(300).delay(index * 30).reduceMotion(ReduceMotion.Never);
  const live = !!route;
  return (
    <Animated.View entering={entering} style={{ width }}>
      <ScalePressable
        scaleTo={0.96}
        onPress={() => {
          if (route) {
            lightHaptic();
            router.push(route as never);
          } else {
            Alert.alert('Coming soon', `${name} is on the way — drawing together lands in a future update.`);
          }
        }}
      >
        <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.sm, borderCurve: 'continuous', borderWidth: 1.5, borderColor: CARD_BORDER, overflow: 'hidden', ...theme.shadow.sm }}>
          <View style={{ height: 4, backgroundColor: color }} />
          {!live && (
            <View style={{ position: 'absolute', top: 12, right: 10, backgroundColor: LK.parchmentDeep, borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 9.5, letterSpacing: 0.5, textTransform: 'uppercase', color: LK.faded }}>Soon</Text>
            </View>
          )}
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={icon} size={26} color={shade(color, 0.55)} />
            </View>
          </View>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.espresso, textAlign: 'center', marginTop: 10, marginBottom: 16 }}>{name}</Text>
        </View>
      </ScalePressable>
    </Animated.View>
  );
}
