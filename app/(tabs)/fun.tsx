import React from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import Animated, { FadeInUp, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { LK, theme, shade, rgba } from '@/constants/theme';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { Icon } from '@/components/ui/Icon';
import { ProgressRing } from '@/components/ui/progress-ring';
import MascotAnimation from '@/components/ui/mascot-animation';
import { LIVE_CATEGORIES, CATEGORY_ILLUS } from '@/constants/live-games';
import { BUCKET_CATEGORIES } from '@/constants/categories';
import { useBucketList } from '@/hooks/useBucketList';
import { useLiveLaunch } from '@/stores/live.store';

const CARD_BORDER = 'rgba(42,33,26,0.12)';

// Scrapbook stickers front each "This or That" deck — shared with the live
// game card via CATEGORY_ILLUS so tile and card carry the same sticker.

// "Surprise me" draws from the everyday decks — After Dark stays a deliberate pick,
// never a random surprise.
const SURPRISE_POOL = LIVE_CATEGORIES.filter((c) => c.id !== 'after-dark');

// NOTE: there is deliberately no haptic helper here. Every tile on this screen
// is a ScalePressable, which already fires tap() on press-in (DESIGN.md §10.12) —
// the old lightHaptic() call in each onPress buzzed a second time on top of it.

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
              illus={CATEGORY_ILLUS[cat.id]}
              tilt={i % 2 === 0 ? -4 : 4}
              name={cat.name}
              blurb={cat.blurb}
              onPress={() => startGame(cat.id)}
            />
          ))}
        </View>

        {/* ── Section 2: CREATIVE — wide rows ───────────────────────────────
            Two full-width rows, not two more grid tiles. With 8 decks above and
            the bucket shelf below, a third block of identical squares gave the
            eye nowhere to land; changing the silhouette is what separates the
            shelves (§S1). */}
        <SectionEyebrow label="Creative" />
        <View style={{ paddingHorizontal: theme.layout.screenX, gap: 10 }}>
          <CreativeRow
            index={9}
            color={LK.marigold}
            illus={require('../../assets/illustrations/mascot/drawing.png')}
            tilt={-4}
            name="Draw"
            caption="Send a little doodle to their lock screen"
            route="/draw"
            sticker
          />
          <CreativeRow
            index={10}
            color={LK.sky}
            illus={require('../../assets/illustrations/mascot/guessing.png')}
            tilt={4}
            name="Draw & Guess"
            caption="One draws, one guesses — together, right now"
            route="/games/draw-and-guess"
            live
          />
        </View>

        {/* ── Section 3: BUCKET LIST — horizontal shelf ─────────────────────
            Seven categories plus an add tile used to be four more rows of the
            same 2-col grid. As a scroller it's one row, and the eyebrow already
            carries the overall progress ring. */}
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
        <Animated.View entering={stagger(11)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: theme.layout.screenX, gap: 10 }}
          >
            {BUCKET_CATEGORIES.map((cat) => {
              const { done, total } = bucketStat(cat.id);
              return (
                <BucketTile
                  key={cat.id}
                  color={cat.color}
                  icon={cat.icon}
                  label={cat.label}
                  done={done}
                  total={total}
                  onPress={() => router.push({ pathname: '/bucket-list', params: { category: cat.id } })}
                />
              );
            })}
            {/* Add tile closes the shelf with an action, in the shelf's own shape. */}
            <ScalePressable scaleTo={0.95} onPress={() => router.push('/bucket-list')} accessibilityLabel="Add a new dream">
              <View
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: theme.radii.sm,
                  borderCurve: 'continuous',
                  borderWidth: 1.5,
                  borderColor: 'rgba(42,33,26,0.22)',
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Icon name="plus" size={20} color={LK.faded} />
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11.5, color: LK.faded, textAlign: 'center' }}>
                  New dream
                </Text>
              </View>
            </ScalePressable>
          </ScrollView>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Deck card — Ivory shell with a kawaii sticker pasted (slightly tilted) on the
 *  category-tinted zone; scrapbook album feel per §7 + user direction. */
