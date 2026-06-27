import React from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { LK, theme, shade, rgba } from '@/constants/theme';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { Icon } from '@/components/ui/Icon';
import { ProgressRing } from '@/components/ui/progress-ring';
import MascotAnimation from '@/components/ui/mascot-animation';
import { LIVE_CATEGORIES } from '@/constants/live-games';
import { BUCKET_CATEGORIES } from '@/constants/categories';
import { useBucketList } from '@/hooks/useBucketList';
import { useLiveLaunch } from '@/stores/live.store';

const CARD_BORDER = 'rgba(42,33,26,0.12)';

// Which Icon (never emoji — §pre-delivery) fronts each live "This or That" deck.
const DECK_ICON: Record<string, string> = {
  cravings: 'fork',
  wanderlust: 'plane',
  cozy: 'house',
  who: 'user',
  heart: 'chat',
  'after-dark': 'moon',
};

// "Surprise me" draws from the everyday decks — After Dark stays a deliberate pick,
// never a random surprise.
const SURPRISE_POOL = LIVE_CATEGORIES.filter((c) => c.id !== 'after-dark');

function lightHaptic() {
  if (process.env.EXPO_OS === 'ios') {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* no-op */ }
  }
}

const stagger = (i: number) =>
  FadeInUp.duration(300).delay(Math.min(i, 12) * 30).reduceMotion(ReduceMotion.System);

/**
 * Fun tab — the play hub (§9.6b / §13.16b).
 *
 * A featured This-or-That hero (Lo & Kit idling + a "Surprise me" shuffle) leads
 * into three labeled shelves: the deck picker, Creative, and the Bucket List with
 * live per-category progress. Every number on this screen is real — there is no
 * per-deck play history yet (game_sessions isn't built), so decks show none.
 */
