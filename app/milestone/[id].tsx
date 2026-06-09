import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LK, tint, shade, catColor, rgba, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { IconChip, RoundIcon } from '@/components/ui';
import { TYPE_ICON } from '@/constants/milestone-types';
import { useMilestones } from '@/hooks/useMilestones';
import { useCouple } from '@/hooks/useCouple';
import { AddMilestoneModal } from '@/components/milestone/AddMilestoneModal';
import { PaywallModal } from '@/components/paywall/PaywallModal';

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

  async function handleDelete() {
    await deleteMilestone(milestone.id);
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      {/* Colored header */}
      <View style={{ backgroundColor: tint(c.base, 0.35), paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <RoundIcon onPress={() => router.back()}>
            <Icon name="chevL" size={20} color={LK.ink} />
          </RoundIcon>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <RoundIcon onPress={() => setSheet('edit')}>
              <Icon name="pen" size={18} color={LK.ink} />
            </RoundIcon>
            <RoundIcon onPress={() => setConfirmDelete(true)}>
              <Icon name="trash" size={18} color={LK.ink} />
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
          {new Date(milestone.milestone_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: 60 }}>
        {milestone.note ? (
          <>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: LK.ink70, marginBottom: 8 }}>
              The story
            </Text>
            <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 19, color: LK.ink, lineHeight: 30 }}>
              {milestone.note}
            </Text>
          </>
        ) : (
          <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 17, color: LK.ink70, lineHeight: 28 }}>
            No note yet — tap the pencil above to add the story behind this moment.
          </Text>
        )}
      </ScrollView>

      {/* Confirm delete sheet */}
      {confirmDelete && (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(20,15,10,0.4)', justifyContent: 'flex-end' } as any}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setConfirmDelete(false)} />
          <View style={{ backgroundColor: LK.cream, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 26, paddingBottom: 40 }}>
            <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)', alignSelf: 'center', marginBottom: 18 }} />
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 23, color: LK.ink, textAlign: 'center' }}>Delete this milestone?</Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: LK.ink70, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
              It'll be recoverable for 30 days before it's gone for good.
            </Text>
            <View style={{ gap: 10, marginTop: 22 }}>
              <TouchableOpacity onPress={handleDelete} style={{ backgroundColor: LK.destructive, borderRadius: 9999, padding: 16, alignItems: 'center' }}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: '#fff' }}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setConfirmDelete(false)} style={{ backgroundColor: 'rgba(42,33,26,0.08)', borderRadius: 9999, padding: 16, alignItems: 'center' }}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: LK.ink }}>Cancel</Text>
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