function DeckBlock({
  index, width, color, illus, tilt, name, blurb, onPress,
}: {
  index: number; width: number; color: string; illus: ReturnType<typeof require>;
  tilt: number; name: string; blurb: string; onPress: () => void;
}) {
  return (
    <Animated.View entering={stagger(index)} style={{ width }}>
      <ScalePressable scaleTo={0.96} onPress={onPress} accessibilityLabel={`Play ${name}`}>
        <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.sm, borderCurve: 'continuous', borderWidth: 1.5, borderColor: CARD_BORDER, overflow: 'hidden', ...theme.shadow.sm }}>
          <View style={{ height: 80, backgroundColor: rgba(color, 0.14), alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={illus}
              contentFit="contain"
              accessible={false}
              style={{ width: 64, height: 64, transform: [{ rotate: `${tilt}deg` }] }}
            />
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

/** Creative row — full-width: tinted illustration square on the left, copy on
 *  the right. Deliberately a different silhouette from the deck grid above so
 *  the shelves don't blur together (§S1). */
function CreativeRow({
  index, color, illus, tilt, name, caption, route, live, sticker,
}: {
  index: number; color: string; illus: number; tilt: number;
  name: string; caption: string; route: string; live?: boolean; sticker?: boolean;
}) {
  return (
    <Animated.View entering={stagger(index)}>
      <ScalePressable scaleTo={0.98} onPress={() => router.push(route as Href)} accessibilityLabel={name}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: LK.ivory,
            borderRadius: theme.radii.sm,
            borderCurve: 'continuous',
            borderWidth: 1.5,
            borderColor: CARD_BORDER,
            overflow: 'hidden',
            ...theme.shadow.sm,
          }}
        >
          <View style={{ width: 92, height: 92, backgroundColor: rgba(color, 0.16), alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={illus}
              contentFit="contain"
              accessible={false}
              style={{ width: 62, height: 62, transform: [{ rotate: `${tilt}deg` }] }}
            />
          </View>

          <View style={{ flex: 1, minWidth: 0, paddingHorizontal: 14, paddingVertical: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 16.5, color: LK.espresso }}>{name}</Text>
              {sticker && <Icon name="sparkle" size={14} color={LK.marigold} />}
              {live && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: LK.danger, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 3 }}>
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: LK.vellum }} />
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 9, letterSpacing: 0.5, color: LK.vellum }}>LIVE</Text>
                </View>
              )}
            </View>
            <Text numberOfLines={2} style={{ fontFamily: theme.fonts.body, fontWeight: '500', fontSize: 12.5, color: LK.sepia, marginTop: 3, lineHeight: 18 }}>
              {caption}
            </Text>
          </View>

          <Icon name="chevR" size={17} color={LK.faded} />
          <View style={{ width: 12 }} />
        </View>
      </ScalePressable>
    </Animated.View>
  );
}

/** Bucket category — square shelf tile with a live progress ring (real
 *  done/total). Sized for a horizontal scroller rather than the 2-col grid. */
function BucketTile({
  color, icon, label, done, total, onPress,
}: {
  color: string; icon: string; label: string; done: number; total: number; onPress: () => void;
}) {
  return (
    <ScalePressable scaleTo={0.95} onPress={onPress} accessibilityLabel={`${label} — ${total ? `${done} of ${total} done` : 'nothing yet'}`}>
      <View
        style={{
          width: 104,
          height: 104,
          backgroundColor: LK.ivory,
          borderRadius: theme.radii.sm,
          borderCurve: 'continuous',
          borderWidth: 1.5,
          borderColor: CARD_BORDER,
          padding: 12,
          justifyContent: 'space-between',
          ...theme.shadow.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Icon name={icon} size={24} color={color} />
          <ProgressRing size={30} progress={total ? done / total : 0} color={color}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 8.5, color: total ? LK.espresso : LK.faded }}>
              {total ? `${done}/${total}` : '—'}
            </Text>
          </ProgressRing>
        </View>
        <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: LK.espresso }}>{label}</Text>
      </View>
    </ScalePressable>
  );
}