export default function FunScreen() {
  const { items } = useBucketList();
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  const requestStart = useLiveLaunch((s) => s.requestStart);

  const cardW = (width - theme.layout.screenX * 2 - 12) / 2;

  // Bucket progress per category + overall — all derived from real items.
  const doneTotal = items.filter((i) => i.is_done).length;
  const remaining = items.length - doneTotal;
  const bucketStat = (catId: string) => {
    const inCat = items.filter((i) => i.category === catId);
    return { done: inCat.filter((i) => i.is_done).length, total: inCat.length };
  };

  function startGame(catId: string) {
    lightHaptic();
    requestStart(catId);     // Home's LiveLayer owns the Realtime channel + runs it
    router.push('/(tabs)');  // hop to Home, where the game launches
  }

  function surpriseMe() {
    const pick = SURPRISE_POOL[Math.floor(Math.random() * SURPRISE_POOL.length)];
    startGame(pick.id);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      {/* Header (56pt) */}
      <View style={{ height: 56, paddingHorizontal: theme.layout.screenX, justifyContent: 'center' }}>
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 20, color: LK.espresso, letterSpacing: -0.5 }}>Fun</Text>
        <Text style={{ fontFamily: theme.fonts.hand, fontSize: 13, color: LK.sepia, marginTop: -1 }}>pick something together</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* ── Hero: featured This or That ───────────────────────────────── */}
        <Animated.View entering={stagger(0)} style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 8 }}>
          <View>
            {/* Washi-tape accent — lives outside the clipped card so it isn't cut off. */}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: -7,
                left: 30,
                width: 62,
                height: 18,
                backgroundColor: rgba(LK.blush, 0.5),
                borderWidth: 1,
                borderColor: 'rgba(42,33,26,0.10)',
                transform: [{ rotate: '-6deg' }],
                zIndex: 2,
              }}
            />
            <ScalePressable scaleTo={0.97} onPress={surpriseMe}>
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: LK.vellum,
                  borderRadius: theme.radii.lg,
                  borderCurve: 'continuous',
                  borderWidth: 1.5,
                  borderColor: CARD_BORDER,
                  overflow: 'hidden',
                  ...theme.shadow.card,
                }}
              >
                <View style={{ flex: 1, padding: 18, paddingRight: 8 }}>
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: shade(LK.coral, 0.25) }}>Play together</Text>
                  <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 23, color: LK.espresso, letterSpacing: -0.5, marginTop: 5 }}>This or That</Text>
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '500', fontSize: 12, color: LK.sepia, marginTop: 4, marginBottom: 14 }}>
                    {LIVE_CATEGORIES.length} decks — pick a vibe, or shuffle
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, backgroundColor: LK.coral, borderRadius: 99, borderCurve: 'continuous', paddingHorizontal: 16, paddingVertical: 9 }}>
                    <Icon name="play" size={14} color={LK.vellum} />
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: LK.vellum }}>Surprise me</Text>
                  </View>
                </View>
                <View style={{ width: 144, backgroundColor: rgba(LK.blush, 0.16), alignItems: 'center', justifyContent: 'center' }}>
                  <MascotAnimation name="lo-kit-idle" size={132} autoPlay={!reduced} />
                </View>
              </View>
            </ScalePressable>
          </View>
        </Animated.View>

        {/* ── Section 1: PICK A DECK ────────────────────────────────────── */}
        <SectionEyebrow label="Pick a deck" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: theme.layout.screenX, gap: 12 }}>
          {LIVE_CATEGORIES.map((cat, i) => (
            <DeckBlock
              key={cat.id}
              index={1 + i}
              width={cardW}
              color={cat.color}
              icon={DECK_ICON[cat.id] ?? 'sparkle'}
              name={cat.name}
              blurb={cat.blurb}
              onPress={() => startGame(cat.id)}
            />
          ))}
        </View>

        {/* ── Section 2: CREATIVE ───────────────────────────────────────── */}
        <SectionEyebrow label="Creative" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: theme.layout.screenX, gap: 12 }}>
          <CreativeBlock index={7} width={cardW} color={LK.marigold} icon="pen" name="Draw" caption="a little doodle" route="/draw" sticker />
          <CreativeBlock index={8} width={cardW} color={LK.sky} icon="feather" name="Draw & Guess" caption="guess it together" route="/games/draw-and-guess" live />
        </View>

        {/* ── Section 3: BUCKET LIST ────────────────────────────────────── */}
        <SectionEyebrow
          label="Bucket list"
          handTrailing={items.length > 0 ? `${remaining} to go` : undefined}
          trailing={
            items.length > 0 ? (
              <ProgressRing size={32} strokeWidth={3} progress={doneTotal / items.length} color={LK.sage}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 9, color: LK.sepia }}>
                  {doneTotal}/{items.length}
                </Text>
              </ProgressRing>
            ) : undefined
          }
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: theme.layout.screenX, gap: 12 }}>
          {BUCKET_CATEGORIES.map((cat, i) => {
            const { done, total } = bucketStat(cat.id);
            return (
              <BucketBlock
                key={cat.id}
                index={9 + i}
                width={cardW}
                color={cat.color}
                icon={cat.icon}
                label={cat.label}
                done={done}
                total={total}
                onPress={() => { lightHaptic(); router.push({ pathname: '/bucket-list', params: { category: cat.id } }); }}
              />
            );
          })}

          {/* Add a new dream — full-width dashed card closes the shelf with an action. */}
          <Animated.View entering={stagger(9 + BUCKET_CATEGORIES.length)} style={{ width: '100%' }}>
            <ScalePressable scaleTo={0.98} onPress={() => { lightHaptic(); router.push('/bucket-list'); }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  borderRadius: theme.radii.sm,
                  borderCurve: 'continuous',
                  borderWidth: 1.5,
                  borderColor: 'rgba(42,33,26,0.22)',
                  borderStyle: 'dashed',
                  paddingVertical: 14,
                }}
              >
                <Icon name="plus" size={18} color={LK.faded} />
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: LK.faded }}>Add a new dream</Text>
              </View>
            </ScalePressable>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionEyebrow({ label, trailing, handTrailing }: { label: string; trailing?: React.ReactNode; handTrailing?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: theme.layout.screenX, paddingTop: 24, paddingBottom: 12 }}>
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: LK.faded }}>{label}</Text>
      <View style={{ flex: 1, height: 1.5, backgroundColor: LK.hairline, borderRadius: 2 }} />
      {handTrailing ? <Text style={{ fontFamily: theme.fonts.hand, fontSize: 12, color: LK.faded }}>{handTrailing}</Text> : null}
      {trailing}
    </View>
  );
}

