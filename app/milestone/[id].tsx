import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { LK, tint, shade, catColor, rgba, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { IconChip } from '@/components/ui/icon-chip';
import { RoundIcon } from '@/components/ui/round-icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { TYPE_ICON, MILESTONE_TYPES } from '@/constants/milestone-types';
import { useMilestones } from '@/hooks/useMilestones';
import { useCouple } from '@/hooks/useCouple';
import { AddMilestoneModal } from '@/components/milestone/AddMilestoneModal';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import { parseLocalDate } from '@/utils/date';

export default function MilestoneDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { milestones, deleteMilestone } = useMilestones();
  const { isPremium } = useCouple();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sheet, setSheet] = useState<'edit' | 'paywall' | null>(null);

  const m = milestones.find((x) => x.id === id);
  if (!m) return null;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const milestone = m!;

  const c = catColor(milestone.type);
  const catLabel = MILESTONE_TYPES.find((t) => t.id === milestone.type)?.label ?? 'Moment';
  const photos = milestone.photos ?? [];

  function openPhotos(index: number) {
    router.push({ pathname: '/milestone/photo-viewer', params: { photos: JSON.stringify(photos), index: String(index) } });
  }

  async function handleDelete() {
    await deleteMilestone(milestone.id);
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      {/* Colored header */}
      <View style={{ backgroundColor: tint(c.base, 0.35), paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <RoundIcon onPress={() => router.back()}>
            <Icon name="chevL" size={20} color={LK.espresso} />
          </RoundIcon>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <RoundIcon onPress={() => setSheet('edit')}>
              <Icon name="pen" size={18} color={LK.espresso} />
            </RoundIcon>
            <RoundIcon onPress={() => setConfirmDelete(true)}>
              <Icon name="trash" size={18} color={LK.espresso} />
            </RoundIcon>
          </View>
        </View>
        <IconChip color={c.base} size={72}>
          <Icon name={TYPE_ICON[milestone.type] ?? 'star'} size={34} color={c.deep} />
        </IconChip>
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 34, color: c.deep, lineHeight: 36, marginTop: 16, letterSpacing: -1 }}>
          {milestone.title}
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: shade(c.base, 0.55), marginTop: 8 }}>
          {catLabel} · {parseLocalDate(milestone.milestone_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: 80 }}>
        {milestone.note ? (
          <>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: LK.ink70, marginBottom: 8 }}>
              The story
            </Text>
            <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 19, color: LK.espresso, lineHeight: 30 }}>
              {milestone.note}
            </Text>
          </>
        ) : (
          <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 17, color: LK.ink70, lineHeight: 28 }}>
            No note yet — tap the pencil above to add the story behind this moment.
          </Text>
        )}

        {/* Photo grid (§13.18) — renders when photos are attached */}
        {photos.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: LK.ink70, marginBottom: 10 }}>
              Photos
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {photos.map((uri, i) => (
                <ScalePressable scaleTo={0.96} key={`${i}-${uri}`} onPress={() => openPhotos(i)}>
                  <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 10, backgroundColor: rgba(LK.espresso, 0.05) }} contentFit="cover" transition={150} />
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Confirm delete sheet */}
      {confirmDelete && (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(20,15,10,0.4)', justifyContent: 'flex-end' } as any}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setConfirmDelete(false)} />
          <View style={{ backgroundColor: LK.parchment, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 26, paddingBottom: 40 }}>
            <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)', alignSelf: 'center', marginBottom: 18 }} />
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 23, color: LK.espresso, textAlign: 'center' }}>Delete this milestone?</Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: LK.ink70, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
              It'll be recoverable for 30 days before it's gone for good.
            </Text>
            <View style={{ gap: 10, marginTop: 22 }}>
              <TouchableOpacity onPress={handleDelete} style={{ backgroundColor: LK.danger, borderRadius: 9999, padding: 16, alignItems: 'center' }}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setConfirmDelete(false)} style={{ backgroundColor: 'rgba(42,33,26,0.08)', borderRadius: 9999, padding: 16, alignItems: 'center' }}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: LK.espresso }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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
