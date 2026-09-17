import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import Transition from 'react-native-screen-transitions';
import { LK, tint, shade, catColor, rgba, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { RoundIcon } from '@/components/ui/round-icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { Skeleton } from '@/components/ui/Skeleton';
import { MILESTONE_ILLUS, MILESTONE_TYPES } from '@/constants/milestone-types';
import { useMilestones } from '@/hooks/useMilestones';
import { useCouple } from '@/hooks/useCouple';
import { AddMilestoneModal } from '@/components/milestone/AddMilestoneModal';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import { confirm } from '@/lib/feedback';
import { parseLocalDate } from '@/utils/date';

const PHOTO_GAP = 8;

export default function MilestoneDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { milestones, loading, deleteMilestone } = useMilestones();
  const { isPremium } = useCouple();
  const { width } = useWindowDimensions();
  const [sheet, setSheet] = useState<'edit' | 'paywall' | null>(null);
  // Set before the delete lands so the screen doesn't flash "not found" on its way out.
  const leaving = useRef(false);

  const m = milestones.find((x) => x.id === id);

  // Loading holds its space; a missing memory says so instead of rendering nothing
  // (PREMIUM_STANDARD §1).
  if (!m) {
    if (leaving.current) return <View style={{ flex: 1, backgroundColor: LK.parchment }} />;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <RoundIcon onPress={() => router.back()} accessibilityLabel="Back">
            <Icon name="chevL" size={20} color={LK.espresso} />
          </RoundIcon>
        </View>
        {loading ? (
          <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 24, gap: 14 }}>
            <Skeleton width={120} height={120} radius={60} />
            <Skeleton width="80%" height={34} radius={10} />
            <Skeleton width="50%" height={16} radius={8} />
            <Skeleton height={96} radius={theme.radii.md} style={{ marginTop: 16 }} />
          </View>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 14 }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 22, color: LK.espresso, textAlign: 'center' }}>
              This memory isn’t here any more
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: LK.ink70, textAlign: 'center', lineHeight: 21 }}>
              It may have been deleted.
            </Text>
            <ScalePressable
              onPress={() => router.back()}
              accessibilityRole="button"
              style={{ borderRadius: 9999, borderWidth: 1.5, borderColor: LK.espresso, paddingHorizontal: 22, minHeight: 44, justifyContent: 'center' }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.espresso }}>Go back</Text>
            </ScalePressable>
          </View>
        )}
      </SafeAreaView>
    );
  }
  const milestone = m;

  const c = catColor(milestone.type);
  const catLabel = MILESTONE_TYPES.find((t) => t.id === milestone.type)?.label ?? 'Moment';
  const illus = MILESTONE_ILLUS[milestone.type] ?? MILESTONE_ILLUS.custom;
  const photos = milestone.photos ?? [];
  const photoSize = (width - theme.layout.screenX * 2 - PHOTO_GAP * 2) / 3;

  function openPhotos(index: number) {
    router.push({ pathname: '/milestone/photo-viewer', params: { photos: JSON.stringify(photos), index: String(index) } });
  }

  async function handleDelete() {
    const ok = await confirm({
      title: 'Delete this memory?',
      message: 'It’ll be recoverable for 30 days before it’s gone for good.',
      confirmLabel: 'Delete',
      destructive: true,
      icon: 'trash',
    });
    if (!ok) return;
    leaving.current = true;
    await deleteMilestone(milestone.id);
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      {/* DESTINATION for the timeline-card → milestone morph (§10.13): the tapped
          MilestoneCard (group="milestone" id) grows into this surface.
          sharedBoundTag 'milestone' (preset set in app/_layout.tsx). The colored
          header + scroll morph together as one card; overlays (edit modal) stay
          outside the boundary. */}
      <Transition.Boundary.View group="milestone" id={id} style={{ flex: 1 }}>
      {/* Colored header */}
      <View style={{ backgroundColor: tint(c.base, 0.35), paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <RoundIcon onPress={() => router.back()} accessibilityLabel="Back">
            <Icon name="chevL" size={20} color={LK.espresso} />
          </RoundIcon>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <RoundIcon onPress={() => setSheet('edit')} accessibilityLabel="Edit memory">
              <Icon name="pen" size={18} color={LK.espresso} />
            </RoundIcon>
            <RoundIcon onPress={handleDelete} accessibilityLabel="Delete memory">
              <Icon name="trash" size={18} color={LK.espresso} />
            </RoundIcon>
          </View>
        </View>
        {/* The type's kawaii sticker, not a line icon (§3, §6). */}
        <View style={{ width: 112, height: 112, borderRadius: 56, backgroundColor: tint(c.base, 0.6), alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] }}>
          <Image source={illus} style={{ width: 88, height: 88 }} contentFit="contain" accessible={false} />
        </View>
        <Text
          accessibilityRole="header"
          style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 34, color: c.deep, lineHeight: 38, marginTop: 14, letterSpacing: -1 }}
        >
          {milestone.title}
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: shade(c.base, 0.55), marginTop: 8 }}>
          {catLabel} · {parseLocalDate(milestone.milestone_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {milestone.note ? (
          <>
            <SectionEyebrow label="The story" paddingTop={22} />
            <Text style={{ paddingHorizontal: theme.layout.screenX, fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 19, color: LK.espresso, lineHeight: 30 }}>
              {milestone.note}
            </Text>
          </>
        ) : (
          // An empty story is an invitation with one way forward (§4).
          <View style={{ margin: theme.layout.screenX, backgroundColor: LK.ivory, borderRadius: theme.radii.md, borderCurve: 'continuous', borderWidth: 1.5, borderColor: LK.hairline, padding: 18, gap: 12, ...theme.shadow.sm }}>
            <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 17, color: LK.ink70, lineHeight: 26 }}>
              What happened that day? Future you will want to know.
            </Text>
            <ScalePressable
              onPress={() => setSheet('edit')}
              accessibilityRole="button"
              containerStyle={{ alignSelf: 'flex-start' }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: LK.espresso, borderRadius: 9999, paddingHorizontal: 18, minHeight: 44 }}
            >
              <Icon name="pen" size={15} color="#fff" />
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: '#fff' }}>Add the story</Text>
            </ScalePressable>
          </View>
        )}

        {/* Photo grid (§13.18) — renders when photos are attached */}
        {photos.length > 0 && (
          <>
            <SectionEyebrow label="Photos" handTrailing={photos.length > 1 ? `${photos.length}` : undefined} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: PHOTO_GAP, paddingHorizontal: theme.layout.screenX }}>
              {photos.map((uri, i) => (
                <ScalePressable
                  scaleTo={0.96}
                  key={`${i}-${uri}`}
                  onPress={() => openPhotos(i)}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={`Photo ${i + 1} of ${photos.length}`}
                >
                  <Image source={{ uri }} style={{ width: photoSize, height: photoSize, borderRadius: 14, backgroundColor: rgba(LK.espresso, 0.05) }} contentFit="cover" transition={150} />
                </ScalePressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      </Transition.Boundary.View>

      {sheet === 'edit' && (
        <AddMilestoneModal
          editing={milestone}
          isPremium={isPremium}
          onClose={() => setSheet(null)}
          onPaywall={() => setSheet('paywall')}
        />
      )}
      {sheet === 'paywall' && <PaywallModal onClose={() => setSheet(null)} />}
    </SafeAreaView>
  );
}