/** Shared card shell — Ivory, tinted illustration zone up top, press scale + stagger. */
function DeckBlock({
  index, width, color, icon, name, blurb, onPress,
}: {
  index: number; width: number; color: string; icon: string;
  name: string; blurb: string; onPress: () => void;
}) {
  return (
    <Animated.View entering={stagger(index)} style={{ width }}>
      <ScalePressable scaleTo={0.96} onPress={onPress}>
        <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.sm, borderCurve: 'continuous', borderWidth: 1.5, borderColor: CARD_BORDER, overflow: 'hidden', ...theme.shadow.sm }}>
          <View style={{ height: 66, backgroundColor: rgba(color, 0.14), alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={30} color={shade(color, 0.45)} />
          </View>
          <View style={{ padding: 12, paddingTop: 10 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.espresso }}>{name}</Text>
            <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontWeight: '500', fontSize: 11, color: LK.sepia, marginTop: 3 }}>{blurb}</Text>
          </View>
        </View>
      </ScalePressable>
    </Animated.View>
  );
}

/** Creative block — Draw (async partner doodles) / Draw & Guess (live game). */
function CreativeBlock({
  index, width, color, icon, name, caption, route, live, sticker,
}: {
  index: number; width: number; color: string; icon: string;
  name: string; caption: string; route: string; live?: boolean; sticker?: boolean;
}) {
  return (
    <Animated.View entering={stagger(index)} style={{ width }}>
      <ScalePressable scaleTo={0.96} onPress={() => { lightHaptic(); router.push(route as Href); }}>
        <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.sm, borderCurve: 'continuous', borderWidth: 1.5, borderColor: CARD_BORDER, overflow: 'hidden', ...theme.shadow.sm }}>
          <View style={{ height: 72, backgroundColor: rgba(color, 0.16), alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={32} color={shade(color, 0.5)} />
          </View>

          {sticker && (
            <View pointerEvents="none" style={{ position: 'absolute', top: 8, right: 9, transform: [{ rotate: '12deg' }] }}>
              <Icon name="sparkle" size={16} color={LK.marigold} />
            </View>
          )}
          {live && (
            <View style={{ position: 'absolute', top: 9, right: 9, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: LK.danger, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 3 }}>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: LK.vellum }} />
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 9, letterSpacing: 0.5, color: LK.vellum }}>LIVE</Text>
            </View>
          )}

          <View style={{ padding: 12, paddingTop: 10 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.espresso }}>{name}</Text>
            <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontWeight: '500', fontSize: 11, color: LK.sepia, marginTop: 3 }}>{caption}</Text>
          </View>
        </View>
      </ScalePressable>
    </Animated.View>
  );
}

/** Bucket category — compact card with a live progress ring (real done/total). */
function BucketBlock({
  index, width, color, icon, label, done, total, onPress,
}: {
  index: number; width: number; color: string; icon: string;
  label: string; done: number; total: number; onPress: () => void;
}) {
  return (
    <Animated.View entering={stagger(index)} style={{ width }}>
      <ScalePressable scaleTo={0.96} onPress={onPress}>
        <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.sm, borderCurve: 'continuous', borderWidth: 1.5, borderColor: CARD_BORDER, padding: 14, ...theme.shadow.sm }}>
          <View style={{ position: 'absolute', top: 10, right: 10 }}>
            <ProgressRing size={34} progress={total ? done / total : 0} color={color}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 9, color: total ? LK.espresso : LK.faded }}>
                {total ? `${done}/${total}` : '—'}
              </Text>
            </ProgressRing>
          </View>
          <Icon name={icon} size={26} color={color} />
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: LK.espresso, marginTop: 12 }}>{label}</Text>
        </View>
      </ScalePressable>
    </Animated.View>
  );
}
